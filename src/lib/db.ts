import mysql, { FieldPacket, ResultSetHeader } from "mysql2/promise";

if (!process.env.NEXT_PUBLIC_DEPLOYMENT_MODE)
  throw Error("NEXT_PUBLIC_DEPLOYMENT_MODE is not set in .env");

export const pool = mysql.createPool(
  process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === "prod"
    ? {
        uri: process.env.DB_URL,
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      }
    : {
        host: "localhost",
        user: "root",
        database: "nextnote",
        waitForConnections: true,
        connectionLimit: 10,
        maxIdle: 10,
        idleTimeout: 60000,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      }
);

// Quick Functions
export async function findUserByEmail(email: string) {
  const [results, fields] = await pool.execute(
    "SELECT * FROM accounts WHERE email = ?",
    [email]
  );
  return [results, fields] as [ResultSetHeader, FieldPacket[]];
}
