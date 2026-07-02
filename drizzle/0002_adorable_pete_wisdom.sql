CREATE TYPE "public"."memory_layer" AS ENUM('short_term', 'project', 'creator', 'knowledge');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'in_progress', 'complete', 'archived');--> statement-breakpoint
CREATE TYPE "public"."project_type" AS ENUM('youtube', 'tiktok', 'instagram', 'blog', 'podcast', 'custom');--> statement-breakpoint
CREATE TYPE "public"."knowledge_type" AS ENUM('document', 'note', 'website', 'prompt', 'research', 'template');--> statement-breakpoint
CREATE TABLE "ai_chat_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"persona_id" uuid,
	"project_id" uuid,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"model" text,
	"tokens" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_memory" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"layer" "memory_layer" DEFAULT 'short_term' NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"embedding" jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_personas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"emoji" text DEFAULT '🤖',
	"system_prompt" text NOT NULL,
	"model" text DEFAULT 'gpt-4o-mini',
	"temperature" text DEFAULT '0.7',
	"tools" jsonb DEFAULT '[]'::jsonb,
	"is_default" boolean DEFAULT false,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "creator_dna" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"writing_style" text DEFAULT 'conversational',
	"speaking_style" text DEFAULT 'casual',
	"brand_voice" text,
	"vocabulary" jsonb DEFAULT '[]'::jsonb,
	"avoid_words" jsonb DEFAULT '[]'::jsonb,
	"brand_colors" jsonb DEFAULT '[]'::jsonb,
	"visual_style" text DEFAULT 'modern',
	"content_goals" jsonb DEFAULT '[]'::jsonb,
	"target_audience" text,
	"niche" text,
	"review_history" jsonb DEFAULT '[]'::jsonb,
	"fav_prompts" jsonb DEFAULT '[]'::jsonb,
	"editing_rules" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_dna_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "creator_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"type" "project_type" DEFAULT 'youtube' NOT NULL,
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"source_url" text,
	"transcript" text,
	"generated_script" text,
	"generated_title" text,
	"generated_desc" text,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"notes" text,
	"exports" jsonb DEFAULT '[]'::jsonb,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_docs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "knowledge_type" DEFAULT 'note' NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"source_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"is_public" text DEFAULT 'false',
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_chat_history" ADD CONSTRAINT "ai_chat_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_memory" ADD CONSTRAINT "ai_memory_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_personas" ADD CONSTRAINT "ai_personas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_dna" ADD CONSTRAINT "creator_dna_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_projects" ADD CONSTRAINT "creator_projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledge_docs" ADD CONSTRAINT "knowledge_docs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;