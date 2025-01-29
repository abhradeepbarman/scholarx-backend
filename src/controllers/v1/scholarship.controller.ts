import { NextFunction, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { db } from "../../db";
import { eq } from "drizzle-orm";
import { organizations, scholarships } from "../../db/schema";
import CustomErrorHandler from "../../utils/CustomErrorHandler";
import { uuid } from "drizzle-orm/pg-core";
import {
    CreateScholarshipSchema,
    UpdateScholarshipSchema,
} from "../../validators";
import ResponseHandler from "../../utils/ResponseHandler";

const CreateScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const body = CreateScholarshipSchema.parse(req.body);

        //check if organization exists
        const org = await db.query.organizations.findFirst({
            where: eq(organizations.id, body.org_id),
        });

        if (!org) {
            next(CustomErrorHandler.notFound("Organization not found"));
        }

        // check if that organization owner is same
        const organizationData = await db.query.organizations.findFirst({
            where: eq(organizations.id, body.org_id),
        });

        if (organizationData?.user_id !== req.user.id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to create scholarship for this organization"
                )
            );
        }

        // create scholarship
        const newScholarship = await db
            .insert(scholarships)
            .values({
                org_id: body.org_id,
                title: body.title,
                description: body.description,
                eligibility_criteria: body.eligibility_criteria,
                deadline: new Date(body.deadline).toISOString(),
                amount: body.amount,
                requirements: body.requirements,
            })
            .returning();

        return res
            .status(201)
            .send(
                ResponseHandler(
                    201,
                    "Scholarship created successfully",
                    newScholarship[0]
                )
            );
    }
);

const UpdateScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const body = UpdateScholarshipSchema.parse(req.body);
        const { scholarshipId } = req.params;

        // check if scholarship exists
        const scholarshipData = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, scholarshipId),
        });

        if (!scholarshipData) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        // check if that organization owner is same
        const organizationData = await db.query.organizations.findFirst({
            where: eq(organizations.id, body.org_id),
        });

        if (organizationData?.user_id !== req.user.id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to update scholarship for this organization"
                )
            );
        }

        // update scholarship
        const updatedScholarship = await db
            .update(scholarships)
            .set({
                title: body.title || scholarshipData?.title,
                description: body.description || scholarshipData?.description,
                eligibility_criteria:
                    body.eligibility_criteria ||
                    scholarshipData?.eligibility_criteria,
                deadline:
                    new Date(body.deadline as Date).toISOString() ||
                    scholarshipData?.deadline,
                amount: body.amount || scholarshipData?.amount,
                requirements:
                    body.requirements || scholarshipData?.requirements,
            })
            .returning();

        return res
            .status(201)
            .send(
                ResponseHandler(
                    201,
                    "Scholarship updated successfully",
                    updatedScholarship[0]
                )
            );
    }
);

const DeleteScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { scholarshipId } = req.params;

        if (!scholarshipId) {
            next(CustomErrorHandler.notFound("Scholarship ID is required"));
        }

        // check if scholarship exists
        const scholarshipData = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, scholarshipId),
        });

        if (!scholarshipData) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        // check if that organization owner is same
        const organizationData = await db.query.organizations.findFirst({
            where: eq(organizations.id, scholarshipData?.org_id!),
        });

        if (organizationData?.user_id !== req.user.id) {
            next(
                CustomErrorHandler.unAuthorized(
                    "You are not authorized to delete scholarship for this organization"
                )
            );
        }

        await db.delete(scholarships).where(eq(scholarships.id, scholarshipId));

        return res
            .status(200)
            .send(ResponseHandler(200, "Scholarship deleted"));
    }
);

const GetScholarship = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { scholarshipId } = req.params;

        if (!scholarshipId) {
            next(CustomErrorHandler.notFound("Scholarship ID is required"));
        }

        const scholarshipData = await db.query.scholarships.findFirst({
            where: eq(scholarships.id, scholarshipId),
            with: {
                org_id: true,
            },
        });

        if (!scholarshipData) {
            next(CustomErrorHandler.notFound("Scholarship not found"));
        }

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Scholarship fetched successfully",
                    scholarshipData
                )
            );
    }
);

export {
    CreateScholarship,
    UpdateScholarship,
    DeleteScholarship,
    GetScholarship,
};
