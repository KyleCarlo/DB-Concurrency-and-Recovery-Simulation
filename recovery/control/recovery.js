import {query1, query2, query3} from "./lib/dbs.js";

const queries = [query1, query2, query3];


async function replicate(source_id, source_node){
    let source_latest = (await queries[source_node]('SELECT * FROM logs WHERE id = ?', [source_id], 'logs', 'READ'))[0];
    let action = source_latest.action;
    let target_node = source_latest.node == 'node_2' ? 1 : 2; 
    // action_time, action, node, apptid, status, TimeQueued, QueueDate, StartTime, EndTime, type, `Virtual`, hospitalname, IsHospital, City, Province, RegionName, mainspecialty, patientage, patientgender
    if (source_node != 0) target_node = 0; 
    // await queries[target_node]('INSERT INTO appointments SET ?', source_latest[0], 'WRITE');
    delete source_latest.id;
    delete source_latest.action_time;
    delete source_latest.action;
    delete source_latest.node;
    await queries[target_node]('INSERT INTO appointments SET ?', source_latest, 'appointments', 'WRITE');
}

export const logging = async () => {        
    setInterval(async () => {
        var c1 = (await queries[0]('SELECT MAX(id) as id FROM logs WHERE node = "node_2";', [], 'logs', 'READ'))[0].id, // center - luzon   
            c2 = (await queries[0]('SELECT MAX(id) as id FROM logs WHERE node = "node_3";', [], 'logs', 'READ'))[0].id, // center - vismin
            luz = (await queries[1]("SELECT MAX(id) as id FROM logs", [], 'logs', 'READ'))[0].id,                       // node 2 - luz       
            vismin = (await queries[2]("SELECT MAX(id) as id FROM logs", [], 'logs', 'READ'))[0].id;                    // vismin
        c1 = c1 == null? 0:c1;
        c2 = c2 == null? 0:c2;
        luz = luz == null? 0:luz;
        vismin = vismin == null? 0:vismin;

        // CENTER -> LUZON
        console.log("C1:", c1, "Luz:", luz, "C2:", c2, "Vismin:", vismin);
        if (c1 > luz) {
            await replicate((luz == null? 0:luz) + 1, 0);
        } 
        // if (c2 > vismin) {
        //     await replicate(c2, 0);
        // } 
        // LUZON -> CENTER
        // else if (luz > c1) {
        //     await replicate(luz, c1, 1);
        // }
        
        // // CENTER -> VISMIN
        // if (c2 > vismin) {
        //     await replicate(c2, vismin, 0);
        // }
        // // VISMIN to CENTER
        // else if (vismin > c2) {
        //     await replicate(vismin, c2, 2);
        // }
    }, 1250);
}