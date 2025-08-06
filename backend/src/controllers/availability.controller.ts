import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middeware";
import { HTTPSTATUS } from "../config/http.config";
import {
  getAvailabilityForPublicEventService,
  getUserAvailabilityService,
  updateAvailabilityService,
} from "../services/availability.service";
import { asyncHandlerAndValidation } from "../middlewares/withValidation.middleware";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto";
import { EventIdDTO } from "../database/dto/event.dto";

export const getUserAvailabilityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id as string;

    const availability = await getUserAvailabilityService(userId);

    res.status(HTTPSTATUS.OK).json({
      message: "Fetched availability successfully",
      availability,
    });
    return;
  }
);

export const updateAvailabilityController = asyncHandlerAndValidation(
  UpdateAvailabilityDto,
  "body",
  async (req: Request, res: Response, updateAvailabilityDto) => {
    const userId = (req.user as any)?.id as string;

    const availability = await updateAvailabilityService(userId, updateAvailabilityDto);

    res.status(HTTPSTATUS.OK).json({
      message: "Availability updated successfully",
      availability,
    });
    return;
  }
);

// For Public Event
export const getAvailabilityForPublicEventController =
  asyncHandlerAndValidation(
    EventIdDTO,
    "params",
    async (req: Request, res: Response, eventIdDto) => {
      const availability = await getAvailabilityForPublicEventService(
        eventIdDto.eventId
      );
      return res.status(HTTPSTATUS.OK).json({
        message: "Event availability fetched successfully",
        data: availability,
      });
    }
  );
