import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User, UserRole } from "../database/entities/user.entity";
import { registerService } from "../services/auth.service";

async function createTestUsers() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const testUsers = [
      {
        firstName: "John",
        lastName: "Doe",
        middleName: "",
        email: "john.doe@example.com",
        password: "password123",
        phoneNumber: "1234567890"
      },
      {
        firstName: "Jane",
        lastName: "Smith",
        middleName: "",
        email: "jane.smith@example.com",
        password: "password123",
        phoneNumber: "1234567891"
      },
      {
        firstName: "Bob",
        lastName: "Johnson",
        middleName: "",
        email: "bob.johnson@example.com",
        password: "password123",
        phoneNumber: "1234567892"
      },
      {
        firstName: "Alice",
        lastName: "Brown",
        middleName: "",
        email: "alice.brown@example.com",
        password: "password123",
        phoneNumber: "1234567893"
      },
      {
        firstName: "Charlie",
        lastName: "Wilson",
        middleName: "",
        email: "charlie.wilson@example.com",
        password: "password123",
        phoneNumber: "1234567894"
      }
    ];

    console.log("🧪 Creating test users...");

    for (const userData of testUsers) {
      try {
        // Check if user already exists
        const existingUser = await AppDataSource.getRepository(User).findOne({
          where: { email: userData.email }
        });

        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`);
          continue;
        }

        // Create user using registration service
        const result = await registerService(userData);
        console.log(`✅ Created user: ${result.user.email} (${result.user.role})`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error);
      }
    }

    // Show all users
    console.log("\n📊 All users in database:");
    const allUsers = await AppDataSource.getRepository(User).find({
      select: ["id", "name", "email", "username", "role", "createdAt"]
    });

    for (const user of allUsers) {
      console.log(`- ${user.email}: ${user.role} (${user.username})`);
    }

    console.log(`\n🎉 Total users: ${allUsers.length}`);

  } catch (error) {
    console.error("❌ Error creating test users:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
createTestUsers()
  .then(() => {
    console.log("✅ Test users creation completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  }); 