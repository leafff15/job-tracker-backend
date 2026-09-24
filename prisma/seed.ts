import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const workSetups = ["On-site", "Hybrid", "Remote"];

  for (const workSetup of workSetups) {
    await prisma.work_setup.upsert({
      where: {
        work_setup_name: workSetup,
      },
      update: {},
      create: {
        work_setup_name: workSetup,
      },
    });
  }

  console.log("Work setups seeded successfully.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());