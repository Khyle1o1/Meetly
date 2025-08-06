import { NextFunction, Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { config } from "../config/app.config";

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isDevelopment = config.NODE_ENV === "development";
  
  // Only log errors in development or if it's a server error
  if (isDevelopment || error.status >= 500) {
    console.log(`Error Occured on PATH: ${req.path}`, error);
  }

  const status = error.status || HTTPSTATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || "Internal Server Error";
  const errorCode = error.errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR;

  res.status(status).json({
    message,
    errorCode,
    ...(isDevelopment && { stack: error.stack }),
  });
};
