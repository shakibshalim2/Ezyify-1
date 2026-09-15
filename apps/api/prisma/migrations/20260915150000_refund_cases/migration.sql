-- Refund cases carry the seller's decline note, the buyer's escalation text and the admin's resolution.
ALTER TABLE "RefundRequest" ADD COLUMN "sellerResponse" TEXT, ADD COLUMN "disputeReason" TEXT, ADD COLUMN "resolution" TEXT;
