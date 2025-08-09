import mysql from "mysql2/promise";

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
