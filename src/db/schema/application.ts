import { date, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import students from "./student";
import { relations } from "drizzle-orm";
import scholarships from "./scholarship";

const applications = pgTable("applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    student_id: uuid("student_id").references(() => students.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    scholarship_id: uuid("scholarship_id").references(() => scholarships.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    status: varchar("status", {
        enum: ["pending", "accepted", "rejected"],
    }).default("pending"),
    response: jsonb("response").notNull(),
    created_at: date("created_at").defaultNow(),
    updated_at: date("updated_at").defaultNow(),
});

export const applicationRelations = relations(applications, ({ one }) => {
    return {
        student: one(students, {
            fields: [applications.student_id],
            references: [students.id],
        }),
        scholarship: one(scholarships, {
            fields: [applications.scholarship_id],
            references: [scholarships.id],
        }),
    };
});

export default applications;
