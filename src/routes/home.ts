import express from "express";

const home = express.Router();

home.get("/", (_req, res) => {
    res.status(200).json({ message: "Hello Word!" });
});

export default home;