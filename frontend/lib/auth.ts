import { betterAuth } from "better-auth";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false,
});

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [
    "https://whatsapp-clone-relay.vercel.app",
    "http://localhost:3000"
  ],
  rateLimit: {
    enabled: false,
  },
  user: {
    additionalFields: {
      status: {
        type: "string",
        defaultValue: "offline",
        fieldName: "status",
      },
      lastSeenAt: {
        type: "date",
        defaultValue: new Date(),
        fieldName: "lastseenat",
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  appName: "Relay",
});
