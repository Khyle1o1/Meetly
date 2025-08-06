import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createPackageController,
  getUserPackagesController,
  getAllPackagesController,
  getPackageByIdController,
  updatePackageController,
  deletePackageController,
  assignPackagesToEventController,
  getEventPackagesController,
  selectPackageForBookingController,
  getMeetingWithPackageController,
} from "../controllers/package.controller";

const router = Router();

// Package CRUD operations
router.post("/", passportAuthenticateJwt, createPackageController);
router.get("/", passportAuthenticateJwt, getUserPackagesController);
router.get("/all", getAllPackagesController);
router.get("/:packageId", passportAuthenticateJwt, getPackageByIdController);
router.put("/:packageId", passportAuthenticateJwt, updatePackageController);
router.delete("/:packageId", passportAuthenticateJwt, deletePackageController);

// Package assignment to events
router.post("/assign-to-event", passportAuthenticateJwt, assignPackagesToEventController);
router.get("/event/:packageId", getEventPackagesController);

// Package selection for bookings
router.post("/meeting/:meetingId/select", selectPackageForBookingController);
router.get("/meeting/:packageId", getMeetingWithPackageController);

export default router; 