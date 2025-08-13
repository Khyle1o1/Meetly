import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middeware";
import { HTTPSTATUS } from "../config/http.config";
import { getAdminStatisticsService } from "../services/adminStatistics.service";

export const getAdminStatisticsController = asyncHandler(async (req: Request, res: Response) => {
  const statistics = await getAdminStatisticsService();

  res.status(HTTPSTATUS.OK).json({
    message: "Admin statistics retrieved successfully",
    statistics,
  });
}); 