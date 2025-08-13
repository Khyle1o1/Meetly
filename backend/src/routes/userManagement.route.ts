import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import { requireAdmin } from "../middlewares/adminAuth.middleware";
import {
  getAllUsersController,
  getUserByIdController,
  updateUserRoleController,
  searchUsersController,
} from "../controllers/userManagement.controller";

const userManagementRoutes = Router();

// Get all users with optional search and pagination
userManagementRoutes.get("/", passportAuthenticateJwt, requireAdmin, getAllUsersController);

// Search users
userManagementRoutes.get("/search", passportAuthenticateJwt, requireAdmin, searchUsersController);

// Get specific user by ID
userManagementRoutes.get("/:userId", passportAuthenticateJwt, requireAdmin, getUserByIdController);

// Update user role (make admin/remove admin)
userManagementRoutes.patch("/:userId/role", passportAuthenticateJwt, requireAdmin, updateUserRoleController);

export default userManagementRoutes; 