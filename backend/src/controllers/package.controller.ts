import { Request, Response } from "express";
import { HTTPSTATUS } from "../config/http.config";
import { asyncHandlerAndValidation } from "../middlewares/withValidation.middleware";
import { asyncHandler } from "../middlewares/asyncHandler.middeware";
import {
  CreatePackageDto,
  UpdatePackageDto,
  PackageIdDTO,
  AssignPackagesToEventDto,
  SelectPackageForBookingDto,
} from "../database/dto/package.dto";
import {
  createPackageService,
  getUserPackagesService,
  getPackageByIdService,
  updatePackageService,
  deletePackageService,
  assignPackagesToEventService,
  getEventPackagesService,
  selectPackageForBookingService,
  getMeetingWithPackageService,
  getAllPackagesService,
} from "../services/package.service";

export const createPackageController = asyncHandlerAndValidation(
  CreatePackageDto,
  "body",
  async (req: Request, res: Response, createPackageDto) => {
    const userId = req.user?.id as string;

    const package_ = await createPackageService(userId, createPackageDto);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Package created successfully",
      package: package_,
    });
  }
);

export const getUserPackagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id as string;
    const packages = await getUserPackagesService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User packages fetched successfully",
      packages,
    });
  }
);

export const getAllPackagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const packages = await getAllPackagesService();

    return res.status(HTTPSTATUS.OK).json({
      message: "All packages fetched successfully",
      packages,
    });
  }
);

export const getPackageByIdController = asyncHandlerAndValidation(
  PackageIdDTO,
  "params",
  async (req: Request, res: Response, packageIdDto) => {
    const userId = req.user?.id as string;
    const package_ = await getPackageByIdService(userId, packageIdDto.packageId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Package fetched successfully",
      package: package_,
    });
  }
);

export const updatePackageController = asyncHandlerAndValidation(
  UpdatePackageDto,
  "body",
  async (req: Request, res: Response, updatePackageDto) => {
    const userId = req.user?.id as string;
    const packageId = req.params.packageId;

    const package_ = await updatePackageService(userId, packageId, updatePackageDto);

    return res.status(HTTPSTATUS.OK).json({
      message: "Package updated successfully",
      package: package_,
    });
  }
);

export const deletePackageController = asyncHandlerAndValidation(
  PackageIdDTO,
  "params",
  async (req: Request, res: Response, packageIdDto) => {
    const userId = req.user?.id as string;

    await deletePackageService(userId, packageIdDto.packageId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Package deleted successfully",
    });
  }
);

export const assignPackagesToEventController = asyncHandlerAndValidation(
  AssignPackagesToEventDto,
  "body",
  async (req: Request, res: Response, assignPackagesDto) => {
    const userId = req.user?.id as string;

    const event = await assignPackagesToEventService(userId, assignPackagesDto);

    return res.status(HTTPSTATUS.OK).json({
      message: "Packages assigned to event successfully",
      event,
    });
  }
);

export const getEventPackagesController = asyncHandlerAndValidation(
  PackageIdDTO,
  "params",
  async (req: Request, res: Response, packageIdDto) => {
    const packages = await getEventPackagesService(packageIdDto.packageId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Event packages fetched successfully",
      packages,
    });
  }
);

export const selectPackageForBookingController = asyncHandlerAndValidation(
  SelectPackageForBookingDto,
  "body",
  async (req: Request, res: Response, selectPackageDto) => {
    const meetingId = req.params.meetingId;

    const meeting = await selectPackageForBookingService(meetingId, selectPackageDto);

    return res.status(HTTPSTATUS.OK).json({
      message: "Package selected for booking successfully",
      meeting,
    });
  }
);

export const getMeetingWithPackageController = asyncHandlerAndValidation(
  PackageIdDTO,
  "params",
  async (req: Request, res: Response, packageIdDto) => {
    const meeting = await getMeetingWithPackageService(packageIdDto.packageId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Meeting with package fetched successfully",
      meeting,
    });
  }
); 