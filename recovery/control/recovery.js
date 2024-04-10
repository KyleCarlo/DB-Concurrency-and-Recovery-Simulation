import {query1, query2, query3} from "./lib/dbs.js";

const queries = [query1, query2, query3];

async function replicate(source_id, source_node, target_node){
    var node;
    if (source_node == 0) {
        node = target_node == 1 ? "node_2" : "node_3";
    } else {
        node = source_node == 1 ? "node_2" : "node_3";
    }
    var data_toRep = await queries[source_node]('SELECT * FROM logs WHERE id >= ? AND node = ?;', [source_id, node], 'logs', 'READ');
    var repLogs = [];
    var statements = '';
    var values = [];
    for (let index = 0; index < data_toRep.length; index++) {
        let action = data_toRep[index].action;
        let id = data_toRep[index].id;
        delete data_toRep[index].id;
        delete data_toRep[index].action_time;
        delete data_toRep[index].action;
        delete data_toRep[index].node;

        switch (action) {
            case 'INSERT':
                statements += 'INSERT INTO appointments SET ?;';
                values.push(data_toRep[index]);
                // await queries[target_node]('INSERT INTO appointments SET ?;', source_latest, 'appointments', 'WRITE');
                break;
            case 'UPDATE':
                statements += 'UPDATE appointments SET ? WHERE apptid = ?;';
                values.push(data_toRep[index]);
                values.push(data_toRep[index].apptid);
                // await queries[target_node]('UPDATE appointments SET ? WHERE apptid = ?;', [source_latest, source_latest.apptid], 'appointments', 'WRITE');
                break;
            case 'DELETE':
                statements += 'DELETE FROM appointments WHERE apptid = ?;';
                values.push(data_toRep[index].apptid);
                // await queries[target_node]('DELETE FROM appointments WHERE apptid = ?;', source_latest.apptid, 'appointments', 'WRITE');
                break;
        }

        repLogs.push({
            logId: id, 
            timestamp: null, 
            source: source_node,
            target: target_node,
            action: action
        });
    }

    await queries[target_node](statements, values, 'appointments', 'WRITE');

    return {timestamp: new Date(), logs: repLogs};
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