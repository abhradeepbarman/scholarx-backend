import { NextFunction, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import { db } from "../../db";
import { and, eq, gte, ilike, lte, or } from "drizzle-orm";
import { organizations, scholarships } from "../../db/schema";
import ResponseHandler from "../../utils/ResponseHandler";

// GET /search?table=scholarships&searchTerm=STEM&filters={"location":"USA"}

type SearchCriteria = {
    table: any;
    searchFields: string[];
    filters?: Record<string, any>;
    searchTerm: string;
};

class SearchService {
    static async search({
        table,
        searchFields,
        filters,
        searchTerm,
    }: SearchCriteria) {
        const searchConditions = searchFields.map((field) => {
            return ilike(table[field], `%${searchTerm}%`);
        });

        const searchQuery = or(...searchConditions);

        const filterConditions = [];
        if (filters) {
            for (const [key, value] of Object.entries(filters)) {
                switch (key) {
                    case "amount_gte":
                        filterConditions.push(gte(table.amount, value));
                        break;
                    case "amount_lte":
                        filterConditions.push(lte(table.amount, value));
                        break;
                    default:
                        filterConditions.push(eq(table[key], value));
                }
            }

            const whereClause = and(searchQuery, ...filterConditions);

            const results = await db.select().from(table).where(whereClause);
            return results.flat();
        }
    }
}

export const searchController = asyncHandler(
    async (req: any, res: Response, next: NextFunction) => {
        const { searchTerm, filters, table } = req.query;

        let results;
        switch (table) {
            case "scholarships":
                results = await SearchService.search({
                    table: scholarships,
                    searchFields: [
                        "title",
                        "description",
                        "eligibility_criteria",
                        "location",
                    ],
                    filters,
                    searchTerm,
                });
                break;
            case "organizations":
                results = await SearchService.search({
                    table: organizations,
                    searchFields: ["name", "address", "contact_person"],
                    filters,
                    searchTerm,
                });
                break;
            default:
                return res
                    .status(400)
                    .send(ResponseHandler(400, "Invalid search table"));
        }

        if (!results) {
            return res
                .status(404)
                .send(ResponseHandler(404, "No results found"));
        }

        return res
            .status(200)
            .send(
                ResponseHandler(
                    200,
                    "Search results fetched successfully",
                    results
                )
            );
    }
);
