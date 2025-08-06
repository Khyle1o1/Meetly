import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { requireAdmin } from "../middlewares/adminAuth.middleware";
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

// Admin-only package CRUD operations
router.post("/", passportAuthenticateJwt, requireAdmin, createPackageController);
router.get("/", passportAuthenticateJwt, getUserPackagesController);
router.get("/all", getAllPackagesController);
router.get("/:packageId", passportAuthenticateJwt, getPackageByIdController);
router.put("/:packageId", passportAuthenticateJwt, requireAdmin, updatePackageController);
router.delete("/:packageId", passportAuthenticateJwt, requireAdmin, deletePackageController);

// Admin-only package assignment to events
router.post("/assign-to-event", passportAuthenticateJwt, requireAdmin, assignPackagesToEventController);
router.get("/event/:packageId", getEventPackagesController);

// Package selection for bookings (public)
router.post("/meeting/:meetingId/select", selectPackageForBookingController);
router.get("/meeting/:packageId", getMeetingWithPackageController);

export default router; 