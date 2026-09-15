-- Seller replies on product reviews + newest-first listing per product / per seller.
ALTER TABLE "Review" ADD COLUMN "reply" TEXT;
ALTER TABLE "Review" ADD COLUMN "repliedAt" TIMESTAMP(3);
ALTER TABLE "Review" ADD COLUMN "orderId" TEXT;
CREATE INDEX "Review_productId_createdAt_idx" ON "Review"("productId", "createdAt" DESC);
