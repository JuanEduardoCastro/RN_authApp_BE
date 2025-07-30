import express, { Router } from "express";
import { createEmailTokenTest } from "../controllers/refreshToken.controller";

const testRoutes: Router = express.Router();

testRoutes.post("/create-email-token", createEmailTokenTest);

export default testRoutes;
