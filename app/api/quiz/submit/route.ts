import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, participantName, participantEmail, answers, timeSpent } = body;

    if (!sessionId || !participantName || !answers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if session exists and is unlocked
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "unlocked") {
      return NextResponse.json(
        { error: "Session is not accepting responses" },
        { status: 403 }
      );
    }

    const response = await prisma.response.create({
      data: {
        sessionId,
        participantName,
        participantEmail: participantEmail || null,
        answers: JSON.stringify(answers),
        timeSpent: timeSpent || null,
      }
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
