import { Router } from "express";
import {db1, db2, db3, query1, query2, query3} from "./lib/dbs.js";

const router = Router();
const queries = [query1, query2, query3];

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