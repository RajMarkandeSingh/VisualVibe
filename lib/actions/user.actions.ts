"use server";

import { revalidatePath } from "next/cache";

import User from "../database/models/user.model";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";

// CREATE
export async function createUser(user: CreateUserParams) {
  try {
    console.log('Attempting to create user:', { clerkId: user.clerkId });
    await connectToDatabase();

    const existingUser = await User.findOne({ clerkId: user.clerkId });
    if (existingUser) {
      console.log('User already exists:', { clerkId: user.clerkId });
      return JSON.parse(JSON.stringify(existingUser));
    }

    const newUser = await User.create(user);
    console.log('User created successfully:', { clerkId: user.clerkId });

    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    console.error('Error creating user:', error);
    handleError(error);
  }
}

// READ
export async function getUserById(userId: string) {
  try {
    if (!userId) {
      console.error('getUserById called with invalid userId:', userId);
      throw new Error('Invalid user ID provided');
    }

    console.log('Attempting to get user by ID:', userId);
    await connectToDatabase();

    const user = await User.findOne({ clerkId: userId }).lean();

    if (!user) {
      console.error('User not found for ID:', userId);
      throw new Error('User not found');
    }

    console.log('User found successfully:', { clerkId: userId });
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    console.error('Error getting user:', error);
    throw error; // Re-throw to be handled by the calling function
  }
}

// UPDATE
export async function updateUser(params: UpdateUserParams) {
  try {
    const { clerkId, updateData } = params;
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate(
      { clerkId },
      updateData,
      { new: true }
    ).lean();

    if (!updatedUser) {
      throw new Error('User update failed');
    }

    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Error updating user:', error);
    handleError(error);
  }
}

// DELETE
export async function deleteUser(params: DeleteUserParams) {
  try {
    const { clerkId } = params;
    await connectToDatabase();

    const deletedUser = await User.findOneAndDelete({ clerkId }).lean();

    if (!deletedUser) {
      throw new Error('User deletion failed');
    }

    revalidatePath("/");

    return JSON.parse(JSON.stringify(deletedUser));
  } catch (error) {
    console.error('Error deleting user:', error);
    handleError(error);
  }
}

// UPDATE CREDITS
export async function updateCredits(userId: string, credits: number) {
  try {
    await connectToDatabase();
    
    // Check if user is admin
    const user = await User.findOne({ clerkId: userId });
    if (user?.isAdmin) {
      // Admin users don't lose credits
      return user;
    }
    
    // Regular users lose credits
    const updatedUser = await User.findOneAndUpdate(
      { clerkId: userId },
      { $inc: { creditBalance: -Math.abs(credits) } },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    console.error("Error updating credits:", error);
    throw error;
  }
}

// CHECK IF USER IS ADMIN
export async function isUserAdmin(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId }).lean();
    return user?.isAdmin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// MAKE USER ADMIN
export async function makeUserAdmin(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { isAdmin: true },
      { new: true }
    );
    return user;
  } catch (error) {
    console.error("Error making user admin:", error);
    throw error;
  }
}

// GET USER CREDIT BALANCE (WITH ADMIN CHECK)
export async function getUserCreditBalance(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId }).lean();
    
    if (user?.isAdmin) {
      return "∞"; // Infinity symbol for admin
    }
    
    return user?.creditBalance || 0;
  } catch (error) {
    console.error("Error getting user credit balance:", error);
    return 0;
  }
}