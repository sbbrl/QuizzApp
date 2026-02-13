import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const quizSession = await prisma.session.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        },
        responses: {
          orderBy: { submittedAt: 'desc' }
        }
      }
    });

    if (!quizSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(quizSession);
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, unlockTime, timeLimit } = body;

    const updatedSession = await prisma.session.update({
      where: { id },
      data: {
        status: status || undefined,
        unlockTime: unlockTime !== undefined ? (unlockTime ? new Date(unlockTime) : null) : undefined,
        timeLimit: timeLimit !== undefined ? timeLimit : undefined,
      }
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
