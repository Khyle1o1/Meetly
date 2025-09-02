import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsString, Matches } from "class-validator";

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsEmail({}, { message: "Invalid email format" })
  @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,{ message: "Invalid email format" })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @MinLength(6)
  @IsNotEmpty()
  password: string;
}

export class LoginDto {
  @IsEmail({}, { message: "Invalid email format" })
  @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,{ message: "Invalid email format" })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
