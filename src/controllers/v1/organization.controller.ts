import { eq, inArray } from "drizzle-orm";
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

interface ApplicationWithRelations {
    id: string;
    status: "pending" | "accepted" | "rejected" | "reviewing" | null;
    created_at: string | null;
    student: {
        name: string;
    } | null;
    scholarship: {
        title: string;
        deadline: string | null;
    } | null;
}

const getOrganizationAnalytics = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { id } = req.user;

        // Get organization details
        const orgDetails = await db.query.organizations.findFirst({
            where: eq(organizations.user_id, id),
        });

        if (!orgDetails) {
            return next(CustomErrorHandler.notFound("Organization not found"));
        }

        // Get all scholarships for the organization
        const orgScholarships = await db.query.scholarships.findMany({
            where: eq(scholarships.org_id, orgDetails.id),
        });

        const scholarshipIds = orgScholarships.map((s) => s.id);

        // Get all applications with student details
        const applicants = await db
            .select({
                id: applications.id,
                status: applications.status,
                created_at: applications.created_at,
                student: {
                    name: students.name,
                },
                scholarship: {
                    title: scholarships.title,
                    deadline: scholarships.deadline,
                },
            })
            .from(applications)
            .leftJoin(students, eq(applications.student_id, students.id))
            .leftJoin(
                scholarships,
                eq(applications.scholarship_id, scholarships.id)
            )
            .where(
                scholarshipIds.length > 0
                    ? inArray(applications.scholarship_id, scholarshipIds)
                    : undefined
            );

        // Calculate analytics
        const totalApplicants = applicants.length;
        const pendingReview = applicants.filter(
            (app) => app.status?.toLowerCase() === "pending"
        ).length;
        const accepted = applicants.filter(
            (app) => app.status?.toLowerCase() === "accepted"
        ).length;
        const reviewing = applicants.filter(
            (app) => app.status?.toLowerCase() === "reviewing"
        ).length;
        const rejected = applicants.filter(
            (app) => app.status?.toLowerCase() === "rejected"
        ).length;

        const acceptanceRate =
            totalApplicants > 0
                ? Math.round((accepted / totalApplicants) * 100)
                : 0;

        // Count active scholarships (those with deadlines in the future)
        const currentDate = new Date();
        const activeScholarships = orgScholarships.filter((scholarship) => {
            return (
                scholarship.deadline &&
                new Date(scholarship.deadline) > currentDate
            );
        }).length;

        // Get recent applicants (last 5)
        const recentApplicants = await db
            .select({
                id: applications.id,
                status: applications.status,
                created_at: applications.created_at,
                student: {
                    name: students.name,
                },
                scholarship: {
                    title: scholarships.title,
                },
            })
            .from(applications)
            .leftJoin(students, eq(applications.student_id, students.id))
            .leftJoin(
                scholarships,
                eq(applications.scholarship_id, scholarships.id)
            )
            .where(
                scholarshipIds.length > 0
                    ? inArray(applications.scholarship_id, scholarshipIds)
                    : undefined
            )
            .orderBy(applications.created_at)
            .limit(5);

        // Format recent applicants
        const formattedRecentApplicants = recentApplicants.map((app) => ({
            applicant: app.student?.name ?? "Unknown",
            scholarship: app.scholarship?.title ?? "Unknown",
            status: app.status?.toLowerCase() ?? "pending",
            date: app.created_at
                ? new Date(app.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  })
                : "Unknown",
        }));

        // Application status distribution
        const statusDistribution = {
            pending: pendingReview,
            reviewing: reviewing,
            accepted: accepted,
            rejected: rejected,
        };

        return res.status(200).send(
            ResponseHandler(200, "Analytics fetched successfully", {
                activeScholarships,
                totalApplicants,
                pendingReview,
                acceptanceRate,
                recentApplicants: formattedRecentApplicants,
                statusDistribution,
            })
        );
    }
);

export { getOrganizationAnalytics };
