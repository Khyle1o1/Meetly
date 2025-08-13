import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { UserRole } from "../database/entities/user.entity";
import { asyncHandler } from "../middlewares/asyncHandler.middeware";
import { requireAdmin } from "../middlewares/adminAuth.middleware";
import {
  getAllUsersService,
  getUserByIdService,
  updateUserRoleService,
  searchUsersService,
  deleteUserService,
} from "../services/userManagement.service";

export const getAllUsersController = asyncHandler(async (req: Request, res: Response) => {
  const { search, page = 1, limit = 10 } = req.query;
  
  const result = await getAllUsersService(
    search as string,
    parseInt(page as string),
    parseInt(limit as string)
  );
  
  res.status(HTTPSTATUS.OK).json({
    message: "Users retrieved successfully",
    ...result,
  });
});

export const getUserByIdController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  const user = await getUserByIdService(userId);
  
  res.status(HTTPSTATUS.OK).json({
    message: "User retrieved successfully",
    user,
  });
});

export const updateUserRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { role: newRole } = req.body;
    const adminId = (req.user as any)?.id as string;
    
    const updatedUser = await updateUserRoleService(userId, newRole, adminId);
    
    res.status(HTTPSTATUS.OK).json({
      message: "User role updated successfully",
      user: updatedUser,
    });
    return;
  }
);

export const searchUsersController = asyncHandler(async (req: Request, res: Response) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!q || typeof q !== 'string') {
    res.status(HTTPSTATUS.BAD_REQUEST).json({
      message: "Search query is required",
      errorCode: "MISSING_SEARCH_QUERY"
    });
    return;
  }
  
  const result = await searchUsersService(
    q,
    parseInt(page as string),
    parseInt(limit as string)
  );
  
  res.status(HTTPSTATUS.OK).json({
    message: "Users search completed successfully",
    ...result,
  });
});

export const deleteUserController = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const adminId = (req.user as any)?.id as string;
  
  const result = await deleteUserService(userId, adminId);
  
  res.status(HTTPSTATUS.OK).json({
    message: "User deleted successfully",
    ...result,
  });
});

// Middleware to ensure admin access for all user management routes
export const requireAdminForUserManagement = [requireAdmin]; 