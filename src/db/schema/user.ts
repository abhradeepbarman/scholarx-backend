import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { UserRole } from "../../constants";

const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    full_name: varchar("full_name").notNull(),
    email: varchar("email").notNull().unique(),
    phone: varchar("phone"),
    password: varchar("password").notNull(),
    profilePicture: varchar("profile_picture"),
    role: varchar("role").default(UserRole.STUDENT).notNull(),
});

export default users;