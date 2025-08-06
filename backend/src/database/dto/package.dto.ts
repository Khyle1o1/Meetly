import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  Min,
} from "class-validator";
import { Type, Transform } from "class-transformer";

export class CreatePackageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  inclusions?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @Transform(({ value }: { value: any }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;
}

export class UpdatePackageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  inclusions?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @Transform(({ value }: { value: any }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Transform(({ value }: { value: any }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  @IsOptional()
  isRecommended?: boolean;
}

export class PackageIdDTO {
  @IsUUID(4, { message: "Invalid uuid" })
  @IsNotEmpty()
  packageId: string;
}

export class AssignPackagesToEventDto {
  @IsUUID(4, { message: "Invalid event uuid" })
  @IsNotEmpty()
  eventId: string;

  @IsUUID(4, { each: true, message: "Invalid package uuid" })
  @IsNotEmpty()
  packageIds: string[];
}

export class SelectPackageForBookingDto {
  @IsUUID(4, { message: "Invalid package uuid" })
  @IsNotEmpty()
  packageId: string;
} 