import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middeware";
import { HTTPSTATUS } from "../config/http.config";
import {
  MeetingFilterEnum,
  MeetingFilterEnumType,
} from "../enums/meeting.enum";
import {
  cancelMeetingService,
  createMeetBookingForGuestService,
  getUserMeetingsService,
  getPendingBookingsService,
  updateMeetingStatusService,
  getPendingBookingsForGuestService,
  getAllBookingsForUserService,
  checkExistingBookingService,
} from "../services/meeting.service";
import { asyncHandlerAndValidation } from "../middlewares/withValidation.middleware";
import { 
  CreateMeetingDto, 
  MeetingIdDTO, 
  UpdateMeetingStatusDto 
} from "../database/dto/meeting.dto";
import { uploadPaymentProof } from "../services/file-upload.service";

export const getUserMeetingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id as string;

    const filter =
      (req.query.filter as MeetingFilterEnumType) || MeetingFilterEnum.UPCOMING;

    const meetings = await getUserMeetingsService(userId, filter);

    res.status(HTTPSTATUS.OK).json({
      message: "Meetings fetched successfully",
      meetings,
    });
    return;
  }
);

export const getPendingBookingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id as string;

    const pendingBookings = await getPendingBookingsService(userId);

    res.status(HTTPSTATUS.OK).json({
      message: "Pending bookings fetched successfully",
      pendingBookings,
    });
    return;
  }
);

export const getPendingBookingsForUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id as string;
    const userEmail = (req.user as any)?.email as string;

    const pendingBookings = await getPendingBookingsForGuestService(userEmail);

    res.status(HTTPSTATUS.OK).json({
      message: "Pending bookings fetched successfully",
      pendingBookings,
    });
    return;
  }
);

export const checkExistingBookingController = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
      return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Email parameter is required",
      });
    }

    const existingBooking = await checkExistingBookingService(email);

    res.status(HTTPSTATUS.OK).json({
      message: "Booking check completed",
      hasExistingBooking: !!existingBooking,
      existingBooking: existingBooking || null,
    });
    return;
  }
);

// For Public
export const createMeetBookingForGuestController = asyncHandler(
  async (req: Request, res: Response) => {
    // Handle FormData instead of JSON
    const formData = req.body;
    const file = req.file; // This will be set by multer middleware

    // Create the DTO object from form data
    const createMeetingDto: CreateMeetingDto = {
      eventId: formData.eventId,
      startTime: formData.startTime,
      endTime: formData.endTime,
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      additionalInfo: formData.additionalInfo,
      selectedPackageId: formData.selectedPackageId,
      lastName: formData.lastName,
      firstName: formData.firstName,
      middleName: formData.middleName,
      contactNumber: formData.contactNumber,
      schoolName: formData.schoolName,
      yearLevel: formData.yearLevel,
      paymentProofUrl: "", // Will be set after file upload
    };

    // Handle file upload if present
    if (file) {
      try {
        const paymentProofUrl = await uploadPaymentProof(file, Date.now().toString());
        createMeetingDto.paymentProofUrl = paymentProofUrl;
      } catch (error: any) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
          message: "Failed to upload payment proof",
          error: error.message,
        });
      }
    }

    const { meetLink, meeting } = await createMeetBookingForGuestService(
      createMeetingDto
    );
    return res.status(HTTPSTATUS.CREATED).json({
      message: "Booking submitted successfully. Pending approval.",
      data: {
        meetLink,
        meeting,
      },
    });
  }
);

export const updateMeetingStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const meetingId = req.params.meetingId;
    const updateData = req.body;
    
    const updatedMeeting = await updateMeetingStatusService(
      meetingId,
      updateData
    );
    return res.status(HTTPSTATUS.OK).json({
      message: "Meeting status updated successfully",
      meeting: updatedMeeting,
    });
  }
);

export const cancelMeetingController = asyncHandlerAndValidation(
  MeetingIdDTO,
  "params",
  async (req: Request, res: Response, meetingIdDto) => {
    await cancelMeetingService(meetingIdDto.meetingId);
    return res.status(HTTPSTATUS.OK).json({
      message: "Meeting cancelled successfully",
    });
  }
);

export const getAllBookingsForUserController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req.user as any)?.id as string;
    const userEmail = (req.user as any)?.email as string;

    const allBookings = await getAllBookingsForUserService(userEmail);

    res.status(HTTPSTATUS.OK).json({
      message: "All bookings fetched successfully",
      allBookings,
    });
    return;
  }
);
