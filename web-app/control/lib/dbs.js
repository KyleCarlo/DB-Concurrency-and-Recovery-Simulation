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

function query(db) {
    return async (q, values, mode) => {
        try {
            await db.query('LOCK TABLES movies ' + mode)
            const results = await db.query(q, values)
            await db.query('UNLOCK TABLES')
            await db.end()
            return results
        } catch (e) {
            try {
            await db.query('ROLLBACK')
            await db.query('UNLOCK TABLES')
            await db.end()
            } catch (e) {
            throw Error(e.message)
            }
            throw Error(e.message)
        }
    }
}

export const db1 = createDB(process.env.PORT0);
export const db2 = createDB(process.env.PORT1);
export const db3 = createDB(process.env.PORT2);

export const query1 = async (q, values, mode) => await query(db1)(q, values, mode)
export const query2 = async (q, values, mode) => await query(db2)(q, values, mode)
export const query3 = async (q, values, mode) => await query(db3)(q, values, mode)