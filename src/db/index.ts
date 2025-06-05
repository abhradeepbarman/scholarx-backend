import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import config from "../config";
import {
    applications,
    organizations,
    scholarships,
    students,
    users,
} from "./schema";

const schema = {
    users,
    students,
    organizations,
    scholarships,
    applications,
};

const client = postgres(config.DATABASE_URL!);
export const db = drizzle({ client, logger: true, schema });