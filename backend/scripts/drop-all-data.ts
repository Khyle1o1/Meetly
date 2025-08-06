import "dotenv/config";
import { AppDataSource } from "../src/config/database.config";

async function dropAllData() {
  try {
    console.log("🔄 Initializing database connection...");
    await AppDataSource.initialize();
    
    console.log("🗑️  Dropping all data from database...");
    
    // Get all entity metadata
    const entities = AppDataSource.entityMetadatas;
    
    // Disable foreign key checks temporarily
    await AppDataSource.query("SET session_replication_role = replica;");
    
    // Drop data from all tables in reverse dependency order
    for (const entity of entities) {
      const tableName = entity.tableName;
      console.log(`🗑️  Dropping data from table: ${tableName}`);
      
      try {
        await AppDataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE;`);
        console.log(`✅ Successfully dropped data from ${tableName}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`⚠️  Warning: Could not drop data from ${tableName}:`, errorMessage);
      }
    }
    
    // Re-enable foreign key checks
    await AppDataSource.query("SET session_replication_role = DEFAULT;");
    
    console.log("✅ All data has been dropped successfully!");
    console.log("📊 Database tables are now empty but schema structure is preserved.");
    
  } catch (error) {
    console.error("❌ Error dropping data:", error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("🔌 Database connection closed.");
    }
  }
}

// Run the script
dropAllData()
  .then(() => {
    console.log("🎉 Script completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Script failed:", error);
    process.exit(1);
  }); 