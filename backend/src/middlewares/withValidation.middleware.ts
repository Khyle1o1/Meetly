import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { NextFunction, Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { asyncHandler } from "./asyncHandler.middeware";

type ValidationSource = "body" | "params" | "query";

export function asyncHandlerAndValidation<T extends object>(
  dto: new () => T,
  source: ValidationSource = "body",
  handler: (req: Request, res: Response, dto: T) => Promise<any>
) {
  return asyncHandler(withValidation(dto, source)(handler));
}

export function withValidation<T extends object>(
  DtoClass: new () => T,
  source: ValidationSource = "body"
) {
  return function (
    handler: (req: Request, res: Response, dto: T) => Promise<any>
  ) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log("Raw request data:", req[source]);
        
        const dtoInstance = plainToInstance(DtoClass, req[source], {
          enableImplicitConversion: true,
          exposeDefaultValues: true,
        });
        
        console.log("Transformed DTO instance:", dtoInstance);
        
        const errors = await validate(dtoInstance);

        if (errors.length > 0) {
          console.log("Validation errors:", errors);
          return formatValidationError(res, errors);
        }

        return handler(req, res, dtoInstance);
      } catch (error) {
        console.error("Validation middleware error:", error);
        next(error);
      }
    };
  };
}

function formatValidationError(res: Response, errors: ValidationError[]) {
  return res.status(HTTPSTATUS.BAD_REQUEST).json({
    message: "Validation failed",
    errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    errors: errors.map((err) => ({
      field: err.property,
      message: err.constraints,
    })),
  });
}
