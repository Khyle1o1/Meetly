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

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException("throwing async error");
    res.status(HTTPSTATUS.OK).json({
      message: "Hello Subscribe to the channel",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/event`, eventRoutes);
app.use(`${BASE_PATH}/availability`, availabilityRoutes);
app.use(`${BASE_PATH}/integration`, integrationRoutes);
app.use(`${BASE_PATH}/meeting`, meetingRoutes);
app.use(`${BASE_PATH}/package`, packageRoutes);
app.use(`${BASE_PATH}/school`, schoolRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  await initializeDatabase();
  console.log(`Server listening on port ${config.PORT} in ${config.NODE_ENV}`);
});
