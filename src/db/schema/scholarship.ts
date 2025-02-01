import {
    date,
    integer,
    jsonb,
    pgTable,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import organizations from "./organization";
import { relations } from "drizzle-orm";

const scholarships = pgTable("scholarships", {
    id: uuid("id").primaryKey().defaultRandom(),
    org_id: uuid("org_id")
        .references(() => organizations.id, {
            onDelete: "cascade",
            onUpdate: "cascade",
        })
        .notNull(),
    title: varchar("title").notNull(),
    description: varchar("description").notNull(),
    eligibility_criteria: varchar("eligibility_criteria").notNull(),
    deadline: date("deadline").notNull(),
    amount: integer("amount").notNull(),
    requirements: jsonb("requirements").notNull(),
    location: varchar("location").notNull(),
    created_at: date("created_at").defaultNow(),
    updated_at: date("updated_at").defaultNow(),
});

export const scholarshipRelations = relations(scholarships, ({ one, many }) => {
    return {
        organizations: one(organizations, {
            fields: [scholarships.org_id],
            references: [organizations.id],
        }),
        scholarships: many(scholarships),
    };
});

export default scholarships;
