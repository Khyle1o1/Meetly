import "dotenv/config";
import "./config/passport.config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import path from "path";
import { config } from "./config/app.config";
import { HTTPSTATUS } from "./config/http.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { asyncHandler } from "./middlewares/asyncHandler.middeware";
import { BadRequestException } from "./utils/app-error";
import { initializeDatabase } from "./database/database";
import authRoutes from "./routes/auth.route";
import passport from "passport";
import eventRoutes from "./routes/event.route";
import availabilityRoutes from "./routes/availability.route";
import integrationRoutes from "./routes/integration.route";
import meetingRoutes from "./routes/meeting.route";
import packageRoutes from "./routes/package.routes";
import schoolRoutes from "./routes/school.route";
import userManagementRoutes from "./routes/userManagement.route";
import adminStatisticsRoutes from "./routes/adminStatistics.route";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Optimize middleware order for better performance
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(passport.initialize());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Serve static files from uploads directory with caching
app.use("/uploads", express.static(path.join(__dirname, "../uploads"), {
  maxAge: '1d', // Cache static files for 1 day
  etag: true,
  lastModified: true,
}));

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("throwing async error");
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel",
    });
  })
);

// Route registration
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/event`, eventRoutes);
app.use(`${BASE_PATH}/availability`, availabilityRoutes);
app.use(`${BASE_PATH}/integration`, integrationRoutes);
app.use(`${BASE_PATH}/meeting`, meetingRoutes);
app.use(`${BASE_PATH}/package`, packageRoutes);
app.use(`${BASE_PATH}/school`, schoolRoutes);
app.use(`${BASE_PATH}/admin`, userManagementRoutes);
app.use(`${BASE_PATH}/admin`, adminStatisticsRoutes);

app.use(errorHandler);

// Optimize server startup
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(config.PORT, () => {
      console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
