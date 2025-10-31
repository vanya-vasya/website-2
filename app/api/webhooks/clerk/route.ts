/* eslint-disable camelcase */

import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { deleteUser, updateUser } from "@/lib/actions/user.actions";
import db from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET!);
  
  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;
  
  // CREATE
  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name } = evt.data;
    const svixEventId = evt.data.id || svix_id;

    try {
      // Get email address safely
      const userEmail = email_addresses?.[0]?.email_address || null;
      
      if (!userEmail) {
        console.error(`[Clerk Webhook] No email address found for user ${id}`);
        return NextResponse.json(
          { 
            message: "Error creating user", 
            error: "No email address found in webhook data" 
          },
          { status: 400 }
        );
      }

      // Check for idempotency - see if this webhook event was already processed
      const existingEventResult = await db.query(
        'SELECT * FROM "WebhookEvent" WHERE "eventId" = $1',
        [svixEventId]
      );

      if (existingEventResult.rows.length > 0 && existingEventResult.rows[0].processed) {
        console.log(`Webhook event ${svixEventId} already processed, skipping...`);
        const existingUserResult = await db.query(
          'SELECT * FROM "User" WHERE "clerkId" = $1',
          [id]
        );
        return NextResponse.json({ 
          message: "Already processed", 
          user: existingUserResult.rows[0],
          idempotent: true 
        });
      }

      // Use database transaction to ensure atomicity
      console.log(`[Clerk Webhook] Starting transaction for user creation`, {
        clerkId: id,
        email: userEmail,
      });

      const result = await db.transaction(async (client) => {
        // Create webhook event record for idempotency
        const webhookEventId = db.generateId();
        await client.query(
          `INSERT INTO "WebhookEvent" ("id", "eventId", "eventType", "processed") 
           VALUES ($1, $2, $3, false)`,
          [webhookEventId, svixEventId, "user.created"]
        );
        console.log(`[Clerk Webhook] Webhook event created`);

        // Create user with initial 20 credits
        const userId = db.generateId();
        const userResult = await client.query(
          `INSERT INTO "User" 
            ("id", "clerkId", "email", "firstName", "lastName", "photo", "availableGenerations") 
           VALUES ($1, $2, $3, $4, $5, $6, 20) 
           RETURNING *`,
          [userId, id, userEmail, first_name, last_name, image_url]
        );
        const newUser = userResult.rows[0];
        console.log(`[Clerk Webhook] User created`, { 
          userId: newUser.id,
          clerkId: newUser.clerkId 
        });

        // Create transaction record for signup bonus
        const transactionId = db.generateId();
        const transactionResult = await client.query(
          `INSERT INTO "Transaction" 
            ("id", "tracking_id", "userId", "amount", "type", "reason", "status", "webhookEventId", "paid_at") 
           VALUES ($1, $2, $3, 20, 'credit', 'signup bonus', 'completed', $4, NOW()) 
           RETURNING *`,
          [transactionId, id, newUser.id, svixEventId]
        );
        const transaction = transactionResult.rows[0];
        console.log(`[Clerk Webhook] Transaction record created`, {
          transactionId: transaction.id,
          amount: transaction.amount,
        });

        // Mark webhook event as processed
        await client.query(
          'UPDATE "WebhookEvent" SET "processed" = true, "processedAt" = NOW() WHERE "eventId" = $1',
          [svixEventId]
        );
        console.log(`[Clerk Webhook] Webhook event marked as processed`);

        return { user: newUser, transaction };
      });

      console.log(`[Clerk Webhook] Transaction completed successfully`);

      // Set public metadata in Clerk
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: result.user.id,
        },
      });

      console.log(`Successfully created user ${id} with 20 signup credits`);
      
      return NextResponse.json({ 
        message: "OK", 
        user: result.user,
        transaction: result.transaction 
      });

    } catch (error) {
      console.error("Error creating user:", error);
      
      // If transaction failed, webhook event won't be marked as processed
      // allowing for retry on next webhook delivery
      return NextResponse.json(
        { 
          message: "Error creating user", 
          error: error instanceof Error ? error.message : "Unknown error" 
        },
        { status: 500 }
      );
    }
  }

  // UPDATE
  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name } = evt.data;

    const user = {
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    };

    const updatedUser = await updateUser(id, user);

    return NextResponse.json({ message: "OK", user: updatedUser });
  }

  // DELETE
  if (eventType === "user.deleted") {
    const { id } = evt.data;

    const deletedUser = await deleteUser(id!);

    return NextResponse.json({ message: "OK", user: deletedUser });
  }

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log("Webhook body:", body);

  return new Response("", { status: 200 });
}

export async function GET(req: Request) {
  return NextResponse.json({ message: "OK" });
}
