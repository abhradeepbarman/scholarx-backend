CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"phone" varchar,
	"password" varchar NOT NULL,
	"profile_picture" varchar,
	"role" varchar DEFAULT 'STUDENT' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
