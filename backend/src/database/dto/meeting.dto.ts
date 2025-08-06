import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
} from "class-validator";
import { MeetingStatus } from "../entities/meeting.entity";

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  guestName: string;

  @IsEmail()
  @IsNotEmpty()
  guestEmail: string;

  @IsString()
  @IsOptional()
  additionalInfo: string;

  @IsUUID(4)
  @IsOptional()
  selectedPackageId?: string;

  // New fields for enhanced booking flow
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsOptional()
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @IsString()
  @IsNotEmpty()
  schoolName: string;

  @IsString()
  @IsNotEmpty()
  yearLevel: string;

  @IsString()
  @IsOptional()
  paymentProofUrl?: string;
}

export class UpdateMeetingStatusDto {
  @IsEnum(MeetingStatus)
  @IsNotEmpty()
  status: MeetingStatus;

  @IsString()
  @IsOptional()
  adminMessage?: string;
}

export class MeetingIdDTO {
  @IsUUID(4, { message: "Invalid uuid" })
  @IsNotEmpty()
  meetingId: string;
}
