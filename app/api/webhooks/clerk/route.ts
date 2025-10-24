/* eslint-disable camelcase */

import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
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
      // Check for idempotency - see if this webhook event was already processed
      const existingEvent = await prismadb.webhookEvent.findUnique({
        where: { eventId: svixEventId },
      });

      if (existingEvent?.processed) {
        console.log(`Webhook event ${svixEventId} already processed, skipping...`);
        const existingUser = await prismadb.user.findUnique({
          where: { clerkId: id },
        });
        return NextResponse.json({ 
          message: "Already processed", 
          user: existingUser,
          idempotent: true 
        });
      }

      // Use Prisma transaction to ensure atomicity
      console.log(`[Clerk Webhook] Starting transaction for user creation`, {
        clerkId: id,
        email: email_addresses[0].email_address,
      });

      const result = await prismadb.$transaction(async (tx) => {
        // Create webhook event record for idempotency
        await tx.webhookEvent.create({
          data: {
            eventId: svixEventId,
            eventType: "user.created",
            processed: false,
          },
        });
        console.log(`[Clerk Webhook] Webhook event created`);

        // Create user with initial 20 credits
        const newUser = await tx.user.create({
          data: {
            clerkId: id,
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            photo: image_url,
            availableGenerations: 20,
          },
        });
        console.log(`[Clerk Webhook] User created`, { 
          userId: newUser.id,
          clerkId: newUser.clerkId 
        });

        // Create transaction record for signup bonus
        const transaction = await tx.transaction.create({
          data: {
            tracking_id: id,
            userId: newUser.id,
            amount: 20,
            type: "credit",
            reason: "signup bonus",
            status: "completed",
            webhookEventId: svixEventId,
            paid_at: new Date(),
          },
        });
        console.log(`[Clerk Webhook] Transaction record created`, {
          transactionId: transaction.id,
          amount: transaction.amount,
        });

        // Mark webhook event as processed
        await tx.webhookEvent.update({
          where: { eventId: svixEventId },
          data: {
            processed: true,
            processedAt: new Date(),
          },
        });
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
  // const user = { clerkId: "111", email:"text2@cfas.com", photo:"https://fsdfdsafasd.com2", firstName:"maris2", lastName:'rabisko2', username: 'test2'}
  // const newUser = await createUser(user);
  return NextResponse.json({ message: "OK" });
}