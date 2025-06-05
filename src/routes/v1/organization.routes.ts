import { Router } from "express";
import { auth } from "../../middleware/auth";
import { org } from "../../middleware/org";
import { getOrganizationAnalytics } from "../../controllers/v1/organization.controller";

const router = Router();

router.get("/analytics", [auth, org], getOrganizationAnalytics);

export default router;
