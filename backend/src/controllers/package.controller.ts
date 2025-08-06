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
  EventIdDTO,
  MeetingIdDTO,
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
    const userId = (req.user as any)?.id as string;

    const package_ = await createPackageService(userId, createPackageDto);

    res.status(HTTPSTATUS.CREATED).json({
      message: "Package created successfully",
      package: package_,
    });
    return;
  }
);

export const getUserPackagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id as string;
    const packages = await getUserPackagesService(userId);

    res.status(HTTPSTATUS.OK).json({
      message: "User packages fetched successfully",
      packages,
    });
    return;
  }
);

export const getAllPackagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const packages = await getAllPackagesService();

    res.status(HTTPSTATUS.OK).json({
      message: "All packages fetched successfully",
      packages,
    });
    return;
  }
);

export const getPackageByIdController = asyncHandlerAndValidation(
  PackageIdDTO,
  "params",
  async (req: Request, res: Response, packageIdDto) => {
    const userId = (req.user as any)?.id as string;
    const package_ = await getPackageByIdService(userId, packageIdDto.packageId);

    res.status(HTTPSTATUS.OK).json({
      message: "Package fetched successfully",
      package: package_,
    });
    return;
  }
);

export const updatePackageController = asyncHandlerAndValidation(
  UpdatePackageDto,
  "body",
  async (req: Request, res: Response, updatePackageDto) => {
    const userId = (req.user as any)?.id as string;
    const userRole = (req.user as any)?.role as string;
    const packageId = req.params.packageId;

    const package_ = await updatePackageService(userId, packageId, updatePackageDto, userRole);

    res.status(HTTPSTATUS.OK).json({
      message: "Package updated successfully",
      package: package_,
    });
    return;
  }
);

export const deletePackageController = asyncHandlerAndValidation(
  PackageIdDTO,
  "params",
  async (req: Request, res: Response, packageIdDto) => {
    const userId = (req.user as any)?.id as string;
    const userRole = (req.user as any)?.role as string;

    await deletePackageService(userId, packageIdDto.packageId, userRole);

    res.status(HTTPSTATUS.OK).json({
      message: "Package deleted successfully",
    });
    return;
  }
);

export const assignPackagesToEventController = asyncHandlerAndValidation(
  AssignPackagesToEventDto,
  "body",
  async (req: Request, res: Response, assignPackagesDto) => {
    const userId = (req.user as any)?.id as string;

    const event = await assignPackagesToEventService(userId, assignPackagesDto);

    res.status(HTTPSTATUS.OK).json({
      message: "Packages assigned to event successfully",
      event,
    });
    return;
  }
);

export const getEventPackagesController = asyncHandlerAndValidation(
  EventIdDTO,
  "params",
  async (req: Request, res: Response, eventIdDto) => {
    const packages = await getEventPackagesService(eventIdDto.eventId);

    res.status(HTTPSTATUS.OK).json({
      message: "Event packages fetched successfully",
      packages,
    });
    return;
  }
);

export const selectPackageForBookingController = asyncHandlerAndValidation(
  SelectPackageForBookingDto,
  "body",
  async (req: Request, res: Response, selectPackageDto) => {
    const meetingId = req.params.meetingId;

    const meeting = await selectPackageForBookingService(meetingId, selectPackageDto);

    res.status(HTTPSTATUS.OK).json({
      message: "Package selected for booking successfully",
      meeting,
    });
    return;
  }
);

export const getMeetingWithPackageController = asyncHandlerAndValidation(
  MeetingIdDTO,
  "params",
  async (req: Request, res: Response, meetingIdDto) => {
    const meeting = await getMeetingWithPackageService(meetingIdDto.meetingId);

    res.status(HTTPSTATUS.OK).json({
      message: "Meeting with package fetched successfully",
      meeting,
    });
    return;
  }
); 