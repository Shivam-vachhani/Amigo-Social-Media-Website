import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allPost = await prisma.post.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        comments: {
          select: {
            id: true,
            comment: true,
            postId: true,
            commenterId: true,
            createAt: true,
            user: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
            likerId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!allPost) {
      return NextResponse.json({
        success: false,
        message: "Can't fetch all posts ",
      });
    }
    return NextResponse.json({
      success: true,
      message: "Successfully fathched all post",
      posts: allPost,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Somthing went wrong in fetch all posts",
    });
  }
}
