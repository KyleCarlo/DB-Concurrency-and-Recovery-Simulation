import { Router } from "express";
import { recovery } from "./recovery.js";

const router = Router();
const logLimits = 25;

function formatNodename(node_index){
    switch (node_index) {
        case 0:
            return 'Center';
        case 1:
            return 'Luzon';
        case 2:
            return 'Visayas and Mindanao';
    }
}

function formatLog(log) {
    log.timestamp = log.timestamp.toDateString() + " " + log.timestamp.toLocaleTimeString();
    log.source = formatNodename(log.source);
    log.target = formatNodename(log.target);
    return log;
}

// CONFIG
router.get("/", (req, res) => {
    const config = req.app.get('config');
    const db_selected = req.app.get('access');
    res.render('config', {
        error: null,
        db_selected: db_selected,
        config: config
    });
});

router.post("/", (req, res) => {
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

router.get('/logNrecover', (req, res) => {
    let recoveryLogs = req.app.get('recoveryLogs');
    res.render('index', {recoveryLogs: recoveryLogs});
});

router.post('/logNrecover', async (req, res) => {
    let recoveryLogs = req.app.get('recoveryLogs');
    let newLog = await recovery();
    if (newLog != null) {
        formatLog(newLog);
        recoveryLogs.push(newLog);
        if (recoveryLogs.length > logLimits) {
            recoveryLogs.shift();
        }
    }
    res.render('index', {recoveryLogs: recoveryLogs});
});

export default router;