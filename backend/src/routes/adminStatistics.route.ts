import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { requireAdmin } from "../middlewares/adminAuth.middleware";
import { getAdminStatisticsController } from "../controllers/adminStatistics.controller";

const adminStatisticsRoutes = Router();

// Get admin dashboard statistics
adminStatisticsRoutes.get("/stats", passportAuthenticateJwt, requireAdmin, getAdminStatisticsController);

export default adminStatisticsRoutes; 