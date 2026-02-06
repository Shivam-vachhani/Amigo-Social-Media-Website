import cloudinary from "@/lib/cloudinary";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "user Id is missing" },
        { status: 401 },
      );
    }

    const userData = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        password: false,
        refreshToken: false,
        name: true,
        email: true,
        avatarUrl: true,
        bio: true,
        location: true,
        createdAt: true,
        _count: {
          select: {
            post: true,
            sentFriendReqs: true,
            recivedFriendReqs: true,
          },
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { success: false, message: "Invalid userId" },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Successfully get User data",
      data: userData,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Somthing went wrong in fetching User data",
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userData = await req.formData();
    const userId = userData.get("userId") as string;
    const name = userData.get("name") as string;
    const bio = userData.get("bio") as string;
    const location = userData.get("loaction") as string;
    const newImage = userData.get("newImage") as File;
    const oldImage = userData.get("oldImage") as string;
    let newImageUrl;
    if (newImage && oldImage) {
      const parts = oldImage.split("/");
      const fileName = parts[parts.length - 1];
      const publicId = fileName.split(".")[0];

      const arrayBuffer = await newImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      newImageUrl = await new Promise<string | null>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: "users",
            public_id: publicId,
            overwrite: true,
            invalidate: true,
          },
          (error, result) => {
            if (error) return reject(error);
            else resolve(result?.secure_url || null);
          },
        );
        upload.end(buffer);
      });
    } else {
      const arrayBuffer = await newImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      newImageUrl = await new Promise<string | null>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: "users",
          },
          (error, result) => {
            if (error) return reject(error);
            else resolve(result?.secure_url || null);
          },
        );
        upload.end(buffer);
      });
    }

    if (!name || !bio || !location) {
      return NextResponse.json({
        success: false,
        message: "somthing missing to update userData",
      });
    }

    const updatedUserData = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name,
        bio: bio,
        location: location,
        avatarUrl: newImageUrl,
      },
    });

    if (!updatedUserData) {
      return NextResponse.json(
        {
          success: false,
          message: "can't update user",
        },
        {
          status: 401,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "successfully update User",
      data: updatedUserData,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in updating userdata",
    });
  }
}
