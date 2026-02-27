import express from "express";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Server is running" });
});

app.listen(6000, () => {
    console.log("Server running on port 6000");
});
