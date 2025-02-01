import { z } from "zod";

const applyScholarshipSchema = z.object({
    response: z.any({ message: "Response is required" }),
});

export default applyScholarshipSchema;
