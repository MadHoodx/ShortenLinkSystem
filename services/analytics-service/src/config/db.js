import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.MYSQL_HOST || '127.0.0.1',
  port: process.env.MYSQLPORT || process.env.MYSQL_PORT ? Number(process.env.MYSQLPORT || process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQLUSER || process.env.MYSQL_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE || 'analytics',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: '+00:00' 
});

export default pool;
