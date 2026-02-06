CREATE TABLE "daily_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" text NOT NULL,
	"image_url" text NOT NULL,
	"week_number" integer NOT NULL,
	"day_of_week" integer NOT NULL,
	"season" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"last_used" timestamp
);
--> statement-breakpoint
CREATE TABLE "premium_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module" text NOT NULL,
	"feature_name" text NOT NULL,
	"feature_type" text NOT NULL,
	"content" jsonb,
	"is_premium" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sleep_premium_content" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"audio_url" text,
	"duration_minutes" integer,
	"is_premium" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"font_size" text DEFAULT 'medium',
	"high_contrast" boolean DEFAULT false,
	"reduced_motion" boolean DEFAULT false,
	"screen_reader_enabled" boolean DEFAULT false,
	"voice_control_enabled" boolean DEFAULT false,
	"notification_preferences" jsonb DEFAULT '{"morningArrival":true,"middayGrounding":true,"afternoonMovement":true,"eveningUnwind":true,"nightRest":true}'::jsonb,
	"tracking_preferences" jsonb DEFAULT '{"movementTracking":true,"nutritionTracking":true,"sleepTracking":true,"journalTracking":true,"groundingTracking":true}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;