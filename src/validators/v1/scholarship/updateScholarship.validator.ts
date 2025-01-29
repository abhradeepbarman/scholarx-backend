import { z } from "zod";

const UpdateScholarshipSchema = z.object({
    org_id: z.string({ message: "Organization ID is required" }),
    title: z.string({ message: "Title is required" }).optional(),
    description: z.string({ message: "Description is required" }).optional(),
    eligibility_criteria: z
        .string({
            message: "Eligibility criteria is required",
        })
        .optional(),
    deadline: z.date({ message: "Deadline is required" }).optional(),
    amount: z.number({ message: "Amount is required" }).optional(),
    requirements: z.any({ message: "Requirements are required" }).optional(),
});

export default UpdateScholarshipSchema;
