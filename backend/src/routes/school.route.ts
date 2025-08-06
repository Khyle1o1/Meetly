import { Router } from "express";
import {
  getAllSchoolsController,
  createSchoolController,
  updateSchoolController,
  deleteSchoolController,
} from "../controllers/school.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const schoolRoutes = Router();

schoolRoutes.get("/all", getAllSchoolsController);

schoolRoutes.post(
  "/create",
  passportAuthenticateJwt,
  createSchoolController
);

schoolRoutes.put(
  "/update/:schoolId",
  passportAuthenticateJwt,
  updateSchoolController
);

schoolRoutes.delete(
  "/delete/:schoolId",
  passportAuthenticateJwt,
  deleteSchoolController
);

export default schoolRoutes; 