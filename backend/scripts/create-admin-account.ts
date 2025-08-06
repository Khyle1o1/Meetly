import "dotenv/config";
import { AppDataSource } from "../src/config/database.config";
import { User, UserRole } from "../src/database/entities/user.entity";
import { Availability } from "../src/database/entities/availability.entity";
import { DayAvailability, DayOfWeekEnum } from "../src/database/entities/day-availability";

async function createAdminAccount() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();
    console.log("✅ Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);
    const availabilityRepository = AppDataSource.getRepository(Availability);
    const dayAvailabilityRepository = AppDataSource.getRepository(DayAvailability);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
      where: { email: "admin@meetly.com" },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin account already exists!");
      console.log("📧 Email: admin@meetly.com");
      console.log("🔑 Password: admin123");
      console.log("👤 Username:", existingAdmin.username);
      console.log("🔐 Role:", existingAdmin.role);
      console.log("🆔 User ID:", existingAdmin.id);
      return;
    }

    console.log("👤 Creating admin account...");

    // Create admin user with proper structure
    // Don't pre-hash password - the entity's @BeforeInsert hook will hash it
    const adminUser = userRepository.create({
      name: "Admin User",
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: "admin@meetly.com",
      password: "admin123", // Plain text - will be hashed by entity hook
      role: UserRole.ADMIN,
    });

    // Create default availability for admin
    console.log("📅 Creating default availability...");
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
    const savedAdmin = await userRepository.save(adminUser);
    console.log("✅ Admin account created successfully!");
    console.log("📧 Email: admin@meetly.com");
    console.log("🔑 Password: admin123");
    console.log("👤 Username: admin");
    console.log("🔐 Role: ADMIN");
    console.log("🆔 User ID:", savedAdmin.id);
    console.log("📅 Availability: Monday-Friday, 9:00 AM - 5:00 PM");
    console.log("⏱️  Time Gap: 30 minutes");

  } catch (error) {
    console.error("❌ Error creating admin account:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error details:", errorMessage);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("🔌 Database connection closed.");
    }
  }
}

// Run the script
createAdminAccount()
  .then(() => {
    console.log("🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }); 