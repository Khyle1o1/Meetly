import "dotenv/config";
import path from "path";
import { DataSource } from "typeorm";

import { config } from "./app.config";

export const getDatabaseConfig = () => {
  const isProduction = config.NODE_ENV === "production";
  const databaseUrl = config.DATABASE_URL;

  // Determine SSL configuration based on environment and URL
  let sslConfig: any = false;
  
  if (isProduction) {
    // For production, check if the database URL requires SSL
    if (databaseUrl && databaseUrl.includes('sslmode=')) {
      // If SSL mode is explicitly set in the URL, respect it
      sslConfig = {
        rejectUnauthorized: false, // Allow self-signed certificates
      };
    } else if (databaseUrl && (databaseUrl.includes('render.com') || databaseUrl.includes('heroku.com') || databaseUrl.includes('supabase.co'))) {
      // For Render, Heroku, and Supabase, SSL is typically required
      sslConfig = {
        rejectUnauthorized: false, // Allow self-signed certificates
      };
    } else {
      // For other production databases, try SSL with self-signed certificate support
      sslConfig = {
        rejectUnauthorized: false, // Allow self-signed certificates
      };
    }
  } else {
    // For development, SSL is optional
    sslConfig = {
      rejectUnauthorized: false,
    };
  }

  return new DataSource({
    type: "postgres",
    url: databaseUrl,
    entities: [path.join(__dirname, "../database/entities/*{.ts,.js}")],
    migrations: [path.join(__dirname, "../database/migrations/*{.ts,.js}")],
    synchronize: false, // Disable synchronize for better performance
    logging: isProduction ? false : ["error"],
    ssl: sslConfig,
    // Add connection pooling for better performance
    extra: {
      max: 20, // Maximum number of connections in the pool
      min: 5,  // Minimum number of connections in the pool
      acquireTimeoutMillis: 30000, // Maximum time to acquire a connection
      createTimeoutMillis: 30000, // Maximum time to create a connection
      destroyTimeoutMillis: 5000, // Maximum time to destroy a connection
      idleTimeoutMillis: 30000, // Maximum time a connection can be idle
      reapIntervalMillis: 1000, // How often to check for idle connections
      createRetryIntervalMillis: 200, // Time to wait before retrying connection creation
    },
    // Temporarily disable query result caching until cache table is created
    // cache: {
    //   duration: 30000, // Cache for 30 seconds
    // },
  });
};

export const AppDataSource = getDatabaseConfig();
