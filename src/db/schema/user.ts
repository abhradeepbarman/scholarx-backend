import {
    boolean,
    pgTable,
    timestamp,
    uuid,
    varchar,
} from "drizzle-orm/pg-core";
import { UserRole } from "../../constants";
import { relations } from "drizzle-orm";
import students from "./student";
import organizations from "./organization";

const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email").notNull().unique(),
    password: varchar("password").notNull(),
    role: varchar("role", {
        enum: [UserRole.STUDENT, UserRole.ORGANIZATION],
    }).notNull(),
    verified: boolean("verified").notNull().default(false),
    refresh_token: varchar("refresh_token"),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
});

export const userRelations = relations(users, ({ one }) => {
    return {
        students: one(students),
        organizations: one(organizations),
    };
});

export default users;
