-- CreateTable
CREATE TABLE "user" (
    "user_id" SERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "status" (
    "status_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("status_id")
);

-- CreateTable
CREATE TABLE "work_setup" (
    "work_setup_id" SERIAL NOT NULL,
    "work_setup_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "work_setup_pkey" PRIMARY KEY ("work_setup_id")
);

-- CreateTable
CREATE TABLE "job_application" (
    "application_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "status_id" INTEGER NOT NULL,
    "work_setup_id" INTEGER NOT NULL,
    "company_name" VARCHAR(255) NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "date_applied" DATE NOT NULL,
    "salary" INTEGER,
    "location" VARCHAR(255) NOT NULL,
    "notes" VARCHAR(1000),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "job_application_pkey" PRIMARY KEY ("application_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "status_user_id_status_name_key" ON "status"("user_id", "status_name");

-- AddForeignKey
ALTER TABLE "status" ADD CONSTRAINT "status_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "status"("status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_application" ADD CONSTRAINT "job_application_work_setup_id_fkey" FOREIGN KEY ("work_setup_id") REFERENCES "work_setup"("work_setup_id") ON DELETE RESTRICT ON UPDATE CASCADE;
