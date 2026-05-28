ALTER TABLE "candidate_profiles" DROP CONSTRAINT "candidate_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "mentor_profiles" DROP CONSTRAINT "mentor_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "recruiter_profiles" DROP CONSTRAINT "recruiter_profiles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "github_username" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "github_data" jsonb;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "github_insights" jsonb;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD COLUMN "github_last_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "message_type" text DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "file_url" text;--> statement-breakpoint
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentor_profiles" ADD CONSTRAINT "mentor_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recruiter_profiles" ADD CONSTRAINT "recruiter_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;