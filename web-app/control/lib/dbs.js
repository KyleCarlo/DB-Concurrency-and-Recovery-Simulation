import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

const createDB = (port) => mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    port: parseInt(port),
    multipleStatements: true
});

export const db1 = createDB(process.env.PORT0);
export const db2 = createDB(process.env.PORT1);
export const db3 = createDB(process.env.PORT2);