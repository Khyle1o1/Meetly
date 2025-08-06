import { BadRequestException } from "../utils/app-error";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export const uploadPaymentProof = async (
  file: any,
  bookingId: string
): Promise<string> => {
  try {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        "Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed."
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new BadRequestException("File size too large. Maximum size is 5MB.");
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Create payment-proofs directory
    const paymentProofsDir = path.join(uploadsDir, "payment-proofs");
    if (!existsSync(paymentProofsDir)) {
      await mkdir(paymentProofsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const fileName = `payment-proof-${bookingId}-${Date.now()}${fileExtension}`;
    const filePath = path.join(paymentProofsDir, fileName);

    // Write file from buffer
    await writeFile(filePath, file.buffer);

    // Return the relative path for database storage
    return `/uploads/payment-proofs/${fileName}`;
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new BadRequestException("Failed to upload file");
  }
};

export const deletePaymentProof = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.join(__dirname, "../../", filePath);
    if (existsSync(fullPath)) {
      await writeFile(fullPath, ""); // Clear file content
    }
  } catch (error) {
    console.error("Failed to delete payment proof:", error);
  }
}; 