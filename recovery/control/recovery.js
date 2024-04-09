import {query1, query2, query3} from "./lib/dbs.js";

const queries = [query1, query2, query3];

async function replicate(source_id, source_node, target_node){
    let source_latest = (await queries[source_node]('SELECT * FROM logs WHERE id = ? AND node = ?;', [source_id, target_node], 'logs', 'READ'))[0];
    let action = source_latest.action;
    
    delete source_latest.id;
    delete source_latest.action_time;
    delete source_latest.action;
    delete source_latest.node;
    switch (action) {
        case 'INSERT':
            await queries[target_node]('INSERT INTO appointments SET ?;', source_latest, 'appointments', 'WRITE');
            break;
        case 'UPDATE':
            console.log(source_latest, source_latest.apptid);
            await queries[target_node]('UPDATE appointments SET ? WHERE apptid = ?;', [source_latest, source_latest.apptid], 'appointments', 'WRITE');
            break;
        case 'DELETE':
            await queries[target_node]('DELETE FROM appointments WHERE apptid = ?;', source_latest.apptid, 'appointments', 'WRITE');
            break;
    }

    return {
        logId: source_id,
        timestamp: new Date(),
        source: source_node,
        target: target_node,
        action: action
    }
}

export const recovery = async (config) => {
    var c1 = (await queries[0]('SELECT MAX(id) as id FROM logs WHERE node = "node_2";', [], 'logs', 'READ'))[0].id, // center - luzon   
        c2 = (await queries[0]('SELECT MAX(id) as id FROM logs WHERE node = "node_3";', [], 'logs', 'READ'))[0].id, // center - vismin
        luz = (await queries[1]("SELECT MAX(id) as id FROM logs", [], 'logs', 'READ'))[0].id,                       // node 2 - luz       
        vismin = (await queries[2]("SELECT MAX(id) as id FROM logs", [], 'logs', 'READ'))[0].id;                    // vismin
    c1 = c1 == null? 0:c1;
    c2 = c2 == null? 0:c2;
    luz = luz == null? 0:luz;
    vismin = vismin == null? 0:vismin;

    // LOGGING
    console.log("C1:", c1, "Luz:", luz, "C2:", c2, "Vismin:", vismin);
    
    if (config[0] && config[1]){
        // CENTER -> LUZON
        if (c1 > luz) {
            return await replicate(luz + 1, 0, 1);
        }
        // LUZON -> CENTER
        if (luz > c1) {
            return await replicate(c1 + 1, 1, 0);
        }
    }
    if (config[0] && config[2]){
        // CENTER -> VISMIN
        if (c2 > vismin) {
            return await replicate(vismin + 1, 0, 2);
        } 
        // VISMIN -> CENTER
        if (vismin > c2) {
            return await replicate(c2 + 1, 2, 0);
        }
    }

    return null;
}