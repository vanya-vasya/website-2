#!/usr/bin/env ts-node
/**
 * Webhook Simulator for Test Mode Payments
 * 
 * Simulates Secure-processor webhook calls to test payment processing locally
 * without needing to make actual payments.
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface WebhookPayload {
  transaction: {
    test: boolean;
    uid: string;
    status: string;
    amount: string;
    currency: string;
    type: string;
    tracking_id: string;
    description: string;
    payment_method_type: string;
    message: string;
    paid_at: string;
    customer: {
      email: string;
    };
  };
}

class WebhookSimulator {
  private webhookUrl: string;

  constructor() {
    // Default to localhost, can be overridden
    this.webhookUrl = process.env.WEBHOOK_TEST_URL || 'http://localhost:3001/api/webhooks/secure-processor';
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 Secure-processor Webhook Simulator - Test Mode');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Target URL: ${this.webhookUrl}\n`);
  }

  /**
   * Generate a test webhook payload
   */
  private generateTestPayload(overrides?: Partial<WebhookPayload['transaction']>): WebhookPayload {
    const timestamp = new Date().toISOString();
    const transactionId = `test_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      transaction: {
        test: true, // CRITICAL: Mark as test transaction
        uid: transactionId,
        status: 'successful',
        amount: '10.00',
        currency: 'USD',
        type: 'payment',
        tracking_id: 'user_test_123', // This should be a valid Clerk user ID
        description: 'Token Top-up (100 Tokens)', // Must match extraction pattern
        payment_method_type: 'card',
        message: 'Payment successful',
        paid_at: timestamp,
        customer: {
          email: 'test@example.com',
        },
        ...overrides,
      },
    };
  }

  /**
   * Send webhook request
   */
  private async sendWebhook(payload: WebhookPayload): Promise<void> {
    console.log('📤 Sending webhook request...\n');
    console.log('Payload:');
    console.log(JSON.stringify(payload, null, 2));
    console.log('\n' + '─'.repeat(60) + '\n');

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: For test transactions, signature is optional
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      console.log('📥 Response received:\n');
      console.log(`Status: ${response.status} ${response.statusText}`);
      console.log('\nHeaders:');
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log('\nBody:');
      console.log(typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData);
      console.log('\n' + '─'.repeat(60) + '\n');

      if (response.ok) {
        console.log('✅ Webhook processed successfully!\n');
        
        if (responseData.idempotent) {
          console.log('⚠️  Note: Transaction was marked as duplicate (idempotent)');
          console.log('This is expected if you run the same webhook twice.\n');
        }
      } else {
        console.log('❌ Webhook processing failed!\n');
        console.log(`Error: ${response.status} ${response.statusText}`);
        console.log('Response:', responseData);
        console.log('\n');
      }
    } catch (error) {
      console.log('❌ Failed to send webhook request\n');
      console.error('Error:', error);
      console.log('\n');
      throw error;
    }
  }

  /**
   * Test successful payment
   */
  async testSuccessfulPayment(userId?: string, tokenAmount: number = 100): Promise<void> {
    console.log('🧪 TEST: Successful Payment\n');
    console.log(`Token Amount: ${tokenAmount}`);
    console.log(`User ID: ${userId || 'user_test_123 (default)'}\n`);
    
    const payload = this.generateTestPayload({
      tracking_id: userId || 'user_test_123',
      description: `Token Top-up (${tokenAmount} Tokens)`,
      status: 'successful',
    });

    await this.sendWebhook(payload);
  }

  /**
   * Test failed payment
   */
  async testFailedPayment(userId?: string): Promise<void> {
    console.log('🧪 TEST: Failed Payment\n');
    
    const payload = this.generateTestPayload({
      tracking_id: userId || 'user_test_123',
      status: 'failed',
      message: 'Payment failed - insufficient funds',
    });

    await this.sendWebhook(payload);
  }

  /**
   * Test pending payment
   */
  async testPendingPayment(userId?: string): Promise<void> {
    console.log('🧪 TEST: Pending Payment\n');
    
    const payload = this.generateTestPayload({
      tracking_id: userId || 'user_test_123',
      status: 'pending',
      message: 'Payment pending verification',
    });

    await this.sendWebhook(payload);
  }

  /**
   * Test refund
   */
  async testRefund(userId?: string, tokenAmount: number = 100): Promise<void> {
    console.log('🧪 TEST: Refund\n');
    
    const payload = this.generateTestPayload({
      tracking_id: userId || 'user_test_123',
      description: `Token Top-up (${tokenAmount} Tokens)`,
      status: 'refunded',
      type: 'refund',
      message: 'Payment refunded',
    });

    await this.sendWebhook(payload);
  }

  /**
   * Test duplicate webhook (idempotency)
   */
  async testDuplicateWebhook(userId?: string): Promise<void> {
    console.log('🧪 TEST: Duplicate Webhook (Idempotency)\n');
    console.log('Sending the same webhook twice to test idempotency...\n');
    
    const transactionId = `test_txn_${Date.now()}_duplicate`;
    const payload = this.generateTestPayload({
      uid: transactionId,
      tracking_id: userId || 'user_test_123',
      description: 'Token Top-up (50 Tokens)',
      status: 'successful',
    });

    console.log('📤 First request:\n');
    await this.sendWebhook(payload);

    console.log('⏱️  Waiting 2 seconds...\n');
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📤 Second request (duplicate):\n');
    await this.sendWebhook(payload);
  }

  /**
   * Test with missing user
   */
  async testMissingUser(): Promise<void> {
    console.log('🧪 TEST: Missing User\n');
    console.log('Testing webhook with non-existent user ID...\n');
    
    const payload = this.generateTestPayload({
      tracking_id: 'user_nonexistent_' + Date.now(),
      description: 'Token Top-up (100 Tokens)',
      status: 'successful',
    });

    await this.sendWebhook(payload);
  }

  /**
   * Test with invalid description (no token amount)
   */
  async testInvalidDescription(userId?: string): Promise<void> {
    console.log('🧪 TEST: Invalid Description Format\n');
    console.log('Testing webhook with description that cannot be parsed...\n');
    
    const payload = this.generateTestPayload({
      tracking_id: userId || 'user_test_123',
      description: 'Some payment without token info',
      status: 'successful',
    });

    await this.sendWebhook(payload);
  }

  /**
   * Run all tests
   */
  async runAllTests(userId?: string): Promise<void> {
    console.log('🚀 Running all webhook tests...\n');
    console.log('═══════════════════════════════════════════════════════\n');

    const tests = [
      { name: 'Successful Payment', fn: () => this.testSuccessfulPayment(userId) },
      { name: 'Failed Payment', fn: () => this.testFailedPayment(userId) },
      { name: 'Pending Payment', fn: () => this.testPendingPayment(userId) },
      { name: 'Refund', fn: () => this.testRefund(userId) },
      { name: 'Duplicate Webhook', fn: () => this.testDuplicateWebhook(userId) },
      { name: 'Missing User', fn: () => this.testMissingUser() },
      { name: 'Invalid Description', fn: () => this.testInvalidDescription(userId) },
    ];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i];
      console.log(`\n${'═'.repeat(60)}`);
      console.log(`Test ${i + 1}/${tests.length}: ${test.name}`);
      console.log('═'.repeat(60) + '\n');

      try {
        await test.fn();
        console.log(`✅ Test ${i + 1} completed\n`);
      } catch (error) {
        console.log(`❌ Test ${i + 1} failed:`, error);
      }

      if (i < tests.length - 1) {
        console.log('⏱️  Waiting 2 seconds before next test...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🎉 All tests completed!');
    console.log('═══════════════════════════════════════════════════════\n');
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const userId = args[1];

  const simulator = new WebhookSimulator();

  switch (command) {
    case 'success':
      const tokenAmount = args[2] ? parseInt(args[2]) : 100;
      await simulator.testSuccessfulPayment(userId, tokenAmount);
      break;
    
    case 'failed':
      await simulator.testFailedPayment(userId);
      break;
    
    case 'pending':
      await simulator.testPendingPayment(userId);
      break;
    
    case 'refund':
      const refundTokens = args[2] ? parseInt(args[2]) : 100;
      await simulator.testRefund(userId, refundTokens);
      break;
    
    case 'duplicate':
      await simulator.testDuplicateWebhook(userId);
      break;
    
    case 'missing-user':
      await simulator.testMissingUser();
      break;
    
    case 'invalid-desc':
      await simulator.testInvalidDescription(userId);
      break;
    
    case 'all':
      await simulator.runAllTests(userId);
      break;
    
    default:
      console.log('Usage: ts-node webhook-simulator-test-mode.ts <command> [userId] [options]\n');
      console.log('Commands:');
      console.log('  success [userId] [tokenAmount]  - Test successful payment (default: 100 tokens)');
      console.log('  failed [userId]                 - Test failed payment');
      console.log('  pending [userId]                - Test pending payment');
      console.log('  refund [userId] [tokenAmount]   - Test refund (default: 100 tokens)');
      console.log('  duplicate [userId]              - Test duplicate webhook (idempotency)');
      console.log('  missing-user                    - Test with non-existent user');
      console.log('  invalid-desc [userId]           - Test with invalid description');
      console.log('  all [userId]                    - Run all tests');
      console.log('\nExamples:');
      console.log('  npm run test:webhook success user_2abc123xyz 250');
      console.log('  npm run test:webhook all user_2abc123xyz');
      console.log('  npm run test:webhook duplicate');
      process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});





