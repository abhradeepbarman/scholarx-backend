import { NextFunction, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { applyScholarshipSchema } from "../../validators";
import { applicaions, scholarships, students } from "../../db/schema";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import CustomErrorHandler from "../../utils/CustomErrorHandler";
import { ScholarshipStatus } from "../../constants";
import ResponseHandler from "../../utils/ResponseHandler";

const applyScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { scholarshipId } = req.params;
        const body = applyScholarshipSchema.parse(req.body);
        const { id } = req.user;

        const scholarshipDetails = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, scholarshipId),
        });

        if (!scholarshipDetails) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        const studentDetails = await db.query.users.findFirst({
            where: (students.user_id, id),
        });

        if (!studentDetails) {
            next(CustomErrorHandler.notFound("Student not found"));
        }

        const newApplication = await db.insert(applicaions).values({
            student_id: studentDetails?.id,
            scholarship_id: scholarshipDetails?.id,
            status: ScholarshipStatus.PENDING,
            response: body.response,
        });

        return res
            .status(201)
            .send(
                ResponseHandler(
                    201,
                    "Applied to scholarship successfully",
                    newApplication
                )
            );
    }
);

export { applyScholarship };