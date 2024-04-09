import { Router } from "express";
import {query1, query2, query3} from "./lib/dbs.js";
import locations from "./lib/locations.js";
import { config } from "dotenv";

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

// CONFIG
router.get("/config", (req, res) => {
    const config = req.app.get('config');
    const db_selected = req.app.get('access');
    res.render('config', {
        error: null,
        db_selected: db_selected,
        config: config
    });
});

router.post("/config", (req, res) => {
    const db_selected = req.body.db_selected;
    const prev_db_selected = req.app.get('access');
    const new_config = [
        req.body.config0 == 'true' ? true : false,
        req.body.config1 == 'true' ? true : false,
        req.body.config2 == 'true' ? true : false
    ];
    const prev_config = req.app.get('config');
    var changed;
    for (let i = 0; i < new_config.length; i++) {
        if (new_config[i] != prev_config[i]) {
           changed = i;
        }
    }

    req.app.set('config', new_config);
    req.app.set('access', db_selected);

    console.log("New config:", new_config);
    console.log("Node", parseInt(db_selected) + 1, "selected.");

    if (db_selected == prev_db_selected){
        res.render('config', {
            error: {status: 'ack', message: "Node " + (parseInt(changed) + 1) + (new_config[changed] == true ? " ON":" OFF") + "!"},
            db_selected: db_selected,
            config: new_config
        });
    } else  {
        res.render('config', {
            error: {status: 'ack', message: "Node " + (parseInt(db_selected) + 1) + " selected!"},
            db_selected: db_selected,
            config: new_config
        });
    }
});

function getNode(req) {
    if (locations.luzon[req.body.RegionName]) {
        return 1;
    }
    return 2;
}

function handleNode(db_selected, config, req) {
    if (config[db_selected] == false) {
        return getNode(req);
    }
    return 0;
}

// CREATE
router.get("/create", (req, res) => {
    const db_selected = req.app.get('access');
    res.render('create', {
        error: null,
        db_selected: db_selected
    });
});

router.post('/create', async (req, res) => {
    const config = req.app.get('config');
//  const config = [false, true , true];
    const db_selected = req.app.get('access');  // 0 - central; 1 - luzon; 2 - vismin
//  const db_selected = handleNode(req.app.get('access'), config, req);
    console.log (db_selected);
    console.log(getNode(req));
    console.log("----");


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
            return res.render('create', {
                error: {status: 'error', message: "Server error has occured!"},
                db_selected: db_selected
            });
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

    // handle blank age and datetime
    if (req.body.patientage == ''){
        req.body.patientage = null;
    }
    if (req.body.hospitalname == '') {
        req.body.hospitalname = null;
    }

    try {
        let query = queries[db_selected];
        await query("INSERT INTO appointments SET ?;", req.body, 'WRITE');
        console.log("Appointment created!");
        res.render('create', {
            error: {status: 'ack', message: "Appointment created!"},
            db_selected: db_selected
        });
    } catch (e) {
        console.log(e.message);
        console.error('Transaction failed. Rolling back...', e);
        return res.render('create', {
            error: {status: 'error', message: "Server error has occured!"},
            db_selected: db_selected
        });
    }
});

// UPDATE
router.get("/update", (req, res) => {
    const db_selected = req.app.get('access');
    res.render('update', {
        error: null,
        db_selected: db_selected
    });
})

router.post("/update", async (req, res) => {
    const db_selected = req.app.get('access');
    const apptid = req.body.apptid;
    
    delete req.body.button;
    console.log(req.body);

    // handle blank inputs
    if (req.body.patientage == ''){
        req.body.patientage = null;
    }
    if (req.body.StartTime == ''){
        req.body.StartTime = null;
    }
    if (req.body.EndTime == ''){
        req.body.EndTime = null;
    }
    if (req.body.hospitalname == '') {
        req.body.hospitalname = null;
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

// REPORTS
router.get("/reports", async (req, res) => {
    const db_selected = req.app.get('access');
    let appointmentReports = [];
    try {
        let query = queries[db_selected];
        appointmentReports = await query("SELECT RegionName, COUNT(apptid) AS count FROM appointments GROUP BY RegionName ORDER BY COUNT(apptid) DESC;",  '', 'READ');
        
        if (appointmentReports.length === 0) {
            res.render('reports', {error: {status: 'error', message: "No Appointments in the DB!"}});
        }
    } catch (error) {
        console.error('Error:', error);
        return res.render('reports', {error: {status: 'error', message: "Server error has occured!"}});
    }

    res.render('reports', {
        error: null,
        db_selected: db_selected,
        appointmentReports: appointmentReports
    });
});

export default router;