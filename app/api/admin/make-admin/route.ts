import { NextRequest, NextResponse } from "next/server";
import { makeUserAdmin } from "@/lib/actions/user.actions";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Check if the user making the request is the admin
    const { userId: authedUserId } = auth();
    if (authedUserId !== process.env.NEXT_PUBLIC_ADMIN_ID) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const updatedUser = await makeUserAdmin(userId);
    
    return NextResponse.json({
      message: "User made admin successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error making user admin:", error);
    return NextResponse.json(
      { error: "Failed to make user admin" },
      { status: 500 }
    );
  }
} 