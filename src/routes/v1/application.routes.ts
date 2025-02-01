import { Router } from "express";
import { auth } from "../../middleware/auth";
import { student } from "../../middleware/student";
import {
    applyScholarship,
    deleteApplication,
    editApplication,
    getApplicationDetails,
    getScholarshipApplications,
    updateApplicationStatus,
} from "../../controllers/v1/application.controller";
import { org } from "../../middleware/org";

const router = Router();

router.post("/", auth, student, applyScholarship);
router.put("/:applicationId", auth, student, editApplication);
router.delete("/:applicationId", auth, student, deleteApplication);
router.put("/status/:applicationId", auth, org, updateApplicationStatus);
router.get(
    "/scholarship/:scholarshipId",
    auth,
    org,
    getScholarshipApplications
);
router.get("/:applicationId", auth, getApplicationDetails);

export default router;
