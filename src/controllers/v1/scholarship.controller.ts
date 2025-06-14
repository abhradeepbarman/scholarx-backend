import { NextFunction, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import {
    CreateScholarshipSchema,
    UpdateScholarshipSchema,
} from "../../validators";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { organizations, scholarships, applications } from "../../db/schema";
import CustomErrorHandler from "../../utils/CustomErrorHandler";
import ResponseHandler from "../../utils/ResponseHandler";

const createScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const body = CreateScholarshipSchema.parse(req.body);
        const { id } = req.user;

        const orgDetails = await db.query.organizations.findFirst({
            where: eq(organizations.user_id, id),
        });

        if (!orgDetails) {
            next(CustomErrorHandler.notFound("Organization not found"));
        }

        const newScholarship = await db
            .insert(scholarships)
            .values({
                ...body,
                deadline: new Date(body.deadline).toISOString(),
                org_id: orgDetails?.id!,
                requirements: body.requirements,
            })
            .returning();

        return res
            .status(201)
            .send(
                ResponseHandler(
                    201,
                    "Scholarship created successfully",
                    newScholarship
                )
            );
    }
);

const getScholarshipDetails = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { scholarshipId } = req.params;

        const scholarshipDetails = await db
            .select()
            .from(scholarships)
            .where(eq(scholarships.id, scholarshipId))
            .innerJoin(
                organizations,
                eq(organizations.id, scholarships.org_id)
            );

        if (!scholarshipDetails) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        const result = {
            ...scholarshipDetails[0].scholarships,
            organization: scholarshipDetails[0].organizations,
        };

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Scholarship details fetched successfully",
                    result
                )
            );
    }
);

const getAllScholarships = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const allScholarships = await db.select().from(scholarships);

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "All scholarships fetched successfully",
                    allScholarships
                )
            );
    }
);

const updateScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { scholarshipId } = req.params;
        const body = UpdateScholarshipSchema.parse(req.body);
        const { id } = req.user;

        const orgDetails = await db.query.organizations.findFirst({
            where: eq(organizations.user_id, id),
        });

        if (!orgDetails) {
            next(CustomErrorHandler.notFound("Organization not found"));
        }

        const scholarshipDetails = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, scholarshipId),
        });

        if (!scholarshipDetails) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        if (scholarshipDetails?.org_id !== orgDetails?.id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to update this scholarship"
                )
            );
        }

        const updatedScholarship = await db
            .update(scholarships)
            .set({
                ...body,
                deadline: body.deadline
                    ? new Date(body.deadline).toISOString()
                    : undefined,
                org_id: orgDetails?.id!,
                requirements: body.requirements,
            })
            .where(eq(scholarships.id, id))
            .returning();

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Scholarship updated successfully",
                    updatedScholarship
                )
            );
    }
);

const deleteScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { scholarshipId } = req.params;
        const { id } = req.user;

        const orgDetails = await db.query.organizations.findFirst({
            where: eq(organizations.user_id, id),
        });

        if (!orgDetails) {
            next(CustomErrorHandler.notFound("Organization not found"));
        }

        const scholarshipDetails = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, scholarshipId),
        });

        if (!scholarshipDetails) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        if (scholarshipDetails?.org_id !== orgDetails?.id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to Delete this scholarship"
                )
            );
        }

        const deletedScholarship = await db
            .delete(scholarships)
            .where(eq(scholarships.id, scholarshipId))
            .returning();

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Scholarship deleted successfully",
                    deletedScholarship
                )
            );
    }
);

const getScholarshipsOrg = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { id } = req.user;

        // Get organization details
        const orgDetails = await db.query.organizations.findFirst({
            where: eq(organizations.user_id, id),
        });

        if (!orgDetails) {
            return next(CustomErrorHandler.notFound("Organization not found"));
        }

        // Get scholarships with applicant count using direct query
        const scholarshipsWithCount = await db
            .select({
                id: scholarships.id,
                title: scholarships.title,
                description: scholarships.description,
                eligibility_criteria: scholarships.eligibility_criteria,
                deadline: scholarships.deadline,
                amount: scholarships.amount,
                requirements: scholarships.requirements,
                location: scholarships.location,
                // status: scholarships.status,
                created_at: scholarships.created_at,
                updated_at: scholarships.updated_at,
                // applicant_count: db.fn.count(applications.id),
            })
            .from(scholarships)
            .leftJoin(
                applications,
                eq(applications.scholarship_id, scholarships.id)
            )
            .where(eq(scholarships.org_id, orgDetails.id))
            .groupBy(
                scholarships.id,
                scholarships.title,
                scholarships.description,
                scholarships.eligibility_criteria,
                scholarships.deadline,
                scholarships.amount,
                scholarships.requirements,
                scholarships.location,
                // scholarships.status,
                scholarships.created_at,
                scholarships.updated_at
            );

        if (!scholarshipsWithCount.length) {
            return next(CustomErrorHandler.notFound("No scholarships found"));
        }

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Organization scholarships fetched successfully with applicant counts",
                    scholarshipsWithCount
                )
            );
    }
);

export {
    createScholarship,
    getScholarshipDetails,
    getAllScholarships,
    updateScholarship,
    deleteScholarship,
    getScholarshipsOrg,
};
