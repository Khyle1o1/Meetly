import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User } from "../database/entities/user.entity";

async function deleteTestUsers() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);

    // List of test user emails to delete
    const testUserEmails = [
      "john.doe@example.com",
      "jane.smith@example.com",
      "bob.johnson@example.com",
      "alice.brown@example.com",
      "charlie.wilson@example.com"
    ];

    console.log("🗑️ Deleting test users...");

    let deletedCount = 0;

    for (const email of testUserEmails) {
      try {
        // Find the user
        const user = await userRepository.findOne({
          where: { email }
        });

        if (user) {
          console.log(`🗑️ Deleting user: ${user.name} (${user.email})`);
          await userRepository.remove(user);
          deletedCount++;
        } else {
          console.log(`⚠️ User ${email} not found, skipping...`);
        }
      } catch (error) {
        console.error(`❌ Error deleting user ${email}:`, error);
      }
    }

    console.log(`✅ Deleted ${deletedCount} test users`);

    // Show remaining users
    console.log("\n📊 Remaining users in database:");
    const remainingUsers = await userRepository.find({
      select: ["id", "name", "email", "username", "role", "createdAt"]
    });

    for (const user of remainingUsers) {
      console.log(`- ${user.email}: ${user.role} (${user.username})`);
    }

    console.log(`\n🎉 Total remaining users: ${remainingUsers.length}`);

  } catch (error) {
    console.error("❌ Error deleting test users:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
deleteTestUsers()
  .then(() => {
    console.log("✅ Test users deletion completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 