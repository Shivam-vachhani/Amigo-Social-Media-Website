import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const postData = await req.formData();
    const userId = postData.get("userId") as string;
    const title = postData.get("title") as string;
    const description = postData.get("description") as string;
    const file = postData.get("image") as File;

    const arraybuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arraybuffer);
    const imageUrl = await new Promise<string | null>((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder: "posts",
        },
        (error, result) => {
          if (error) return reject(error);
          else resolve(result?.secure_url || null);
        },
      );
      upload.end(buffer);
    });

    const post = await prisma.post.create({
      data: {
        title: title,
        description: description,
        imageUrl: imageUrl,
        ownerId: userId,
      },
    });

    if (!post) {
      return NextResponse.json({
        success: false,
        message: "Post isn't created somthing went wrong",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully Post Created..",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Post isn't created somthing went wrong",
    });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  try {
    let posts;
    if (id) {
      posts = await prisma.post.findMany({
        where: { ownerId: id },
      });
    }

    if (!posts) {
      return NextResponse.json({
        success: false,
        message: "Can't find any posts",
      });
    }
    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "somthing went wrong in getting posts ",
    });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const postData = await req.formData();
    const postId = postData.get("postId") as string;
    const title = postData.get("title") as string;
    const description = postData.get("description") as string;
    const oldImgUrl = postData.get("OldImageUrl") as string;
    const Newimage = postData.get("Newimage") as File;
    let NewImageUrl;
    if (Newimage) {
      const parts = oldImgUrl.split("/");
      const fileName = parts[parts.length - 1];
      const publicId = fileName.split(".")[0];

      const arrayBuffer = await Newimage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      NewImageUrl = await new Promise<string | null>((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: "posts",
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
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: {
        title: title,
        description: description,
        imageUrl: Newimage ? NewImageUrl : oldImgUrl,
      },
    });

    if (!post) {
      return NextResponse.json({
        success: false,
        message: "Post dosen't exist",
      });
    }
    return NextResponse.json({
      success: true,
      message: "Post successfully updated",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Post isn't Updated somthing went wrong",
    });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let isDeleted;
    if (id) {
      isDeleted = await prisma.post.delete({
        where: { id: id },
      });
    }

    if (!isDeleted) {
      return NextResponse.json({
        success: false,
        message: "Post isn't deleted",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Post Successfully Deleted",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      success: false,
      message: "Somthing went wrong in Deleting Post",
    });
  }
}
