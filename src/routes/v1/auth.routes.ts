import { Router } from "express";
import {
    userLogin,
    userLogout,
    userRegister,
} from "../../controllers/v1/auth.controller";

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", userLogout);

export default router;
