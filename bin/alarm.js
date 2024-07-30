import inquirer from "inquirer";
import DatePrompt from "inquirer-date-prompt";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
inquirer.registerPrompt("date", DatePrompt);
export default class Alarm {
    info = [];
    constructor () {
        this.queryDb();
        // this.displayTime();
    }
    
    // display current time
    displayTime () {
        // setInterval(
        // function () {
        //     const now = new Date().toString();    //converting date into string
        //     console.log("current time: ", now.substring(16,24));
        // }
        // ,1000);
        const now = new Date().toString();    //converting date into string
        console.log("current time: ", now.substring(16,24));
    }

    // alarm alert
    alertAlarm () {
        // console.log("alertAlarm");
        let _this = this
        var interval = setInterval(
         async function () {
            for (const inf of _this.info) {  
                if (new Date(inf.timeStmp) <= Date.now()) {
                    console.log("Alet alarm: ", new Date(inf.timeStmp).toString());
                    if (inf.snoozed < 3) {
                        clearInterval(interval);
                        const snoozeAlarm = await inquirer.prompt([
                            {
                              type: "list",
                              name: "snooze",
                              message: "want to snooze?",
                              choices: [
                                { name: "Y", value: "Yes" },
                                { name: "N", value: "No" },
                              ],
                            },
                        ]);
                        if (snoozeAlarm.snooze == "Yes") {
                            const answers = await inquirer.prompt([
                                {
                                    type: "date",
                                    name: "timeStmp",
                                    message: "snooze? set alarm date and time",
                                    validate: (t) => t  > Date.now() || "Time should be greater"
                                }
                            ]);
                        
                            inf.timeStmp = answers.timeStmp;
                            inf.snoozed = inf.snoozed + 1;
                            _this.createDetails();
                        } else {
                            // delete alarm
                            _this.deleteAlarm(inf.id);
                        }
                        _this.alertAlarm();
                    }
                }
            }
        }, 1000); 
    }

    async addAlarm () {
        try {
            const answers = await inquirer.prompt([
                {
                    type: "date",
                    name: "timeStmp",
                    message: "set alarm date and time",
                    validate: (t) => t  > Date.now() || "Time should be greater"
                }
            ]);
        
            const data = {
                id: uuidv4(),
                timeStmp: answers.timeStmp,
                snoozed: 0
            };
            this.info.push(data);
            // console.log("this.info: ", this.info);
        
            if (fs.existsSync("db.json")) {
                this.createDetails();
            } else {
                fs.appendFile("db.json", "[]", (err) => {
                if (err) {
                    console.log("Could not create db.json", err);
                    return;
                }
                    this.createDetails();
                });
            }
        } catch (error) {
            console.log("Something went wrong!", error);
        }
    }

    async deleteAlarm (_id) {
        if (_id == "fromIndex") {
            const answers = await inquirer.prompt([
                {
                    type: "input",
                    name: "_id",
                    message: "id of alarm?"
                }
            ]);
            _id = answers._id;
        }
        let latestData = [];
        this.info.forEach((element) => {
            if (element.id !== _id) {
                latestData.push(element);
            }
        });
        this.info = latestData;
        this.createDetails();
    }

    async createDetails() {
        console.log("info: ", this.info);
        await fs.writeFile("db.json", JSON.stringify(this.info), function (err) {
            if (err) {
            console.log(err);
            }
            console.log("saved!");
        });
    }

    async queryDb () {
        let _this = this;
        let info = [];
        try {
            if (fs.existsSync("db.json")) {
                await fs.readFile("db.json", function (err, data) {
                    // console.log(JSON.parse(data.toString()));
                    _this.info = JSON.parse(data.toString());
                    console.log("\n All data: ", _this.info);
                    if (err) {
                        console.log(err);
                        return;
                    }

                    // if (externalFunction && !err) {
                    //     externalFunction(info);
                    //     return;
                    // }
                });
            }
            //  else {
            //     if (externalFunction) {
            //         externalFunction(info);
            //         return;
            //     }
            // }
            // console.log("info get from db:", info);
            // this.info = info;
        } catch (error) {
            console.error(`Something Happened: ${error.message}`);
        }
    }

}