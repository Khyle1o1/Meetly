import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { EventLocationEnumType } from "../entities/event.entity";

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  duration: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  showDateRange?: boolean;

  @IsEnum(EventLocationEnumType)
  @IsNotEmpty()
  locationType: EventLocationEnumType;
}

export class EventIdDTO {
  @IsUUID(4, { message: "Invaild uuid" })
  @IsNotEmpty()
  eventId: string;
}

export class UserNameDTO {
  @IsString()
  @IsNotEmpty()
  username: string;
}

export class UserNameAndSlugDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  slug: string;
}
