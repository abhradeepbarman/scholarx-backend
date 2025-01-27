import { Router } from "express";
import {
    userLogin,
    userLogout,
    userRegister,
} from "../../controllers/v1/auth.controller";
import { auth } from "../../middleware/auth";

const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.post("/logout", auth, userLogout);

export default router;
