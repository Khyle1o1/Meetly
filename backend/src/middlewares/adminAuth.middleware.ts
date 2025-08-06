import { Request, Response, NextFunction } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { UserRole } from "../database/entities/user.entity";

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user exists and has admin role
    if (!req.user) {
      res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Authentication required",
        errorCode: "UNAUTHORIZED"
      });
      return;
    }

    if (req.user && (req.user as any).role !== UserRole.ADMIN) {
      res.status(HTTPSTATUS.FORBIDDEN).json({
        message: "Admin access required",
        errorCode: "FORBIDDEN"
      });
      return;
    }

    next();
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      errorCode: "INTERNAL_SERVER_ERROR"
    });
    return;
  }
};

// Optional admin middleware - allows both admin and regular users but provides role info
export const optionalAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "Authentication required",
        errorCode: "UNAUTHORIZED"
      });
      return;
    }

    next();
  } catch (error) {
    res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
      message: "Internal server error",
      errorCode: "INTERNAL_SERVER_ERROR"
    });
    return;
  }
}; 