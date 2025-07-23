"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database/mongoose";
import { handleError } from "../utils";
import User from "../database/models/user.model";
import Image from "../database/models/image.model";
import { redirect } from "next/navigation";
import { v2 as cloudinary } from "cloudinary";

const populateUser = (query: any) => query.populate({
  path: "author",
  model: User,
  select: "_id firstName lastName clerkId"
});

// Add image to database
export async function addImage({ image, userId, path }: AddImageParams) {
  try {
    console.log('Attempting to connect to database...');
    await connectToDatabase();
    console.log('Successfully connected to database');

    let author = await User.findOne({ clerkId: userId });

    if (!author) {
      // Fallback: fetch from Clerk and create user
      const { clerkClient } = await import("@clerk/nextjs/server");
      const clerkUser = await clerkClient.users.getUser(userId);
      author = await User.create({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress.split("@")[0] || clerkUser.id,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        photo: clerkUser.imageUrl,
      });
    }

    const newImage = await Image.create({
      ...image,
      author: author._id
    })

    revalidatePath(path);

    return JSON.parse(JSON.stringify(newImage));
  } catch (error) {
    console.error('Error in addImage:', error);
    throw error;
  }
}

// Update image
export async function updateImage({ image, userId, path }: UpdateImageParams) {
  try {
    console.log('Attempting to connect to database...');
    await connectToDatabase();
    console.log('Successfully connected to database');

    const author = await User.findOne({ clerkId: userId });

    if (!author) {
      console.error('User not found in updateImage:', userId);
      throw new Error("User not found");
    }

    const imageToUpdate = await Image.findById(image._id);

    if (!imageToUpdate || imageToUpdate.author.toString() !== author._id.toString()) {
      throw new Error("Unauthorized or image not found");
    }

    const updatedImage = await Image.findByIdAndUpdate(
      imageToUpdate._id,
      { ...image, author: author._id },
      { new: true }
    );

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedImage));
  } catch (error) {
    console.error('Error in updateImage:', error);
    throw error;
  }
}

// Delete image
export async function deleteImage(imageId: string, path: string) {
  try {
    console.log('Attempting to connect to database...');
    const db = await connectToDatabase();
    console.log('Successfully connected to database');

    const deletedImage = await Image.findByIdAndDelete(imageId);

    if (deletedImage) revalidatePath(path);

    return JSON.parse(JSON.stringify(deletedImage));
  } catch (error) {
    console.error('Error in deleteImage:', error);
    handleError(error)
  }
}

// Get image
export async function getImageById(imageId: string) {
  try {
    console.log('Attempting to connect to database...');
    const db = await connectToDatabase();
    console.log('Successfully connected to database');

    const image = await populateUser(Image.findById(imageId));

    if (!image) throw new Error("Image not found");

    return JSON.parse(JSON.stringify(image));
  } catch (error) {
    console.error('Error in getImageById:', error);
    handleError(error)
  }
}

// Get all images
export async function getAllImages({
  limit = 9,
  page = 1,
  searchQuery = "",
}: {
  limit?: number;
  page: number;
  searchQuery?: string;
}) {
  try {
    console.log('Attempting to connect to database...');
    const db = await connectToDatabase();
    console.log('Successfully connected to database');

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new Error("Missing Cloudinary credentials");
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    let expression = "folder=imagenko";

    if (searchQuery) {
      expression += ` AND ${searchQuery}`;
    }

    const { resources } = await cloudinary.search
      .expression(expression)
      .execute();

    const resourceIds = resources.map((resource: any) => resource.public_id);

    let query = {};

    if (searchQuery) {
      query = {
        publicId: {
          $in: resourceIds
        }
      };
    }

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find(query))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find(query).countDocuments();
    const savedImages = await Image.find().countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
      savedImages,
    };
  } catch (error) {
    console.error('Error in getAllImages:', error);
    handleError(error);
  }
}

// Get User Images
export async function getUserImages({
  limit = 9,
  page = 1,
  userId,
}: {
  limit?: number;
  page: number;
  userId: string;
}) {
  try {
    console.log('Attempting to connect to database...');
    const db = await connectToDatabase();
    console.log('Successfully connected to database');

    const skipAmount = (Number(page) - 1) * limit;

    const images = await populateUser(Image.find({ author: userId }))
      .sort({ updatedAt: -1 })
      .skip(skipAmount)
      .limit(limit);

    const totalImages = await Image.find({ author: userId }).countDocuments();

    return {
      data: JSON.parse(JSON.stringify(images)),
      totalPage: Math.ceil(totalImages / limit),
    };
  } catch (error) {
    console.error('Error in getUserImages:', error);
    handleError(error);
  }
}