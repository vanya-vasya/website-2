"use server";

import { revalidatePath } from "next/cache";
import db from "@/lib/db";

export interface User {
  id: string;
  clerkId: string;
  email: string;
  photo: string;
  firstName: string | null;
  lastName: string | null;
  usedGenerations: number;
  availableGenerations: number;
  createdAt: Date;
  updatedAt: Date;
}

// CREATE OR GET - Upsert user (create if not exists, return if exists)
export async function createOrGetUser(clerkUser: {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  photo: string;
}) {
  try {
    console.log('[CREATE_OR_GET_USER] Starting for clerkId:', clerkUser.clerkId);
    
    // Try to find existing user
    const existingResult = await db.query<User>(
      'SELECT * FROM "User" WHERE "clerkId" = $1',
      [clerkUser.clerkId]
    );

    if (existingResult.rows.length > 0) {
      console.log('[CREATE_OR_GET_USER] User exists:', existingResult.rows[0].id);
      return existingResult.rows[0];
    }

    // User doesn't exist, create new
    console.log('[CREATE_OR_GET_USER] Creating new user');
    const userId = db.generateId();
    const result = await db.query<User>(
      `INSERT INTO "User" 
        ("id", "clerkId", "email", "firstName", "lastName", "photo", "availableGenerations", "usedGenerations") 
       VALUES ($1, $2, $3, $4, $5, $6, 20, 0) 
       RETURNING *`,
      [
        userId,
        clerkUser.clerkId,
        clerkUser.email,
        clerkUser.firstName || null,
        clerkUser.lastName || null,
        clerkUser.photo
      ]
    );

    console.log('[CREATE_OR_GET_USER] Created user:', result.rows[0].id);
    return result.rows[0];
    
  } catch (error) {
    console.error('[CREATE_OR_GET_USER] Error:', error);
    throw error;
  }
}

// CREATE
export async function createUser(user: {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  photo: string;
  availableGenerations?: number;
  usedGenerations?: number;
}) {
  try {
    console.log('[createUser] Starting user creation', { 
      clerkId: user.clerkId,
      email: user.email 
    });
    
    const userId = db.generateId();
    const result = await db.query<User>(
      `INSERT INTO "User" 
        ("id", "clerkId", "email", "firstName", "lastName", "photo", "availableGenerations", "usedGenerations") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [
        userId,
        user.clerkId,
        user.email,
        user.firstName || null,
        user.lastName || null,
        user.photo,
        user.availableGenerations || 20,
        user.usedGenerations || 0
      ]
    );

    console.log('[createUser] User created successfully', { 
      id: result.rows[0].id,
      clerkId: result.rows[0].clerkId 
    });

    return result.rows[0];
  } catch (error) {
    console.error('[createUser] Error creating user:', error);
    throw error;
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    const result = await db.query<User>(
      'SELECT * FROM "User" WHERE "clerkId" = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// UPDATE
export async function updateUser(clerkId: string, user: {
  firstName?: string | null;
  lastName?: string | null;
  photo?: string;
  email?: string;
}) {
  try {
    console.log('[updateUser] Updating user', { clerkId });
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (user.firstName !== undefined) {
      updates.push(`"firstName" = $${paramIndex++}`);
      values.push(user.firstName);
    }
    if (user.lastName !== undefined) {
      updates.push(`"lastName" = $${paramIndex++}`);
      values.push(user.lastName);
    }
    if (user.photo !== undefined) {
      updates.push(`"photo" = $${paramIndex++}`);
      values.push(user.photo);
    }
    if (user.email !== undefined) {
      updates.push(`"email" = $${paramIndex++}`);
      values.push(user.email);
    }

    if (updates.length === 0) {
      throw new Error("No fields to update");
    }

    values.push(clerkId);
    const result = await db.query<User>(
      `UPDATE "User" SET ${updates.join(', ')} WHERE "clerkId" = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new Error("User update failed - user not found");
    }

    console.log('[updateUser] User updated successfully', { 
      id: result.rows[0].id,
      clerkId: result.rows[0].clerkId 
    });

    return result.rows[0];
  } catch (error) {
    console.error('[updateUser] Error updating user:', error);
    throw error;
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    // Find user to delete
    const findResult = await db.query<User>(
      'SELECT * FROM "User" WHERE "clerkId" = $1',
      [clerkId]
    );

    if (findResult.rows.length === 0) {
      throw new Error("User not found");
    }

    // Delete user
    const result = await db.query<User>(
      'DELETE FROM "User" WHERE "id" = $1 RETURNING *',
      [findResult.rows[0].id]
    );

    revalidatePath("/");

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    const result = await db.query<User>(
      'UPDATE "User" SET "usedGenerations" = "usedGenerations" + $1 WHERE "id" = $2 RETURNING *',
      [creditFee, userId]
    );

    if (result.rows.length === 0) {
      throw new Error("User credits update failed");
    }

    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
}
