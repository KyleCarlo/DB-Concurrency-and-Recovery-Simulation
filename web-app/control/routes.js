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


const choices = {
    "city": ["Bacoor City", "Calamba City", "Cebu City", "Dagupan City","Dasmariñas City", "Dumaguete City", "General Santos City","Iligan City", "Iloilo City", "Kananga", "Las Piñas","Legazpi City", "Liloan", "Makati", "Makilala", "Malabon","Malolos City", "Mandaluyong", "Manila", "Manito", "Muntinlupa","Olongapo City", "Pangil", "Parañaque", "Pasig", "Pozzorubio","Quezon City", "San Fernando City", "San Juan", "Santa Cruz","Santa Rosa City", "Siniloan", "Taguig", "Valencia", "Valenzuela"],
    "province": ["Albay", "Bulacan", "Cavite", "Cebu", "Cotabato", "Iloilo","La Union", "Laguna", "Lanao del Norte", "Leyte", "Manila","Negros Oriental", "Pangasinan", "South Cotabato", "Zambales"],
    "region": ["Bicol Region (V)", "CALABARZON (IV-A)", "Central Luzon (III)","Central Visayas (VII)", "Eastern Visayas (VIII)","Ilocos Region (I)", "National Capital Region (NCR)","Northern Mindanao (X)", "SOCCSKSARGEN (Cotabato Region) (XII)","Western Visayas (VI)"],
    "specialty": ["aesthetic, plastic, and reconstructive surgery", "dermatology","family and community medicine", "general medicine","general surgery", "hematology", "infectious diseases","internal medicine","lifestyle, functional, and integrative medicine","naturopathic medicine", "neurology", "obstetrics and gynecology","ophthalmology", "orthopedic surgery", "pediatrics", "pulmonology","veterinary medicine"]
};

router.get("/", (req, res) => {
    res.render('index');
});

router.get("/create", (req, res) => {
    res.render('create', {
        cities: choices.city,
        provinces: choices.province,
        regions: choices.region,
        specialties: choices.specialty
    });
})
router.post('/create', async (req, res) => {
    const db_selected = req.app.get('access');
    let {apptid, type, Virtual, hospitalname, ishospital, City, mainspecialty,
        Province, RegionName, patientage, patientgender
    } = req.body;
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
                type: type,
                Virtual: Virtual,
                hospitalname: hospitalname,
                ishospital: ishospital,

                cities: choices.city,
                provinces: choices.province,
                regions: choices.region,
                specialties: choices.specialty,

                patientage: patientage,
                patientgender: patientgender
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

    // check for valid input?
    // check if the city is in the province?
    // check if the province is in the region?

    try {
        let query = queries[db_selected];
        //await query("SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE;");
        //await query("START TRANSACTION;");
        await query("INSERT INTO appointments SET ?;", req.body, 'WRITE');
        //await query("COMMIT;");
        console.log("Appointment created!");
        res.render('create', {
            cities: choices.city,
            provinces: choices.province,
            regions: choices.region,
            specialties: choices.specialty,
            error: null
        });
    } catch (e) {
        console.log(e.message);
        console.error('Transaction failed. Rolling back...', e);

        // try {
        //     // Rollback the transaction in case of an error
        //     await query('ROLLBACK;');
        // } catch (rollbackError) {
        //     console.error('Rollback failed:', rollbackError);
        // }
        return res.render('create', {
            type: type,
            Virtual: Virtual,
            hospitalname: hospitalname,
            ishospital: ishospital,

            cities: choices.city,
            provinces: choices.province,
            regions: choices.region,
            specialties: choices.specialty,

            patientage: patientage,
            patientgender: patientgender,
            error: {status: 'error', message: "Server error has occured!"}
        });
    }
});

router.get("/update", (req, res) => {
    res.render('update', {
        cities: choices.city,
        provinces: choices.province,
        regions: choices.region,
        specialties: choices.specialty
    });
})

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
        await query("DELETE FROM appointments WHERE apptid=?;", [apptid], 'WRITE');
        res.render('delete', {error: {status: 'ack', message: "Appointment deleted!"}});
    } catch (e) {
        console.log(e.message);
        return res.render('delete', {error: {status: 'error', message: "Server error has occured!"}});
    }
});

export default router;