import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";
import { Event, EventLocationEnumType } from "../database/entities/event.entity";
import { slugify } from "../utils/helper";

async function createSampleEvent() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);
    const eventRepository = AppDataSource.getRepository(Event);

    // Find the admin user
    const adminUser = await userRepository.findOne({
      where: { email: "admin@meetly.com" },
    });

    if (!adminUser) {
      console.log("❌ Admin user not found! Please run 'npm run create-admin' first.");
      return;
    }

    // Check if sample event already exists
    const existingEvent = await eventRepository.findOne({
      where: { 
        user: { id: adminUser.id },
        title: "Sample Consultation" 
      },
    });

    if (existingEvent) {
      console.log("Sample event already exists!");
      console.log("Event Title:", existingEvent.title);
      console.log("Event Slug:", existingEvent.slug);
      console.log("Event URL: /admin/sample-consultation");
      return;
    }

    // Create sample event
    const sampleEvent = eventRepository.create({
      title: "Sample Consultation",
      description: "This is a sample consultation event for testing the booking system. You can book a 60-minute session with the admin.",
      duration: 60, // 60 minutes
      locationType: EventLocationEnumType.FACE_TO_FACE,
      slug: "sample-consultation",
      user: adminUser,
      isPrivate: false, // Make it public so users can book
      showDateRange: true,
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
    });

    // Save the event
    await eventRepository.save(sampleEvent);
    console.log("✅ Sample event created successfully!");
    console.log("📋 Event Title:", sampleEvent.title);
    console.log("🔗 Event Slug:", sampleEvent.slug);
    console.log("🌐 Event URL: /admin/sample-consultation");
    console.log("⏱️ Duration:", sampleEvent.duration, "minutes");
    console.log("📍 Location Type:", sampleEvent.locationType);

  } catch (error) {
    console.error("❌ Error creating sample event:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
createSampleEvent(); 