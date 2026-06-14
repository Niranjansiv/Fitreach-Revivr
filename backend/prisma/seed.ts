import { PrismaClient, MembershipType, ChurnRisk, LogStatus } from "@prisma/client";

const prisma = new PrismaClient();

const TODAY = new Date("2026-06-15");
const CLASSES = ["Yoga", "HIIT", "Spin", "Zumba", "Strength Training"] as const;
const TRAINERS = ["Rahul Sharma", "Priya Nair", "Amit Patel", "Sneha Iyer", "Vikram Singh", "Deepa Menon"] as const;
const AVATAR_COLORS = ["#00ff87", "#7c3aed", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"] as const;

function daysAgo(n: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d;
}

function monthsAgo(n: number): Date {
  const d = new Date(TODAY);
  d.setMonth(d.getMonth() - n);
  return d;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type MemberTemplate = {
  name: string;
  membership: MembershipType;
  risk: ChurnRisk;
  lastVisitDays: number;
  joinMonths: number;
  engagement: number;
  visits: number;
  favClass: string;
};

const memberTemplates: MemberTemplate[] = [
  // ── GOLD ── 15 members (10 LOW · 3 MEDIUM · 2 HIGH) ─────────────────
  { name: "Aarav Sharma",    membership: "GOLD",   risk: "LOW",    lastVisitDays: 2,  joinMonths: 12, engagement: 92, visits: 145, favClass: "Yoga"             },
  { name: "Priya Patel",     membership: "GOLD",   risk: "LOW",    lastVisitDays: 1,  joinMonths: 18, engagement: 88, visits: 138, favClass: "HIIT"             },
  { name: "Rohan Mehta",     membership: "GOLD",   risk: "LOW",    lastVisitDays: 3,  joinMonths: 15, engagement: 95, visits: 142, favClass: "Spin"             },
  { name: "Ananya Nair",     membership: "GOLD",   risk: "LOW",    lastVisitDays: 4,  joinMonths: 10, engagement: 85, visits: 120, favClass: "Yoga"             },
  { name: "Karan Kapoor",    membership: "GOLD",   risk: "LOW",    lastVisitDays: 1,  joinMonths: 14, engagement: 91, visits: 135, favClass: "Strength Training"},
  { name: "Deepika Iyer",    membership: "GOLD",   risk: "LOW",    lastVisitDays: 2,  joinMonths: 8,  engagement: 87, visits: 98,  favClass: "Zumba"            },
  { name: "Arjun Verma",     membership: "GOLD",   risk: "LOW",    lastVisitDays: 5,  joinMonths: 16, engagement: 89, visits: 148, favClass: "HIIT"             },
  { name: "Pooja Reddy",     membership: "GOLD",   risk: "LOW",    lastVisitDays: 3,  joinMonths: 11, engagement: 82, visits: 110, favClass: "Yoga"             },
  { name: "Vikram Malhotra", membership: "GOLD",   risk: "LOW",    lastVisitDays: 6,  joinMonths: 13, engagement: 90, visits: 130, favClass: "Spin"             },
  { name: "Shreya Gupta",    membership: "GOLD",   risk: "LOW",    lastVisitDays: 1,  joinMonths: 17, engagement: 93, visits: 149, favClass: "Strength Training"},
  { name: "Rahul Agarwal",   membership: "GOLD",   risk: "MEDIUM", lastVisitDays: 10, joinMonths: 9,  engagement: 74, visits: 88,  favClass: "HIIT"             },
  { name: "Neha Krishnan",   membership: "GOLD",   risk: "MEDIUM", lastVisitDays: 14, joinMonths: 12, engagement: 71, visits: 85,  favClass: "Zumba"            },
  { name: "Siddharth Joshi", membership: "GOLD",   risk: "MEDIUM", lastVisitDays: 18, joinMonths: 15, engagement: 72, visits: 92,  favClass: "Yoga"             },
  { name: "Divya Pillai",    membership: "GOLD",   risk: "HIGH",   lastVisitDays: 25, joinMonths: 6,  engagement: 78, visits: 81,  favClass: "Spin"             },
  { name: "Aditya Bose",     membership: "GOLD",   risk: "HIGH",   lastVisitDays: 35, joinMonths: 8,  engagement: 75, visits: 83,  favClass: "Strength Training"},

  // ── SILVER ── 20 members (6 LOW · 8 MEDIUM · 6 HIGH) ────────────────
  { name: "Meera Chaudhary", membership: "SILVER", risk: "LOW",    lastVisitDays: 2,  joinMonths: 6,  engagement: 68, visits: 72,  favClass: "Yoga"             },
  { name: "Rajesh Kumar",    membership: "SILVER", risk: "LOW",    lastVisitDays: 4,  joinMonths: 8,  engagement: 65, visits: 65,  favClass: "HIIT"             },
  { name: "Anjali Singh",    membership: "SILVER", risk: "LOW",    lastVisitDays: 1,  joinMonths: 5,  engagement: 62, visits: 58,  favClass: "Zumba"            },
  { name: "Suresh Nambiar",  membership: "SILVER", risk: "LOW",    lastVisitDays: 3,  joinMonths: 9,  engagement: 64, visits: 70,  favClass: "Spin"             },
  { name: "Kavya Menon",     membership: "SILVER", risk: "LOW",    lastVisitDays: 5,  joinMonths: 7,  engagement: 60, visits: 62,  favClass: "Strength Training"},
  { name: "Abhishek Tiwari", membership: "SILVER", risk: "LOW",    lastVisitDays: 6,  joinMonths: 10, engagement: 63, visits: 75,  favClass: "HIIT"             },
  { name: "Lakshmi Rajan",   membership: "SILVER", risk: "MEDIUM", lastVisitDays: 9,  joinMonths: 6,  engagement: 55, visits: 52,  favClass: "Yoga"             },
  { name: "Gaurav Pandey",   membership: "SILVER", risk: "MEDIUM", lastVisitDays: 12, joinMonths: 9,  engagement: 52, visits: 48,  favClass: "Spin"             },
  { name: "Riya Desai",      membership: "SILVER", risk: "MEDIUM", lastVisitDays: 15, joinMonths: 7,  engagement: 50, visits: 45,  favClass: "Zumba"            },
  { name: "Manish Sinha",    membership: "SILVER", risk: "MEDIUM", lastVisitDays: 8,  joinMonths: 11, engagement: 57, visits: 55,  favClass: "HIIT"             },
  { name: "Sunita Sharma",   membership: "SILVER", risk: "MEDIUM", lastVisitDays: 11, joinMonths: 8,  engagement: 54, visits: 50,  favClass: "Yoga"             },
  { name: "Nikhil Rao",      membership: "SILVER", risk: "MEDIUM", lastVisitDays: 16, joinMonths: 6,  engagement: 48, visits: 42,  favClass: "Strength Training"},
  { name: "Preeti Dubey",    membership: "SILVER", risk: "MEDIUM", lastVisitDays: 19, joinMonths: 10, engagement: 45, visits: 38,  favClass: "Spin"             },
  { name: "Harish Bhatt",    membership: "SILVER", risk: "MEDIUM", lastVisitDays: 13, joinMonths: 12, engagement: 51, visits: 47,  favClass: "HIIT"             },
  { name: "Swati Naik",      membership: "SILVER", risk: "HIGH",   lastVisitDays: 22, joinMonths: 7,  engagement: 43, visits: 35,  favClass: "Yoga"             },
  { name: "Tarun Jain",      membership: "SILVER", risk: "HIGH",   lastVisitDays: 28, joinMonths: 9,  engagement: 40, visits: 32,  favClass: "Zumba"            },
  { name: "Archana Varma",   membership: "SILVER", risk: "HIGH",   lastVisitDays: 32, joinMonths: 6,  engagement: 42, visits: 34,  favClass: "HIIT"             },
  { name: "Saurabh Mishra",  membership: "SILVER", risk: "HIGH",   lastVisitDays: 38, joinMonths: 11, engagement: 41, visits: 31,  favClass: "Spin"             },
  { name: "Vinita Kaur",     membership: "SILVER", risk: "HIGH",   lastVisitDays: 45, joinMonths: 8,  engagement: 44, visits: 33,  favClass: "Strength Training"},
  { name: "Pranav Nair",     membership: "SILVER", risk: "HIGH",   lastVisitDays: 26, joinMonths: 7,  engagement: 46, visits: 36,  favClass: "HIIT"             },

  // ── BASIC ── 15 members (2 LOW · 3 MEDIUM · 10 HIGH) ────────────────
  { name: "Ritesh Yadav",    membership: "BASIC",  risk: "LOW",    lastVisitDays: 3,  joinMonths: 3,  engagement: 35, visits: 22,  favClass: "HIIT"             },
  { name: "Shweta Chauhan",  membership: "BASIC",  risk: "LOW",    lastVisitDays: 5,  joinMonths: 2,  engagement: 30, visits: 15,  favClass: "Yoga"             },
  { name: "Dinesh Goel",     membership: "BASIC",  risk: "MEDIUM", lastVisitDays: 10, joinMonths: 4,  engagement: 28, visits: 18,  favClass: "Spin"             },
  { name: "Alka Trivedi",    membership: "BASIC",  risk: "MEDIUM", lastVisitDays: 17, joinMonths: 5,  engagement: 25, visits: 16,  favClass: "Zumba"            },
  { name: "Mukesh Sharma",   membership: "BASIC",  risk: "MEDIUM", lastVisitDays: 14, joinMonths: 3,  engagement: 22, visits: 12,  favClass: "Strength Training"},
  { name: "Reena Pillai",    membership: "BASIC",  risk: "HIGH",   lastVisitDays: 21, joinMonths: 4,  engagement: 20, visits: 10,  favClass: "Yoga"             },
  { name: "Sunil Thakur",    membership: "BASIC",  risk: "HIGH",   lastVisitDays: 30, joinMonths: 6,  engagement: 18, visits: 9,   favClass: "HIIT"             },
  { name: "Geeta Rao",       membership: "BASIC",  risk: "HIGH",   lastVisitDays: 25, joinMonths: 3,  engagement: 15, visits: 8,   favClass: "Yoga"             },
  { name: "Pankaj Dubey",    membership: "BASIC",  risk: "HIGH",   lastVisitDays: 35, joinMonths: 5,  engagement: 12, visits: 7,   favClass: "Spin"             },
  { name: "Sunita Verma",    membership: "BASIC",  risk: "HIGH",   lastVisitDays: 28, joinMonths: 4,  engagement: 14, visits: 8,   favClass: "Zumba"            },
  { name: "Arun Pandey",     membership: "BASIC",  risk: "HIGH",   lastVisitDays: 42, joinMonths: 6,  engagement: 13, visits: 6,   favClass: "HIIT"             },
  { name: "Usha Nair",       membership: "BASIC",  risk: "HIGH",   lastVisitDays: 50, joinMonths: 7,  engagement: 11, visits: 5,   favClass: "Yoga"             },
  { name: "Ramesh Patel",    membership: "BASIC",  risk: "HIGH",   lastVisitDays: 38, joinMonths: 5,  engagement: 16, visits: 7,   favClass: "Spin"             },
  { name: "Mina Gupta",      membership: "BASIC",  risk: "HIGH",   lastVisitDays: 60, joinMonths: 8,  engagement: 10, visits: 5,   favClass: "Strength Training"},
  { name: "Vivek Joshi",     membership: "BASIC",  risk: "HIGH",   lastVisitDays: 33, joinMonths: 4,  engagement: 17, visits: 6,   favClass: "Zumba"            },
];

function buildLog(
  campaignId: string,
  memberId: string,
  status: LogStatus,
  sentAt: Date
) {
  const deliveredAt = new Date(sentAt.getTime() + randInt(1, 60) * 60_000);
  const openedAt   = new Date(deliveredAt.getTime() + randInt(10, 120) * 60_000);
  const clickedAt  = new Date(openedAt.getTime() + randInt(5, 60) * 60_000);
  const convertedAt = new Date(clickedAt.getTime() + randInt(10, 180) * 60_000);

  const isDelivered  = ["DELIVERED", "OPENED", "CLICKED", "CONVERTED"].includes(status);
  const isOpened     = ["OPENED", "CLICKED", "CONVERTED"].includes(status);
  const isClicked    = ["CLICKED", "CONVERTED"].includes(status);
  const isConverted  = status === "CONVERTED";

  return {
    campaignId,
    memberId,
    status,
    sentAt,
    deliveredAt:  isDelivered  ? deliveredAt  : null,
    openedAt:     isOpened     ? openedAt     : null,
    clickedAt:    isClicked    ? clickedAt    : null,
    convertedAt:  isConverted  ? convertedAt  : null,
  };
}

async function main() {
  console.log("Seeding FitReach Revivr database...\n");

  // ── Clear existing data ───────────────────────────────────────────────
  console.log("Clearing existing data...");
  await prisma.communicationLog.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.visit.deleteMany();
  await prisma.member.deleteMany();
  console.log("  Done.\n");

  // ── Create 50 members ────────────────────────────────────────────────
  console.log("Creating 50 members...");
  const members = await Promise.all(
    memberTemplates.map((t, i) =>
      prisma.member.create({
        data: {
          name:           t.name,
          email:          t.name.toLowerCase().replace(/\s+/g, ".") + "@gmail.com",
          phone:          String(9876540001 + i),
          membershipType: t.membership,
          joinDate:       monthsAgo(t.joinMonths),
          lastVisit:      daysAgo(t.lastVisitDays),
          engagementScore: t.engagement,
          churnRisk:      t.risk,
          favoriteClass:  t.favClass,
          totalVisits:    t.visits,
          avatarColor:    AVATAR_COLORS[i % AVATAR_COLORS.length],
        },
      })
    )
  );
  console.log(`  Created ${members.length} members (15 GOLD · 20 SILVER · 15 BASIC)\n`);

  // ── Create visit history ─────────────────────────────────────────────
  console.log("Generating visit history...");
  const allVisits: Array<{
    memberId: string;
    date: Date;
    classType: string;
    trainer: string;
  }> = [];

  for (let i = 0; i < members.length; i++) {
    const t = memberTemplates[i];
    const member = members[i];
    const start = monthsAgo(t.joinMonths).getTime();
    const end   = daysAgo(t.lastVisitDays).getTime();
    const range = end - start;

    for (let v = 0; v < t.visits; v++) {
      allVisits.push({
        memberId:  member.id,
        date:      new Date(start + Math.random() * range),
        classType: Math.random() < 0.7 ? t.favClass : pick(CLASSES),
        trainer:   pick(TRAINERS),
      });
    }
  }

  await prisma.visit.createMany({ data: allVisits });
  console.log(`  Created ${allVisits.length} visit records\n`);

  // ── Create segments ───────────────────────────────────────────────────
  console.log("Creating 3 segments...");

  const highRiskCount = members.filter((m) => m.churnRisk === "HIGH").length;
  const goldCount     = members.filter((m) => m.membershipType === "GOLD").length;
  const newCount      = members.filter((m) => {
    const ageMs = TODAY.getTime() - m.joinDate.getTime();
    return ageMs <= 30 * 24 * 60 * 60 * 1000;
  }).length;

  const segHighRisk = await prisma.segment.create({
    data: {
      name:        "High Churn Risk Members",
      description: "Members who haven't visited in 21+ days and need immediate attention",
      rules:       { churnRisk: "HIGH" },
      memberCount: highRiskCount,
    },
  });

  const segGold = await prisma.segment.create({
    data: {
      name:        "Gold Members",
      description: "Premium members with highest lifetime value",
      rules:       { membershipType: "GOLD" },
      memberCount: goldCount,
    },
  });

  await prisma.segment.create({
    data: {
      name:        "New Members (Last 30 Days)",
      description: "Recently joined members in their critical first month",
      rules:       { joinedDays: 30 },
      memberCount: newCount,
    },
  });

  console.log(
    `  High Churn Risk (${highRiskCount} members) · Gold Members (${goldCount}) · New Members (${newCount})\n`
  );

  // ── Create campaigns ──────────────────────────────────────────────────
  console.log("Creating 2 sample campaigns...");

  const campaign1 = await prisma.campaign.create({
    data: {
      name:           "Re-engage Lapsed Members",
      segmentId:      segHighRisk.id,
      channel:        "WHATSAPP",
      status:         "COMPLETED",
      message:        "Hey {name}! We miss you at FitReach Revivr 💪 Your fitness journey isn't over. Book your spot for tomorrow's {favoriteClass} class and get back on track!",
      totalSent:      18,
      totalDelivered: 16,
      totalOpened:    11,
      totalClicked:   7,
      totalConverted: 4,
      totalFailed:    2,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      name:           "Gold Member Appreciation",
      segmentId:      segGold.id,
      channel:        "EMAIL",
      status:         "COMPLETED",
      message:        "Dear {name}, as one of our valued Gold members, you deserve the best. Enjoy a complimentary personal training session this month! 🏆",
      totalSent:      15,
      totalDelivered: 15,
      totalOpened:    12,
      totalClicked:   9,
      totalConverted: 6,
      totalFailed:    0,
    },
  });

  console.log("  Re-engage Lapsed Members (WhatsApp) · Gold Member Appreciation (Email)\n");

  // ── Create communication logs ─────────────────────────────────────────
  console.log("Creating communication logs...");

  const highRiskMembers = members.filter((m) => m.churnRisk === "HIGH");
  const goldMembers     = members.filter((m) => m.membershipType === "GOLD");

  // Campaign 1: 4 CONVERTED + 3 CLICKED + 4 OPENED + 5 DELIVERED + 2 FAILED = 18
  const c1Statuses: LogStatus[] = [
    "CONVERTED", "CONVERTED", "CONVERTED", "CONVERTED",
    "CLICKED",   "CLICKED",   "CLICKED",
    "OPENED",    "OPENED",    "OPENED",    "OPENED",
    "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED", "DELIVERED",
    "FAILED",    "FAILED",
  ];
  const c1SentBase = daysAgo(45);
  const c1Logs = highRiskMembers.slice(0, 18).map((m, idx) =>
    buildLog(campaign1.id, m.id, c1Statuses[idx], new Date(c1SentBase.getTime() + randInt(0, 180) * 60_000))
  );
  await prisma.communicationLog.createMany({ data: c1Logs });

  // Campaign 2: 6 CONVERTED + 3 CLICKED + 3 OPENED + 3 DELIVERED = 15
  const c2Statuses: LogStatus[] = [
    "CONVERTED", "CONVERTED", "CONVERTED", "CONVERTED", "CONVERTED", "CONVERTED",
    "CLICKED",   "CLICKED",   "CLICKED",
    "OPENED",    "OPENED",    "OPENED",
    "DELIVERED", "DELIVERED", "DELIVERED",
  ];
  const c2SentBase = daysAgo(30);
  const c2Logs = goldMembers.slice(0, 15).map((m, idx) =>
    buildLog(campaign2.id, m.id, c2Statuses[idx], new Date(c2SentBase.getTime() + randInt(0, 180) * 60_000))
  );
  await prisma.communicationLog.createMany({ data: c2Logs });

  console.log(`  ${c1Logs.length} logs for campaign 1 · ${c2Logs.length} logs for campaign 2\n`);

  // ── Summary ───────────────────────────────────────────────────────────
  console.log("Seeding complete!");
  console.log(`  Members   : ${members.length}`);
  console.log(`  Visits    : ${allVisits.length}`);
  console.log(`  Segments  : 3`);
  console.log(`  Campaigns : 2`);
  console.log(`  Logs      : ${c1Logs.length + c2Logs.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
