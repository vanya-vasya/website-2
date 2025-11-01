/**
 * Diagnostic Script: Payment Redirect Configuration
 * 
 * This script checks all configurations related to the payment redirect
 * to help diagnose why users might be landing on a 404 instead of the dashboard.
 * 
 * Run with: npx tsx scripts/diagnose-payment-redirect.ts
 */

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  Payment Redirect Diagnostic Tool                         ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// Check 1: Environment Variables
console.log('📋 CHECK 1: Environment Variables');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const envVars = {
  NETWORX_RETURN_URL: process.env.NETWORX_RETURN_URL,
  NETWORX_WEBHOOK_URL: process.env.NETWORX_WEBHOOK_URL,
  NETWORX_SHOP_ID: process.env.NETWORX_SHOP_ID,
  NETWORX_SECRET_KEY: process.env.NETWORX_SECRET_KEY,
  NETWORX_TEST_MODE: process.env.NETWORX_TEST_MODE,
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
};

Object.entries(envVars).forEach(([key, value]) => {
  if (key.includes('SECRET') || key.includes('KEY')) {
    console.log(`   ${key}: ${value ? '***' + value.substring(value.length - 4) : '❌ NOT SET'}`);
  } else {
    console.log(`   ${key}: ${value || '❌ NOT SET'}`);
  }
});

console.log('');

// Check 2: Default Return URL
console.log('🎯 CHECK 2: Default Return URL Configuration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const defaultReturnUrl = 'https://nerbixa.com/dashboard';
const actualReturnUrl = process.env.NETWORX_RETURN_URL || defaultReturnUrl;

console.log(`   Default: ${defaultReturnUrl}`);
console.log(`   Actual:  ${actualReturnUrl}`);

if (actualReturnUrl.includes('/payment/success')) {
  console.log('   ⚠️  WARNING: Return URL still points to /payment/success!');
  console.log('   This will cause 404 errors.');
  console.log('   Set NETWORX_RETURN_URL to: https://www.nerbixa.com/dashboard');
} else if (actualReturnUrl.includes('/payment/callback')) {
  console.log('   ⚠️  WARNING: Return URL points to /payment/callback');
  console.log('   Consider using /dashboard directly for better UX.');
} else if (actualReturnUrl.includes('/dashboard')) {
  console.log('   ✅ GOOD: Return URL correctly points to /dashboard');
} else {
  console.log('   ❌ ERROR: Return URL does not point to a valid page');
}

console.log('');

// Check 3: URL Structure Analysis
console.log('🔍 CHECK 3: Return URL Structure Analysis');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

try {
  const url = new URL(actualReturnUrl);
  console.log('   Protocol:', url.protocol);
  console.log('   Hostname:', url.hostname);
  console.log('   Port:', url.port || '(default)');
  console.log('   Pathname:', url.pathname);
  console.log('   Search:', url.search || '(none)');
  
  // Check for common issues
  const issues: string[] = [];
  
  if (url.pathname !== '/dashboard') {
    issues.push(`Pathname should be /dashboard, got: ${url.pathname}`);
  }
  
  if (url.pathname.includes('//')) {
    issues.push('Double slashes in pathname');
  }
  
  if (url.pathname.includes(' ')) {
    issues.push('Spaces in pathname');
  }
  
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    issues.push(`Invalid protocol: ${url.protocol}`);
  }
  
  if (issues.length > 0) {
    console.log('');
    console.log('   ⚠️  Issues found:');
    issues.forEach(issue => console.log(`      - ${issue}`));
  } else {
    console.log('');
    console.log('   ✅ No structural issues found');
  }
} catch (error) {
  console.log('   ❌ ERROR: Invalid URL format');
  console.log(`      ${error}`);
}

console.log('');

// Check 4: Route Existence
console.log('📂 CHECK 4: Dashboard Route Existence');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const fs = require('fs');
const path = require('path');

const dashboardPagePath = path.join(process.cwd(), 'app', '(dashboard)', 'dashboard', 'page.tsx');
const dashboardPageExists = fs.existsSync(dashboardPagePath);

console.log(`   Dashboard page file: ${dashboardPagePath}`);
console.log(`   Exists: ${dashboardPageExists ? '✅ YES' : '❌ NO'}`);

if (dashboardPageExists) {
  const content = fs.readFileSync(dashboardPagePath, 'utf-8');
  const hasDefaultExport = content.includes('export default');
  const hasUseClient = content.includes('"use client"') || content.includes("'use client'");
  
  console.log(`   Has default export: ${hasDefaultExport ? '✅ YES' : '❌ NO'}`);
  console.log(`   Has "use client": ${hasUseClient ? '✅ YES' : '❌ NO'}`);
} else {
  console.log('   ❌ ERROR: Dashboard page does not exist!');
  console.log('   This will cause 404 errors.');
}

console.log('');

// Check 5: Middleware Configuration
console.log('🔒 CHECK 5: Middleware Route Protection');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const middlewarePath = path.join(process.cwd(), 'middleware.ts');
const middlewareExists = fs.existsSync(middlewarePath);

console.log(`   Middleware file: ${middlewarePath}`);
console.log(`   Exists: ${middlewareExists ? '✅ YES' : '⚠️  NO'}`);

