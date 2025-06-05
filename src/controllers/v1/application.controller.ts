import { eq } from "drizzle-orm";
import { NextFunction, Response } from "express";
import { db } from "../../db";
import {
    applications,
    organizations,
    scholarships,
    students,
} from "../../db/schema";
import asyncHandler from "../../utils/asyncHandler";
import CustomErrorHandler from "../../utils/CustomErrorHandler";
import ResponseHandler from "../../utils/ResponseHandler";
import {
    applyScholarshipSchema,
    editApplicationSchema,
} from "../../validators";

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

        const newApplication = await db.insert(applications).values({
            student_id: studentDetails?.id,
            scholarship_id: scholarshipDetails?.id,
            status: "pending",
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

const editApplication = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { applicationId } = req.params;
        const body = editApplicationSchema.parse(req.body);
        const { id } = req.user;

        const applicationDetails = await db.query.applications.findFirst({
            where: eq(applications.id, applicationId),
        });

        if (!applicationDetails) {
            next(CustomErrorHandler.notFound("Application not found"));
        }

        const studentDetails = await db.query.users.findFirst({
            where: (students.user_id, id),
        });

        if (!studentDetails) {
            next(CustomErrorHandler.notFound("Student not found"));
        }

        if (applicationDetails?.student_id !== studentDetails?.id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to edit this application"
                )
            );
        }

        const updatedScholarship = await db
            .update(applications)
            .set({
                response: body.response,
                updated_at: new Date().toISOString(),
            })
            .where(eq(applications.id, applicationId))
            .returning();

        return res
            .status(200)
            .send(
                ResponseHandler(200, "Application updated", updatedScholarship)
            );
    }
);

const deleteApplication = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { applicationId } = req.params;
        const { id } = req.user;

        const applicationDetails = await db.query.applications.findFirst({
            where: eq(applications.id, applicationId),
        });

        if (!applicationDetails) {
            next(CustomErrorHandler.notFound("Application not found"));
        }

        const studentDetails = await db.query.users.findFirst({
            where: (students.user_id, id),
        });

        if (!studentDetails) {
            next(CustomErrorHandler.notFound("Student not found"));
        }

        if (applicationDetails?.student_id !== studentDetails?.id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to delete this application"
                )
            );
        }

        const deletedApplication = await db
            .delete(applications)
            .where(eq(applications.id, applicationId))
            .returning();

        return res
            .status(200)
            .send(
                ResponseHandler(200, "Application deleted", deletedApplication)
            );
    }
);

const updateApplicationStatus = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { applicationId } = req.params;
        const { id } = req.user;
        const { status } = req.query;

        const applicationDetails = await db.query.applications.findFirst({
            where: eq(applications.id, applicationId),
        });

        if (!applicationDetails) {
            next(CustomErrorHandler.notFound("Application not found"));
        }

        const scholarshipDetails = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, applicationDetails?.scholarship_id!),
        });

        if (!scholarshipDetails) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        const orgDetails = await db.query.organizations.findFirst({
            where: eq(organizations.user_id, scholarshipDetails?.org_id!),
        });

        if (!orgDetails) {
            next(CustomErrorHandler.notFound("Organization not found"));
        }

        if (orgDetails?.user_id !== id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to change status of this application"
                )
            );
        }

        const updatedApplicationStatus = await db
            .update(applications)
            .set({ status })
            .where(eq(applications.id, applicationId))
            .returning();

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Application status updated",
                    updatedApplicationStatus
                )
            );
    }
);

const getScholarshipApplications = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { scholarshipId } = req.params;
        const { id } = req.user;

        const scholarshipDetails = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, scholarshipId),
            with: {
                student_id: true,
            },
        });

        if (!scholarshipDetails) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        const orgDetails = await db.query.organizations.findFirst({
            where: eq(organizations.user_id, scholarshipDetails?.org_id!),
        });

        if (!orgDetails) {
            next(CustomErrorHandler.notFound("Organization not found"));
        }

        if (orgDetails?.user_id !== id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to view applications of this scholarship"
                )
            );
        }

        const applicants = await db.query.applications.findMany({
            where: eq(applications.scholarship_id, scholarshipId),
        });

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Applications fetched successfully",
                    applicants
                )
            );
    }
);

const getApplicationDetails = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { applicationId } = req.params;

        const applicationDetails = await db.query.applications.findFirst({
            where: eq(applications.id, applicationId),
        });

        if (!applicationDetails) {
            next(CustomErrorHandler.notFound("Application not found"));
        }

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Application details fetched successfully",
                    applicationDetails
                )
            );
    }
);

export {
    applyScholarship,
    deleteApplication,
    editApplication,
    getApplicationDetails,
    getScholarshipApplications,
    updateApplicationStatus,
};
