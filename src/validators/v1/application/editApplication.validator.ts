import { z } from "zod";

const editApplicationSchema = z.object({
    response: z.any({ message: "Response is required" }),
});

export default editApplicationSchema;
