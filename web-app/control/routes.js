import { Router } from "express";
import {db1, db2, db3, query1, query2, query3} from "./lib/dbs.js";

const router = Router();
const queries = [query1, query2, query3];

function generateRandomString(length) {
    const characters = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

router.get("/", (req, res) => {
    res.render('index');
});

// CREATE
router.get("/create", (req, res) => {
    res.render('create', {
        error: null
    });
});
router.post('/create', async (req, res) => {
    const db_selected = req.app.get('access');
    let apptid = req.body.apptid;
    apptid = generateRandomString(32);
    let appointmentExists = true;

    while (appointmentExists) {
        try {
            let query = queries[db_selected];
            const existingAppointments = await query("SELECT * FROM appointments WHERE apptid = ?", apptid, 'READ');
            
            if (existingAppointments.length === 0) {
                appointmentExists = false;
            } else {
                apptid = generateRandomString(32);
            }
        } catch (error) {
            console.error('Error:', error);
            appointmentExists = false; 
            return res.render('create', {error: {status: 'error', message: "Server error has occured!"}});
        }
    }

    req.body.apptid = apptid;
    req.body.status = "Queued";

    const currentTime = new Date();
    const formattedTimeQueued = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')} ${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}:${currentTime.getSeconds().toString().padStart(2, '0')}`;
    const formattedQueueDate = `${currentTime.getFullYear()}-${(currentTime.getMonth() + 1).toString().padStart(2, '0')}-${currentTime.getDate().toString().padStart(2, '0')}`;

    req.body.TimeQueued = formattedTimeQueued;
    req.body.QueueDate = formattedQueueDate;

    req.body.StartTime = null;
    req.body.EndTime = null;

    delete req.body.button;
    console.log(req.body);

    // handle blank age
    if (req.body.patientage == ''){
        req.body.patientage = 0;
    }

    try {
        let query = queries[db_selected];
        await query("INSERT INTO appointments SET ?;", req.body, 'WRITE');
        console.log("Appointment created!");
        res.render('create', {error: {status: 'ack', message: "Appointment created!"}});
    } catch (e) {
        console.log(e.message);
        console.error('Transaction failed. Rolling back...', e);
        return res.render('create', {
            error: {status: 'error', message: "Server error has occured!"}
        });
    }
});

// UPDATE
router.get("/update", (req, res) => {
    res.render('update', {
        error: null
    });
})

router.post("/update", async (req, res) => {
    const db_selected = req.app.get('access');
    const apptid = req.body.apptid;
    
    delete req.body.button;
    console.log(req.body);

    // handle blank age
    if (req.body.patientage == ''){
        req.body.patientage = 0;
    }

    try {
        let query = queries[db_selected];
        const existingAppointments = await query("SELECT * FROM appointments WHERE apptid = ?", apptid, 'READ');
        
        if (existingAppointments.length === 0) {
            res.render('update', {error: {status: 'error', message: "Appointment NOT FOUND!"}});
        } else {
            let query = queries[db_selected];
            await query("UPDATE appointments SET ? WHERE apptid = ?;", [req.body, apptid], 'WRITE');
            console.log("Appointment edited!");
            res.render('update', {error: {status: 'ack', message: "Appointment updated!"}});
        }
    } catch (error) {
        console.error('Error:', error);
        return res.render('update', {error: {status: 'error', message: "Server error has occured!"}});
    }
});

// READ
router.get("/read", (req, res) => {
    res.render('read', {results: null, apptid: null, error: null});
});

router.post('/read', async (req, res) => {
    const apptid = req.body.apptid;
    const db_selected = req.app.get('access');
    try {
        let query = queries[db_selected]
        let results = await query("SELECT * FROM appointments WHERE apptid=?;", [apptid], 'READ');
        res.render('read', {results: results[0], apptid: apptid, error: null});
    } catch (e) {
        console.log(e.message);
        return res.render('read', {results: null, apptid: null, error: {status: 'error', message: "Server error has occured!"}});
    }
});

// DELETE
router.get("/delete", (req, res) => {
    res.render('delete',{error: null});
});

router.post('/delete', async (req, res) => {
    const apptid = req.body.apptid;
    const db_selected = req.app.get('access');
    
    try {
        let query = queries[db_selected];
        const existingAppointments = await query("SELECT * FROM appointments WHERE apptid = ?", apptid, 'READ');
        
        if (existingAppointments.length === 0) {
            res.render('delete', {error: {status: 'error', message: "Appointment NOT FOUND!"}});
        } else {
            let query = queries[db_selected];
            await query("DELETE FROM appointments WHERE apptid=?;", [apptid], 'WRITE');
            res.render('delete', {error: {status: 'ack', message: "Appointment deleted!"}});
        }
    } catch (error) {
        console.error('Error:', error);
        appointmentExists = false; 
        return res.render('delete', {error: {status: 'error', message: "Server error has occured!"}});
    }
});

export default router;