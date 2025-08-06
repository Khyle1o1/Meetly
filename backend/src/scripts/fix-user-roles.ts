import "dotenv/config";
import { AppDataSource } from "../config/database.config";
import { User, UserRole } from "../database/entities/user.entity";

async function fixUserRoles() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log("Database connected successfully");

    const userRepository = AppDataSource.getRepository(User);

    // Get all users
    const allUsers = await userRepository.find();
    console.log(`Found ${allUsers.length} users in the database`);

    let updatedCount = 0;

    for (const user of allUsers) {
      console.log(`User: ${user.email}, Current role: ${user.role}`);
      
      // If user is not admin@meetly.com and has admin role, change to user
      if (user.email !== "admin@meetly.com" && user.role === UserRole.ADMIN) {
        console.log(`⚠️  Fixing role for ${user.email} from ADMIN to USER`);
        user.role = UserRole.USER;
        await userRepository.save(user);
        updatedCount++;
      }
      
      // If user is admin@meetly.com and doesn't have admin role, change to admin
      if (user.email === "admin@meetly.com" && user.role !== UserRole.ADMIN) {
        console.log(`⚠️  Fixing role for ${user.email} from ${user.role} to ADMIN`);
        user.role = UserRole.ADMIN;
        await userRepository.save(user);
        updatedCount++;
      }
    }

    console.log(`✅ Fixed ${updatedCount} user roles`);

    // Show final state
    console.log("\n📊 Final user roles:");
    const finalUsers = await userRepository.find();
    for (const user of finalUsers) {
      console.log(`- ${user.email}: ${user.role}`);
    }

  } catch (error) {
    console.error("❌ Error fixing user roles:", error);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run the script
fixUserRoles(); 