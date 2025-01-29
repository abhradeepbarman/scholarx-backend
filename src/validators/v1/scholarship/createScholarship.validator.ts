import { z } from "zod";

const CreateScholarshipSchema = z.object({
    org_id: z.string({ message: "Organization ID is required" }),
    title: z.string({ message: "Title is required" }),
    description: z.string({ message: "Description is required" }),
    eligibility_criteria: z.string({
        message: "Eligibility criteria is required",
    }),
    deadline: z.date({ message: "Deadline is required" }),
    amount: z.number({ message: "Amount is required" }),
    requirements: z.any({ message: "Requirements are required" }),
});

export default CreateScholarshipSchema;
