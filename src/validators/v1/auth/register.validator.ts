import { z } from "zod";
import { UserRole } from "../../../constants";

const registerSchema = z.object({
    name: z.string({ message: "Name is required" }),
    email: z.string({ message: "Email is required" }).email("Invalid email"),
    password: z
        .string({ message: "Password is required" })
        .min(6, "Password must be at least 6 characters long"),
    role: z.enum([UserRole.STUDENT, UserRole.ORGANIZATION], {
        message: "Role is required",
    }),
});

export default registerSchema;
