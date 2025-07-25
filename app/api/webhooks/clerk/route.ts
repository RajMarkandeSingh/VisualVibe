/* eslint-disable camelcase */
import { clerkClient } from "@clerk/nextjs";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";

import { createUser, deleteUser, updateUser } from "@/lib/actions/user.actions";

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
  const wh = new Webhook(WEBHOOK_SECRET);

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
    return new Response(
      "Error occurred",
      {
        status: 400,
      }
    );
  }

  const eventType = evt.type;

  console.log(`Webhook received! Event type: ${eventType}`);

  if (eventType === "user.created") {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    try {
      // Create a new user in your database
      const user = await createUser({
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username || first_name,
        firstName: first_name || "",
        lastName: last_name || "",
        photo: image_url,
      });

      // Update Clerk user metadata
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: user._id
        }
      });

      return NextResponse.json({ message: "User created", user });
    } catch (err) {
      console.error("Error in user.created webhook:", err);
      return new Response("Error occurred", { status: 500 });
    }
  }

  if (eventType === "user.updated") {
    const { id, image_url, first_name, last_name, username } = evt.data;

    try {
      const user = await updateUser({
        clerkId: id,
        updateData: {
          firstName: first_name,
          lastName: last_name,
          username: username,
          photo: image_url,
        },
      });

      return NextResponse.json({ message: "User updated", user });
    } catch (err) {
      console.error("Error in user.updated webhook:", err);
      return new Response("Error occurred", { status: 500 });
    }
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    try {
      const user = await deleteUser({
        clerkId: id!,
      });

      return NextResponse.json({ message: "User deleted", user });
    } catch (err) {
      console.error("Error in user.deleted webhook:", err);
      return new Response("Error occurred", { status: 500 });
    }
  }

  return new Response("", { status: 200 });
}