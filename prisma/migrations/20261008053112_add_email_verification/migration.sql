-- AlterTable
ALTER TABLE "user" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verification_code_expires_at" TIMESTAMP(3),
ADD COLUMN     "verification_code_hash" TEXT;
