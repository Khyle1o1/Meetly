import { LessThan, MoreThan } from "typeorm";
import { AppDataSource } from "../config/database.config";
import { Meeting, MeetingStatus } from "../database/entities/meeting.entity";
import {
  MeetingFilterEnum,
  MeetingFilterEnumType,
} from "../enums/meeting.enum";
import { CreateMeetingDto, UpdateMeetingStatusDto } from "../database/dto/meeting.dto";
import {
  Event,
  EventLocationEnumType,
} from "../database/entities/event.entity";
import {
  Integration,
  IntegrationAppTypeEnum,
  IntegrationCategoryEnum,
} from "../database/entities/integration.entity";
import { Package } from "../database/entities/package.entity";
import { School } from "../database/entities/school.entity";
import { BadRequestException, NotFoundException } from "../utils/app-error";
import { validateGoogleToken } from "./integration.service";
import { googleOAuth2Client } from "../config/oauth.config";
import { google } from "googleapis";
import { sendBookingReceivedEmail, sendBookingConfirmationEmail } from "./email.service";

export const getUserMeetingsService = async (
  userId: string,
  filter: MeetingFilterEnumType
) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const where: any = { user: { id: userId } };

  if (filter === MeetingFilterEnum.UPCOMING) {
    where.status = MeetingStatus.SCHEDULED;
    where.startTime = MoreThan(new Date());
  } else if (filter === MeetingFilterEnum.PAST) {
    where.status = MeetingStatus.SCHEDULED;
    where.startTime = LessThan(new Date());
  } else if (filter === MeetingFilterEnum.CANCELLED) {
    where.status = MeetingStatus.CANCELLED;
  } else {
    where.status = MeetingStatus.SCHEDULED;
    where.startTime = MoreThan(new Date());
  }

  const meetings = await meetingRepository.find({
    where,
    relations: ["event"],
    order: { startTime: "ASC" },
    // cache: true, // Temporarily disabled caching
  });

  return meetings || [];
};

export const getPendingBookingsService = async (userId: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const meetings = await meetingRepository.find({
    where: { 
      user: { id: userId },
      status: MeetingStatus.PENDING 
    },
    relations: ["event", "selectedPackage"],
    order: { createdAt: "DESC" },
    // cache: true, // Temporarily disabled caching
  });

  return meetings || [];
};

export const getAllBookingsForUserService = async (userEmail: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const allBookings = await meetingRepository.find({
    where: { guestEmail: userEmail },
    relations: ["event", "event.user", "selectedPackage"],
    order: { createdAt: "DESC" },
  });

  return allBookings || [];
};

export const getIncompleteBookingsService = async (userId: string, userEmail: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  // Get pending bookings for the current user (as guest)
  const pendingBookings = await meetingRepository.find({
    where: { guestEmail: userEmail, status: MeetingStatus.PENDING },
    relations: ["event", "event.user", "selectedPackage"],
    order: { createdAt: "DESC" },
  });

  return pendingBookings || [];
};

export const getPendingBookingsForGuestService = async (userEmail: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const pendingBookings = await meetingRepository.find({
    where: { guestEmail: userEmail, status: MeetingStatus.PENDING },
    relations: ["event", "event.user", "selectedPackage"],
    order: { createdAt: "DESC" },
  });

  return pendingBookings || [];
};

export const checkExistingBookingService = async (guestEmail: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);

  const existingBooking = await meetingRepository.findOne({
    where: { guestEmail },
    select: ["id", "status", "createdAt", "event"],
    relations: ["event"],
  });

  return existingBooking;
};

