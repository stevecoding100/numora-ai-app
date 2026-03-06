import { Request, Response, NextFunction } from "express";
import { createUserSchema } from "../utils/userSchemas";
import { createUser } from "../services/userService";

export const createUserHandler = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.log("Request body:", req.body);
    try {
        const validatedData = createUserSchema.parse(req.body);
        console.log("Validated data:", validatedData);
        const user = await createUser(
            validatedData.email,
            validatedData.password,
        );
        console.log("User created:", user);

        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};
