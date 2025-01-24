import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

const users = pgTable("users", {
    id: serial("id").primaryKey(),
    fullName: text("full_name"),
    phone: varchar("phone", { length: 256 }),
    password: varchar("password", { length: 256 }),
});

export default users;