export const createMeetBookingForGuestService = async (
  createMeetingDto: CreateMeetingDto
) => {
  const { 
    eventId, 
    guestEmail, 
    guestName, 
    additionalInfo, 
    selectedPackageId,
    lastName,
    firstName,
    middleName,
    contactNumber,
    schoolName,
    yearLevel,
    paymentProofUrl
  } = createMeetingDto;
  const startTime = new Date(createMeetingDto.startTime);
  const endTime = new Date(createMeetingDto.endTime);

  const eventRepository = AppDataSource.getRepository(Event);
  const integrationRepository = AppDataSource.getRepository(Integration);
  const meetingRepository = AppDataSource.getRepository(Meeting);
  const packageRepository = AppDataSource.getRepository(Package);

  // Check if user has already made a booking
  const existingBooking = await meetingRepository.findOne({
    where: { guestEmail },
    select: ["id", "status", "createdAt"],
  });

  if (existingBooking) {
    throw new BadRequestException("You have already made a booking. Only one booking per account is allowed.");
  }

  const event = await eventRepository.findOne({
    where: { id: eventId, isPrivate: false },
    relations: ["user", "packages"],
    select: ["id", "title", "locationType", "user"], // Only select needed fields
  });

  if (!event) throw new NotFoundException("Event not found");

  // Handle package selection if provided
  let selectedPackage: Package | null = null;
  if (selectedPackageId) {
    selectedPackage = await packageRepository.findOne({
      where: { id: selectedPackageId, isActive: true },
      select: ["id", "name", "price"], // Only select needed fields
    });

    if (!selectedPackage) {
      throw new BadRequestException("Selected package not found or inactive");
    }

    // Verify the package is assigned to this event
    const isPackageAssignedToEvent = event.packages.some(
      (pkg) => pkg.id === selectedPackageId
    );

    if (!isPackageAssignedToEvent) {
      throw new BadRequestException("Selected package is not available for this event");
    }
  }

  if (!Object.values(EventLocationEnumType).includes(event.locationType)) {
    throw new BadRequestException("Invalid location type");
  }

  const meetIntegration = event.locationType === EventLocationEnumType.FACE_TO_FACE 
    ? null 
    : await integrationRepository.findOne({
        where: {
          user: { id: event.user.id },
          app_type: IntegrationAppTypeEnum[event.locationType as keyof typeof IntegrationAppTypeEnum],
        },
        select: ["id", "app_type", "access_token", "refresh_token", "expiry_date"], // Only select needed fields
      });

  if (!meetIntegration && event.locationType !== EventLocationEnumType.FACE_TO_FACE)
    throw new BadRequestException("No video conferencing integration found");

  let meetLink: string = "";
  let calendarEventId: string = "";
  let calendarAppType: string = "";

  // For the new booking flow, we don't create calendar events immediately
  // They will be created when the booking is approved
  if (event.locationType === EventLocationEnumType.FACE_TO_FACE) {
    meetLink = "";
    calendarEventId = "";
    calendarAppType = "";
  }

  const meeting = meetingRepository.create({
    event: { id: event.id },
    user: event.user,
    guestName,
    guestEmail,
    additionalInfo,
    lastName,
    firstName,
    middleName,
    contactNumber,
    schoolName,
    yearLevel,
    paymentProofUrl,
    startTime,
    endTime,
    meetLink: meetLink,
    calendarEventId: calendarEventId,
    calendarAppType: calendarAppType,
    status: MeetingStatus.PENDING,
    selectedPackage: selectedPackage ? { id: selectedPackage.id } : undefined,
  });

  await meetingRepository.save(meeting);

  // Send booking received email
  try {
    await sendBookingReceivedEmail(
      guestEmail,
      `${firstName} ${lastName}`,
      {
        eventTitle: event.title,
        startTime,
        endTime,
      }
    );
  } catch (error) {
    console.error("Failed to send booking received email:", error);
    // Don't throw error as the booking was created successfully
  }

  return {
    meetLink,
    meeting,
  };
};

