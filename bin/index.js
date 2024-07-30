import Alarm from "./alarm.js";
import yargs from "yargs";
const fr = new Alarm();

const options = yargs
 .usage("Usage: -n <name>")
 .option("n", { alias: "name", describe: "Function name", type: "string", demandOption: true }) 
 .argv; // name = displayTime, alertAlarm, addAlarm, deleteAlarm

const callFunctions = async function (name) {
 if (name == "deleteAlarm") {
    await fr.deleteAlarm("fromIndex");
 } else {
    await fr[name]();
 }
};
callFunctions(options.name);