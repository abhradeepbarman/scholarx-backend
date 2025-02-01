import { Router } from "express";
import { auth } from "../../middleware/auth";
import { org } from "../../middleware/org";
import {
    createScholarship,
    deleteScholarship,
    getAllScholarships,
    getScholarshipDetails,
    getScholarshipsOrg,
    updateScholarship,
} from "../../controllers/v1/scholarship.controller";

const router = Router();

router.post("/", auth, org, createScholarship);
router.get("/:scholarshipId", getScholarshipDetails);
router.get("/all", getAllScholarships);
router.put("/:scholarshipId", auth, org, updateScholarship);
router.delete("/:scholarshipId", auth, org, deleteScholarship);
router.get("/", auth, org, getScholarshipsOrg);

export default router;
