-- CreateTable
CREATE TABLE "DatastreamHistory" (
    "datastreamId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "datastream_history_created_at_idx" ON "DatastreamHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DatastreamHistory_datastreamId_value_createdAt_key" ON "DatastreamHistory"("datastreamId", "value", "createdAt");

-- AddForeignKey
ALTER TABLE "DatastreamHistory" ADD CONSTRAINT "DatastreamHistory_datastreamId_fkey" FOREIGN KEY ("datastreamId") REFERENCES "Datastream"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
