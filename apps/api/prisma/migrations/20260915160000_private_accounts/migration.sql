-- Private accounts hide posts / followers / following from non-followers.
ALTER TABLE "User" ADD COLUMN "isPrivate" BOOLEAN NOT NULL DEFAULT false;
