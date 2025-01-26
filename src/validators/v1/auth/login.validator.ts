import { z } from "zod";

const loginSchema = z.object({
    email: z.string({ message: "Email is required" }).email("Invalid email"),
    password: z.string({ message: "Password is required" }),
});

export default loginSchema;
