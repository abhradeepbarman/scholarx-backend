import { date, jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import students from "./student";
import { ScholarshipStatus } from "../../constants";
import { relations } from "drizzle-orm";
import scholarships from "./scholarship";

const applicaions = pgTable("applications", {
    id: uuid("id").primaryKey().defaultRandom(),
    student_id: uuid("student_id").references(() => students.id),
    scholarship_id: uuid("scholarship_id").references(() => scholarships.id),
    status: varchar("status", {
        enum: [
            ScholarshipStatus.PENDING,
            ScholarshipStatus.APPROVED,
            ScholarshipStatus.REJECTED,
        ],
    }),
    response: jsonb("response").notNull(),
    created_at: date("created_at").defaultNow(),
    updated_at: date("updated_at").defaultNow(),
});

export const applicationRelations = relations(applicaions, ({ one }) => {
    return {
        students: one(students, {
            fields: [applicaions.student_id],
            references: [students.id],
        }),
        scholarships: one(scholarships, {
            fields: [applicaions.scholarship_id],
            references: [scholarships.id],
        }),
    };
});

export default applicaions;
