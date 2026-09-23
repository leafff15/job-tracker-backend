import { PrismaClient } from "../generated/prisma/client.js"
import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv" 

dotenv.config();

const databaseUrl =  process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error ("DATABASE_URL not defined.");
}

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const prisma = new PrismaClient({ adapter });