import "dotenv/config";
import { config } from "../src/config/app.config";

console.log("🔧 Checking CORS configuration...");
console.log("📧 FRONTEND_ORIGIN:", config.FRONTEND_ORIGIN);
console.log("🌐 NODE_ENV:", config.NODE_ENV);
console.log("🚀 PORT:", config.PORT);
console.log("📁 BASE_PATH:", config.BASE_PATH);

// Test if the origin would be allowed
const testOrigin = "http://localhost:5173";
console.log("🧪 Testing origin:", testOrigin);

// Simple CORS check
if (config.FRONTEND_ORIGIN === "localhost") {
  console.log("⚠️  WARNING: FRONTEND_ORIGIN is set to 'localhost' instead of 'http://localhost:5173'");
  console.log("💡 This might cause CORS issues!");
} else {
  console.log("✅ FRONTEND_ORIGIN looks correct");
} 