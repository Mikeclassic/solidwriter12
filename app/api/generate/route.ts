import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

    const user = await db.user.findUnique({ where: { email: session.user.email } });
    
    if (!user) return new NextResponse("User not found", { status: 404 });
    if (user.apiUsage >= user.usageLimit) {
        return new NextResponse("Usage Limit Reached. Please upgrade.", { status: 403 });
    }

    const { prompt, tone, documentId } = await req.json();

    if (!prompt) return new NextResponse("Prompt required", { status: 400 });

    const systemPrompt = `You are Solidwriter, an advanced AI writing assistant. Tone: ${tone || "Professional"}.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: "moonshotai/kimi-k2-thinking",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
        ],
        reasoning: { enabled: true }
      })
    });

    if (!response.ok) {
        const error = await response.text();
        return new NextResponse(`AI Error: ${error}`, { status: 500 });
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content || "";

    if (documentId) {
        await db.document.update({
            where: { id: documentId },
            data: { content: generatedText } 
        });
    }

    await db.user.update({
        where: { id: user.id },
        data: { apiUsage: { increment: 1 } }
    });

    return NextResponse.json({ content: generatedText });

  } catch (error) {
    console.error("[GENERATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}