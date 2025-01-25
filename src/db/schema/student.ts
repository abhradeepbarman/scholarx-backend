import { date, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import users from "./user";
import { AcademicLevel } from "../../constants";
import { relations } from "drizzle-orm";
import { applicaions } from "./application";

const students = pgTable("students", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
    }),
    first_name: varchar("first_name").notNull(),
    middle_name: varchar("middle_name"),
    last_name: varchar("last_name"),
    date_of_birth: date("date_of_birth"),
    phone_number: varchar("phone_number"),
    address: varchar("address"),
    college: varchar("college"),
    university: varchar("university"),
    academic_level: varchar("academic_level", {
        enum: [AcademicLevel.UG, AcademicLevel.PG],
    }),
    field_of_study: varchar("field_of_study"),
    created_at: date("created_at").defaultNow(),
    updated_at: date("updated_at").defaultNow(),
});

export const studentRelations = relations(students, ({ one }) => {
    return {
        users: one(users, {
            fields: [students.user_id],
            references: [users.id],
        }),
        applicaions: one(applicaions)
    }
})

export default students;