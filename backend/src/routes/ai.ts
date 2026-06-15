import { Router } from "express";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

router.post("/chat", async (req: any, res: any) => {
  try {
    const { message, history = [] } = req.body;

    console.log("AI chat called:", message);
    console.log("API Key exists:", !!process.env.ANTHROPIC_API_KEY);

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `You are an AI assistant for FitReach Revivr, a fitness member retention CRM. You help fitness studio managers identify at-risk members, create campaigns, and improve member retention.

You have access to data about:
- 50 fitness members (15 GOLD, 20 SILVER, 15 BASIC)
- 18 high churn risk members
- 3 segments
- 2 campaigns

Be concise, helpful and actionable. When asked to draft messages, write them in a motivational fitness tone.`,
      messages: [
        ...history.map((h: any) => ({ role: h.role, content: h.content })),
        { role: "user", content: message },
      ],
    });

    const aiResponse =
      response.content[0].type === "text"
        ? response.content[0].text
        : "Sorry, I could not process that.";

    console.log("AI response generated successfully");

    res.json({ response: aiResponse, success: true });
  } catch (error: any) {
    console.error("AI chat error:", error.message);
    res.status(500).json({ error: "AI service error", details: error.message });
  }
});

router.post("/draft-message", async (req: any, res: any) => {
  try {
    const { segmentName, channel, tone, memberCount } = req.body;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Draft a ${tone || "motivational"} ${channel || "WhatsApp"} message for ${memberCount || "some"} fitness members in the "${segmentName || "general"}" segment.
Keep it under 160 characters for SMS, or 300 characters for WhatsApp.
Use {name} as placeholder for member name.
Make it personal and actionable.`,
        },
      ],
    });

    res.json({
      message:
        response.content[0].type === "text"
          ? response.content[0].text
          : "Hey {name}! We miss you at FitReach! 💪",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/segment", async (req: any, res: any) => {
  try {
    const { prompt } = req.body;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Convert this to member filters: "${prompt}"

Available filters:
- churnRisk: HIGH, MEDIUM, LOW
- membershipType: GOLD, SILVER, BASIC
- lastVisitDays: number (days since last visit)

Respond in JSON:
{
  "filters": { "churnRisk": "HIGH" },
  "insight": "Brief explanation",
  "estimatedCount": 18
}`,
        },
      ],
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    try {
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      res.json(parsed);
    } catch {
      res.json({ filters: {}, insight: text, estimatedCount: 0 });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
