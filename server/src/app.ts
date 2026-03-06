import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/errorHandler";
import { db } from "./config/db";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(express.json());
app.use(errorHandler);
app.use(helmet());
app.use(cors());

app.use("/users/auth", userRoutes);

app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    }),
);

app.get("/health", async (_req, res) => {
    try {
        await db.raw("select 1+1 as result");
        res.status(200).json({ status: "ok", database: "connected" });
    } catch {
        res.status(500).json({ status: "error", database: "disconnected" });
    }
});

export default app;