export const updateMeetingStatusService = async (
  meetingId: string,
  updateData: UpdateMeetingStatusDto
) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);
  const integrationRepository = AppDataSource.getRepository(Integration);

  const meeting = await meetingRepository.findOne({
    where: { id: meetingId },
    relations: ["event", "event.user", "selectedPackage"],
    select: ["id", "status", "startTime", "endTime", "guestEmail", "firstName", "lastName", "adminMessage"], // Only select needed fields
  });

  if (!meeting) throw new NotFoundException("Meeting not found");

  const { status, adminMessage } = updateData;

  // If approving the meeting, create calendar event and meet link
  if (status === MeetingStatus.APPROVED && meeting.status === MeetingStatus.PENDING) {
    const event = meeting.event;
    
    if (event.locationType === EventLocationEnumType.GOOGLE_MEET_AND_CALENDAR) {
      const meetIntegration = await integrationRepository.findOne({
        where: {
          user: { id: event.user.id },
          app_type: IntegrationAppTypeEnum[event.locationType as keyof typeof IntegrationAppTypeEnum],
        },
        select: ["id", "app_type", "access_token", "refresh_token", "expiry_date"], // Only select needed fields
      });

      if (meetIntegration) {
        const { calendarType, calendar } = await getCalendarClient(
          meetIntegration.app_type,
          meetIntegration.access_token,
          meetIntegration.refresh_token,
          meetIntegration.expiry_date
        );

        const response = await calendar.events.insert({
          calendarId: "primary",
          conferenceDataVersion: 1,
          requestBody: {
            summary: `${meeting.firstName} ${meeting.lastName} - ${event.title}`,
            description: meeting.additionalInfo,
            start: { dateTime: meeting.startTime.toISOString() },
            end: { dateTime: meeting.endTime.toISOString() },
            attendees: [{ email: meeting.guestEmail }, { email: event.user.email }],
            conferenceData: {
              createRequest: {
                requestId: `${event.id}-${Date.now()}`,
              },
            },
          },
        });

        meeting.meetLink = response.data.hangoutLink!;
        meeting.calendarEventId = response.data.id!;
        meeting.calendarAppType = calendarType;
      }
    }

    // Update status to SCHEDULED for approved meetings
    meeting.status = MeetingStatus.SCHEDULED;
  } else {
    meeting.status = status;
  }

  if (adminMessage) {
    meeting.adminMessage = adminMessage;
  }

  await meetingRepository.save(meeting);

  // Send status update email
  try {
    await sendBookingConfirmationEmail(
      meeting.guestEmail,
      `${meeting.firstName} ${meeting.lastName}`,
      {
        eventTitle: meeting.event.title,
        startTime: meeting.startTime,
        endTime: meeting.endTime,
        status: meeting.status,
        adminMessage: meeting.adminMessage,
      }
    );
  } catch (error) {
    console.error("Failed to send status update email:", error);
    // Don't throw error as the status was updated successfully
  }

  return meeting;
};

export const cancelMeetingService = async (meetingId: string) => {
  const meetingRepository = AppDataSource.getRepository(Meeting);
  const integrationRepository = AppDataSource.getRepository(Integration);

  const meeting = await meetingRepository.findOne({
    where: { id: meetingId },
    relations: ["event", "event.user"],
    select: ["id", "calendarEventId", "calendarAppType", "status"], // Only select needed fields
  });
  if (!meeting) throw new NotFoundException("Meeting not found");

  try {
    const calendarIntegration = await integrationRepository.findOne({
      where: {
        app_type:
          IntegrationAppTypeEnum[
            meeting.calendarAppType as keyof typeof IntegrationAppTypeEnum
          ],
      },
      select: ["id", "app_type", "access_token", "refresh_token", "expiry_date"], // Only select needed fields
    });

    if (calendarIntegration) {
      const { calendar, calendarType } = await getCalendarClient(
        calendarIntegration.app_type,
        calendarIntegration.access_token,
        calendarIntegration.refresh_token,
        calendarIntegration.expiry_date
      );
      switch (calendarType) {
        case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
          await calendar.events.delete({
            calendarId: "primary",
            eventId: meeting.calendarEventId,
          });
          break;
        default:
          throw new BadRequestException(
            `Unsupported calendar provider: ${calendarType}`
          );
      }
    }
  } catch (error) {
    throw new BadRequestException("Failed to delete event from calendar");
  }

  meeting.status = MeetingStatus.CANCELLED;
  await meetingRepository.save(meeting);
  return { success: true };
};

async function getCalendarClient(
  appType: IntegrationAppTypeEnum,
  access_token: string,
  refresh_token: string,
  expiry_date: number | null
) {
  switch (appType) {
    case IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR:
      const validToken = await validateGoogleToken(
        access_token,
        refresh_token,
        expiry_date
      );
      googleOAuth2Client.setCredentials({ access_token: validToken });
      const calendar = google.calendar({
        version: "v3",
        auth: googleOAuth2Client,
      });
      return {
        calendar,
        calendarType: IntegrationAppTypeEnum.GOOGLE_MEET_AND_CALENDAR,
      };
    default:
      throw new BadRequestException(
        `Unsupported Calendar provider: ${appType}`
      );
  }
}
