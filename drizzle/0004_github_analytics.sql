ALTER TABLE "candidate_profiles" ADD COLUMN "github_username" text;
ALTER TABLE "candidate_profiles" ADD COLUMN "github_data" jsonb;
ALTER TABLE "candidate_profiles" ADD COLUMN "github_insights" jsonb;
ALTER TABLE "candidate_profiles" ADD COLUMN "github_last_updated_at" timestamp;
