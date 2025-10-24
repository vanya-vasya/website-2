"use server";

import { revalidatePath } from "next/cache";
// NOTE: Keep imports minimal; we do not auto-create users here to avoid backend logic changes.
import prismadb from "@/lib/prismadb";

// CREATE
export async function createUser(user: any) {
  try {
    console.log('[createUser] Starting user creation', { 
      clerkId: user.clerkId,
      email: user.email 
    });
    
    const newUser = await prismadb.user.create({
      data: user,
    });

    console.log('[createUser] User created successfully', { 
      id: newUser.id,
      clerkId: newUser.clerkId 
    });

    return newUser;
  } catch (error) {
    console.error('[createUser] Error creating user:', error);
    console.error('[createUser] User data:', user);
    throw error;
  }
}

// READ
export async function getUserById(userId: string){
  try {
    const user = await prismadb.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    return user;
  } catch (error) {
    console.error(error);
  }
}


// UPDATE
export async function updateUser(clerkId: string, user: any){
  try {
    console.log('[updateUser] Updating user', { clerkId });
    
    const updatedUser = await prismadb.user.update({
      where: { clerkId },
      data: user,
    });

    if (!updatedUser) throw new Error("User update failed");

    console.log('[updateUser] User updated successfully', { 
      id: updatedUser.id,
      clerkId: updatedUser.clerkId 
    });

    return updatedUser;
  } catch (error) {
    console.error('[updateUser] Error updating user:', error);
    throw error;
  }
}

// DELETE
export async function deleteUser(clerkId: string) {
  try {
    // Find user to delete
    const userToDelete = await prismadb.user.findUnique({
      where: { clerkId },
    });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Delete user
    const deletedUser = await prismadb.user.delete({
      where: { id: userToDelete.id },
    });

    revalidatePath("/");

    return deletedUser;
  } catch (error) {
    console.error(error);
  }
}

// USE CREDITS
export async function updateCredits(userId: string, creditFee: number) {
  try {
    const updatedUserCredits = await prismadb.user.update({
      where: { id: userId },
      data: {
        usedGenerations: {
          increment: creditFee,
        },
      },
    });

    if (!updatedUserCredits) throw new Error("User credits update failed");

    return updatedUserCredits;
  } catch (error) {
    console.error(error);
  }
}