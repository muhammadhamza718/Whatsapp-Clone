import { Pool } from "pg";
import { NextResponse } from "next/server";

/**
 * GET /api/db-health
 *
 * A diagnostic endpoint to confirm the database connection in production.
 * Shows which host is connected, pg version, and current DB name.
 *
 * ⚠️  Remove or protect this endpoint before going to a public launch.
 */
export async function GET() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return NextResponse.json(
      {
        connected: false,
        error: "DATABASE_URL environment variable is not set in Vercel.",
        hint: "Go to Vercel → Project → Settings → Environment Variables and add DATABASE_URL.",
      },
      { status: 500 }
    );
  }

  // Parse the host from the connection string for display (never expose password)
  let displayHost = "unknown";
  try {
    const url = new URL(connectionString);
    displayHost = url.hostname;
  } catch {
    displayHost = "could not parse host";
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    // Short timeout so Vercel doesn't hang on a bad connection
    connectionTimeoutMillis: 5000,
  });

  let client;
  try {
    client = await pool.connect();

    const [versionResult, dbNameResult] = await Promise.all([
      client.query("SELECT version()"),
      client.query("SELECT current_database()"),
    ]);

    const pgVersion = versionResult.rows[0]?.version ?? "unknown";
    const dbName = dbNameResult.rows[0]?.current_database ?? "unknown";

    return NextResponse.json({
      connected: true,
      host: displayHost,
      database: dbName,
      pg_version: pgVersion,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        connected: false,
        host: displayHost,
        error: message,
        hint: "Check that DATABASE_URL in Vercel matches your Railway connection string, and that Railway allows external connections.",
      },
      { status: 500 }
    );
  } finally {
    client?.release();
    await pool.end();
  }
}
