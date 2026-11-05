-- CreateTable
CREATE TABLE "registration_window" (
    "registration_window_id" SERIAL NOT NULL,
    "window_start" TIMESTAMP(3) NOT NULL,
    "registrations_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_window_pkey" PRIMARY KEY ("registration_window_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_window_window_start_key" ON "registration_window"("window_start");
