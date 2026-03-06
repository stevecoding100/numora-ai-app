import { Router } from "express";
import { createUserHandler } from "../controllers/userController";

const router = Router();

router.post("/register", createUserHandler);

export default router;
