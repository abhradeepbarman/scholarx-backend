import { Router } from "express";
import { searchController } from "../../controllers/v1/search.controller";

const router = Router();

router.get("/", searchController);

export default router;
