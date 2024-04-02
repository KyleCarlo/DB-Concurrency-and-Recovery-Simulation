//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const choices = {
    "city": ["Bacoor City", "Calamba City", "Cebu City", "Dagupan City","Dasmariñas City", "Dumaguete City", "General Santos City","Iligan City", "Iloilo City", "Kananga", "Las Piñas","Legazpi City", "Liloan", "Makati", "Makilala", "Malabon","Malolos City", "Mandaluyong", "Manila", "Manito", "Muntinlupa","Olongapo City", "Pangil", "Parañaque", "Pasig", "Pozzorubio","Quezon City", "San Fernando City", "San Juan", "Santa Cruz","Santa Rosa City", "Siniloan", "Taguig", "Valencia", "Valenzuela"],
    "province": ["Albay", "Bulacan", "Cavite", "Cebu", "Cotabato", "Iloilo","La Union", "Laguna", "Lanao del Norte", "Leyte", "Manila","Negros Oriental", "Pangasinan", "South Cotabato", "Zambales"],
    "region": ["Bicol Region (V)", "CALABARZON (IV-A)", "Central Luzon (III)","Central Visayas (VII)", "Eastern Visayas (VIII)","Ilocos Region (I)", "National Capital Region (NCR)","Northern Mindanao (X)", "SOCCSKSARGEN (Cotabato Region) (XII)","Western Visayas (VI)"],
    "specialty": ["aesthetic, plastic, and reconstructive surgery", "dermatology","family and community medicine", "general medicine","general surgery", "hematology", "infectious diseases","internal medicine","lifestyle, functional, and integrative medicine","naturopathic medicine", "neurology", "obstetrics and gynecology","ophthalmology", "orthopedic surgery", "pediatrics", "pulmonology","veterinary medicine"]
}

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render('index');
});

app.get("/create", (req, res) => {
    res.render('create', {
        cities: choices.city,
        provinces: choices.province,
        regions: choices.region,
        specialties: choices.specialty
    });
})

app.get("/update", (req, res) => {
    res.render('update', {
        cities: choices.city,
        provinces: choices.province,
        regions: choices.region,
        specialties: choices.specialty
    });
})

app.get("/read", (req, res) => {
    res.render('read');
});

app.get("/delete", (req, res) => {
    res.render('delete');
});



app.listen(3000, () =>{
    console.log("Server listening on port 3000.")
})