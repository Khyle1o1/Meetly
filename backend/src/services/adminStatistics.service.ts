import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { Event } from "../database/entities/event.entity";
import { Meeting, MeetingStatus } from "../database/entities/meeting.entity";

export const getAdminStatisticsService = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const eventRepository = AppDataSource.getRepository(Event);
  const meetingRepository = AppDataSource.getRepository(Meeting);

  // Get total users count
  const totalUsers = await userRepository.count();

  // Get active events count (non-private events)
  const activeEvents = await eventRepository.count({
    where: { isPrivate: false }
  });

  // Get pending bookings count
  const pendingBookings = await meetingRepository.count({
    where: { status: MeetingStatus.PENDING }
  });

  return {
    totalUsers,
    activeEvents,
    pendingBookings
  };
}; 