import { Router } from "express";
import { userRegister } from "../../controllers/v1/auth.controller";

const router = Router();

router.post("/register", userRegister);

export default router;
