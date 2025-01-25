import { date, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import users from "./user";
import { relations } from "drizzle-orm";
import { scholarships } from "./scholarship";

const organizations = pgTable("organizations", {
    id: uuid("id").primaryKey().defaultRandom(),
    user_id: uuid("user_id").references(() => users.id),
    org_name: varchar("org_name").notNull(),
    contact_person: varchar("contact_person"),
    phone_number: varchar("phone_number"),
    address: varchar("address"),
    created_at: date("created_at").defaultNow(),
    updated_at: date("updated_at").defaultNow(),
});

export const organizationRelations = relations(
    organizations,
    ({ one, many }) => {
        return {
            users: one(users, {
                fields: [organizations.user_id],
                references: [users.id],
            }),
            scholarships: many(scholarships),
        };
    }
);

export default organizations;
