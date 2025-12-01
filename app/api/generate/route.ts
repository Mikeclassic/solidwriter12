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
    
    // Simple credit check
    if (user.apiUsage >= user.usageLimit) {
        return new NextResponse("Usage Limit Reached. Please upgrade.", { status: 403 });
    }

    const body = await req.json();
    const { type, topic, keywords, tone, title, outline, documentId } = body;

    let systemPrompt = "";
    let userPrompt = "";

    // --- STEP 1: GENERATE TITLES ---
    if (type === "titles") {
        systemPrompt = "You are an SEO expert. Return ONLY a raw JSON array of 5 catchy, SEO-optimized blog titles. No markdown, no explanations.";
        userPrompt = `Topic: ${topic}. Keywords: ${keywords}. Tone: ${tone}.`;
    } 
    // --- STEP 2: GENERATE OUTLINE ---
    else if (type === "outline") {
        systemPrompt = "You are a content strategist. Return ONLY a raw JSON array of 6-8 distinct section headers (H2s) for a blog post. No markdown.";
        userPrompt = `Title: ${title}. Tone: ${tone}. Keywords: ${keywords}`;
    } 
    // --- STEP 3: WRITE FULL ARTICLE ---
    else if (type === "article") {
        systemPrompt = `You are an expert writer. Write a comprehensive, long-form blog post (HTML format). Use <h2> tags for section headers. Tone: ${tone}.`;
        userPrompt = `Title: ${title}\n\nOutline Structure:\n${JSON.stringify(outline)}\n\nWrite the full content now.`;
    }
    // --- SIDEBAR ASSISTANT (Legacy) ---
    else {
        systemPrompt = `You are a writing assistant. Tone: ${tone || "Professional"}.`;
        userPrompt = body.prompt;
    }

    // Call OpenRouter (Moonshot/Kimi)
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
            { role: "user", content: userPrompt }
        ],
        // Lower temperature for structured JSON tasks
        temperature: type === "titles" || type === "outline" ? 0.3 : 0.7, 
        reasoning: { enabled: true }
      })
    });

    if (!response.ok) {
        const error = await response.text();
        return new NextResponse(`AI Error: ${error}`, { status: 500 });
    }

    const data = await response.json();
    let generatedContent = data.choices[0]?.message?.content || "";

    // Cleanup JSON responses if they contain Markdown blocks
    if (type === "titles" || type === "outline") {
        generatedContent = generatedContent.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    // Update DB credits only for full generations, not small steps (optional, but friendlier)
    if (type === "article" || !type) {
        if (documentId) {
             // If writing into existing doc
             await db.document.update({
                where: { id: documentId },
                data: { content: generatedContent }
            });
        }
        
        await db.user.update({
            where: { id: user.id },
            data: { apiUsage: { increment: 1 } }
        });
    }

    return NextResponse.json({ result: generatedContent });

  } catch (error) {
    console.error("[GENERATE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}