if (middlewareExists) {
  const content = fs.readFileSync(middlewarePath, 'utf-8');
  const protectsDashboard = content.includes('/dashboard') || content.includes('dashboard');
  
  console.log(`   Protects /dashboard: ${protectsDashboard ? '✅ YES' : '⚠️  NO'}`);
  
  if (content.includes('/dashboard(.*)')) {
    console.log('   Pattern: /dashboard(.*)  ✅ Correct (matches all dashboard routes)');
  } else if (content.includes('/Dashboard')) {
    console.log('   ⚠️  WARNING: Uses capital D "Dashboard" - might cause case-sensitivity issues');
  }
} else {
  console.log('   ⚠️  No middleware found - dashboard routes not protected');
}

console.log('');

// Check 6: Vercel Configuration
console.log('⚙️  CHECK 6: Vercel Configuration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
const vercelJsonExists = fs.existsSync(vercelJsonPath);

console.log(`   vercel.json file: ${vercelJsonPath}`);
console.log(`   Exists: ${vercelJsonExists ? '✅ YES' : 'ℹ️  NO (optional)'}`);

if (vercelJsonExists) {
  const content = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
  
  console.log(`   Regions: ${content.regions?.join(', ') || '(default)'}`);
  console.log(`   Framework: ${content.framework || '(auto-detect)'}`);
  
  if (content.redirects && content.redirects.length > 0) {
    console.log(`   Redirects configured: ${content.redirects.length}`);
    content.redirects.forEach((redirect: any, index: number) => {
      console.log(`      ${index + 1}. ${redirect.source} → ${redirect.destination}`);
      if (redirect.source.includes('dashboard') || redirect.destination.includes('dashboard')) {
        console.log('         ⚠️  WARNING: Redirect affects dashboard routes!');
      }
    });
  } else {
    console.log('   Redirects: None configured ✅');
  }
  
  if (content.rewrites && content.rewrites.length > 0) {
    console.log(`   Rewrites configured: ${content.rewrites.length}`);
    content.rewrites.forEach((rewrite: any, index: number) => {
      console.log(`      ${index + 1}. ${rewrite.source} → ${rewrite.destination}`);
    });
  } else {
    console.log('   Rewrites: None configured ✅');
  }
} else {
  console.log('   ℹ️  No vercel.json found (using defaults)');
}

console.log('');

// Check 7: Next.js Configuration
console.log('⚙️  CHECK 7: Next.js Configuration');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const nextConfigPath = path.join(process.cwd(), 'next.config.js');
const nextConfigExists = fs.existsSync(nextConfigPath);

console.log(`   next.config.js file: ${nextConfigPath}`);
console.log(`   Exists: ${nextConfigExists ? '✅ YES' : '❌ NO'}`);

if (nextConfigExists) {
  const content = fs.readFileSync(nextConfigPath, 'utf-8');
  
  const hasBasePath = content.includes('basePath');
  const hasAssetPrefix = content.includes('assetPrefix');
  const hasI18n = content.includes('i18n');
  const hasRedirects = content.includes('redirects');
  const hasRewrites = content.includes('rewrites');
  
  console.log(`   Has basePath: ${hasBasePath ? '⚠️  YES (check value)' : '✅ NO'}`);
  console.log(`   Has assetPrefix: ${hasAssetPrefix ? '⚠️  YES (check value)' : '✅ NO'}`);
  console.log(`   Has i18n: ${hasI18n ? 'ℹ️  YES (check locale prefixes)' : '✅ NO'}`);
  console.log(`   Has redirects: ${hasRedirects ? 'ℹ️  YES (check configuration)' : '✅ NO'}`);
  console.log(`   Has rewrites: ${hasRewrites ? 'ℹ️  YES (check configuration)' : '✅ NO'}`);
} else {
  console.log('   ❌ ERROR: next.config.js not found!');
}

console.log('');

// Summary and Recommendations
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  SUMMARY & RECOMMENDATIONS                                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

const recommendations: string[] = [];

if (!process.env.NETWORX_RETURN_URL) {
  recommendations.push('Set NETWORX_RETURN_URL environment variable in Vercel');
}

if (actualReturnUrl.includes('/payment/success')) {
  recommendations.push('Update NETWORX_RETURN_URL to point to /dashboard');
}

if (!dashboardPageExists) {
  recommendations.push('Create dashboard page at app/(dashboard)/dashboard/page.tsx');
}

if (actualReturnUrl.includes('Dashboard') || actualReturnUrl.includes('DASHBOARD')) {
  recommendations.push('Use lowercase /dashboard (Next.js routes are case-sensitive)');
}

if (recommendations.length > 0) {
  console.log('⚠️  RECOMMENDED ACTIONS:');
  console.log('');
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
  console.log('');
} else {
  console.log('✅ NO ISSUES FOUND');
  console.log('');
  console.log('   All configurations appear correct.');
  console.log('   If users are still getting 404, check:');
  console.log('   - Vercel environment variables are set');
  console.log('   - Deployment has been redeployed after changes');
  console.log('   - Payment provider (Networx) dashboard configuration');
  console.log('   - Browser console for redirect errors');
  console.log('');
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('Run with environment variables:');
console.log('   NETWORX_RETURN_URL=https://www.nerbixa.com/dashboard \\');
console.log('   npx tsx scripts/diagnose-payment-redirect.ts');
console.log('');

export {};







