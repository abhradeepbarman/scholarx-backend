import { z } from "zod";

const CreateScholarshipSchema = z.object({
    title: z.string({ message: "Title is required" }),
    description: z.string({ message: "Description is required" }),
    eligibility_criteria: z.string({
        message: "Eligibility criteria is required",
    }),
    deadline: z.string({ message: "Deadline is required" }),
    amount: z.number({ message: "Amount is required" }),
    requirements: z.any({ message: "Requirements are required" }),
    location: z.string({ message: "Location is required" }),
});

export default CreateScholarshipSchema;
