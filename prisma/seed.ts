import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const defaultStatuses = ["Applied", "Interviewing", "Offer", "Rejected"];

async function main() {
  const workSetups = ["On-site", "Hybrid", "Remote"];

  for (const workSetup of workSetups) {
    const existing = await prisma.work_setup.findFirst({
      where: { work_setup_name: workSetup },
      select: { work_setup_id: true },
    });
    if (!existing) {
      await prisma.work_setup.create({ data: { work_setup_name: workSetup } });
    }
  }

  const users = await prisma.user.findMany({ select: { user_id: true } });

  for (const user of users) {
    for (const statusName of defaultStatuses) {
      await prisma.status.upsert({
        where: {
          user_id_status_name: {
            user_id: user.user_id,
            status_name: statusName,
          },
        },
        update: {},
        create: {
          user_id: user.user_id,
          status_name: statusName,
        },
      });
    }
  }

  console.log(`Seeded work setups and default statuses for ${users.length} existing user(s).`);
}

main()
  .catch((error: unknown) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
