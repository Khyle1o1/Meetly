import { AppDataSource } from "../config/database.config";
import { Package } from "../database/entities/package.entity";
import { User } from "../database/entities/user.entity";
import { Event } from "../database/entities/event.entity";
import { Meeting } from "../database/entities/meeting.entity";
import { In } from "typeorm";
import {
  CreatePackageDto,
  UpdatePackageDto,
  AssignPackagesToEventDto,
  SelectPackageForBookingDto,
} from "../database/dto/package.dto";

const packageRepository = AppDataSource.getRepository(Package);
const userRepository = AppDataSource.getRepository(User);
const eventRepository = AppDataSource.getRepository(Event);
const meetingRepository = AppDataSource.getRepository(Meeting);

export const createPackageService = async (
  userId: string,
  createPackageDto: CreatePackageDto
): Promise<Package> => {
  const user = await userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const package_ = packageRepository.create({
    ...createPackageDto,
    user,
  });

  return await packageRepository.save(package_);
};

export const getUserPackagesService = async (userId: string): Promise<Package[]> => {
  return await packageRepository.find({
    where: { user: { id: userId } },
    order: { createdAt: "DESC" },
  });
};

export const getAllPackagesService = async (): Promise<Package[]> => {
  return await packageRepository.find({
    where: { isActive: true },
    order: { createdAt: "DESC" },
  });
};

export const getPackageByIdService = async (
  userId: string,
  packageId: string
): Promise<Package> => {
  const package_ = await packageRepository.findOne({
    where: { id: packageId, user: { id: userId } },
  });

  if (!package_) {
    throw new Error("Package not found");
  }

  return package_;
};

export const updatePackageService = async (
  userId: string,
  packageId: string,
  updatePackageDto: UpdatePackageDto
): Promise<Package> => {
  const package_ = await packageRepository.findOne({
    where: { id: packageId, user: { id: userId } },
  });

  if (!package_) {
    throw new Error("Package not found");
  }

  Object.assign(package_, updatePackageDto);
  return await packageRepository.save(package_);
};

export const deletePackageService = async (
  userId: string,
  packageId: string
): Promise<void> => {
  const package_ = await packageRepository.findOne({
    where: { id: packageId, user: { id: userId } },
  });

  if (!package_) {
    throw new Error("Package not found");
  }

  await packageRepository.remove(package_);
};

export const assignPackagesToEventService = async (
  userId: string,
  assignPackagesDto: AssignPackagesToEventDto
): Promise<Event> => {
  const event = await eventRepository.findOne({
    where: { id: assignPackagesDto.eventId, user: { id: userId } },
    relations: ["packages"],
  });

  if (!event) {
    throw new Error("Event not found");
  }

  const packages = await packageRepository.find({
    where: { id: In(assignPackagesDto.packageIds), user: { id: userId } },
  });

  if (packages.length !== assignPackagesDto.packageIds.length) {
    throw new Error("Some packages not found");
  }

  event.packages = packages;
  return await eventRepository.save(event);
};

export const getEventPackagesService = async (eventId: string): Promise<Package[]> => {
  const event = await eventRepository.findOne({
    where: { id: eventId },
    relations: ["packages"],
  });

  if (!event) {
    throw new Error("Event not found");
  }

  return event.packages.filter((pkg: Package) => pkg.isActive);
};

export const selectPackageForBookingService = async (
  meetingId: string,
  selectPackageDto: SelectPackageForBookingDto
): Promise<Meeting> => {
  const meeting = await meetingRepository.findOne({
    where: { id: meetingId },
    relations: ["event", "event.packages"],
  });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  const selectedPackage = meeting.event.packages.find(
    (pkg: Package) => pkg.id === selectPackageDto.packageId && pkg.isActive
  );

  if (!selectedPackage) {
    throw new Error("Package not available for this event");
  }

  meeting.selectedPackage = selectedPackage;
  return await meetingRepository.save(meeting);
};

export const getMeetingWithPackageService = async (
  meetingId: string
): Promise<Meeting> => {
  const meeting = await meetingRepository.findOne({
    where: { id: meetingId },
    relations: ["selectedPackage"],
  });

  if (!meeting) {
    throw new Error("Meeting not found");
  }

  return meeting;
}; 