import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { io } from "../index";
import { LogStatus } from "@prisma/client";

const router = Router();

router.post("/callback", async (req: Request, res: Response) => {
  try {
    const { communicationLogId, status, timestamp } = req.body as {
      communicationLogId: string;
      status: LogStatus;
      timestamp?: string;
    };

    const ts = timestamp ? new Date(timestamp) : new Date();

    const statusFieldMap: Partial<Record<LogStatus, Record<string, Date>>> = {
      DELIVERED: { deliveredAt: ts },
      OPENED: { openedAt: ts },
      CLICKED: { clickedAt: ts },
      CONVERTED: { convertedAt: ts },
    };

    const log = await prisma.communicationLog.update({
      where: { id: communicationLogId },
      data: {
        status,
        ...(statusFieldMap[status] ?? {}),
      },
      include: {
        member: true,
        campaign: true,
      },
    });

    const campaignCountField: Partial<Record<LogStatus, string>> = {
      DELIVERED: "totalDelivered",
      OPENED: "totalOpened",
      CLICKED: "totalClicked",
      CONVERTED: "totalConverted",
      FAILED: "totalFailed",
    };

    const field = campaignCountField[status];
    if (field) {
      await prisma.campaign.update({
        where: { id: log.campaignId },
        data: { [field]: { increment: 1 } },
      });
    }

    io.emit("callback_update", {
      memberName: log.member.name,
      status,
      channel: log.campaign.channel,
      campaignId: log.campaignId,
    });

    res.json({ message: "Callback processed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process callback" });
  }
});

export default router;
