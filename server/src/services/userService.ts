import { db } from "../config/db";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export const createUser = async (email: string, password: string) => {
    // Check if user exists
    const existingUser = await db("users").where({ email }).first();

    if (existingUser) {
        const error: any = new Error("User already exists");
        error.status = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        id: randomUUID(),
        email,
        password_hash: hashedPassword,
    };

    await db("users").insert(newUser);

    return {
        id: newUser.id,
        email: newUser.email,
    };
};
