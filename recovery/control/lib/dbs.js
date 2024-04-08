import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

function query(db, table) {
    return async (q, values, mode) => {
        try {
            await db.promise().query('LOCK TABLES appointments ' + mode)
            const results = await db.promise().query(q, values);
            await db.promise().query('UNLOCK TABLES')
            // await db.promise().end()
            return results[0];
        } catch (e) {
            try {
                await db.promise().query('ROLLBACK')
                await db.promise().query('UNLOCK TABLES')
                // await db.promise().end()
            } catch (e) {
                throw Error(e.message)
            }
            throw Error(e.message)
        }
    }
}

const createDB = (port, db) => mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PW,
    database: db,
    port: parseInt(port),
    multipleStatements: true
});

export const db1 = createDB(process.env.PORT0, process.env.DB0);
export const db2 = createDB(process.env.PORT1, process.env.DB1);
export const db3 = createDB(process.env.PORT2, process.env.DB2);

export const query1 = async (q, values, mode) => await query(db1, process.env.TABLE0)(q, values, mode);
export const query2 = async (q, values, mode) => await query(db2, process.env.TABLE1)(q, values, mode);
export const query3 = async (q, values, mode) => await query(db3, process.env.TABLE2)(q, values, mode);