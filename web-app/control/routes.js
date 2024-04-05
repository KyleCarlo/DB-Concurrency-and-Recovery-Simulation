import { Router } from "express";
import mysql from "mysql2";

const router = Router();

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
    res.render('read', {results: null, apptid: null});
});
router.post('/read', (req, res) => {
    const apptid = req.body.apptid;
    let connection = mysql.createConnection({
        host: 'ccscloud.dlsu.edu.ph',
        user: process.env.USER,
        password: process.env.PW,
        database: process.env.DB0,
        port: parseInt(process.env.PORT0)
    });
    connection.connect((err) => {
        if (err) {
            console.error('Error connecting to MySQL database: ' + err.stack);
            return;
        }
        console.log('Connected to MySQL database.');
    });
    connection.query(`SELECT * FROM luzvimin WHERE apptid="${apptid}";`, (err, results) => {
        if (err) {
            console.error('Error executing MySQL query: ' + err.stack);
            return res.status(500).send('Error retrieving data from database');
        } else {
            res.render('read', {results: results[0], apptid: apptid});
        }
    });
    connection.end();
});

// DELETE
router.get("/delete", (req, res) => {
    res.render('delete');
});

export default router;