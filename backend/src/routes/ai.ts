import { Router, Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are the FitReach Revivr AI assistant — an expert in fitness member retention and engagement strategy.
You have access to member data including engagement scores, churn risk levels (LOW/MEDIUM/HIGH), membership types (GOLD/SILVER/BASIC), visit history, and communication logs.
Help gym operators reduce churn, craft targeted messages, and build smart member segments.
Be concise, data-driven, and actionable.`;

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: Array<{ role: "user" | "assistant"; content: string }>;
    };

    if (!message) {
      res.status(400).json({ error: "message is required" });
      return;
    }

    const messages: Anthropic.MessageParam[] = [
      ...(history ?? []).map((h) => ({ role: h.role, content: h.content })),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const text = response.content.find((b) => b.type === "text");
    res.json({ response: text?.type === "text" ? text.text : "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI chat failed" });
  }
});

router.post("/draft-message", async (req: Request, res: Response) => {
  try {
    const { segmentName, channel, tone, memberCount } = req.body as {
      segmentName: string;
      channel: string;
      tone: string;
      memberCount: number;
    };

    if (!segmentName || !channel || !tone) {
      res.status(400).json({ error: "segmentName, channel, and tone are required" });
      return;
    }

    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Draft a ${channel} message for the "${segmentName}" segment (${memberCount ?? "unknown number of"} members). Tone: ${tone}. Return only the message text, no explanation.`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    res.json({ message: text?.type === "text" ? text.text : "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Draft message failed" });
  }
});

router.post("/segment", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body as { prompt: string };

    if (!prompt) {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Convert this natural language description into segment filters and an insight.

Description: "${prompt}"

Respond with valid JSON only, in this exact shape:
{
  "filters": {
    "churnRisk": "HIGH" | "MEDIUM" | "LOW" | null,
    "membershipType": "GOLD" | "SILVER" | "BASIC" | null
  },
  "insight": "<one sentence explaining who this segment targets and why>"
}`,
        },
      ],
    });

    const text = response.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") {
      res.status(500).json({ error: "No response from AI" });
      return;
    }

    const jsonMatch = text.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: "Could not parse AI response" });
      return;
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      filters: { churnRisk: string | null; membershipType: string | null };
      insight: string;
    };

    res.json(parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Segment generation failed" });
  }
});

export default router;
