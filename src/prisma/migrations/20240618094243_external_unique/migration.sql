/*
  Warnings:

  - A unique constraint covering the columns `[provider,providerId]` on the table `UserExternal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserExternal_provider_providerId_key" ON "UserExternal"("provider", "providerId");
