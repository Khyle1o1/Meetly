import { AvailabilityResponseType } from "../@types/availability.type";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { NotFoundException } from "../utils/app-error";
import { UpdateAvailabilityDto } from "../database/dto/availability.dto";
import { Availability } from "../database/entities/availability.entity";
import { DayAvailability, DayOfWeekEnum } from "../database/entities/day-availability";
import { Event } from "../database/entities/event.entity";
import { addDays, addMinutes, format, parseISO } from "date-fns";

export const getUserAvailabilityService = async (userId: string) => {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["availability", "availability.days"],
  });
  if (!user || !user.availability) {
    throw new NotFoundException("User not found or availbility");
  }

  const availabilityData: AvailabilityResponseType = {
    timeGap: user.availability.timeGap,
    days: [],
  };

  user.availability.days.forEach((dayAvailability) => {
    availabilityData.days.push({
      day: dayAvailability.day,
      startTime: dayAvailability.startTime.toISOString().slice(11, 16),
      endTime: dayAvailability.endTime.toISOString().slice(11, 16),
      isAvailable: dayAvailability.isAvailable,
    });
  });

  return availabilityData;
};

export const updateAvailabilityService = async (
  userId: string,
  data: UpdateAvailabilityDto
) => {
  const userRepository = AppDataSource.getRepository(User);
  const availabilityRepository = AppDataSource.getRepository(Availability);

  const user = await userRepository.findOne({
    where: { id: userId },
    relations: ["availability", "availability.days"],
  });

  if (!user) throw new NotFoundException("User not found");

  const dayAvailabilityData = data.days.map(
    ({ day, isAvailable, startTime, endTime }) => {
      const baseDate = new Date().toISOString().split("T")[0];
      return {
        day: day.toUpperCase() as DayOfWeekEnum,
        startTime: new Date(`${baseDate}T${startTime}:00Z`),
        endTime: new Date(`${baseDate}T${endTime}:00Z`),
        isAvailable,
      } as Partial<DayAvailability>;
    }
  );

  if (user.availability) {
    await availabilityRepository.save({
      id: user.availability.id,
      timeGap: data.timeGap,
      days: dayAvailabilityData.map((day) => ({
        ...day,
        availability: { id: user.availability.id } as Availability,
      })) as DayAvailability[],
    });
  } else {
    const availability = availabilityRepository.create({
      user: { id: userId } as User,
      timeGap: data.timeGap,
      days: dayAvailabilityData as DayAvailability[],
    });
    await availabilityRepository.save(availability);
  }

  return { sucess: true };
};

export const getAvailabilityForPublicEventService = async (eventId: string) => {
  const eventRepository = AppDataSource.getRepository(Event);

  const event = await eventRepository.findOne({
    where: { id: eventId, isPrivate: false },
    relations: [
      "user",
      "user.availability",
      "user.availability.days",
      "user.meetings",
    ],
  });

  if (!event || !event.user.availability) return [];

  const { availability, meetings } = event.user;

  const daysOfWeek = Object.values(DayOfWeekEnum);

  const availableDays = [] as Array<{ day: string; slots: string[]; isAvailable: boolean }>;

  const manilaNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const manilaTodayMidnight = new Date(manilaNow.getFullYear(), manilaNow.getMonth(), manilaNow.getDate());

  for (const dayOfWeek of daysOfWeek) {
    const nextDate = getNextDateForDay(dayOfWeek);

    // Skip past dates relative to Manila
    const nextDateManila = new Date(nextDate.toLocaleString("en-US", { timeZone: "Asia/Manila" }));
    const nextDateMidnight = new Date(nextDateManila.getFullYear(), nextDateManila.getMonth(), nextDateManila.getDate());
    if (nextDateMidnight < manilaTodayMidnight) {
      continue;
    }

    // Check if the date is within the event's date range (if showDateRange is true)
    if (event.showDateRange && event.startDate && event.endDate) {
      const startDate = new Date(new Date(event.startDate).toLocaleString("en-US", { timeZone: "Asia/Manila" }));
      const endDate = new Date(new Date(event.endDate).toLocaleString("en-US", { timeZone: "Asia/Manila" }));

      const startDateMidnight = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const endDateMidnight = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

      if (nextDateMidnight < startDateMidnight || nextDateMidnight > endDateMidnight) {
        continue;
      }
    }

    const dayAvailability = availability.days.find((d) => d.day === dayOfWeek);
    if (dayAvailability) {
      const slots = dayAvailability.isAvailable
        ? generateAvailableTimeSlots(
            dayAvailability.startTime,
            dayAvailability.endTime,
            event.duration,
            meetings,
            format(nextDate, "yyyy-MM-dd"),
            availability.timeGap
          )
        : [];

      availableDays.push({
        day: dayOfWeek,
        slots,
        isAvailable: dayAvailability.isAvailable,
      });
    }
  }

  return availableDays;
};

function getNextDateForDay(dayOfWeek: string): Date {
  const days = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];

  // Use Asia/Manila to determine "today"
  const todayManila = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const todayDay = todayManila.getDay();

  const targetDay = days.indexOf(dayOfWeek);

  const daysUntilTarget = (targetDay - todayDay + 7) % 7;

  return addDays(todayManila, daysUntilTarget);
}

function generateAvailableTimeSlots(
  startTime: Date,
  endTime: Date,
  duration: number,
  meetings: { startTime: Date; endTime: Date }[],
  dateStr: string,
  timeGap: number = 30
) {
  const slots: string[] = [];

  let slotStartTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`
  );

  let slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`
  );

  // Manila "now" for same-day filtering
  const nowManila = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" }));
  const isToday = format(nowManila, "yyyy-MM-dd") === dateStr;

  while (slotStartTime < slotEndTime) {
    if (!isToday || slotStartTime >= nowManila) {
      const slotEnd = new Date(slotStartTime.getTime() + duration * 60000);

      if (isSlotAvailable(slotStartTime, slotEnd, meetings)) {
        slots.push(format(slotStartTime, "HH:mm"));
      }
    }

    slotStartTime = addMinutes(slotStartTime, timeGap);
  }

  return slots;
}

function isSlotAvailable(
  slotStart: Date,
  slotEnd: Date,
  meetings: { startTime: Date; endTime: Date }[]
): boolean {
  for (const meeting of meetings) {
    if (slotStart < meeting.endTime && slotEnd > meeting.startTime) {
      return false;
    }
  }
  return true;
}
