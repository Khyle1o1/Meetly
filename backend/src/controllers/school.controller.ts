import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middeware";
import { HTTPSTATUS } from "../config/http.config";
import {
  getAllSchoolsService,
  createSchoolService,
  updateSchoolService,
  deleteSchoolService,
} from "../services/school.service";
import { asyncHandlerAndValidation } from "../middlewares/withValidation.middleware";
import { 
  CreateSchoolDto, 
  UpdateSchoolDto, 
  SchoolIdDTO 
} from "../database/dto/school.dto";

export const getAllSchoolsController = asyncHandler(
  async (req: Request, res: Response) => {
    const schools = await getAllSchoolsService();

    return res.status(HTTPSTATUS.OK).json({
      message: "Schools fetched successfully",
      schools,
    });
  }
);

export const createSchoolController = asyncHandlerAndValidation(
  CreateSchoolDto,
  "body",
  async (req: Request, res: Response, createSchoolDto) => {
    const school = await createSchoolService(createSchoolDto);
    return res.status(HTTPSTATUS.CREATED).json({
      message: "School created successfully",
      school,
    });
  }
);

export const updateSchoolController = asyncHandler(
  async (req: Request, res: Response) => {
    const schoolId = req.params.schoolId;
    const updateData = req.body;
    
    const school = await updateSchoolService(schoolId, updateData);
    return res.status(HTTPSTATUS.OK).json({
      message: "School updated successfully",
      school,
    });
  }
);

export const deleteSchoolController = asyncHandlerAndValidation(
  SchoolIdDTO,
  "params",
  async (req: Request, res: Response, schoolIdDto) => {
    await deleteSchoolService(schoolIdDto.schoolId);
    return res.status(HTTPSTATUS.OK).json({
      message: "School deleted successfully",
    });
  }
); 