import { Router } from "express";
import {query1, query2, query3} from "./lib/dbs.js";

const router = Router();

router.get("/", (req, res) => {
    res.render('index'); 
});

export default router;