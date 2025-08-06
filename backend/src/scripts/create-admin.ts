import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User, UserRole } from "../database/entities/user.entity";
import { Availability } from "../database/entities/availability.entity";
import { DayAvailability, DayOfWeekEnum } from "../database/entities/day-availability";
import { hashValue } from "../utils/bcrypt";

async function createAdminAccount() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);
    const availabilityRepository = AppDataSource.getRepository(Availability);
    const dayAvailabilityRepository = AppDataSource.getRepository(DayAvailability);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: "admin@meetly.com" },
    });

    if (existingAdmin) {
      console.log("Admin account already exists!");
      console.log("Email: admin@meetly.com");
      console.log("Password: admin123");
      console.log("Username:", existingAdmin.username);
      console.log("Role:", existingAdmin.role);
      return;
    }

    // Create admin user
    const hashedPassword = await hashValue("admin123");
    
    const adminUser = userRepository.create({
      name: "Admin User",
      username: "admin",
      email: "admin@meetly.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    // Create default availability for admin
    const availability = availabilityRepository.create({
      timeGap: 30,
      days: Object.values(DayOfWeekEnum).map((day) => {
        return dayAvailabilityRepository.create({
          day: day,
          startTime: new Date(`2025-03-01T09:00:00Z`), // 9:00 AM
          endTime: new Date(`2025-03-01T17:00:00Z`), // 5:00 PM
          isAvailable: day !== DayOfWeekEnum.SUNDAY && day !== DayOfWeekEnum.SATURDAY,
        });
      }),
    });

    adminUser.availability = availability;

    // Save admin user
    await userRepository.save(adminUser);
    console.log("✅ Admin account created successfully!");
    console.log("📧 Email: admin@meetly.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Username: admin");
    console.log("🔐 Role: ADMIN");

  } catch (error) {
    console.error("❌ Error creating admin account:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
createAdminAccount(); 