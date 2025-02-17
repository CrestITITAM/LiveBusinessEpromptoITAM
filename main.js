const { app, BrowserWindow, screen, ipcMain, net, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const electron = require('electron');
// const remote = require('electron').remote;
const url = require('url');
const path = require('path');
const { dialog } = require('electron');
const os = require('os');
const si = require('systeminformation');
// const mysql = require('mysql');
const ip = require('ip');
const { session } = require('electron');
const osu = require('node-os-utils');
const request = require("request");
const cron = require('node-cron');
const fs = require("fs");
const log = require("electron-log");
// const exec = require('child_process').exec;
const AutoLaunch = require('auto-launch');
const nodeDiskInfo = require('node-disk-info');
const mv = require('mv');
const uuid = require('node-machine-id');
const csv = require('csvtojson');
const serialNumber = require('serial-number');
// const shell = require('node-powershell');
const { spawn, exec, execSync } = require('child_process');
// const child_process = require('child_process');
const store = require('electron-store');
const notifier = require('node-notifier'); // temp
const store1 = new store();
const Tray = electron.Tray;
const iconPath = path.join(__dirname, 'images/ePrompto_png.png');
const versionItam = '5.1.3';

const { Client } = require('ssh2');
// const chokidar = require('chokidar');
const sqlite3 = require('sqlite3').verbose();
const getmac = require('getmac');
var format = require('date-fns/format');
const dateFnsSub = require('date-fns/sub');
const FormData = require('form-data');

const safeJSON = require('./lib/safe-json');
const JSON = safeJSON

// const format = require("date-fns/format") // for easy date time formatting

var globalparent_created_by = '';
let winWindow;

//Local Url

// global.root_url = 'http://localhost/business_eprompto/itam_backend_end_user';
// server_url = 'http://localhost/business_eprompto';

// Jayshree polymers url
global.root_url = 'https://jayashreepolymers.eprompto.com/itam_backend_end_user';
server_url = 'https://jayashreepolymers.eprompto.com/';

//Business Url

// global.root_url = 'https://business.eprompto.com/itam_backend_end_user';
// server_url = 'https://business.eprompto.com';

//Developer Url
// global.root_url = 'https://developer.eprompto.com/itam_backend_end_user';
// server_url = 'https://developer.eprompto.com/';

//Dome Link
// global.root_url = 'https://demo.crestit.in/itam_backend_end_user';
// server_url = 'https://demo.crestit.in/';


let reqPath = path.join(app.getPath('userData')); //-- Change path for C:/Program Files/Permission Issue
console.log('reqPath++' + reqPath);

let EXEPath = app.getPath('exe');
console.log('EXEPath++' + EXEPath);
//let reqPath = path.join(app.getAppPath(), '../');  -- Old Request Path On 22/10/2024


const detail = reqPath + "syskey.txt";
//var csvFilename = reqPath + 'utilise.csv';
var time_file = reqPath + 'time_file.txt';

let mainWindow;
let categoryWindow;
let settingWindow;
let display;
let width;
let startWindow;
let tabWindow;
let child;
let ticketIssue;
let policyWindow;

let tray = null;
let count = 0;
var crontime_array = [];
var updateDownloaded = false;

let loginWindow;
let regWindow;
let forgotWindow;
let ticketWindow;
let quickUtilWindow;

let isWindowClosingProgrammatically  = false;


// const INITIAL_TIMER = 1000 * 10 // 20 sec
// const INCREMENT_TIMER_BY = 1000 * 10 //  10 sec
// function* genIncreamentTimeForSetTimout() {
//     let currentValue = INITIAL_TIMER;
//     // let currentValue = 30000;
//     while (true) {
//         yield currentValue += INCREMENT_TIMER_BY
//         // yield currentValue += 60000
//     }
// }

// let getTimeForSetTimout = genIncreamentTimeForSetTimout()

// // function min2ms(min){
// //     return min * 60 * 1000
// // }

const appLauncher = new AutoLaunch({
    name: 'eprompto-ITAM', // The name of your app
    path: app.getPath('exe'), // Path to your app executable
});

app.whenReady().then(() => {
    // Enable auto-launch
    appLauncher.enable();
});

app.on('login', () => {
    // Automatically restart the app after login
    app.relaunch();
    app.quit();
});

app.on('ready', function () {

      // ERROR popup box: overwrite
    dialog.showErrorBox = (title, content) => {
        console.log({title, content})
    };

    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
        app.quit();
    }

    tray = new Tray(iconPath);

    tray.setToolTip('Eprompto') // @AC
    // tray.on("double-click", createMainWindow)

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open app', click: () => {
                console.log("open app")
                createMainWindow()
                // mainWindow.show()
            }
        },
        // {
        //     label: 'Ticketing', click: () => {
        //         console.log("Ticketing")
        //     }
        // },
        {
            label: 'Exit', click: () => {
                console.log("Exit")
                show_exit_popup()
                // app.quit()
            }
        },
    ])
    tray.setContextMenu(contextMenu)


    log.transports.file.level = 'info';
    log.transports.file.maxSize = 5 * 1024 * 1024;
    log.transports.file.file = reqPath + '/log.log';
    log.transports.file.streamConfig = { flags: 'a' };
    log.transports.file.stream = fs.createWriteStream(log.transports.file.file, log.transports.file.streamConfig);
    log.transports.console.level = 'debug';
    const console = {
        log: log.log,
        error: log.error,
        info: log.info,
        warn: log.warn
    }

    // clearCookies()

    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies) => {
            console.log({cookies});
            
            if (cookies.length == 0) {
                if (fs.existsSync(detail)) {
                    fs.readFile(detail, 'utf8', function (err, data) {
                        if (err) {
                            return console.log(err);
                        }

                        var stats = fs.statSync(detail);
                        var fileSizeInBytes = stats["size"];
                        if (fileSizeInBytes > 0) {
                            // const cookie = { url: 'http://www.eprompto.com', name: data, value: '', expirationDate: 99999999999 }
                            // session.defaultSession.cookies.set(cookie, (error) => {
                            //     if (error) console.log(error)
                            // })
                            console.log('On start cookie set', data)
                            setSystemKeyInCookie(data).catch(console.log)
                        }
                    });
                }
            } else {
                if (fs.existsSync(detail)) {
                    var stats = fs.statSync(detail);
                    var fileSizeInBytes = stats["size"];
                    if (fileSizeInBytes == 0) {
                        fs.writeFile(detail, cookies[0].name, function (err) {
                            if (err) return console.log(err);
                        });
                    }
                } else {
                    fs.writeFile(detail, cookies[0].name, function (err) {
                        if (err) return console.log(err);
                    });
                }

            }

            fs.access("C:/ITAMEssential", function (error) {
                if (error) {
                    fs.mkdir("C:/ITAMEssential", function (err) {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log("Created folder C:/ITAMEssential");
                            fs.mkdir("C:/ITAMEssential/EventLogCSV", function (err) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log("Created folder C:/ITAMEssential/EventLogCSV");
                                    checkforbatchfile_FirstTime();
                                }
                            })
                        }
                    })
                } else {
                    console.log("Base Folder Exists");
                }
            });
            //  SetCron(cookies[0].name); // to fetch utilisation

            checkSecuritySelected(cookies[0].name); //to fetch security detail

        }).catch((error) => {
            console.log(error)
        })

    var now_datetime = new Date();
    var options = { hour12: false, timeZone: "Asia/Kolkata" };
    now_datetime = now_datetime.toLocaleString('en-US', options);
    var only_date = now_datetime.split(", ");

    fs.writeFile(time_file, now_datetime, function (err) {
        if (err) return console.log(err);
    });

    setGlobalVariable();


    // session.defaultSession.clearStorageData([], function (data) {
    //     console.log(data);
    // })

});

// app.on('resume', () => {
//   // Restart your application or restore its state
// });

app.commandLine.appendSwitch('ignore-certificate-errors') // COMMENT THIS OUT
app.commandLine.appendSwitch('disable-http2');
autoUpdater.requestHeaders = { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0' };

const { powerMonitor } = require('electron');
const { chrome } = require('process');


// Listen for the 'resume' event, which is emitted when the system wakes up from sleep mode
powerMonitor.on('resume', () => {
    console.log('System has resumed from sleep mode');
    // logEverywhere('System has resumed from sleep mode');
    app.quit();
    app.relaunch();
    // Perform any necessary actions after the system wakes up
});



function checkSecuritySelected(system_key) {
    console.log("Inside checkSecuritySelected");
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            var body = JSON.stringify({ "funcType": 'checkSecuritySelected', "sys_key": system_key });
            const request = net.request({
                method: 'POST',
                url: root_url + '/security.php'
            });
            request.on('response', (response) => {
                console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                    console.log(`${chunk}`);
                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            console.log("Past checkSecuritySelected Json.parse chunk"); // comment
                            if (obj.status == 'valid') {
                                var asset_id = obj.asset_id;
                                var last_update = obj.last_date;
                                console.log("AT ACCESS"); // comment out
                                fs.access("C:/ITAMEssential", function (error) {
                                    if (error) {
                                        console.log("AT MAKE DIR"); // comment out
                                        fs.mkdir("C:/ITAMEssential", function (err) {
                                            if (err) {
                                                console.log(err)
                                            } else {
                                                console.log("AT MAKE EVENTLOGCSV") // comment out
                                                fs.mkdir("C:/ITAMEssential/EventLogCSV", function (err) {
                                                    if (err) {
                                                        console.log(err)
                                                    } else {
                                                        checkforbatchfile(last_update);
                                                    }
                                                })
                                            }
                                        })
                                    } else {
                                        checkforbatchfile(last_update);
                                    }
                                })

                                fetchEventlogData(asset_id, system_key, last_update);
                            }

                        } catch (e) {
                            return console.log('checkSecuritySelected: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                console.log(`ERROR: ${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();
        }
    });
}

function checkforbatchfile(last_update) {
    const path1 = 'C:/ITAMEssential/logadmin.bat';
    const path2 = 'C:/ITAMEssential/execScript.bat';
    const path3 = 'C:/ITAMEssential/copy.ps1';

    if (!fs.existsSync(path1)) {
        fs.writeFile(path1, '@echo off' + '\n' + 'runas /profile /user:itam /savecred "c:\\ITAMEssential\\execScript.bat"', function (err) {
            if (err) throw err;
            console.log('File1 is created successfully.');
        });
    }

    if (!fs.existsSync(path2)) {
        fs.writeFile(path2, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -executionpolicy bypass c:\\ITAMEssential\\copy.ps1', function (err) {
            if (err) throw err;
            console.log('File2 is created successfully.');
        });
    }

    var command = '$aDateTime = [dateTime]"' + last_update + '"' + '\n' + 'Get-EventLog -LogName Security -After ($aDateTime) -Before (Get-Date)  | Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\securitylog.csv'

    fs.writeFile(path3, command, function (err) {
        if (err) throw err;
        console.log('File3 is created successfully.');
    });
}



function checkforbatchfile_FirstTime() {
    const path1 = 'C:/ITAMEssential/logadmin.bat';
    const path2 = 'C:/ITAMEssential/execScript.bat';
    const path3 = 'C:/ITAMEssential/copy.ps1';
    if (!fs.existsSync(path1)) {
        fs.writeFile(path1, '@echo off' + '\n' + 'runas /profile /user:itam /savecred "c:\\ITAMEssential\\execScript.bat"', function (err) {
            if (err) throw err;
            console.log('File1 is created successfully.');
        });
    }
    if (!fs.existsSync(path2)) {
        fs.writeFile(path2, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -executionpolicy bypass c:\\ITAMEssential\\copy.ps1', function (err) {
            if (err) throw err;
            console.log('File2 is created successfully.');
        });
    }
    var command = '$aDateTime = [dateTime](Get-Date).AddDays(-1)' + '\n' + 'Get-EventLog -LogName Security -After ($aDateTime) -Before (Get-Date)  | Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\securitylog.csv'
    fs.writeFile(path3, command, function (err) {
        if (err) throw err;
        console.log('File3 is created successfully.');
    });
}

function fetchEventlogData(assetid, system_key, last_update) {

    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            var body = JSON.stringify({ "funcType": 'getSecurityCrontime', "sys_key": system_key });
            const request = net.request({
                method: 'POST',
                url: root_url + '/security.php'
            });
            request.on('response', (response) => {
                //console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                    //console.log(`${chunk}`);
                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            if (obj.status == 'valid') {
                                security_crontime_array = obj.result;
                                security_crontime_array.forEach(function (slot) {
                                    cron.schedule("0 " + slot[1] + " " + slot[0] + " * * *", function () {
                                        session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                                            .then((cookies) => {
                                                if (cookies.length > 0) {
                                                    exec('C:\\ITAMEssential\\logadmin', function (error, stdout, stderr) {
                                                        console.log('ERROR ln 421:', {error,stderr})
                                                        console.log(stdout);
                                                    })
                                                    events = '10016';
                                                    getEventIds('System', assetid, function (events) {
                                                        var command = '$aDateTime = [dateTime]"' + last_update + '"' + '\n' + 'Get-EventLog -LogName System -InstanceId ' + events + ' -After ($aDateTime) -Before (Get-Date)  | Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\systemlog.csv';
                                                        //var command = 'Get-EventLog -LogName System -InstanceId '+events+' -After ([datetime]::Today)| Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\systemlog.csv';
                                                        exec(command, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                                                            console.log('ERROR ln 429:', {error,stderr})
                                                            console.log(stdout);
                                                        })
                                                    });

                                                    getEventIds('Application', assetid, function (events) {
                                                        var command = '$aDateTime = [dateTime]"' + last_update + '"' + '\n' + 'Get-EventLog -LogName Application -InstanceId ' + events + ' -After ($aDateTime) -Before (Get-Date)  | Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\applog.csv';
                                                        //var command = 'Get-EventLog -LogName Application -InstanceId '+events+' -After ([datetime]::Today)| Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\applog.csv';
                                                        exec(command, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                                                            console.log('ERROR ln 437:', {error, stderr})
                                                            console.log(stdout);
                                                        })
                                                    });
                                                }
                                            }).catch((error) => {
                                                console.log(error)
                                            })
                                    }, {
                                        scheduled: true,
                                        timezone: "Asia/Kolkata"
                                    });


                                    var minute = Number(slot[1]) + Number(4);
                                    if (minute > 59) {
                                        slot[0] = Number(slot[0]) + Number(1);
                                        minute = Number(minute) - Number(60);
                                    }
                                    cron.schedule("0 " + minute + " " + slot[0] + " * * *", function () {
                                        session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                                            .then((cookies) => {
                                                if (cookies.length > 0) {
                                                    //read from csv
                                                    try {
                                                        if (fs.existsSync('C:/ITAMEssential/EventLogCSV/securitylog.csv')) {
                                                            readSecurityCSVFile('C:\\ITAMEssential\\EventLogCSV\\securitylog.csv', system_key);
                                                        }
                                                    } catch (err) {
                                                        console.log(err)
                                                    }

                                                    try {
                                                        if (fs.existsSync('C:/ITAMEssential/EventLogCSV/systemlog.csv')) {
                                                            readCSVFile('C:\\ITAMEssential\\EventLogCSV\\systemlog.csv', system_key);
                                                        }
                                                    } catch (err) {
                                                        console.log(err)
                                                    }

                                                    try {
                                                        if (fs.existsSync('C:/ITAMEssential/EventLogCSV/applog.csv')) {
                                                            readCSVFile('C:\\ITAMEssential\\EventLogCSV\\applog.csv', system_key);
                                                        }
                                                    } catch (err) {
                                                        console.log(err)
                                                    }
                                                }
                                            }).catch((error) => {
                                                console.log(error)
                                            })
                                    }, {
                                        scheduled: true,
                                        timezone: "Asia/Kolkata"
                                    });
                                });
                            }

                        } catch (e) {
                            return console.log('getSecurityCrontime: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                console.log(`ERROR: ${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();
        }
    });
}

function readSecurityCSVFile(filepath, system_key) {
    // logEverywhere('In readSecurityCSVFile');
    //var main_arr=[];
    var final_arr = [];
    var new_Arr = [];
    var ultimate = [];
    const converter = csv()
        .fromFile(filepath)
        .then((json) => {
            if (json != []) {
                for (j = 1; j < json.length; j++) {
                    // if(json[j]['field12'] == 'Security' ){  
                    if (final_arr.indexOf(json[j]['field11']) == -1 && final_arr.indexOf(json[j]['field12']) == -1) { //to avoid duplicate entry into the array
                        final_arr.push(json[j]['field11'], json[j]['field12']);
                        new_Arr = [json[j]['field11'], json[j]['field12']];
                        ultimate.push(new_Arr);
                    }
                    //}
                }

                require('dns').resolve('www.google.com', function (err) {
                    if (err) {
                        console.log("No connection");
                    } else {
                        var body = JSON.stringify({ "funcType": 'addsecuritywinevent', "sys_key": system_key, "events": ultimate });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/security.php'
                        });
                        request.on('response', (response) => {
                            //console.log(`STATUS: ${response.statusCode}`)
                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
            }
        })
}

function readCSVFile(filepath, system_key) {
    //logEverywhere('In readcsvfile');
    var final_arr = [];
    var new_Arr = [];
    var ultimate = [];
    const converter = csv()
        .fromFile(filepath)
        .then((json) => {
            if (json != []) {
                for (j = 1; j < json.length; j++) {
                    if (final_arr.indexOf(json[j]['field11']) == -1) { //to avoid duplicate entry into the array
                        final_arr.push(json[j]['field11']);
                        new_Arr = [json[j]['field11'], json[j]['field12']];
                        ultimate.push(new_Arr);
                    }
                }
                require('dns').resolve('www.google.com', function (err) {
                    if (err) {
                        console.log("No connection");
                    } else {
                        var body = JSON.stringify({ "funcType": 'addwinevent', "sys_key": system_key, "events": ultimate });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/security.php'
                        });
                        request.on('response', (response) => {
                            //console.log(`STATUS: ${response.statusCode}`)
                            response.on('data', (chunk) => {
                                //console.log(`${chunk}`);
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
            }
        })
}

var getEventIds = function (logname, asset_id, callback) {
    // logEverywhere('In geteventIds');
    var events = '';
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            var body = JSON.stringify({ "funcType": 'getEventId', "lognametype": logname, "asset_id": asset_id });
            const request = net.request({
                method: 'POST',
                url: root_url + '/security.php'
            });
            request.on('response', (response) => {
                //console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                    //console.log(`${chunk}`);
                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            if (obj.status == 'valid') {
                                if (obj.result.length > 0) {
                                    for (var i = 0; i < obj.result.length - 1; i++) {
                                        events = events + obj.result[i] + ',';
                                    }
                                    events = events + obj.result[obj.result.length - 1];
                                }
                                callback(events);
                            }

                        } catch (e) {
                            return console.log('getEventId: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                console.log(`ERROR: ${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();
        }
    });
}

function SetCron(sysKey) {
    var body = JSON.stringify({ "funcType": 'crontime', "syskey": sysKey });
    const request = net.request({
        method: 'POST',
        url: root_url + '/main.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log("ITAM CRON TIME IS" + `${chunk}`);
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'valid') {
                        crontime_array = obj.result;

                        crontime_array.forEach(function (slot) {
                            //  logEverywhere('In Cron Foreach');







                            cron.schedule("0 " + slot[0] + " " + slot[1] + " * * *", function () {
                                console.log('In Cron Foreach+++++++++++');
                                session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                                    .then((cookies) => {
                                        //   logEverywhere('In Cron Cookies Session Code');
                                        if (cookies.length > 0) {
                                            slot_time = slot[1] + ':' + slot[0];
                                            //  logEverywhere('In Cron Cookies');
                                            console.log('++++++++Before updateAssetUtilisation');
                                            updateAssetUtilisation(slot_time);
                                        }
                                    }).catch((error) => {
                                        console.log(error)
                                    })
                            }, {
                                scheduled: true,
                                timezone: "Asia/Kolkata"
                            });
                        });
                    }

                } catch (e) {
                    return console.log('crontime: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        console.log(`ERROR: ${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();
}


// ------------------------------ User Behavior Starts here : ------------------------------------------------------------


// ipcMain.on('check_user_behavior_request',function(e) { 
//   logEverywhere('In User Behavior');
//   require('dns').resolve('www.google.com', function(err) {
//    console.log('Inside User Behavior');
//    logEverywhere('Inside User Behavior');
//     if (err) {
//        console.log("No connection");
//     } else {
//       session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
//       .then((cookies) => {
//       if(cookies.length > 0){
//         console.log("Inside User Behavior Cookies");
//         console.log(cookies[0].name);
//         var body = JSON.stringify({ "syskey": cookies[0].name, "funcType": 'crontime'}); 
//         const request = net.request({ 
//             method: 'POST', 
//             url: root_url+'/main.php' 
//         }); 
//         request.on('response', (response) => {
//             //console.log(`STATUS: ${response.statusCode}`)
//             response.on('data', (chunk) => {
//              console.log("ITAM CRON TIME IS"+`${chunk}`);
//               if (chunk) {
//                 let a;
//                 try {
//                   var obj = JSON.parse(chunk);
//                   if(obj.status == 'valid'){
//                     crontime_array = obj.result;
//                     crontime_array.forEach(function(slot){ 
//                       logEverywhere('In Cron Foreach');
//                       cron.schedule("0 "+slot[0]+" "+slot[1]+" * * *", function() { 

//                             slot_time = slot[1]+':'+slot[0];
//                             logEverywhere('In Cron Cookies');
//                             updateAssetUtilisation(slot_time);

//                        }, {
//                          scheduled: true,
//                          timezone: "Asia/Kolkata" 
//                     });
//                     });
//                   }

//                 } catch (e) {
//                     return console.log('crontime: No proper response received'); // error in the above string (in this case, yes)!
//                 }
//                } 
//             })
//             response.on('end', () => {})
//         })
//         request.on('error', (error) => { 
//             console.log(`ERROR: ${(error)}`) 
//         })
//         request.setHeader('Content-Type', 'application/json'); 
//         request.write(body, 'utf-8'); 
//         request.end();
//     }
//   });
// };
// });});



// ---------------------------------User Behavior Ends here : ---------------------------------------------------------------- 

function setGlobalVariable() {
    console.log('In setGlobalVariable');
    // tray.destroy();
    // tray = new Tray(iconPath);
    // tray.setToolTip('Eprompto')

    // const contextMenu = Menu.buildFromTemplate([
    //     {
    //         label: 'Open app', click: () => {
    //             console.log("open app")
    //             createMainWindow()
    //             // mainWindow.show()
    //         }
    //     },
    //     // {
    //     //     label: 'Ticketing', click: () => {
    //     //         console.log("Ticketing")
    //     //     }
    //     // },
    //     {
    //         label: 'Exit', click: () => {
    //             console.log("Exit")
    //             show_exit_popup()
    //             // app.quit()
    //         }
    //     },
    // ])
    // // tray.on("double-click", createMainWindow)
    // tray.setContextMenu(contextMenu)

    display = electron.screen.getPrimaryDisplay();
    width = display.bounds.width;
    height = display.bounds.height;

    si.system(function (data) {
        sys_OEM = data.manufacturer;
        sys_model = data.model;
        global.Sys_name = sys_OEM + ' ' + sys_model;
    });

    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies) => {
            if (cookies.length > 0) {
                require('dns').resolve('www.google.com', function (err) {
                    if (err) {
                        console.log("No connection");
                        global.NetworkStatus = 'No';
                    } else {
                        console.log("CONNECTED");
                        global.NetworkStatus = 'Yes';
                        console.log('Before openFunc');
                        var body = JSON.stringify({ "funcType": 'openFunc', "sys_key": cookies[0].name });
                        console.log('Before openFunc body',body);
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/main.php'
                        });
                        request.on('response', (response) => {
                            //console.log(`STATUS: ${response.statusCode}`)
                            response.on('data', (chunk) => {
                                //console.log(`${chunk}`); 

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        if (obj.status == 'valid') {
                                            asset_id = obj.result[0];
                                            client_id = obj.result[1];
                                            global.clientID = client_id;
                                            global.NetworkStatus = 'Yes';
                                            global.downloadURL = __dirname;
                                            global.assetID = asset_id;
                                            console.log('+++++++++++++global.assetID' + global.assetID);
                                            global.deviceID = obj.result[2];
                                            global.userName = obj.loginPass[0];
                                            global.loginid = obj.loginPass[1];
                                            global.sysKey = cookies[0].name;

                                            //updateAsset(asset_id);
                                            itamLastLogin();

                                            setTimeout(() => {
                                                hardwareDetails();
                                                // }, 60000);
                                            }, 60000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                domainName();
                                            }, 120000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                softwareDetails();
                                            }, 120000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                graphicCardDetails();
                                            }, 180000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                motherboardDetails();
                                            }, 240000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                monitorDetails();
                                            }, 300000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                monitorInches();
                                            }, 360000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                RAMSerialNumber();
                                            }, 420000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                HDDSerialNumber();
                                            }, 120000);
                                            // },getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                ProcessorSerialNumber();
                                            }, 540000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                keyboardDetails();
                                            }, 660000);
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                mouseDetails();
                                            }, 720000)
                                            // }, getTimeForSetTimout.next().value);
                                            setTimeout(() => {
                                                checkUserProductivityPermission();
                                            }, 120000);
                                            setTimeout(() => {
                                                check_acceptance_policy();
                                            }, 120000); // 1min


                                            /// New code


                                            setTimeout(() => {
                                                getUserProductivity();
                                            }, 900000); // 15min

                                            setTimeout(() => {
                                                check_scrap_asset_request();
                                            }, 960000); // 16min

                                            setTimeout(() => {
                                                check_location_track_request();
                                            }, 120000); // 17min



                                            setTimeout(() => {
                                                const input_values = {};
                                                Preventive_Maintenance_Main(input_values, 'One Time');
                                            }, 120000); // 2min

                                            setTimeout(() => {
                                                const input_values = {};
                                                Preventive_Maintenance_Main(input_values, 'Scheduled');
                                            }, 180000); // 18min

                                            setTimeout(() => {
                                                const input_values = {};
                                                Patch_Management_Main(input_values, 'One Time');
                                            }, 120000); // 2min

                                            setTimeout(() => {
                                                const input_values = {};
                                                Patch_Management_Specific(input_values, 'One Time');
                                            }, 180000); // 3min

                                            setTimeout(() => {
                                                const input_values = {};
                                                Network_Monitor_Main(input_values, 'One Time');
                                            }, 120000); // 2min


                                        }

                                    } catch (e) {
                                        return console.log('openFunc: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            log.info('Error while fetching global data ' + error);
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });


                // Old ITAM UI dimensions:
                // mainWindow = new BrowserWindow({
                //   width: 392,
                //   height: 520,
                //   icon: __dirname + '/images/ePrompto_png.png',
                //   titleBarStyle: 'hiddenInset',
                //   frame: false,
                //   x: width - 450,
                //   y: 190,
                //   webPreferences: {
                //           nodeIntegration: true,
                //           enableRemoteModule: true,
                //       }
                // });

                //New ITAM UI dimensions:
                mainWindow = new BrowserWindow({
                    width: 280,
                    height: 300,
                    icon: __dirname + '/images/ePrompto_png.png',
                    titleBarStyle: 'hiddenInset',
                    frame: false,
                    resizable: false,
                    transparent: true,
                    x: width - (280 + 15),
                    // y: 420,
                    y: height - (300 + 40),
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                    }
                });

                mainWindow.hide()   //  @AC
                mainWindow.setSkipTaskbar(true)

                mainWindow.setMenuBarVisibility(false);

                mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'index.html'),
                    protocol: 'file:',
                    slashes: true
                }));

                mainWindow.once('ready-to-show', () => {
                    autoUpdater.checkForUpdates();
                    // autoUpdater.checkForUpdatesAndNotify();
                    // autoUpdater.onUpdateAvailable();
                });

                const gotTheLock = app.requestSingleInstanceLock();
                if (!gotTheLock) {
                    app.quit();
                }

                // tray.on('click', function (e) {
                //     if (mainWindow.isVisible()) {
                //         mainWindow.hide();
                //     } else {
                //         mainWindow.show();
                //     }
                // });


                mainWindow.on('close', function (e) {
                    // if (process.platform !== "darwin") {
                    //     app.quit();
                    // }
                    // // if (electron.app.isQuitting) {
                    // //  return
                    // // }
                    // e.preventDefault();
                    // mainWindow.hide();
                    // // if (child.isVisible()) {
                    // //     child.hide()
                    // //   } 
                    // //mainWindow = null;
                });

                //mainWindow.on('closed', () => app.quit());
            }
            else {
                startWindow = new BrowserWindow({
                    icon: __dirname + '/images/ePrompto_png.png',
                    titleBarStyle: 'hiddenInset',
                    // frame: false,
                    resizable: false,
                    transparent: true,
                    width: 330,
                    height: 520,
                    x: width - (330 + 15),
                    y: height - (520 + 40),
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                    }
                });

                startWindow.setMenuBarVisibility(false);

                startWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'are_you_member.html'),
                    protocol: 'file:',
                    slashes: true
                }));

                // startWindow.webContents.openDevTools({ mode: 'detach' })

                // startWindow.on("close", ()=>{
                //     if(!isWindowClosingProgrammatically){
                //         clearCookies();
                //         isWindowClosingProgrammatically = false;
                //     }
                // })
            }
        }).catch((error) => {
            console.log(error)
        })
}


function updateAssetUtilisation(slot) {
    // logEverywhere("In Updt asset utili.---------------------------");
    console.log('In Update');
    const cpu = osu.cpu;
    var active_user_name = "";
    var ctr = 0;
    var app_list = [];
    const data = [];
    var app_name_list = "";
    var time_off = "";
    var avg_ctr;
    var avg_cpu = 0;
    var avg_hdd = 0;
    var avg_ram = 0;
    //  logEverywhere('In Update Code'); 
    var todays_date = new Date();
    todays_date = todays_date.toISOString().slice(0, 10);
    console.log(todays_date);
    if (fs.existsSync(time_file)) {
        console.log(time_file);
        //  logEverywhere('In Update Code time file'); 
        var stats = fs.statSync(time_file);
        var fileSizeInBytes = stats["size"];
        if (fileSizeInBytes > 0) {
            fs.readFile(time_file, 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                time_off = data;
            });
        }
    }

    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies1) => {

            const disks = nodeDiskInfo.getDiskInfoSync();
            total_ram = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1); // total RAM
            free_ram = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1); // free RAM
            //tot_mem = (os.totalmem()/(1024*1024*1024)).toFixed(1);
            //utilised_RAM = tot_mem - free_mem; // in GB
            today = Math.floor(Date.now() / 1000);
            utilised_RAM = (((total_ram - free_ram) / total_ram) * 100).toFixed(1); // % RAM used

            //used_mem = ((os.totalmem() - os.freemem())/(1024*1024*1024)).toFixed(1);
            hdd_total = hdd_used = 0;
            hdd_name = '';
            for (const disk of disks) {
                if (disk.filesystem == 'Local Fixed Disk') {
                    hdd_total = hdd_total + disk.blocks;
                    hdd_used = hdd_used + disk.used;
                    //free_drive = ((disk.available - disk.used)/(1024*1024*1024)).toFixed(2);
                    used_drive = (disk.used / (1024 * 1024 * 1024)).toFixed(2); // disk used in GB
                    hdd_name = hdd_name.concat(disk.mounted + ' ' + used_drive + ' / ');
                }

            }

            hdd_total = hdd_total / (1024 * 1024 * 1024);
            hdd_used = hdd_used / (1024 * 1024 * 1024);
            //  logEverywhere('Before Browser History'); 
            Get_Browser_History_Powershell_Script('Get_Browser_History', cookies1[0].name);

            cpu.usage()
                .then(info => {
                    // info is nothing but CPU utilisation in %
                    if (info == 0) {
                        info = 1;
                    }
                    getAppUsedList(function (app_data) {
                        app_name_list = app_data;
                        setTimeout(function () {
                            CallUpdateAssetApi(cookies1[0].name, todays_date, slot, info, utilised_RAM, hdd_used, ctr, active_user_name, app_name_list, utilised_RAM, info, hdd_used, total_ram, hdd_total, hdd_name, time_off);
                        }, 15000); // 15secs
                    });
                })
        }).catch((error) => {
            console.log(error)
        })
}

function CallUpdateAssetApi(sys_key, todays_date, slot, cpu_used, ram_used, hdd_used, active_usr_cnt, active_usr_nm, app_name_list, csv_ram_util, info, hdd_used, total_mem, hdd_total, hdd_name, time_off) {

    var filepath1 = 'C:\\ITAMEssential\\EventLogCSV\\BrowserData.csv';
    newFilePath = filepath1;
    // logEverywhere('In CallUpdateAssetApi');
    if (fs.existsSync(newFilePath)) {
        var final_arr = [];
        var new_Arr = [];
        var ultimate = [];
        const converter = csv({ noheader: true, output: "line" })
            .fromFile(newFilePath)
            .then((json) => {

                if (json != []) {
                    console.log(json);

                    var body = JSON.stringify({
                        "funcType": 'addassetUtilisation', "sys_key": sys_key, "browser_data": json, "cpu_util": cpu_used, "slot": slot, "ram_util": ram_used,
                        "total_mem": total_mem, "hdd_total": hdd_total, "hdd_used": hdd_used, "hdd_name": hdd_name, "app_used": app_name_list, "timeoff": time_off
                    });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/asset.php'
                    });
                    request.on('response', (response) => {
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            console.log(`${chunk}`);

                            if (chunk) {
                                let a;
                                try {
                                    var obj = JSON.parse(chunk);
                                    if (obj.status == 'invalid') {
                                        log.info('Error while updating asset detail 1');
                                    } else {
                                        log.info('Updated asset detail successfully 1');
                                    }

                                } catch (e) {
                                    return console.log('addassetUtilisation: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }
                        })
                        response.on('end', () => {
                            // if (newFilePath != "" ){ // if filepath has been passed and uploading done
                            //   fs.unlinkSync(newFilePath); // This deletes the created csv
                            //   console.log("BrowserData File Unlinked");
                            // }
                        })
                    })
                    request.on('error', (error) => {
                        console.log(`ERROR: ${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();
                }
            })
    } else {
        var body = JSON.stringify({
            "funcType": 'addassetUtilisation', "sys_key": sys_key, "cpu_util": cpu_used, "slot": slot, "ram_util": ram_used,
            "total_mem": total_mem, "hdd_total": hdd_total, "hdd_used": hdd_used, "hdd_name": hdd_name, "app_used": app_name_list, "timeoff": time_off
        });
        const request = net.request({
            method: 'POST',
            url: root_url + '/asset.php'
        });
        request.on('response', (response) => {
            //console.log(`STATUS: ${response.statusCode}`)
            response.on('data', (chunk) => {
                //console.log(`${chunk}`);
                if (chunk) {
                    let a;
                    try {
                        var obj = JSON.parse(chunk);
                        if (obj.status == 'invalid') {
                            log.info('Error while updating asset detail 2');
                        } else {
                            log.info('Updated asset detail successfully 2');
                        }
                    } catch (e) {
                        return console.log('addassetUtilisation: No proper response received'); // error in the above string (in this case, yes)!
                    }
                }
            })
            response.on('end', () => { })
        })
        request.on('error', (error) => {
            console.log(`ERROR: ${(error)}`)
        })
        request.setHeader('Content-Type', 'application/json');
        request.write(body, 'utf-8');
        request.end();
    }
}

var getAppUsedList = function (callback) {
    //  logEverywhere("In getAppusedlist");
    var app_name_list = "";
    var app_list = [];

    exec('tasklist /nh', function (error, stdout, stderr) {
        if(error){
            console.log('ERROR ln 1274:', {error, stderr})
            return;
        }

        res = stdout.split('\n');
        res.forEach(function (line) {
            line = line.trim();
            var newStr = line.replace(/  +/g, ' ');
            var parts = newStr.split(' ');
            if (app_list.indexOf(parts[0]) == -1) { //to avoid duplicate entry into the array
                app_list.push(parts[0]);
            }
        });
        var j;
        for (j = 0; j < app_list.length; j++) {
            //if(app_list[j] == 'EXCEL.EXE' || app_list[j] == 'wordpad.exe' || app_list[j] == 'WINWORD.EXE' || app_list[j] == 'tally.exe' ){
            app_name_list += app_list[j] + " / ";
            //}
        }
        callback(app_name_list);
        //console.log(output);
    });
};

function readCSVUtilisation() {
    //var inputPath = reqPath + '/utilise.csv';

    var current_date = new Date();
    var month = current_date.getMonth() + 1;
    var day = current_date.getDate();
    var year = current_date.getFullYear();
    current_date = day + '-0' + month + '-' + year; //change the format as per excel to compare thee two dates

    first_active_usr_cnt = sec_active_usr_cnt = third_active_usr_cnt = frth_active_usr_cnt = '';
    first_active_usrname = sec_active_usrname = third_active_usrname = frth_active_usrname = '';
    first_app_used = sec_app_used = third_app_used = frth_app_used = '';

    first_avg_ctr = first_avg_cpu = first_avg_ram = first_avg_hdd = 0;
    sec_avg_ctr = sec_avg_cpu = sec_avg_ram = sec_avg_hdd = 0;
    third_avg_ctr = third_avg_cpu = third_avg_ram = third_avg_hdd = 0;
    frth_avg_ctr = frth_avg_cpu = frth_avg_ram = frth_avg_hdd = 0;

    var csv_array = [];

    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies) => {
            require_path = reqPath + 'utilise.csv';

            if (fs.existsSync(require_path)) {
                const converter = csv()
                    .fromFile(reqPath + '/utilise.csv')
                    .then((json) => {
                        if (json != []) {

                            for (j = 0; j < json.length; j++) {
                                if (json[j]['date'] == current_date) {
                                    if (json[j]['time_slot'] == 'first') {
                                        first_avg_ctr = Number(first_avg_ctr) + 1;
                                        first_avg_cpu = first_avg_cpu + Number(json[j]['cpu']);
                                        first_avg_ram = first_avg_ram + Number(json[j]['ram']);
                                        first_avg_hdd = first_avg_hdd + Number(json[j]['hdd']);
                                        first_active_usr_cnt = json[j]['active_user'];
                                        first_active_usrname = json[j]['active_user_name'];
                                        first_app_used = json[j]['app_used'];

                                    } else if (json[j]['time_slot'] == 'second') {
                                        sec_avg_ctr = Number(sec_avg_ctr) + 1;
                                        sec_avg_cpu = sec_avg_cpu + Number(json[j]['cpu']);
                                        sec_avg_ram = sec_avg_ram + Number(json[j]['ram']);
                                        sec_avg_hdd = sec_avg_hdd + Number(json[j]['hdd']);
                                        sec_active_usr_cnt = json[j]['active_user'];
                                        sec_active_usrname = json[j]['active_user_name'];
                                        sec_app_used = json[j]['app_used'];
                                    } else if (json[j]['time_slot'] == 'third') {
                                        third_avg_ctr = Number(third_avg_ctr) + 1;
                                        third_avg_cpu = third_avg_cpu + Number(json[j]['cpu']);
                                        third_avg_ram = third_avg_ram + Number(json[j]['ram']);
                                        third_avg_hdd = third_avg_hdd + Number(json[j]['hdd']);
                                        third_active_usr_cnt = json[j]['active_user'];
                                        third_active_usrname = json[j]['active_user_name'];
                                        third_app_used = json[j]['app_used'];
                                    } else if (json[j]['time_slot'] == 'fourth') {
                                        frth_avg_ctr = Number(frth_avg_ctr) + 1;
                                        frth_avg_cpu = frth_avg_cpu + Number(json[j]['cpu']);
                                        frth_avg_ram = frth_avg_ram + Number(json[j]['ram']);
                                        frth_avg_hdd = frth_avg_hdd + Number(json[j]['hdd']);
                                        frth_active_usr_cnt = json[j]['active_user'];
                                        frth_active_usrname = json[j]['active_user_name'];
                                        frth_app_used = json[j]['app_used'];
                                    }

                                    csv_array['date'] = json[j]['date'];
                                }

                            }

                            if (first_avg_ctr != 0) {

                                first_avg_cpu = first_avg_cpu / first_avg_ctr;
                                first_avg_ram = first_avg_ram / first_avg_ctr;
                                first_avg_hdd = first_avg_hdd / first_avg_ctr;

                                csv_array['first'] = {
                                    time_slot: 'first',
                                    cpu: first_avg_cpu,
                                    ram: first_avg_ram,
                                    hdd: first_avg_hdd,
                                    active_user: first_active_usr_cnt,
                                    active_user_name: first_active_usrname,
                                    app_used: first_app_used
                                }
                            }


                            if (sec_avg_ctr != 0) {

                                sec_avg_cpu = sec_avg_cpu / sec_avg_ctr;
                                sec_avg_ram = sec_avg_ram / sec_avg_ctr;
                                sec_avg_hdd = sec_avg_hdd / sec_avg_ctr;

                                csv_array['second'] = {
                                    time_slot: 'second',
                                    cpu: sec_avg_cpu,
                                    ram: sec_avg_ram,
                                    hdd: sec_avg_hdd,
                                    active_user: sec_active_usr_cnt,
                                    active_user_name: sec_active_usrname,
                                    app_used: sec_app_used
                                }
                            }

                            if (third_avg_ctr != 0) {

                                third_avg_cpu = third_avg_cpu / third_avg_ctr;
                                third_avg_ram = third_avg_ram / third_avg_ctr;
                                third_avg_hdd = third_avg_hdd / third_avg_ctr;

                                csv_array['third'] = {
                                    time_slot: 'third',
                                    cpu: third_avg_cpu,
                                    ram: third_avg_ram,
                                    hdd: third_avg_hdd,
                                    active_user: third_active_usr_cnt,
                                    active_user_name: third_active_usrname,
                                    app_used: third_app_used
                                }
                            }

                            if (frth_avg_ctr != 0) {

                                frth_avg_cpu = frth_avg_cpu / frth_avg_ctr;
                                frth_avg_ram = frth_avg_ram / frth_avg_ctr;
                                frth_avg_hdd = frth_avg_hdd / frth_avg_ctr;

                                csv_array['fourth'] = {
                                    time_slot: 'fourth',
                                    cpu: frth_avg_cpu,
                                    ram: frth_avg_ram,
                                    hdd: frth_avg_hdd,
                                    active_user: frth_active_usr_cnt,
                                    active_user_name: frth_active_usrname,
                                    app_used: frth_app_used
                                }
                            }

                            const disks = nodeDiskInfo.getDiskInfoSync();
                            //total_mem = (os.totalmem()/(1024*1024*1024)).toFixed(1);
                            hdd_total = hdd_used = 0;
                            hdd_name = '';
                            for (const disk of disks) {
                                hdd_total = hdd_total + disk.blocks;
                                used_drive = (disk.used / (1024 * 1024 * 1024)).toFixed(2);
                                hdd_name = hdd_name.concat(disk.mounted + ' ' + used_drive);
                            }

                            hdd_total = hdd_total / (1024 * 1024 * 1024);

                            var body = JSON.stringify({ "funcType": 'fetchfromCSV', "sys_key": cookies[0].name, "data": csv_array, "total_mem": total_mem, "hdd_total": hdd_total, "hdd_name": hdd_name });
                            const request = net.request({
                                method: 'POST',
                                url: root_url + '/utilisation.php'
                            });
                            request.on('response', (response) => {
                                //console.log(`STATUS: ${response.statusCode}`)
                                response.on('data', (chunk) => {
                                    //console.log(`${chunk}`);
                                    if (chunk) {
                                        let a;
                                        try {
                                            var obj = JSON.parse(chunk);
                                            if (obj.status == 'valid') {
                                                log.info('Successfully inserted data to database');
                                            }

                                        } catch (e) {
                                            return console.log('fetchfromCSV: No proper response received'); // error in the above string (in this case, yes)!
                                        }
                                    }
                                })
                                response.on('end', () => { })
                            })
                            request.on('error', (error) => {
                                log.info('Error while fetchfromCSV ' + `${(error)}`)
                            })
                            request.setHeader('Content-Type', 'application/json');
                            request.write(body, 'utf-8');
                            request.end();

                        }

                    })
            }

        }).catch((error) => {
            log.info('Session error occured in readCSVUtilisation function ' + error);
        })
}

function MoveFile() {
    require_path = reqPath + '/utilise.csv';

    if (fs.existsSync(require_path)) {
        const converter = csv()
            .fromFile(reqPath + '/utilise.csv')
            .then((json) => {
                if (json != []) {
                    var datetime = new Date();
                    datetime = datetime.toISOString().slice(0, 10);

                    var oldPath = reqPath + '/utilise.csv';
                    require_path = reqPath + '/utilisation';

                    if (!fs.existsSync(require_path)) {
                        fs.mkdirSync(require_path);
                    }

                    var newPath = require_path + '/utilise_' + datetime + '.csv';

                    mv(oldPath, newPath, err => {
                        if (err) log.info('Error while moving csv file to utilisation folder ' + error);
                        log.info('Succesfully moved to Utilisation tab');
                    });

                }
            })
    }

}

function addAssetUtilisation(asset_id, client_id) {

    const cpu = osu.cpu;

    cpu.usage()
        .then(info => {
            free_mem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
            tot_mem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1)
            utilised_RAM = tot_mem - free_mem; // in GB
            today = Math.floor(Date.now() / 1000);

            var body = JSON.stringify({
                "funcType": 'assetUtilisation', "clientID": client_id,
                "assetID": asset_id, "cpu_util": info, "ram_util": utilised_RAM
            });
            const request = net.request({
                method: 'POST',
                url: root_url + '/asset.php'
            });
            request.on('response', (response) => {
                //console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                log.info('Error while adding asset ' + `${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();

        })
}

// function updateAsset(asset_id){
//   console.log("In updateAsset");
//   global.assetID = asset_id;
//   system_ip = ip.address();

//   if(asset_id != null){
//     si.osInfo(function(data) {
//       os_release = data.kernel;
//         os_bit_type = data.arch;
//         os_serial = data.serial;
//         os_version = data.release;
//         os_name = data.distro;
//         os_OEM = data.codename;

//         os_data = os_name+' '+os_OEM+' '+os_bit_type+' '+os_version;

//         exec('wmic path SoftwareLicensingService get OA3xOriginalProductKey', function(err, stdout, stderr) {
//           if (stderr || err ) {
//             // console.error(`exec error: ${stderr}`);
//             // return;
//             // console.log("INSIDE ERROR WMIC STATEMENT");

//             var product_key='';

//             var body = JSON.stringify({ "funcType": 'osInfo', "asset_id": asset_id, "version" : os_data,"license_key" : product_key }); 
//             const request = net.request({ 
//                 method: 'POST', 
//                 url: root_url+'/asset.php' 
//             }); 
//             request.on('response', (response) => {
//                 //console.log(`STATUS: ${response.statusCode}`)
//                 response.on('data', (chunk) => {
//                 })
//                 response.on('end', () => {})
//             })
//             request.on('error', (error) => { 
//                 log.info('Error while updating osInfo '+`${(error)}`) 
//             })
//             request.setHeader('Content-Type', 'application/json'); 
//             request.write(body, 'utf-8'); 
//             request.end();

//             return;

//           }else{
//          //console.log(stdout);

//             // console.log("OUTSIDE ERROR WMIC STATEMENT");
//             res = stdout.split('\n'); 
//             var ctr=0;
//             var product_key='';
//             res.forEach(function(line) {
//               ctr = Number(ctr)+Number(1);
//               line = line.trim();
//               var newStr = line.replace(/  +/g, ' ');
//               var parts = line.split(/  +/g);
//               if(ctr == 2){
//                 product_key = parts;
//               }
//             });

//             var body = JSON.stringify({ "funcType": 'osInfo', "asset_id": asset_id, "version" : os_data,"license_key" : product_key }); 
//             const request = net.request({ 
//                 method: 'POST', 
//                 url: root_url+'/asset.php' 
//             }); 
//             request.on('response', (response) => {
//                 //console.log(`STATUS: ${response.statusCode}`)
//                 response.on('data', (chunk) => {
//                 })
//                 response.on('end', () => {})
//             })
//             request.on('error', (error) => { 
//                 log.info('Error while updating osInfo '+`${(error)}`) 
//             })
//             request.setHeader('Content-Type', 'application/json'); 
//             request.write(body, 'utf-8'); 
//             request.end();
//         }
//         });

//     });

//     si.bios(function(data) {
//        bios_name = data.vendor;
//        bios_version = data.bios_version;
//        bios_released = data.releaseDate;

//       var body = JSON.stringify({ "funcType": 'biosInfo',  "asset_id": asset_id, "biosname": bios_name, "sys_ip": system_ip,
//         "serialNo": bios_version, "biosDate": bios_released }); 
//       const request = net.request({ 
//           method: 'POST', 
//           url: root_url+'/asset.php' 
//       }); 
//       request.on('response', (response) => {
//           //console.log(`STATUS: ${response.statusCode}`)
//           response.on('data', (chunk) => {
//           })
//           response.on('end', () => {})
//       })
//       request.on('error', (error) => { 
//           log.info('Error while updating biosInfo '+`${(error)}`) 
//       })
//       request.setHeader('Content-Type', 'application/json'); 
//       request.write(body, 'utf-8'); 
//       request.end();

//     });

//     si.cpu(function(data) {
//       processor_OEM = data.vendor;
//       processor_speed_ghz = data.speed;
//       processor_model = data.brand;

//       var body = JSON.stringify({ "funcType": 'cpuInfo',"asset_id": asset_id,"processor" : processor_OEM, "brand": processor_model, "speed": processor_speed_ghz }); 
//       const request = net.request({ 
//           method: 'POST', 
//           url: root_url+'/asset.php' 
//       }); 
//       request.on('response', (response) => {
//           //console.log(`STATUS: ${response.statusCode}`)
//           response.on('data', (chunk) => {
//           })
//           response.on('end', () => {})
//       })
//       request.on('error', (error) => { 
//           log.info('Error while updating cpu '+`${(error)}`) 
//       })
//       request.setHeader('Content-Type', 'application/json'); 
//       request.write(body, 'utf-8'); 
//       request.end();

//     });

//     si.system(function(data) {
//       sys_OEM = data.manufacturer;
//         sys_model = data.model;
//         device_name = os.hostname();
//         cpuCount = os.cpus().length;
//         itam_version = app.getVersion();


//        serialNumber(function (err, value) {

//         var body = JSON.stringify({ "funcType": 'systemInfo',"asset_id": asset_id, "make" : sys_OEM,
//           "model": sys_model, "serial_num": value, "device_name": device_name, "cpu_count": cpuCount, "version": itam_version}); 
//         const request = net.request({ 
//             method: 'POST', 
//             url: root_url+'/asset.php' 
//         }); 
//         request.on('response', (response) => {
//             //console.log(`STATUS: ${response.statusCode}`)
//             response.on('data', (chunk) => {
//             })
//             response.on('end', () => {})
//         })
//         request.on('error', (error) => { 
//             log.info('Error while updating systemInfo '+`${(error)}`) 
//         })
//         request.setHeader('Content-Type', 'application/json'); 
//         request.write(body, 'utf-8'); 
//         request.end();

//       });

//     });

//     getAntivirus(function(antivirus_data){

//         var body = JSON.stringify({ "funcType": 'antivirusInfo',"asset_id": asset_id,"data" : antivirus_data }); 
//         const request = net.request({ 
//             method: 'POST', 
//             url: root_url+'/asset.php' 
//         }); 
//         request.on('response', (response) => {
//             //console.log(`STATUS: ${response.statusCode}`)
//             response.on('data', (chunk) => {
//             })
//             response.on('end', () => {})
//         })
//         request.on('error', (error) => { 
//             log.info('Error while updating antivirusInfo '+`${(error)}`) 
//         })
//         request.setHeader('Content-Type', 'application/json'); 
//         request.write(body, 'utf-8'); 
//         request.end();

//     });

//     exec("Get-ItemProperty -Path 'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' , 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' | where { $_.DisplayName -ne $null  -and $_.DisplayName -notlike '*false*'  } | Select-Object DisplayName, DisplayVersion, InstallDate | Sort DisplayName",{'shell':'powershell.exe'}, (error, stdout, stderr) => {
//       if (error) {
//         console.error(`exec error: ${error}`);
//         return;
//       }

//       var app_list = [];
//       var version ="";
//       var i=0;
//       res = stdout.split('\n'); 
//       version = '[';
//       res.forEach(function(line) {
//         i=Number(i)+Number(1);
//          line = line.trim();
//          //var newStr = line.replace(/  +/g, ' ');
//           var parts = line.split(/  +/g);
//           if(parts[0] != 'DisplayName' && parts[0] != '-----------' && parts[0] != '' && parts[1] != 'DisplayVersion'){
//             version += '{"name":"'+parts[0]+'","version":"'+parts[1]+'"},';
//           }
//       });
//       version += '{}]';
//       var output = JSON.stringify(version);
//       output = JSON.parse(output);
//       require('dns').resolve('www.google.com', function(err) {
//       if (err) {
//          console.log("No connection");
//       } else {
//         var body = JSON.stringify({ "funcType": 'softwareList', "asset_id": asset_id, "result": output }); 
//         const request = net.request({ 
//             method: 'POST', 
//             url: root_url+'/asset.php' 
//         }); 
//         request.on('response', (response) => {
//             //console.log(`STATUS: ${response.statusCode}`)
//             response.on('data', (chunk) => {
//               console.log(`${chunk}`);
//             })
//             response.on('end', () => {})
//         })
//         request.on('error', (error) => { 
//             console.log(`ERROR: ${(error)}`) 
//         })
//         request.setHeader('Content-Type', 'application/json'); 
//         request.write(body, 'utf-8'); 
//         request.end();
//       }
//     });
//   });

//   } 
// }

var getAntivirus = function (callback) {
    // var final_list = [];

    // exec('PowerShell.exe Get-CimInstance -Namespace root/SecurityCenter2 -ClassName AntivirusProduct', (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`exec error: ${error}`);
    //         return;
    //     }
    //     var final_list = "";
    //     var antivirus_detail = "";
    //     var ctr = 0;
    //     var is_name = 'no';
    //     res = stdout.split('\n');
    //     res.forEach(function (line) {
    //         line = line.trim();
    //         if (line.length > 0) {
    //             var newStr = line.replace(/  +/g, ' ');
    //             if (newStr != '')
    //                 var parts = newStr.split(':');
    //             if (parts[0].trim() == 'displayName') {
    //                 ctr = Number(ctr) + Number(1);
    //                 final_list = ctr + ') ';
    //                 is_name = 'yes';
    //             }
    //             if (parts[0].trim() == 'displayName' || parts[0].trim() == 'timestamp' || parts[0].trim() == 'productState') {
    //                 final_list += parts[0].trim() + ':' + parts[1] + ' <br>';
    //             }
    //         }
    //         if (is_name == 'yes') {
    //             antivirus_detail += final_list;
    //             final_list = "";
    //         }
    //     });
    //     console.log('ANTIVIRUS DETAILS:',antivirus_detail);
    //     callback(antivirus_detail);
    // });

    const command = `wmic /namespace:\\\\root\\SecurityCenter2 path AntiVirusProduct get displayName,productState,timestamp`;
    try {
        const output = execSync(command);

        const strs = output.toString().split('\n')
        const regex = /(.+?)\s+(\d+)\s+([\w, :]+ GMT)/;

        let antivirus_details = ''
        for (let i = 1; i < strs.length; i++) {

            const match = strs[i].match(regex);

            if (!match) { continue; }
            const displayName = match[1].trim(),
                productState = parseInt(match[2], 10),
                timestamp = match[3].trim();

            antivirus_details += `${i}) displayName: ${displayName} <br>productState: ${productState} <br>timestamp: ${timestamp} <br>`
        }

        console.log('ANTIVIRUS DETAILS:', antivirus_details);
        callback(antivirus_details);
    } catch (error) {
        console.log(`Error: ${error.message}`);
    }
};

// setTimeout(() => {
//     getAntivirus(()=>{})
// }, 30000);

ipcMain.on("open_policy", (event, info) => {
    policyWindow = new BrowserWindow({
        width: 1500,
        height: 1500,
        icon: __dirname + '/images/ePrompto_png.png',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    policyWindow.setMenuBarVisibility(false);

    policyWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'policy.html'),
        protocol: 'file:',
        slashes: true
    }));

    policyWindow.on('close', function (e) {
        policyWindow = null;
    });
});

ipcMain.on("download", (event, info) => {
    var newWindow = BrowserWindow.getFocusedWindow();
    var filename = reqPath + '/output.csv';

    let options = {
        buttons: ["OK"],
        message: "Downloaded Successfully. Find the same in Download folder"
    }

    let alert_message = dialog.showMessageBox(options);

    var output_one = [];
    var data = [];
    var space = '';

    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies1) => {
            if (cookies1.length > 0) {
                if (info['tabName'] == 'usage') {

                    var body = JSON.stringify({
                        "funcType": 'cpuDetail', "sys_key": cookies1[0].name,
                        "from_date": info['from'], "to_date": info['to']
                    });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/download.php'
                    });
                    request.on('response', (response) => {
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            //console.log(`${chunk}`);

                            if (chunk) {
                                let a;
                                try {
                                    var obj = JSON.parse(chunk);
                                    if (obj.status == 'valid') {
                                        data = obj.result;
                                        output_one = ['Date,Slot Time,Total Ram(GB),Total HDD(GB),HDD Name,CPU(%),RAM(%),HDD(GB),App'];

                                        data.forEach((d) => {
                                            output_one.push(d[0]);
                                            d['detail'].forEach((dd) => {
                                                output_one.push(dd.join()); // by default, join() uses a ','
                                            });
                                        });

                                        fs.writeFileSync(filename, output_one.join(os.EOL));
                                        var datetime = new Date();
                                        datetime = datetime.toISOString().slice(0, 10);

                                        var oldPath = reqPath + '/output.csv';
                                        require_path = 'C:/Users/' + os.userInfo().username + '/Downloads';

                                        if (!fs.existsSync(require_path)) {
                                            fs.mkdirSync(require_path);
                                        }

                                        var newPath = 'C:/Users/' + os.userInfo().username + '/Downloads/perfomance_report_of_' + os.hostname() + '_' + datetime + '.csv';
                                        mv(oldPath, newPath, err => {
                                            if (err) return console.log(err);
                                            console.log('success!');
                                            console.log(alert_message);
                                        });
                                    }

                                } catch (e) {
                                    return console.log('cpuDetail: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }
                        })
                        response.on('end', () => { })
                    })
                    request.on('error', (error) => {
                        console.log(`ERROR: ${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();

                } else if (info['tabName'] == 'app') {
                    filename = reqPath + '/app_output.csv';
                    var body = JSON.stringify({ "funcType": 'appDetail', "sys_key": cookies1[0].name, "from_date": info['from'], "to_date": info['to'] });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/download.php'
                    });
                    request.on('response', (response) => {
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            //console.log(`${chunk}`);

                            if (chunk) {
                                let a;
                                try {
                                    var obj = JSON.parse(chunk);
                                    if (obj.status == 'valid') {
                                        data = obj.result;
                                        output_one = ['Date,Detail'];
                                        data.forEach((d) => {
                                            output_one.push(d.join()); // by default, join() uses a ','
                                        });

                                        fs.writeFileSync(filename, output_one.join(os.EOL));
                                        var datetime = new Date();
                                        datetime = datetime.toISOString().slice(0, 10);

                                        var oldPath = reqPath + '/app_output.csv';
                                        require_path = 'C:/Users/' + os.userInfo().username + '/Downloads';

                                        if (!fs.existsSync(require_path)) {
                                            fs.mkdirSync(require_path);
                                        }

                                        var newPath = 'C:/Users/' + os.userInfo().username + '/Downloads/app_used_report_of_' + os.hostname() + '_' + datetime + '.csv';
                                        mv(oldPath, newPath, err => {
                                            if (err) return console.log(err);
                                            console.log('success!');
                                            console.log(alert_message);
                                        });
                                    }
                                } catch (e) {
                                    return console.log('appDetail: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }
                        })
                        response.on('end', () => { })
                    })
                    request.on('error', (error) => {
                        console.log(`ERROR: ${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();
                }
            }
        }).catch((error) => {
            console.log(error)
        })

});

ipcMain.on('app_version', (event) => {
    event.sender.send('app_version', { version: app.getVersion() });
});

ipcMain.on('openTabs', function (e, form_data) {
    tabWindow = new BrowserWindow({
        width: 1500,
        height: 1500,
        icon: __dirname + '/images/ePrompto_png.png',
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    tabWindow.setMenuBarVisibility(false);

    tabWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'setting/all_in_one.html'),
        protocol: 'file:',
        slashes: true
    }));

    tabWindow.on('close', function (e) {
        // if (electron.app.isQuitting) {
        //  return
        // }
        // e.preventDefault();
        tabWindow = null;
    });
});


ipcMain.on('tabData', function (e, form_data) {
    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies1) => {
            if (cookies1.length > 0) {
                if (form_data['tabName'] == 'ticket') {

                    var body = JSON.stringify({ "funcType": 'ticketDetail', "sys_key": cookies1[0].name });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/ticket.php'
                    });
                    console.log('tabData', body)
                    request.on('response', (response) => {
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            console.log('tabData chunk', `${chunk}`);
                            if (chunk) {
                                let a;
                                try {
                                    var obj = JSON.parse(chunk);
                                    console.log('tabData obj', JSON.stringify(obj));
                                    if (obj.status == 'valid') {
                                        e.reply('tabTicketReturn', obj.result);
                                    } else if (obj.status == 'invalid') {
                                        e.reply('tabTicketReturn', obj.result);
                                    }

                                } catch (e) {
                                    return console.log('ticketDetail: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }
                        })
                        response.on('end', () => { })
                    })
                    request.on('error', (error) => {
                        log.info('Error while fetching ticket detail' + `${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();

                }
                else if (form_data['tabName'] == 'notification_policy') {
                    var body = JSON.stringify({ "functionType": 'notificationDetails', "sys_key": cookies1[0].name });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/notification.php'
                    });
                    request.on('response', (response) => {
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            let data = '';
                            console.log(`${chunk}`);
                            if (chunk) {
                                data += chunk.toString();
                                let a;
                                try {
                                    const obj = JSON.parse(data); // Parse the full response

                                    // console.log('Parsed Response:', obj);
                                    console.log(obj.status);
                                    if (obj.status == 'valid') {
                                        console.log(obj.result);
                                        e.reply('tabNotificationPolicy', obj.result);
                                    }

                                } catch (e) {
                                    return console.log('notificationDetails: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }
                        })
                        response.on('end', () => { })
                    })
                    request.on('error', (error) => {
                        log.info('Error while fetching notification detail ' + `${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();
                }
                else if (form_data['tabName'] == 'task') {
                    var body = JSON.stringify({ "funcType": 'TaskManagerTable', "sys_key": cookies1[0].name });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/task_manager.php'
                    });
                    request.on('response', (response) => {
                        // console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            console.log(chunk);
                            // console.log(`${chunk}`);
                            // console.log(chunk.toString('utf8'));
                            // var obj = JSON.parse(chunk);
                            if (chunk) {
                                let a;
                                try {
                                    var obj = JSON.parse(chunk);
                                    if (obj.status == 'valid') {
                                        // console.log(obj);
                                        e.reply('tabTaskReturn', obj.result);
                                    }
                                    else if (obj.status == 'invalid') {
                                        e.reply('tabTaskReturn', obj.result);
                                    }

                                } catch (e) {
                                    return console.log('tabName:task: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }

                        })
                        response.on('end', () => { })
                    })
                    request.on('error', (error) => {
                        log.info('Error while fetching task detail' + `${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();
                } else if (form_data['tabName'] == 'asset') {

                    var body = JSON.stringify({ "funcType": 'assetDetail', "sys_key": cookies1[0].name });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/asset.php'
                    });
                    console.log('tabData->asset: reqbody', { body })
                    request.on('response', (response) => {
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            console.log('tabData->asset: chunk', `${chunk}`);
                            if (chunk) {
                                let a;
                                try {
                                    var obj = JSON.parse(chunk);
                                    console.log('tabData->asset: obj', JSON.stringify(obj));
                                    if (obj.status == 'valid') {
                                        e.reply('tabAssetReturn', obj.result[0]);
                                    }

                                } catch (e) {
                                    return console.log('assetDetail: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }
                        })
                        response.on('end', () => { })
                    })
                    request.on('error', (error) => {
                        log.info('Error while fetching asset detail ' + `${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();

                } else if (form_data['tabName'] == 'user') {

                    var body = JSON.stringify({ "funcType": 'userDetail', "sys_key": cookies1[0].name });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/user.php'
                    });
                    request.on('response', (response) => {
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            console.log(`${chunk}`);
                            if (chunk) {
                                let a;
                                try {
                                    var obj = JSON.parse(chunk);
                                    if (obj.status == 'valid') {
                                        if (obj.result[0][2] == '') {
                                            obj.result[0][2] = 'Not Available';
                                        }

                                        if (obj.result[0][3] == '') {
                                            obj.result[0][3] = 'Not Available';
                                        }

                                        e.reply('tabUserReturn', obj.result[0]);
                                    }

                                } catch (e) {
                                    return console.log('userDetail: No proper response received'); // error in the above string (in this case, yes)!
                                }
                            }
                        })
                        response.on('end', () => { })
                    })
                    request.on('error', (error) => {
                        log.info('Error while fetching user detail ' + `${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();

                } else if (form_data['tabName'] == 'usage') {
                    e.reply('tabUtilsReturn', '');
                } else if (form_data['tabName'] == 'app') {
                    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                        .then((cookies1) => {
                            if (cookies1.length > 0) {
                                request({
                                    uri: root_url + "/utilisation.php",
                                    method: "POST",
                                    form: {
                                        funcType: 'appDetail',
                                        sys_key: cookies1[0].name,
                                        from_date: form_data['from'],
                                        to_date: form_data['to']
                                    }
                                }, function (error, response, body) {
                                    if (error) {
                                        log.info('Error while fetching app detail ' + error);
                                    } else {
                                        if (body != '' || body != null) {
                                            output = JSON.parse(body);
                                            if (output.status == 'valid') {
                                                e.reply('tabAppReturn', output.result);
                                            } else if (output.status == 'invalid') {
                                                e.reply('tabAppReturn', output.result);
                                            }
                                        }
                                    }
                                });
                            }
                        }).catch((error) => {
                            console.log(error)
                        })

                } else if (form_data['tabName'] == 'quick_util') {
                    var result = [];
                    const cpu = osu.cpu;
                    const disks = nodeDiskInfo.getDiskInfoSync();
                    // global.clientID = 8;
                    // console.log(global.clientID);
                    total_ram = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
                    free_ram = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
                    utilised_RAM = (total_ram - free_ram).toFixed(1);

                    result['total_ram'] = total_ram;
                    result['used_ram'] = utilised_RAM;
                    result['free_ram'] = free_ram;

                    hdd_total = hdd_used = 0;
                    hdd_name = '';

                    for (const disk of disks) {
                        if (disk.filesystem == 'Local Fixed Disk') {
                            hdd_total = hdd_total + disk.blocks;
                            hdd_used = hdd_used + disk.used;
                            used_drive = (disk.used / (1024 * 1024 * 1024)).toFixed(2);
                            hdd_name = hdd_name.concat(disk.mounted + ' ' + used_drive + ' GB <br>');
                        }

                    }

                    hdd_total = (hdd_total / (1024 * 1024 * 1024)).toFixed(1);
                    hdd_used = (hdd_used / (1024 * 1024 * 1024)).toFixed(1);
                    hdd_free = hdd_total - hdd_used;

                    result['hdd_total'] = hdd_total;
                    result['hdd_used'] = hdd_used;
                    result['hdd_name'] = hdd_name;
                    result['hdd_free'] = hdd_free;


                    cpu.usage()
                        .then(info => {

                            if (info == 0) {
                                info = 1;
                            }

                            result['cpu_usage'] = info;
                            e.reply('setInstantUtil', result);


                            var ram_percentage = (utilised_RAM / total_ram) * 100;
                            var percentage = 80;
                            // if(ram_percentage >= percentage || info >= percentage)
                            // {
                            //   console.log(ram_percentage);
                            //  logEverywhere(ram_percentage);
                            //   dialog.showMessageBox({message: "Your memory utilisation is above 90%"}); 

                            //   // directory path
                            //   const dir = 'C:\\Windows\\Temp'

                            //   // delete directory recursively
                            //   fs.rmdir(dir, { recursive: true }, err => {
                            //     if (err) {
                            //       try {
                            //         console.log(`${dir} is deleted!`)
                            //       } catch (err) {
                            //           return console.log('Error :'+err); // error in the above string (in this case, yes)!
                            //       }
                            //     }

                            //   })

                            // }
                            // else
                            //console.log('hdd_percentage'+hdd_percentage);


                        })

                }
            }
        }).catch((error) => {
            console.log(error)
        })
});

ipcMain.on('form_data', function (e, form_data) {

    type = form_data['type'];
    category = form_data['category'];

    loginid = form_data['user_id'];

    calendar_id = 0; //value has to be given
    client_id = form_data['clientid']; //value has to be given
    user_id = form_data['user_id']; //value has to be given
    //engineer_id = "";
    partner_id = 0;
    status_id = 4;
    external_status_id = 6;
    internal_status_id = 5
    issue_type_id = "";
    //is_media = null;
    catgory = 0;
    asset_id = form_data['assetID']; //value has to be given
    //address_id = null;
    description = form_data['desc'];
    ticket_no = Math.floor(Math.random() * (9999 - 10 + 1) + 10);
    resolution_method_id = 1;


    issue_type_category_id = category;
    if (form_data['disp_type'] == 'PC') {
        if (type == '1') {
            issue_type_id = "1,13," + category;

        } else if (type == '2') {
            issue_type_id = "2,15," + category;
        } else if (type == '3') {
            issue_type_id = "556,557," + category;
        }
    }

    else if (form_data['disp_type'] == 'WiFi') {
        issue_type_id = "1,13,47,179," + category;
    }
    else if (form_data['disp_type'] == 'Network') {
        issue_type_id = "1,13,47," + category;
    }
    else if (form_data['disp_type'] == 'Antivirus') {
        issue_type_id = "1,13,56,156,265," + category;
    }
    else if (form_data['disp_type'] == 'Application') {
        issue_type_id = "1,13,56,156," + category;
    }
    else if (form_data['disp_type'] == 'Printers') {
        issue_type_id = "6,22,42," + category;
    }

    estimated_cost = 0;
    //request_id = null;
    is_offer_ticket = 2;
    is_reminder = 0;
    is_completed = 3;
    res_cmnt_confirm = 0;
    res_time_confirm = 0;
    is_accept = 0;
    resolver_wi_step = 0;
    is_partner_ticket = 2;
    created_by = user_id;
    created_on = Math.floor(Date.now() / 1000);
    updated_by = user_id;
    updated_on = Math.floor(Date.now() / 1000);


    const form = new FormData();
    form.append("funcType", 'ticketInsert');
    form.append("tic_type", form_data['type']);
    form.append("loginID", loginid);
    form.append("calender", calendar_id);
    form.append("clientID", client_id);
    form.append("userID", user_id);
    form.append("partnerID", partner_id);
    form.append("statusID", status_id);
    form.append("exstatusID", external_status_id);
    form.append("instatusID", internal_status_id);
    form.append("catgory", catgory);
    form.append("asset_id", asset_id);
    form.append("desc", description);
    form.append("tic_no", ticket_no);
    form.append("resolution", resolution_method_id);
    form.append("issue_type", issue_type_id);
    form.append("issue_type_category_id", issue_type_category_id);
    form.append("est_cost", estimated_cost);
    form.append("offer_tic", is_offer_ticket);
    form.append("reminder", is_reminder);
    form.append("complete", is_completed);
    form.append("cmnt_confirm", res_cmnt_confirm);
    form.append("time_confirm", res_time_confirm);
    form.append("accept", is_accept);
    form.append("wi_step", resolver_wi_step);
    form.append("partner_tic", is_partner_ticket);

    if (form_data.file) {
        const fileBuffer = Buffer.from(form_data.file, 'base64');
        const fileName = form_data.fileName || 'uploaded_file'; // Use the sent file name or a default one
        form.append('file', fileBuffer, { filename: fileName });
    }
    else {
        console.log('File does not exist or path is invalid.');
    }
    // var body = JSON.stringify({ "funcType": 'ticketInsert', "tic_type": form_data['type'], "loginID": loginid, "calender": calendar_id,
    //   "clientID": client_id, "userID": user_id, "partnerID": partner_id, "statusID": status_id, "exstatusID": external_status_id, "instatusID": internal_status_id,
    //   "catgory": catgory, "asset_id": asset_id, "desc": description, "tic_no": ticket_no, "resolution": resolution_method_id, "issue_type": issue_type_id, "issue_type_category_id": issue_type_category_id,"est_cost": estimated_cost,
    //   "offer_tic": is_offer_ticket, "reminder": is_reminder, "complete": is_completed, "cmnt_confirm": res_cmnt_confirm, "time_confirm": res_time_confirm,
    //   "accept": is_accept, "wi_step": resolver_wi_step, "partner_tic": is_partner_ticket, "filename": filename }); 
    //console.log(body);
    const request = net.request({
        method: 'POST',
        url: root_url + '/ticket.php',
        headers: form.getHeaders()
    });

    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            //console.log(`${chunk}`);
            var obj = JSON.parse(chunk);
            var result = [];

            if (chunk) {
                let a;
                try {
                    console.log(obj.status);
                    console.log(obj.message);
                    if (obj.status == 'valid') {
                        global.ticketNo = obj.ticket_no;
                        result['status'] = 1;
                        result['ticketNo'] = ticketNo;
                        e.reply('ticket_submit', result);
                    } else {
                        result['status'] = 0;
                        result['ticketNo'] = '';
                        e.reply('ticket_submit', result);
                    }
                    console.log('raise ticket data:', obj)
                } catch (e) {
                    return console.log('ticketInsert: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })

    })
    request.on('error', (error) => {
        log.info('Error while inserting ticket ' + `${(error)}`)
    })
    form.pipe(request);
    request.end();

});

ipcMain.on('getUsername', function (e, form_data) {

    var body = JSON.stringify({ "funcType": 'getusername', "clientID": form_data['clientid'] });
    const request = net.request({
        method: 'POST',
        url: root_url + '/user.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            //console.log(`${chunk}`);
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'valid') {
                        e.reply('returnUsername', obj.result);
                    }

                } catch (e) {
                    return console.log('getusername: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error while fetching user name ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});

function getIssueTypeData(type, callback) {
    $query = 'SELECT `estimate_time`,`device_type_id`,`impact_id` FROM `et_issue_type_master` where `it_master_id`="' + type + '"';
    connection.query($query, function (error, results, fields) {
        if (error) {
            return connection.rollback(function () {
                throw error;
            });
        } else {
            callback(null, results);
        }

    });
}

function getMaxId($query, callback) {
    connection.query($query, function (error, results, fields) {
        if (error) {
            return connection.rollback(function () {
                throw error;
            });
        } else {
            callback(null, results);
        }

    });
}

ipcMain.on('openHome', function (e, data) {
    display = electron.screen.getPrimaryDisplay();
    width = display.bounds.width;
    mainWindow = new BrowserWindow({
        // width: 392,
        // height: 520,
        // icon: __dirname + '/images/ePrompto_png.png',
        // frame: false,
        // x: width - 450,
        // y: 190,
        // webPreferences: {
        //     nodeIntegration: true,
        //     enableRemoteModule: true,
        // }
        width: 280,
        height: 300,
        x: width - (280 + 15),
        // y: 420,
        y: height - (300 + 40),
        icon: __dirname + '/images/ePrompto_png.png',
        titleBarStyle: 'hiddenInset',
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    //mainWindow.setMenu(null);

    //categoryWindow.close();
    categoryWindow.on('close', function (e) {
        categoryWindow = null;
    });
});

ipcMain.on('internet_reconnect', function (e, data) {

    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies) => {
            if (cookies.length > 0) {
                // SetCron(cookies[0].name);
            }
        }).catch((error) => {
            console.log(error)
        })
    setGlobalVariable();
});

ipcMain.on('getSystemKey', function (e, data) {

    var body = JSON.stringify({ "funcType": 'getSysKey' });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    console.log('getSysKey:',{body, url: root_url + '/login.php'})
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.sys_key != '' || obj.sys_key != null) {
                        e.reply('setSysKey', obj.sys_key);
                        // setSystemKeyInCookie(res.sys_key)
                        //     .then(_ => {
                        //     e.reply('setSysKey', res.sys_key);
                        //     })
                    }

                } catch (e) {
                    return console.log('getSysKey: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error while fetching system key ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});

ipcMain.on('loadAllocUser', function (e, data) {

    var body = JSON.stringify({ "funcType": 'getAllocUser', "userID": data.userID });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    console.log(body)
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'valid') {
                        e.reply('setAllocUser', obj.result);
                    } else {
                        e.reply('setAllocUser', '');
                    }
                } catch (e) {
                    return console.log('getAllocUser: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error while getting allocated user detail ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});


ipcMain.on('login_data', async function (e, data) {
    console.log('globalparent_created_by' + globalparent_created_by);
    console.log('login data:', data)

    var system_ip = ip.address();
    var asset_id = "";
    var machineId = uuid.machineIdSync({ original: true });
    hdd_total = 0;
    // RAM = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
    let RAM = [];
    let ram_clockspeed = {}
    const ram_layout = await si.memLayout()
    ram_layout.forEach((ram, index) => {
        // const ram_slot = "Slot " + (parseInt(ram.bank.replaceAll("/", "")) + 1)
        // REGEX that removes everything except for digits.
        const ram_slot_no = (parseInt(ram.bank.replaceAll(/\D/g, ''), 2) || index) + 1
        const ram_slot = `Slot ${ram_slot_no}`
        const ram_size = (ram.size / (1024 * 1024 * 1024)).toFixed(1) + " GB"
        RAM.push(`${ram_slot}: ${ram_size}`);

        ram_clockspeed[ram_slot] = ram.clockSpeed
    })
    RAM = RAM.join(", ")
    const disks = nodeDiskInfo.getDiskInfoSync();

    for (const disk of disks) {
        if (disk.filesystem == 'Local Fixed Disk') {
            hdd_total = hdd_total + disk.blocks;
        }
    }
    hdd_total = hdd_total / (1024 * 1024 * 1024);
    serialNumber(function (err, value) {
        console.log("Level Name" + data.level1_name + data.level2_name + data.level3_name);
        // console.log(sys_OEM);console.log(sys_model);console.log(value);console.log(data.system_key); console.log(getmac.default());
        mac_address = getmac.default();
        console.log(mac_address);
        si.system()
            .then(systemInfo => {
                const deviceId = systemInfo.uuid;

                console.log('Device ID:', deviceId);
                var body = JSON.stringify({
                    "funcType": 'loginFunc', 
                    "userID": data.userId,
                    "sys_key": data.system_key, 
                    "dev_type": data.device_type, 
                    "ram": RAM, 
                    "hdd_capacity": hdd_total,
                    "machineID": machineId, 
                    "title": data.title, 
                    "user_fname": data.usr_first_name, 
                    "user_lname": data.usr_last_name,
                    "user_email": data.usr_email,
                    "user_mob_no": data.usr_contact, 
                    "token": data.token, 
                    "client_no": data.clientno, 
                    "ip": system_ip, 
                    "make": sys_OEM, 
                    "model": sys_model, 
                    "serial_num": value, 
                    "mac_address": mac_address, 
                    "deviceId": deviceId, 
                    "system_type": 'Windows', 
                    "department_id": data.departmentId, 
                    "level_id1": data.levelId1, 
                    "level_id2": data.levelId2, 
                    "level_id3": data.levelId3, 
                    "level1_name": data.level1_name, 
                    "level2_name": data.level2_name, 
                    "level3_name": data.level3_name, 
                    "parent_id": data.parent_id, 
                    "parent_created_by": globalparent_created_by, 
                    "asset_status": data.asset_status
                });
                console.log(body);
                const request = net.request({
                    method: 'POST',
                    url: root_url + '/login.php'
                });
                request.on('response', (response) => {
                    console.log(`STATUS: ${response.statusCode}`)
                    response.on('data', (chunk) => {
                        console.log(`login response chunk: ${chunk}`);

                        if (chunk) {
                            let a;
                            try {
                                var obj = JSON.parse(chunk);

                                if (obj.status == 'valid') {

                                    // const cookie = { url: 'http://www.eprompto.com', name: data.system_key, value: data.system_key, expirationDate: 9999999999 }
                                    // session.defaultSession.cookies.set(cookie, (error) => {
                                    //     if (error) console.log(error)
                                    // })
                                    setSystemKeyInCookie(data.system_key)
                                    console.log('cookie set at login', data.system_key);

                                    fs.writeFile(detail, data.system_key, function (err) {
                                        if (err) return console.log(err);
                                    });

                                    global.clientID = obj.result;
                                    global.userName = obj.loginPass[0];
                                    global.loginid = obj.loginPass[1];
                                    global.assetID = obj.asset_maxid;
                                    asset_id = obj.asset_maxid;
                                    console.log('asset id at login:',asset_id);
                                    // updateAsset(asset_id);
                                    //hardwareDetails('first');
                                    // keyboardDetails();
                                    // mouseDetails();
                                    // graphicCardDetails();
                                    // motherboardDetails();
                                    // monitorDetails();
                                    // monitorInches();
                                    // RAMSerialNumber();
                                    // HDDSerialNumber();
                                    // ProcessorSerialNumber();
                                    // softwareDetails();
                                    // checkUserProductivityPermission();

                                    // getTimeForSetTimout = genIncreamentTimeForSetTimout();
                                    setTimeout(() => {
                                        hardwareDetails('first');
                                    }, 60000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        itamLastLogin();
                                    }, 60000);
                                    // }, getTimeForSetTimout.next().value);

                                    setTimeout(() => {
                                        domainName();
                                    }, 120000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        softwareDetails();
                                    }, 120000);
                                    // },getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        graphicCardDetails();
                                    }, 180000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        motherboardDetails();
                                    }, 240000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        monitorDetails();
                                    }, 300000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        monitorInches();
                                    }, 360000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        RAMSerialNumber();
                                    }, 420000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        HDDSerialNumber();
                                    }, 120000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        ProcessorSerialNumber();
                                    }, 540000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        keyboardDetails();
                                    }, 660000);
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        mouseDetails();
                                    }, 720000)
                                    // }, getTimeForSetTimout.next().value);
                                    setTimeout(() => {
                                        checkUserProductivityPermission();
                                    }, 120000);
                                    setTimeout(() => {
                                        check_acceptance_policy();
                                    }, 120000); // 1min

                                    setTimeout(() => {
                                        getUserProductivity();
                                    }, 900000); // 15min

                                    setTimeout(() => {
                                        check_scrap_asset_request();
                                    }, 960000); // 16min


                                    /// New code
                                    setTimeout(() => {
                                        check_location_track_request();
                                    }, 120000); // 2min



                                    setTimeout(() => {
                                        const input_values = {};
                                        Preventive_Maintenance_Main(input_values, 'One Time');
                                    }, 120000); // 2min

                                    setTimeout(() => {
                                        const input_values = {};
                                        Preventive_Maintenance_Main(input_values, 'Scheduled');
                                    }, 180000); // 18min

                                    setTimeout(() => {
                                        const input_values = {};
                                        Patch_Management_Main(input_values, 'One Time');
                                    }, 120000); // 2min

                                    setTimeout(() => {
                                        const input_values = {};
                                        Patch_Management_Specific(input_values, 'One Time');
                                    }, 180000); // 3min

                                    setTimeout(() => {
                                        const input_values = {};
                                        Network_Monitor_Main(input_values, 'One Time');
                                    }, 120000); // 2min




                                    //   location_service();
                                    // addAssetUtilisation(output.asset_maxid,output.result[0]);
                                    global.deviceID = data.device_type;

                                    mainWindow = new BrowserWindow({
                                        width: 280,
                                        height: 300,
                                        //hesight: 530,
                                        x: width - (280 + 15),
                                        // y: 420,
                                        y: height - (300 + 40),
                                        icon: __dirname + '/images/ePrompto_png.png',
                                        titleBarStyle: 'hiddenInset',
                                        frame: false,
                                        resizable: false,
                                        transparent: true,
                                        webPreferences: {
                                            nodeIntegration: true,
                                            enableRemoteModule: true,
                                        }
                                    });

                                    mainWindow.setMenuBarVisibility(false);

                                    mainWindow.loadURL(url.format({
                                        pathname: path.join(__dirname, 'index.html'),
                                        protocol: 'file:',
                                        slashes: true
                                    }));

                                    child = new BrowserWindow({
                                        parent: mainWindow,
                                        icon: __dirname + '/images/ePrompto_png.png',
                                        modal: true,
                                        show: true,
                                        frame: false,
                                        resizable: false,
                                        transparent: true,
                                        width: 280,
                                        // height: 100,
                                        height: 100,
                                        x: width - (280 + 15),
                                        y: height - (100 + 250),
                                        // y: height - (100 + 45),
                                        webPreferences: {
                                            nodeIntegration: true,
                                            enableRemoteModule: true,
                                        }
                                    });

                                    child.setMenuBarVisibility(false);

                                    child.loadURL(url.format({
                                        pathname: path.join(__dirname, 'modal.html'),
                                        protocol: 'file:',
                                        slashes: true
                                    }));
                                    // child.once('ready-to-show', () => {
                                    //  child.show();
                                    // });


                                    // isWindowClosingProgrammatically = true;
                                    if(startWindow && !startWindow.isDestroyed()){
                                        startWindow.close()
                                    }
                                    if(loginWindow && !loginWindow.isDestroyed()){
                                        loginWindow.close();
                                    }
                                    // loginWindow.on('close', function (e) {
                                    //   loginWindow = null;
                                    // });

                                    // tray.on('click', function (e) {
                                    //     if (mainWindow.isVisible()) {
                                    //         mainWindow.hide();
                                    //     } else {
                                    //         mainWindow.show();
                                    //     }
                                    // });

                                    // mainWindow.on('close', function (e) {
                                    //     if (process.platform !== "darwin") {
                                    //         app.quit();
                                    //     }
                                    //     // // if (electron.app.isQuitting) {
                                    //     // //  return
                                    //     // // }
                                    //     // e.preventDefault()
                                    //     // mainWindow.hide()
                                    //     // // if (child.isVisible()) {
                                    //     // //     child.hide()
                                    //     // //   } 
                                    //     // //mainWindow = null;
                                    // });
                                }
                            } catch (e) {
                                console.log('An error occurred:', e.message);
                                return console.log('loginFunc: No proper response received'); // error in the above string (in this case, yes)!
                            }
                        }
                    })
                    response.on('end', () => { })
                })
                request.on('error', (error) => {
                    log.info('Error in login function ' + `${(error)}`);
                })
                request.setHeader('Content-Type', 'application/json');
                request.write(body, 'utf-8');
                request.end();
            });
    })

});

function check_acceptance_policy(e) {
    console.log('global.parentId' + global.parentId);
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "funcType": 'check_acceptance_policy', "sys_key": cookies[0].name });
                        console.log(body);
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/acceptance_policy.php'
                        });
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);                //comment out
                                if (chunk) {
                                    try {
                                        var obj = JSON.parse(chunk);
                                        var policyData = obj.policyData;
                                        // console.log(obj.msg);

                                        // global.acceptanceTime = obj.frequency;
                                        // console.log(global.acceptanceTime);
                                        if (obj.status == 'valid') {
                                            policyData = obj.policyData;
                                            asset_name = obj.asset_name;
                                            global.memberId = obj.client_id;
                                            console.log('length' + policyData.length);
                                            var policy_data_new = policyData[0];
                                            if (policyData.length > 0) {
                                                var index_key = 0;
                                                policyData.forEach((policy, index) => {
                                                    setTimeout(() => {
                                                        // notifier.notify(
                                                        //   {
                                                        //     title: policy.title,
                                                        //     message: policy.policy,
                                                        //     icon: path.join(app.getAppPath(), '/images/ePrompto.ico'),
                                                        //     sound: true,
                                                        //     wait: true, 
                                                        //     appID: "New Company Policy Added"
                                                        //   },
                                                        //   function (err, response, metadata) {
                                                        //     if (err) {
                                                        //       console.error('Notification error:', err);
                                                        //     } else {
                                                        //       console.log('User response:', response);
                                                        //       if(response == undefined)
                                                        //       {
                                                        console.log("Inside company policy Call");

                                                        winWindow = new BrowserWindow({
                                                            width: 500,
                                                            height: 200,
                                                            icon: __dirname + '/images/ePrompto_png.png',
                                                            webPreferences: {
                                                                nodeIntegration: true,
                                                                contextIsolation: false, // for simplicity; consider security implications
                                                            },
                                                        });

                                                        winWindow.setMenuBarVisibility(false);

                                                        winWindow.loadFile('accept_form.html').then(() => {
                                                            // Send data after the window is loaded
                                                            winWindow.webContents.send('policy_data', { policy, asset_name });
                                                        });

                                                        //   if (winWindow && !winWindow.isDestroyed()) 
                                                        //   { 
                                                        //     setTimeout(() => {
                                                        //       winWindow.close();
                                                        //     }, 300000); // 5 min 
                                                        // }
                                                        //   if (winWindow && !winWindow.isDestroyed()) { 
                                                        //     setTimeout(() => {
                                                        //         if (winWindow && !winWindow.isDestroyed()) {
                                                        //             winWindow.close();
                                                        //         }
                                                        //     }, 300000); // 5 minutes 
                                                        // }
                                                        if (winWindow && !winWindow.isDestroyed()) {
                                                            winWindow.on('minimize', () => {
                                                                setTimeout(() => {
                                                                    //   winWindow.close();
                                                                }, 10000); // Adjust the timeout as needed
                                                            });
                                                        }


                                                        //  }
                                                        // console.log('Metadata:', metadata); // Useful for tracking user's interaction
                                                        // }

                                                        // })


                                                    }, index * 600000); // Delay each policy display by 10 minute
                                                });
                                            }
                                        }
                                    } catch (e) {
                                        return console.log('check_acceptance_policy: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                }).catch((error) => {
                    // console.log(error)            // comment out
                })

        }
    });


}
ipcMain.on('check_first_acceptance_policy', function (e, data, companyPolicyIdValue) {
    console.log('check_first_acceptance_policy' + data);
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "funcType": 'check_first_acceptance_policy', "sys_key": cookies[0].name, "data": data, "memberId": global.memberId, "company_policy_id": companyPolicyIdValue, "frequency": global.acceptanceTime });
                        console.log(body);
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/acceptance_policy.php'
                        });
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);              //comment out
                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        console.log(obj.status);
                                        console.log(obj.msg);
                                        if (obj.status == 'valid') {
                                            if (winWindow) {

                                                winWindow.close();

                                                dialog.showMessageBox(winWindow, {
                                                    type: 'info',
                                                    title: 'Success',
                                                    message: 'Policy Acceptance Submitted Successfully.',
                                                    buttons: ['OK']
                                                });

                                                winWindow.on('minimize', () => {
                                                    setTimeout(() => {
                                                        winWindow.close();
                                                    }, 10000); // Adjust the timeout as needed
                                                });
                                            }



                                        }

                                    } catch (e) {
                                        return console.log('check_first_acceptance_policy: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                }).catch((error) => {
                    // console.log(error)            // comment out
                })

        }
    });


});


ipcMain.on('create_new_member', function (e, form_data) {
    regWindow = new BrowserWindow({
        width: 392,
        height: 520,
        icon: __dirname + '/images/ePrompto_png.png',
        //frame: false,
        x: width - 450,
        y: 190,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    regWindow.setMenuBarVisibility(false);

    regWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'new_member.html'),
        protocol: 'file:',
        slashes: true
    }));

    startWindow.close();
    // startWindow.on('close', function (e) {
    //   startWindow = null;
    // });

});

ipcMain.on('cancel_reg', function (e, form_data) {
    startWindow = new BrowserWindow({
        icon: __dirname + '/images/ePrompto_png.png',
        //frame: false,
        width: 330,
        height: 520,
        x: width - (330 + 15),
        y: height - (520 + 40),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    startWindow.setMenuBarVisibility(false);

    startWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'are_you_member.html'),
        protocol: 'file:',
        slashes: true
    }));

    regWindow.close();
    // regWindow.on('close', function (e) {
    //   regWindow = null;
    // });
});

ipcMain.on('update_member', function (e, form_data) {
    loginWindow = new BrowserWindow({
        icon: __dirname + '/images/ePrompto_png.png',
        //frame: false,
        width: 330,
        height: 520,
        x: width - (330 + 15),
        y: height - (520 + 40),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    loginWindow.setMenuBarVisibility(false);

    loginWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'login.html'),
        protocol: 'file:',
        slashes: true
    }));

    isWindowClosingProgrammatically = true;
    startWindow.close();
    // startWindow.on('close', function (e) {
    //   startWindow = null;
    // });
});

ipcMain.on('cancel_login', function (e, form_data) {
    startWindow = new BrowserWindow({
        icon: __dirname + '/images/ePrompto_png.png',
        width: 330,
        height: 520,
        x: width - (330 + 15),
        y: height - (520 + 40),
        // frame: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    startWindow.setMenuBarVisibility(false);

    startWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'are_you_member.html'),
        protocol: 'file:',
        slashes: true
    }));

    loginWindow.close();
    // loginWindow.on('close', function (e) {
    //   //loginWindow = null;
    //   if(process.platform != 'darwin')
    //        app.quit();
    // });
});

ipcMain.on('check_email', function (e, form_data) {
    var body = JSON.stringify({ "funcType": 'checkemail', "email": form_data['email'] });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {

            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'valid') {
                        e.reply('checked_email', obj.status);
                    } else if (obj.status == 'invalid') {
                        e.reply('checked_email', obj.status);
                    }
                } catch (e) {
                    return console.log('checkemail: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error n login function ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});

ipcMain.on('check_user_email', function (e, form_data) {
    global.parentId = form_data['parent_id'];
    console.log('check_user_email+++++++++++++++++++++++++++++++++++');
    var body = JSON.stringify({ "funcType": 'check_user_email', "email": form_data['email'], "parent_id": form_data['parent_id'] });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {

            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    console.log(obj.status);
                    console.log(obj.result_email_count);
                    if (obj.status == 'valid') {
                        e.reply('checked_user_email', obj.status);
                    } else if (obj.status == 'invalid') {
                        e.reply('checked_user_email', obj.status);
                    }
                } catch (e) {
                    return console.log('check_user_email: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error n login function ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});

//------------------------------ Start Code of Fetch Si level for using member email id-----------------------------------
ipcMain.on('fetch_level_si', function (e, form_data) {
    console.log('Inside fetch_level_si');
    console.log(form_data['email']);
    var body = JSON.stringify({ "funcType": 'fetchlevelsi', "email": form_data['email'] });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'valid') {
                        console.log(obj.status);
                        console.log(obj.level_data);
                        console.log(obj.new);
                        e.reply('setvaluelevelsi', obj.new, obj.level_data);

                    }

                } catch (e) {
                    return console.log('fetchlevelsi: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error while checking member email ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});

ipcMain.on('request-dynamic-content', (event, data, level_data) => {
    console.log('request-dynamic-content+++' + level_data);

    if (!data || data.length === 0) {
        event.sender.send('response-dynamic-content', '', true);
    } else {
        let dynamicFieldsHtml = '';

        data.forEach(item => {
            if (item.is_show.toLowerCase() === 'yes' && item.label !== 'department' && item.label !== 'device_type') {
                switch (item.label) {
                    case 'email':
                        dynamicFieldsHtml += `
                  <div class="form-group">
                  
                      <input class="input100" type="email" name="user_email" id="user_email" placeholder="Email (Optional)" onchange="checkDuplication(this.value)">
                  </div>`;
                        break;
                    case 'mobile_no':
                        dynamicFieldsHtml += `
                  <div class="form-group">
                      <input class="input100" type="text" name="user_contact_no" id="user_contact_no" placeholder="Contact No. (Optional)" pattern="[0-9]*" maxlength="10" minlength="10">
                      <span class="focus-input100" id="err_user_contact" style="color:#B22222; font-weight: bold;"></span>
                  </div>`;
                        break;
                    default:
                        dynamicFieldsHtml += `
                  <div class="form-group">
                      <input type="text" class="input100" name="user_${item.label}" id="user_${item.label}" placeholder="${item.title} *" pattern="[A-Za-z0-9 ]+" >
                      <span class="focus-input100" id="err_user_${item.label}" style="color:#B22222; font-weight: bold;"></span>
                  </div>`;
                        break;
                }
            }

            if (item.label === 'department' && item.is_show.toLowerCase() === 'yes') {
                dynamicFieldsHtml += `
          <div class="form-group" id="allocate_department">
              <select class="input100" id="alloc_department">
                  <option value="" selected disabled>Allocated Department</option>
              </select>
          </div>`;
            }
        });
        let level1Added = false;
        let level2Added = false;
        let level3Added = false;
        // for (let i = 0; i < level_data.length; i++) 
        // {      
        //   if(level_data[i][1] !== null && level_data[i][1] !== 'NULL' && !level1Added) 
        //   {
        //     dynamicFieldsHtml += `<div class="" id="allocate_level1">
        //     <select class="input100" id="alloc_level1">
        //       <option value="" selected disabled>Level 1</option>
        //     </select>
        //     </div>`;

        //     level1Added = true; 

        //   } 

        //   if(level_data[i][2] !== null && level_data[i][2] !== 'NULL' && !level2Added) 
        //   {
        //       dynamicFieldsHtml += `<div class="" id="allocate_level2">
        //       <select class="input100" id="alloc_level2">
        //         <option value="" selected disabled>Level 2</option>
        //       </select>
        //       </div>`;   
        //       level2Added = true; 
        //     } 
        //     if(level_data[i][3] !== null && level_data[i][3] !== 'NULL' && !level3Added) 
        //      {
        //         dynamicFieldsHtml += `<div class="" id="allocate_level3">
        //         <select class="input100" id="alloc_level3">
        //           <option value="" selected disabled>Level 3</option>
        //         </select>
        //         </div>`;     
        //         level3Added = true; 
        //     }                  
        //   }
        event.reply('response-dynamic-content', dynamicFieldsHtml, false);
    }
});
//------------------------------ End Code of Fetch Si level for using member email id-----------------------------------
ipcMain.on('check_member_email', function (e, form_data) {
    var body = JSON.stringify({ "funcType": 'checkmemberemail', "email": form_data['email'] });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {

            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'valid') {
                        e.reply('checked_member_email', obj);
                    } else if (obj.status == 'invalid') {
                        e.reply('checked_member_email', obj);
                    }

                } catch (e) {
                    return console.log('checkmemberemail: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error while checking member email ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});

ipcMain.on('member_registration', function (e, form_data) {
    var system_ip = ip.address();
    RAM = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
    const disks = nodeDiskInfo.getDiskInfoSync();
    hdd_total = 0;

    for (const disk of disks) {
        if (disk.filesystem == 'Local Fixed Disk') {
            hdd_total = hdd_total + disk.blocks;
        }
    }
    hdd_total = hdd_total / (1024 * 1024 * 1024);

    var body = JSON.stringify({
        "funcType": 'member_register', "title": form_data['title'], "first_name": form_data['mem_first_name'], "last_name": form_data['mem_last_name'],
        "email": form_data['mem_email'], "contact": form_data['mem_contact'], "company": form_data['mem_company'], "dev_type": form_data['device_type'], "ip": system_ip,
        "ram": RAM, "hdd_capacity": hdd_total, "otp": form_data['otp']
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {

            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'valid') {
                        global.clientID = obj.result;
                        global.userName = obj.loginPass[0];
                        global.loginid = obj.loginPass[1];
                        asset_id = obj.asset_maxid;
                        global.NetworkStatus = 'Yes';
                        global.assetID = asset_id;
                        global.sysKey = obj.sysKey;
                        //updateAsset(asset_id);
                        hardwareDetails();
                        keyboardDetails();
                        mouseDetails();
                        graphicCardDetails();
                        motherboardDetails();
                        monitorDetails();
                        monitorInches();
                        RAMSerialNumber();
                        HDDSerialNumber();
                        ProcessorSerialNumber();
                        //  location_service();
                        softwareDetails();
                        checkUserProductivityPermission();
                        // addAssetUtilisation(output.asset_maxid,output.result[0]);
                        // const cookie = { url: 'http://www.eprompto.com', name: obj.sysKey, value: obj.sysKey, expirationDate: 9999999999 }
                        // session.defaultSession.cookies.set(cookie, (error) => {
                        //     if (error) console.log(error)
                        // })

                        // fs.writeFile(detail, obj.sysKey, function (err) {
                        //     if (err) return console.log(err);
                        // });

                        global.deviceID = form_data['device_type'];

                        mainWindow = new BrowserWindow({
                            // width: 392,
                            // height: 520,
                            // icon: __dirname + '/images/ePrompto_png.png',
                            // frame: false,
                            // x: width - 450,
                            // y: 190,
                            // webPreferences: {
                            //     nodeIntegration: true,
                            //     enableRemoteModule: true,
                            // }
                            width: 280,
                            height: 300,
                            x: width - (280 + 15),
                            // y: 420,
                            y: height - (300 + 40),
                            icon: __dirname + '/images/ePrompto_png.png',
                            titleBarStyle: 'hiddenInset',
                            frame: false,
                            resizable: false,
                            transparent: true,
                            webPreferences: {
                                nodeIntegration: true,
                                enableRemoteModule: true,
                            }
                        });

                        mainWindow.setMenuBarVisibility(false);

                        mainWindow.loadURL(url.format({
                            pathname: path.join(__dirname, 'index.html'),
                            protocol: 'file:',
                            slashes: true
                        }));

                        child = new BrowserWindow({
                            parent: mainWindow,
                            icon: __dirname + '/images/ePrompto_png.png',
                            modal: true,
                            show: true,
                            width: 500,
                            height: 300,
                            frame: false,
                            x: width - 500,
                            y: height - 300,
                            webPreferences: {
                                nodeIntegration: true,
                                enableRemoteModule: true,
                            }
                        });

                        child.setMenuBarVisibility(false);

                        child.loadURL(url.format({
                            pathname: path.join(__dirname, 'modal.html'),
                            protocol: 'file:',
                            slashes: true
                        }));
                        child.once('ready-to-show', () => {
                            child.show();
                        });

                        regWindow.close();

                        // tray.on('click', function (e) {
                        //     if (mainWindow.isVisible()) {
                        //         mainWindow.hide()
                        //     } else {
                        //         mainWindow.show()
                        //     }
                        // });

                        mainWindow.on('close', function (e) {
                            // if (process.platform !== "darwin") {
                            //     app.quit();
                            // }
                        });
                    } else if (obj.status == 'wrong_otp') {
                        e.reply('otp_message', 'OTP entered is wrong');
                    }

                } catch (e) {
                    return console.log('member_register: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error n member registration function ' + `${(error)}`);
        require('dns').resolve('www.google.com', function (err) {
            if (err) {
                e.reply('error_message', 'No internet connection');
            } else {
                e.reply('error_message', 'Request not completed');
            }
            global.NetworkStatus = 'No';
        });
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();


});

ipcMain.on('check_forgot_email', function (e, form_data) {

    request({
        uri: root_url + "/login.php",
        method: "POST",
        form: {
            funcType: 'check_forgot_cred_email',
            email: form_data['email']
        }
    }, function (error, response, body) {
        output = JSON.parse(body);
        e.reply('checked_forgot_email', output.status);
    });
});

ipcMain.on('sendOTP', function (e, form_data) {

    var body = JSON.stringify({ "funcType": 'sendOTP', "email": form_data['emailID'], "mem_name": form_data['name'] });
    const request = net.request({
        method: 'POST',
        url: root_url + '/login.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            //console.log(`${chunk}`);
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    e.reply('sendOTP_status', obj.status);

                } catch (e) {
                    return console.log('sendOTP: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error while sending OTP ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});


ipcMain.on('forgot_cred_email_submit', function (e, form_data) {
    //not used
    request({
        uri: root_url + "/check_clientno.php",
        method: "POST",
        form: {
            funcType: 'forgot_cred_email',
            email: form_data['email']
        }
    }, function (error, response, body) {
        output = JSON.parse(body);
        e.reply('forgot_cred_email_submit_response', output.status);
        //forgotWindow.close();

    });

});

ipcMain.on('ticketform', function (e, form_data) {
    ticketWindow = new BrowserWindow({
        icon: __dirname + '/images/ePrompto_png.png',
        titleBarStyle: 'hiddenInset',
        // frame: false,
        resizable: false,
        transparent: true,
        width: 300,
        height: 300,
        x: width - (300 + 15),
        y: height - (300 + 45),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });


    ticketWindow.setMenuBarVisibility(false);

    ticketWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'category/pc_laptop.html'),
        protocol: 'file:',
        slashes: true
    }));

    ticketWindow.webContents.on('did-finish-load', () => {
        ticketWindow.webContents.send('device_type_ticket', form_data['issueType']);
    });

    mainWindow.close();
    // mainWindow.on('close', function (e) {
    //   mainWindow = null;
    // });

});

ipcMain.on('back_to_main', function (e, form_data) {

    mainWindow = new BrowserWindow({
        // width: 330,
        // height: 520,
        // icon: __dirname + '/images/ePrompto_png.png',
        // x: width - 450,
        // y: 190,
        // webPreferences: {
        //     nodeIntegration: true
        // }
        width: 280,
        height: 300,
        x: width - (280 + 15),
        // y: 420,
        y: height - (300 + 40),
        icon: __dirname + '/images/ePrompto_png.png',
        titleBarStyle: 'hiddenInset',
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }

    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    ticketWindow.close();
    // ticketWindow.on('close', function (e) {
    //   //ticketWindow = null;
    //   if(process.platform != 'darwin')
    //        app.quit();
    // });

});

ipcMain.on('thank_back_to_main', function (e, form_data) {

    mainWindow = new BrowserWindow({
        // width: 330,
        // height: 520,
        // icon: __dirname + '/images/ePrompto_png.png',
        // x: width - 450,
        // y: 190,
        // webPreferences: {
        //     nodeIntegration: true
        // }
        width: 280,
        height: 300,
        x: width - (280 + 15),
        // y: 420,
        y: height - (300 + 40),
        icon: __dirname + '/images/ePrompto_png.png',
        titleBarStyle: 'hiddenInset',
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }

    });

    mainWindow.setMenuBarVisibility(false);

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    categoryWindow.close();
    // categoryWindow.on('close', function (e) {
    //   categoryWindow = null;
    // });

});

ipcMain.on('update_is_itam_policy', function (e, form_data) {
    var body = JSON.stringify({ "funcType": 'update_itam_policy', "clientId": form_data['clientID'] });
    const request = net.request({
        method: 'POST',
        url: root_url + '/main.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            //console.log(`${chunk}`);

            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    console.log(obj);
                    if (obj.status == 'invalid') {
                        log.info('Error occured on updating itam policy');
                    }

                } catch (e) {
                    return console.log('update_itam_policy: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error occured on updating client master ' + `${(error)}`);
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

});


app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

ipcMain.on('app_version', (event) => {
    //logEverywhere('In AppVersion'); 
    event.sender.send('app_version', { version: app.getVersion() });
});

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});
//autoUpdater.on('update-downloaded', () => {
//updateDownloaded = true;
//mainWindow.webContents.send('update_downloaded');
//});

// ipcMain.on('restart_app', () => {
//   autoUpdater.quitAndInstall();
// });

autoUpdater.on('update-downloaded', () => {
    autoUpdater.quitAndInstall();
    // notifier.notify(
    //   {
    //     title: 'ITAM Version 4.1.1 Released. Click to Restart Application.', //put version number of future release. not current.
    //     message: 'ITAM will be Updated on Application Restart.',
    //     icon: path.join(app.getAppPath(), '/images/ePrompto.ico'),
    //     sound: true,
    //     wait: true, 
    //     appID: "Click to restart Application"
    //   },
    //   function (err, response, metadata) {
    //     // console.log(response);
    //     // console.log(err);
    //     if(response == undefined){
    //       console.log("auto updater quit and install function called.")
    //       autoUpdater.quitAndInstall();
    //     }

    //   }
    // );

    // console.log(app.getVersion()); // temp
    // title:'ITAM Version'+AppVersionNumber+'Released. Click to Restart Application.'

});

ipcMain.on('checkfmfselected', function (e, form_data) {
    //logEverywhere('In checkfmfselected'); 
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "funcType": 'checkfmfselected', "sys_key": cookies[0].name });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/findmyfile.php'
                        });
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                // console.log(`${chunk}`)                //comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        if (obj.status == 'valid') {
                                            // logEverywhere('Valid:Find');
                                            var asset_id = obj.result.asset_id;
                                            var search_type = obj.result.search_type;
                                            var scheduled_date_from = obj.result.scheduled_date_from;
                                            var scheduled_date_to = obj.result.scheduled_date_to;
                                            var mem_client_id = obj.result.member_client_id;
                                            var mem_user_id = obj.result.member_user_id;
                                            var today = obj.result.current_date;
                                            global.fmf_asset_id = obj.result.fmf_asset_id;
                                            var result = [];
                                            if (search_type != 2) { // 2 mean Scheduled search.
                                                getsearchparameter(asset_id, mem_client_id, mem_user_id, fmf_asset_id, function (events) {
                                                    //   logEverywhere('getsearchparameter');
                                                    if (events == 'success') {
                                                        console.log('hello created');
                                                        result['response'] = 'success';
                                                        result['fmf_asset_id'] = fmf_asset_id;
                                                        //  e.reply('filecreated', result);

                                                        try {
                                                            child = spawn("powershell.exe", ["C:\\ITAMEssential\\findmyfile.ps1"]);
                                                            // logEverywhere('execFMFscript1111++');
                                                            child.on("exit", function () {
                                                                console.log("Find My File Powershell Script finished");
                                                                readFMFCSV(fmf_asset_id);

                                                            });
                                                            child.stdin.end(); //end input
                                                        } catch (error) {
                                                            logEverywhere(`ERROR at 4092: ${error}`)
                                                        }
                                                    }
                                                });
                                            } else {
                                                if (scheduled_date_from <= today && scheduled_date_to >= today) {
                                                    getsearchparameter(asset_id, mem_client_id, mem_user_id, fmf_asset_id, function (events) {
                                                        // logEverywhere('getsearchparameter1');
                                                        if (events == 'success') {
                                                            console.log('hello created');
                                                            result['response'] = 'success';
                                                            result['fmf_asset_id'] = fmf_asset_id;
                                                            //  e.reply('filecreated', result);

                                                            try {
                                                                child = spawn("powershell.exe", ["C:\\ITAMEssential\\findmyfile.ps1"]);
                                                                // logEverywhere('execFMFscript1111++');
                                                                child.on("exit", function () {
                                                                    console.log("Find My File Powershell Script finished");
                                                                    readFMFCSV(fmf_asset_id);
                                                                });
                                                                child.stdin.end(); //end input
                                                            } catch (error) {
                                                                    logEverywhere(`ERROR at 4115: ${error}`)
                                                            }
                                                        }
                                                    });
                                                }
                                            }
                                        }
                                    } catch (e) {
                                        return console.log('checkfmfselected: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                }).catch((error) => {
                    // console.log(error)            // comment out
                })

        }
    });
});

var getsearchparameter = function (asset_id, mem_client_id, mem_user_id, fmf_asset_id, callback) {
    console.log('hee');
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            var body = JSON.stringify({ "funcType": 'getsearchparameter', "asset_id": asset_id, "mem_client_id": mem_client_id, "mem_user_id": mem_user_id, "fmf_asset_id": fmf_asset_id });
            const request = net.request({
                method: 'POST',
                url: root_url + '/findmyfile.php'
            });
            request.on('response', (response) => {

                response.on('data', (chunk) => {
                    //  console.log(`${chunk}`);         // comment out

                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            if (obj.status == 'valid') {
                                file_name = obj.result.file_folder_name;
                                if (obj.result.extension_name != '') {
                                    ///extention = "('*."+obj.result.extension_name+"')";
                                    extention = obj.result.extension_name;
                                } else {
                                    //extention ="('.pyc','.js','.csv','.txt','.php','.sql')";
                                    extention = "$Null";
                                }

                                if (obj.result.search_from_date != '') {
                                    start_date = "'" + obj.result.search_from_date + "'"; //format is M/D/Y
                                } else {
                                    start_date = "'1/1/2000'";
                                }

                                if (obj.result.search_to_date != '') {
                                    end_date = "'" + obj.result.search_to_date + "'"; //format is M/D/Y
                                } else {
                                    end_date = "(Get-Date).AddDays(1).ToString('MM-dd-yyyy')";
                                }

                                if (obj.result.exclude_parameter != null && obj.result.exclude_parameter != '') {
                                    excluded_parameter = "(" + obj.result.exclude_parameter + ")";
                                } else {
                                    excluded_parameter = '';
                                }

                                //exclude path
                                if (obj.result.excludepath != null && obj.result.excludepath != '') {
                                    //excludepath = "('."+obj.result.excludepath+"')";
                                    excludepath = obj.result.excludepath;
                                } else {
                                    //excludepath ='"^C:\\Program Files","^C:\\Windows"';
                                    excludepath = '';
                                }

                                content = "$Drives     = Get-PSDrive -PSProvider 'FileSystem'" + '\n' + "$Filename   = '" + file_name + "'" + '\n' +
                                    "$IncludeExt = " + extention + '\n' + "$StartDate  =  " + start_date + '\n' + "$EndDate    =  " + end_date + '\n' + "$excludepath = " + excludepath + '\n' +
                                    "$Ignore = @('.dll','.drv','.reg','.frm','.wdgt','.cur','.admx','.ftf','.ani','.iconpackage','.ebd','.desklink','.htt','.icns','.clb','.vga',\
                    '.vx','.dvd','.dmp','.theme','.mdmp','.pk2','.nfo','.scr','.ion','.pck','.ico','.qvm','.nt','.sys','.73u','.inf_LOC','.library-MS','.hiv','.cpl',\
                    '.asec','.sfcache','.RC1','.msc','.manifest','.prop','.fota','.pat','.bin','.cab','.000','.itemdata-ms','.mui','.ci','.zone.identifier','.cgz',\
                    '.prefpane','.lockfile','.rmt','.ffx','.pwl','.service','.edj','.CM0012','.Bash_history','.H1s','.DRPM','.TIMER','.DAT','.ELF','.MTZ','.BASH_PROFILE','.WDF','.SDB','.MLC','.DRV',\
                    '.bio','.msstyles','.cm0013','.h','.hpp','.H1s','.bmp', '.mum','.cat','.pyc','.tmp')"+ '\n' +
                                    "if($excludepath.Count -eq 0){ $excludepath_1 = '^Z:\\Does_not_exist'; $excludepath_2 = '^Z:\\Does_not_exist'; $excludepath_3 = '^Z:\\Does_not_exist'; $excludepath_4 = '^Z:\\Does_not_exist'; $excludepath_5 = '^Z:\\Does_not_exist'; } elseif($excludepath.Count -eq 1){ $excludepath_1 = $excludepath[0]; $excludepath_2 = '^Z:\\Does_not_exist'; $excludepath_3 = '^Z:\\Does_not_exist'; $excludepath_4 = '^Z:\\Does_not_exist'; $excludepath_5 = '^Z:\\Does_not_exist'; } elseif($excludepath.Count -eq 2){ $excludepath_1 = $excludepath[0]; $excludepath_2 = $excludepath[1]; $excludepath_3 = '^Z:\\Does_not_exist'; $excludepath_4 = '^Z:\\Does_not_exist'; $excludepath_5 = '^Z:\\Does_not_exist'; } elseif($excludepath.Count -eq 3){ $excludepath_1 = $excludepath[0]; $excludepath_2 = $excludepath[1]; $excludepath_3 = $excludepath[2]; $excludepath_4 = '^Z:\\Does_not_exist'; $excludepath_5 = '^Z:\\Does_not_exist'; } elseif($excludepath.Count -eq 4){ $excludepath_1 = $excludepath[0]; $excludepath_2 = $excludepath[1]; $excludepath_3 = $excludepath[2]; $excludepath_4 = $excludepath[3]; $excludepath_5 = '^Z:\\Does_not_exist'; } elseif($excludepath.Count -eq 5){ $excludepath_1 = $excludepath[0]; $excludepath_2 = $excludepath[1]; $excludepath_3 = $excludepath[2]; $excludepath_4 = $excludepath[3]; $excludepath_5 = $excludepath[4]; }" + '\n' +
                                    "$ExcludeUserExt= " + excluded_parameter + '\n' +
                                    "$GCIArgs = @{Path    = $Drives.Root" + '\n' + "Recurse = $True" + '\n' + "}" + '\n' +
                                    "If ($Null -ne $IncludeExt) {" + '\n' + "$GCIArgs.Add('Include',$IncludeExt)" + '\n' + "}" + '\n' +
                                    "Get-ChildItem @GCIArgs | Where-Object { $_.FullName -notmatch $excludepath_1 }| Where-Object { $_.FullName -notmatch $excludepath_2 }| Where-Object { $_.FullName -notmatch $excludepath_3 }| Where-Object { $_.FullName -notmatch $excludepath_4 }| Where-Object { $_.FullName -notmatch $excludepath_5 }| Where-Object { ($Ignore -notcontains $_.Extension)} |  Where-Object{($ExcludeUserExt -notcontains $_.Extension)} | Where-Object {($_.BaseName -match $Filename )} | Where-Object{ ($_.lastwritetime -ge $StartDate) -and ($_.lastwritetime -le $EndDate) } | " + '\n' +
                                    "foreach{" + '\n' +
                                    "$Item = $_.Basename" + '\n' +
                                    "$Path = $_.FullName" + '\n' +
                                    "$Type = $_.Extension" + '\n' +
                                    "$Modified=$_.LastWriteTime" + '\n' +
                                    "$Age = $_.CreationTime" + '\n' +
                                    "$Length= $_.Length" + '\n' +
                                    "$Type = &{if($_.PSIsContainer){'Folder'}else{$_.Extension}}" + '\n' +
                                    "$Path | Select-Object @{n='Name';e={$Item}}," + '\n' +
                                    "@{n='Created';e={$Age}}," + '\n' +
                                    "@{n='filePath';e={$Path}}," + '\n' +
                                    "@{n='Size';e={if ($Length -ge 1GB)" + '\n' +
                                    "{" + '\n' +
                                    "'{0:F2} GB' -f ($Length / 1GB)" + '\n' +
                                    "}" + '\n' +
                                    "elseif ($Length-ge 1MB)" + '\n' +
                                    "{" + '\n' +
                                    "'{0:F2} MB' -f ($Length / 1MB)" + '\n' +
                                    "}" + '\n' +
                                    "elseif ($Length -ge 1KB)" + '\n' +
                                    "{" + '\n' +
                                    "'{0:F2} KB' -f ($Length / 1KB)" + '\n' +
                                    "}" + '\n' +
                                    "else" + '\n' +
                                    "{" + '\n' +
                                    "'{0} bytes' -f $Length" + '\n' +
                                    "}" + '\n' +
                                    "}}," + '\n' +
                                    "@{n='Modified Date';e={$Modified}}," + '\n' +
                                    "@{n='Folder/File';e={$Type}}" + '\n' +
                                    "}| Export-Csv C:\\ITAMEssential\\EventLogCSV\\findmyfile.csv -NoTypeInformation ";

                                const path1 = 'C:/ITAMEssential/findmyfile.ps1';
                                fs.writeFile(path1, content, function (err) {
                                    if (err) {
                                        throw err;
                                    } else {
                                        console.log('File created');
                                        //logEverywhere('PS1.File');
                                        events = 'success';
                                        callback(events);
                                    }
                                });
                            }
                        } catch (e) {
                            return console.log('getsearchparameter: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                console.log(`ERROR: ${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();
        }
    });
}

// ipcMain.on('execFMFscript',function(e,form_data){ 

//   //const command = `Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -File "C:\\ITAMEssential\\findmyfile.ps1"' -Verb RunAs`;

// // Spawn the PowerShell process with 'runas'
// //  child = spawn(command, {
// //   shell: true,
// //   windowsHide: true // Hide the PowerShell window if needed
// // });
//   child = spawn("powershell.exe",["C:\\ITAMEssential\\findmyfile.ps1"]);
//   logEverywhere('execFMFscript1111++');
//   child.on("exit",function(){
//       console.log("Find My File Powershell Script finished");
//       readFMFCSV(form_data['fmf_asset_id']);
//   });
//   child.stdin.end(); //end input
// });

function readFMFCSV(fmf_asset_id) {
    //logEverywhere('readFMFCSV'+fmf_asset_id);
    var filepath = 'C:\\ITAMEssential\\EventLogCSV\\findmyfile.csv';
    if (fs.existsSync(filepath)) {
        var final_arr = [];
        var new_Arr = [];
        var ultimate = [];
        const converter = csv()
            .fromFile(filepath)
            .then((json) => {
                console.log('In Filepath readFMF')
                if (json != []) {
                    for (j = 0; j < json.length; j++) {
                        new_Arr = [json[j]['Name'], json[j]['Created'], json[j]['filePath'], json[j]['Size'], json[j]['Modified Date'], json[j]['Folder/File']];
                        ultimate.push(new_Arr);
                    }

                    //  if(excludepath.length >0){ //temp
                    //   for(i = 0; i < $excludepath.length; $i++){
                    //       if(excludepath[i].match(filepath[i])){
                    //         excludepath[i]=null
                    //       }
                    //     } 
                    //     }
                    console.log('ultimate' + ultimate);


                    require('dns').resolve('www.google.com', function (err) {
                        if (err) {
                            console.log("No connection");
                        } else {
                            var body = JSON.stringify({ "funcType": 'insertFindMyFile', "fmf_asset_id": fmf_asset_id, "events": ultimate });
                            const request = net.request({
                                method: 'POST',
                                url: root_url + '/findmyfile.php'
                            });
                            request.on('response', (response) => {
                                console.log(`STATUS: ${response.statusCode}`)
                                response.on('data', (chunk) => {
                                    console.log(`${chunk}`);
                                })
                                response.on('end', () => {
                                    if (filepath != "") { // if filepath has been passed and uploading done
                                        fs.unlinkSync(filepath); // This deletes the created csv
                                    }
                                })
                            })
                            request.on('error', (error) => {
                                console.log(`ERROR: ${(error)}`)
                            })
                            request.setHeader('Content-Type', 'application/json');
                            request.write(body, 'utf-8');
                            request.end();
                        }
                    });
                }
            })
    }
}

ipcMain.on('check_copy_my_files_request2', function (e, form_data) {
    //logEverywhere('In CMFile');
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "sys_key": cookies[0].name });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/copy_my_files.php'
                        });
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                //  console.log(`${chunk}`);         // comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        if (obj.status == 'valid') {

                                            UploadFilePath = obj.result.location_path; //"D:\\temp_files\\Powershell_SSH_test.txt";

                                            //  If a folder is found , to send it to the desired server it is converted into a zip file then sent over.
                                            if (obj.result.extension_name == 'Folder') {
                                                UploadFileName = obj.result.file_folder_name;
                                                content = "Compress-Archive -Path " + UploadFilePath + ". -DestinationPath " + UploadFilePath + ".zip";
                                                UploadFilePath = UploadFilePath + ".zip";
                                                UploadFileName = UploadFileName + ".zip";
                                                const path3 = 'C:/ITAMEssential/folder_zip.ps1';
                                                fs.writeFile(path3, content, function (err) {
                                                    if (err) {
                                                        // throw err;
                                                        logEverywhere(`ERROR at 4389: ${err}`)
                                                    } else {
                                                        try {
                                                            console.log('Zip Script File Created');
                                                            child = spawn("powershell.exe", ["C:\\ITAMEssential\\folder_zip.ps1"]);
                                                            child.on("exit", function () {
                                                                console.log("Powershell Upload Script finished");
                                                                child.stdin.end(); //end input
                                                            });
                                                        } catch (error) {
                                                            logEverywhere(`ERROR at 4399: ${error}`)
                                                        }
                                                    }
                                                });

                                            }
                                            else {
                                                UploadFileName = obj.result.file_folder_name + obj.result.extension_name;
                                            }

                                            console.log(UploadFilePath);
                                            CopyId = obj.result.copy_id;
                                            console.log(CopyId);

                                            // Ext=obj.result.extension_name;
                                            //Compress-Archive -Path C:\path\to\file\. -DestinationPath C:\path\to\archive.zip

                                            UploadURL = global.root_url + "/itam_copy_my_files.php?req_id=" + CopyId + "&lid=" + obj.login_user;
                                            // UploadURL = "https://developer.eprompto.com/itam_backend_end_user/itam_copy_my_files.php?req_id="+CopyId+"&ext="+obj.result.extension_name+"&lid="+obj.login_user;

                                            content = "$FilePath = '" + UploadFilePath + "'" + '\n' + "$URL ='" + UploadURL + "'" + '\n' +
                                                "$fileBytes = [System.IO.File]::ReadAllBytes($FilePath);" + '\n' +
                                                "$fileEnc = [System.Text.Encoding]::GetEncoding('UTF-8').GetString($fileBytes);" + '\n' +
                                                "$boundary = [System.Guid]::NewGuid().ToString(); " + '\n' +
                                                "$LF = \"`r`n\";" + '\n' +

                                                "$bodyLines = ( \"--$boundary\", \"Content-Disposition: form-data; name=`\"file`\"; filename=`\"" + UploadFileName + "`\"\", \"Content-Type: application/octet-stream$LF\", $fileEnc, \"--$boundary--$LF\" ) -join $LF" + '\n' +

                                                "Invoke-RestMethod -Uri $URL -Method Post -ContentType \"multipart/form-data; boundary=`\"$boundary`\"\" -Body $bodyLines"

                                            const path2 = 'C:/ITAMEssential/upload.ps1';
                                            fs.writeFile(path2, content, function (err) {
                                                if (err) {
                                                    // throw err;
                                                    logEverywhere(`ERROR at 4433: ${err}`)
                                                } else {
                                                    try {
                                                        console.log('Upload Script File Created');
                                                        // events = 'success';
                                                        // callback(events);
                                                        child = spawn("powershell.exe", ["C:\\ITAMEssential\\upload.ps1"]);
                                                        child.on("exit", function () {
                                                            console.log("Powershell Upload Script finished");
                                                            child.stdin.end(); //end input
    
                                                            if (obj.result.extension_name == 'Folder') {
                                                                fs.unlinkSync(UploadFilePath);
                                                                console.log("File Unlinked");
                                                            }
                                                        });
                                                    } catch (error) {
                                                        logEverywhere(`ERROR at 4450: ${error}`)
                                                    }
                                                }
                                            });
                                        }
                                    } catch (e) {
                                        return console.log('check_copy_my_files_request2: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
});

//-----------------------------------Execution Policy Script Start Here : ------------------------------------------------------------------

ipcMain.on('executionPolicyScript', function (e) {
    console.log("Inside Execution Policy Script");

    const path30 = 'C:/ITAMEssential/excutionPolicy.bat';
    const bat_file_path = 'C:\\\\ITAMEssential\\\\excutionPolicy.bat';
    const ps1_file_path = 'C:\\ITAMEssential\\excutionPolicyNew.ps1';
    const deskstopPath = 'C:/ITAMEssential/';
    const powershell_path1 = 'C:\ITAMEssential';

    fs.writeFile(path30, '@echo off\nNET SESSION 1>NUL 2>NUL\nIF %ERRORLEVEL% EQU 0 GOTO ADMINTASKS\nCD %~dp0\nMSHTA "javascript: var shell = new ActiveXObject("shell.application"); shell.ShellExecute("' + bat_file_path + '", "", "", "runas", 0); close();"\n:ADMINTASKS\npowershell.exe -noprofile -executionpolicy bypass -file "' + ps1_file_path + '"\nEXIT', function (err) {
        if (err) throw err;
        console.log('Bat File is created successfully.');
    });
    //content = "Set-ExecutionPolicy Remotesigned\nSet-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass";
    content = "Function Check-RunAsAdministrator()\n{\n#Get current user context\n$CurrentUser = New-Object Security.Principal.WindowsPrincipal $([Security.Principal.WindowsIdentity]::GetCurrent())\n#Check user is running the script is member of Administrator Group\nif($CurrentUser.IsInRole([Security.Principal.WindowsBuiltinRole]::Administrator))\n{\nWrite-host 'Script is running with Administrator privileges!'\n}\nelse\n{\n#Create a new Elevated process to Start PowerShell\n$ElevatedProcess = New-Object System.Diagnostics.ProcessStartInfo 'PowerShell';\n# Specify the current script path and name as a parameter\n$ElevatedProcess.Arguments = '& " + powershell_path1 + "\\excutionPolicyNew.ps1'\n#Set the Process to elevated\n$ElevatedProcess.Verb = 'runas'\n#Start the new elevated process\n[System.Diagnostics.Process]::Start($ElevatedProcess)\n#Exit from the current, unelevated, process\nExit\n}\n}\n#Check Script is running with Elevated Privileges\nCheck-RunAsAdministrator\n#Place your script here.\nSet-ExecutionPolicy Remotesigned\nSet-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Remotesigned\nSet-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass\n#Dependencies for Backup Place Your Scripts Here";

    const path28 = deskstopPath + '/excutionPolicyNew.ps1';
    //child = spawn("powershell.exe",["C:\\Users\\shitals\\Desktop\\exep1.bat"]);

    fs.writeFile(path28, content, function (err) {
        if (err) {
            // throw err;
            logEverywhere(`ERROR at 4498: ${err}`)
        } else {
            try {
                console.log('Upload Script File Created');
                child = spawn("powershell.exe", ["C:\\ITAMEssential\\excutionPolicy.bat"]);
    
                child.on("exit", function () {
                    console.log("Powershell exep1 Script finished");
    
    
                });
                child.stdin.end(); //end input
            } catch (error) {
                logEverywhere(`ERROR at 4511: ${error}`)
            }
        }
    });

});

//-----------------------------------Execution Policy Script End Here : --------------------------------------------------------------------


// ------------------------------ Preventive Maintenance Starts here : ------------------------------------------------------------


function Preventive_Maintenance_Main(form_data, pm_type) {
    console.log("Preventive Maintenance Type: " + pm_type);
    //logEverywhere('In Preventive_Maintenance_Main');

    console.log('inside Preventive_Maintenance_Main function');

    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
            console.log("++++++++++++++++++++" + err);

            var filepath = "C:/ITAMEssential/lock_call.txt";
            fs.readFile(filepath, 'utf-8', (err, data) => {
                // logEverywhere('In Read Lock File');
                if (err) {
                    // logEverywhere('An error ocurred reading the file');
                    console.log("An error ocurred reading the file :" + err.message);
                    return;
                }

                // Change how to handle the file content
                console.log("The file content is : " + data);

                var lock_string = data[16] + data[17] + data[18];
                console.log(lock_string);
                if (lock_string = 'yes') {
                    //  logEverywhere('Execute Lock Screen On local');
                    exec("Rundll32.exe user32.dll,LockWorkStation", (error, stdout, stderr) => {
                        // if (error) {
                        //     console.log(`error: ${error.message}`);
                        //     return;
                        // }
                        // if (stderr) {
                        //     console.log(`stderr: ${stderr}`);
                        //     return;
                        // }
                        console.log('ERROR ln 4539:', {error, stderr})
                        // console.log(`stdout: ${stdout}`);
                    });
                }

            });
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "funcType": 'getPreventiveMaintenanceList', "sys_key": cookies[0].name, "maintenance_type": pm_type });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/preventive_maintenance.php'
                        });
                        console.log(cookies[0].name);
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);         // comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        if (obj.status == 'valid') {
                                            console.log(obj.result.message);
                                            if (obj.result.script_type == 'Simple') {
                                                global.stdoutputArray = [];

                                                if (chunk.includes(obj.result.process_name)) {
                                                    console.log('++++++++++++++++=');
                                                    if (obj.result.script_id == 15) {
                                                        var filepath = "C:/ITAMEssential/lock_call.txt";// you need to save the filepath when you open the file to update without use the filechooser dialog againg
                                                        var content = "is_locked_req = yes";
                                                        fs.writeFile(filepath, content, (err) => {
                                                            //   logEverywhere('write is_locked_req = yes');

                                                            if (err) {
                                                                //logEverywhere('Error in lock write file');
                                                                console.log("An error ocurred updating the file :" + err.message);
                                                                console.log(err);
                                                                return;
                                                            }
                                                            console.log("The file has been succesfully saved");
                                                            // logEverywhere('The file has been succesfully saved in lock');
                                                        });
                                                    }
                                                    if (obj.result.script_id == 16) {
                                                        var filepath = "C:/ITAMEssential/lock_call.txt";// you need to save the filepath when you open the file to update without use the filechooser dialog againg
                                                        var content = "is_locked_req = no";

                                                        fs.writeFile(filepath, content, (err) => {
                                                            //  logEverywhere('write is_locked_req = no');
                                                            if (err) {
                                                                //  logEverywhere('Error in unlock updating the file');
                                                                console.log("An error ocurred updating the file :" + err.message);
                                                                console.log(err);
                                                                return;
                                                            }
                                                            console.log("The file has been succesfully saved");
                                                            // logEverywhere('The file has been succesfully saved in unlock');
                                                        });
                                                    }
                                                    if (obj.result.script_id == 17 || obj.result.script_id == 18) {
                                                        dialog.showMessageBox(null, {
                                                            title: 'Message',
                                                            message: obj.result.message,
                                                        });

                                                        const output_data = [];
                                                        output_data['activity_id'] = obj.result.activity_id;
                                                        output_data['asset_id'] = obj.result.asset_id;
                                                        output_data['script_id'] = obj.result.script_id;
                                                        // output_data['login_user']   = obj.result.login_user;
                                                        output_data['maintenance_id'] = obj.result.maintenance_id;

                                                        output_data['script_status'] = 'Completed';
                                                        output_data['script_remark'] = 'Maintainance Activity Performed Successfully on this device';
                                                        output_data['result_data'] = '';
                                                        output_data['pm_type'] = pm_type;
                                                        updatePreventiveMaintenance(output_data);

                                                    }
                                                    else {
                                                        exec(obj.result.script_path, function (error, stdout, stderr) // works properly
                                                        {
                                                            const output_data = [];
                                                            output_data['activity_id'] = obj.result.activity_id;
                                                            output_data['asset_id'] = obj.result.asset_id;
                                                            output_data['script_id'] = obj.result.script_id;
                                                            // output_data['login_user']   = obj.result.login_user;
                                                            output_data['maintenance_id'] = obj.result.maintenance_id;
                                                            output_data['pm_type'] = pm_type;

                                                            if (error) {
                                                                console.log("error");
                                                                output_data['script_status'] = 'Failed';
                                                                output_data['script_remark'] = 'Failed to perform Maintainance Activity on this device.';
                                                                output_data['result_data'] = error;
                                                                output_data['pm_type'] = pm_type;
                                                                updatePreventiveMaintenance(output_data);
                                                                return;
                                                            };

                                                            global.stdoutputArray.push(stdout);

                                                            output_data['script_status'] = 'Completed';
                                                            output_data['script_remark'] = 'Maintainance Activity Performed Successfully on this device';
                                                            output_data['result_data'] = global.stdoutputArray;
                                                            updatePreventiveMaintenance(output_data);
                                                        });
                                                    }
                                                    // console.log(global.stdoutputArray);
                                                    // UnArray = global.stdoutputArray[0];
                                                    // console.log(UnArray);
                                                    // console.log(stdoutputArray);
                                                    // updatePreventiveMaintenance(global.stdoutputArray); // stdoutputArray has all the outputs. They'll be sent to Send_PM_StdOutput to be uploaded

                                                }
                                            }

                                            const output_data = [];
                                            output_data['activity_id'] = obj.result.activity_id;
                                            output_data['asset_id'] = obj.result.asset_id;
                                            output_data['script_id'] = obj.result.script_id
                                            output_data['maintenance_id'] = obj.result.maintenance_id;
                                            output_data['login_user'] = obj.result.login_user;
                                            output_data['script_status'] = "Completed";
                                            output_data['pm_type'] = pm_type;
                                            output_data['script_remark'] = 'Maintainance Activity Performed Successfully on this device';


                                            // Complex Bat Scripts
                                            if (chunk.includes("Browser Cache")) {
                                                Preventive_Maintenance_Complex_Scripts('Browser Cache', output_data);
                                            }
                                            if (chunk.includes('Windows Cache')) {
                                                Preventive_Maintenance_Complex_Scripts('Windows Cache', output_data);
                                            }
                                            if (chunk.includes('Force Change Password')) {
                                                Preventive_Maintenance_Complex_Scripts('Force Change Password', output_data);
                                            }
                                            if (chunk.includes('Enable Password Expiry')) {
                                                Preventive_Maintenance_Complex_Scripts('Enable Password Expiry', output_data);
                                            }
                                            if (chunk.includes('Disable Password Expiry')) {
                                                Preventive_Maintenance_Complex_Scripts('Disable Password Expiry', output_data);
                                            }

                                            // Powershell Scripts:
                                            if (chunk.includes('Security Log')) {
                                                Preventive_Maintenance_Powershell_Scripts('Security Log', output_data);
                                            }
                                            if (chunk.includes('Antivirus Details')) {
                                                Preventive_Maintenance_Powershell_Scripts('Antivirus Details', output_data);
                                            }
                                            if (chunk.includes('Bit Locker')) {
                                                Preventive_Maintenance_Powershell_Scripts('Bit Locker', output_data);
                                            }
                                            if (chunk.includes('Windows Update')) {
                                                Preventive_Maintenance_Powershell_Scripts('Windows Update', output_data);
                                            }
                                            if (chunk.includes('Enable USB Ports')) {
                                                Preventive_Maintenance_Powershell_Scripts('Enable USB Ports', output_data);
                                            }
                                            if (chunk.includes('Disable USB Ports')) {
                                                Preventive_Maintenance_Powershell_Scripts('Disable USB Ports', output_data);
                                            }
                                        }
                                    } catch (e) {
                                        return console.log('getPreventiveMaintenanceList: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { });
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`);
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
    // }});
}

//Function to update remark, response of bat file and status based on bat file runs or not.
function updatePreventiveMaintenance(output) {
    console.log("Inside updatePreventiveMaintenance function");
    console.log('pm Body++++++=' + output);
    var body = JSON.stringify({
        "funcType": 'updateActivity',
        "result_data": output['result_data'],
        "asset_id": output['asset_id'],
        "script_id": output['script_id'],
        "login_user": output['login_user'],
        "maintenance_id": output['maintenance_id'],
        "activity_id": output['activity_id'],
        "script_status": output['script_status'],
        "script_remark": output['script_remark'],
        "pm_type": output['pm_type']
    });

    const request = net.request({
        method: 'POST',
        url: root_url + '/preventive_maintenance.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            // console.log(chunk);
            console.log(chunk.toString('utf8'));
            // arr.push(...chunk.toString('utf8'));
            // console.log(arr);
        })
        response.on('end', () => {

            global.stdoutputArray = []; // Emptying array to stop previous result from getting used

        });
    })
    request.on('error', (error) => {
        log.info('Error while updating PM outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};

function Preventive_Maintenance_Complex_Scripts(Process_Name, output_res = []) {
    console.log('In PM Complex Script' + Process_Name);
    if (Process_Name == 'Browser Cache') {
        console.log('In browser cache');
        content1 = "@echo off" + '\n' +
            "set LOGFILE=C:\\ITAMEssential\\EventLogCSV\\Browser_Cache_Clear.csv" + '\n' +
            "call :LOG > %LOGFILE%" + '\n' +
            "exit /B" + '\n' +
            ":LOG" + '\n' +
            "set ChromeDir=C:\\Users\\%USERNAME%\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Cache" + '\n' +
            "del /q /s /f \"%ChromeDir%\"" + '\n' +
            "rd /s /q \"%ChromeDir%\"" + '\n' +
            "set edgeDir=C:\\Users\\%USERNAME%\\AppData\\Microsoft\\Edge\\User Data\\Default\\Cache" + '\n' +
            "del /q /s /f \"%edgeDir%\"" + '\n' +
            "rd /s /q \"%edgeDir%\"" + '\n' +
            "set DataDir=C:\\Users\\%USERNAME%\\AppData\\Local\\Mozilla\\Firefox\\Profiles" + '\n' +
            "del /q /s /f \"%DataDir%\"" + '\n' +
            "rd /s /q \"%DataDir%\"" + '\n' +
            "for /d %%x in (C:\\Users\\%USERNAME%\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\*) do del /q /s /f %%x\\*sqlite" + '\n' +
            "set DataDir=C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Intern~1" + '\n' +
            "del /q /s /f \"%DataDir%\"" + '\n' +
            "rd /s /q \"%DataDir%\"" + '\n' +
            "set History=C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\History" + '\n' +
            "del /q /s /f \"%History%\"" + '\n' +
            "rd /s /q \"%History%\"" + '\n' +
            "set IETemp=C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\Windows\\Tempor~1" + '\n' +
            "del /q /s /f \"%IETemp%\"" + '\n' +
            "rd /s /q \"%IETemp%\"" + '\n' +
            "set Cookies=C:\\Users\\%USERNAME%\\AppData\\Roaming\\Microsoft\\Windows\\Cookies" + '\n' +
            "del /q /s /f \"%Cookies%\"" + '\n' +
            "rd /s /q \"%Cookies%\"" + '\n' +
            "C:\\bin\\regdelete.exe HKEY_CURRENT_USER \"Software\\Microsoft\\Internet Explorer\\TypedURLs\""
        //Creating the script:
        console.log(content1);
        const path1 = 'C:/ITAMEssential/Browser_Cache.bat';
        fs.writeFile(path1, content1, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 4838: ${err}`)
            } else {
                try {
                    console.log('Browser_Cache.bat Created');
                    // Execution part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Browser_Cache.bat"]);
                    child.on("exit", function () {
                        console.log('++++++++++++++++++++' + output_res);
                        console.log("Browser Cache Script Executed");
                        setTimeout(function () {
                            readPMCSV("Browser_Cache", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 4853: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Windows Cache') {

        console.log('Windows Cache username');
        const username = os.userInfo().username;
        console.log('yyy' + username);
        content2 = `@echo off
set LOGFILE=C:\\ITAMEssential\\EventLogCSV\\Windows_Cache_Clear.csv
call :LOG > %LOGFILE%
exit /B
:LOG
del /s /f /q C:\\Windows\\Temp\\
del /s /f /q C:\\Users\\${username}\\appdata\\local\\temp\\`;


        //Creating the script:
        const path2 = 'C:/ITAMEssential/Windows_Cache.bat';
        fs.writeFile(path2, content2, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 4882: ${err}`)
            } else {
                try {
                    console.log('Windows_Cache.bat Created');
                    // Execution part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Windows_Cache.bat"]);
                    child.on("exit", function () {
                        console.log("Windows Cache Script Executed");
                        setTimeout(function () {
                            readPMCSV("Windows_Cache", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 4896: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Force Change Password') {
        content4 = "@echo off" + '\n' +
            ":: BatchGotAdmin" + '\n' +
            ":-------------------------------------" + '\n' +
            "REM  --> Check for permissions" + '\n' +
            "    IF \"%PROCESSOR_ARCHITECTURE%\" EQU \"amd64\" (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\SysWOW64\\cacls.exe\" \"%SYSTEMROOT%\\SysWOW64\\config\\system\"" + '\n' +
            ") ELSE (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\system32\\cacls.exe\" \"%SYSTEMROOT%\\system32\\config\\system\"" + '\n' +
            ")" + '\n' +
            "REM --> If error flag set, we do not have admin." + '\n' +
            "if '%errorlevel%' NEQ '0' (" + '\n' +
            "    echo Requesting administrative privileges..." + '\n' +
            "    goto UACPrompt" + '\n' +
            ") else ( goto gotAdmin )" + '\n' +
            ":UACPrompt" + '\n' +
            "    echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\\getadmin.vbs\"" + '\n' +
            "    set params= %*" + '\n' +
            "    echo UAC.ShellExecute \"cmd.exe\", \"/c \"\"%~s0\"\" %params:\"=\"\"%\", \"\", \"runas\", 1 >> \"%temp%\\getadmin.vbs\"" + '\n' +
            "    \"%temp%\\getadmin.vbs\"" + '\n' +
            "    del \"%temp%\\getadmin.vbs\"" + '\n' +
            "    exit /B" + '\n' +
            ":gotAdmin" + '\n' +
            "    pushd \"%CD%\"" + '\n' +
            "    CD /D \"%~dp0\"" + '\n' +
            ":--------------------------------------" + '\n' +
            "set LOGFILE=C:\\ITAMEssential\\EventLogCSV\\logonpasswordchg.csv" + '\n' +
            "call :LOG > %LOGFILE%" + '\n' +
            "exit /B" + '\n' +
            ":LOG" + '\n' +
            "net  user %USERNAME%  /logonpasswordchg:yes" + '\n' +
            "ECHO Force Change Password bat executed"
        //Creating the script:
        const path4 = 'C:/ITAMEssential/logonpasswordchg.bat';
        console.log('content4' + content4);
        fs.writeFile(path4, content4, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 4944: ${err}`)
            } else {
                try {
                    console.log('logonpasswordchg Bat File Created');
                    // Execution part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\logonpasswordchg.bat"]);
                    child.on("exit", function () {
                        console.log("logonpasswordchg Script Executed");
                        setTimeout(function () {
                            readPMCSV("logonpasswordchg", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 4958: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Enable Password Expiry') {
        content5 = "@echo off" + '\n' +
            ":: BatchGotAdmin" + '\n' +
            ":-------------------------------------" + '\n' +
            "REM  --> Check for permissions" + '\n' +
            "    IF \"%PROCESSOR_ARCHITECTURE%\" EQU \"amd64\" (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\SysWOW64\\cacls.exe\" \"%SYSTEMROOT%\\SysWOW64\\config\\system\"" + '\n' +
            ") ELSE (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\system32\\cacls.exe\" \"%SYSTEMROOT%\\system32\\config\\system\"" + '\n' +
            ")" + '\n' +
            "REM --> If error flag set, we do not have admin." + '\n' +
            "if '%errorlevel%' NEQ '0' (" + '\n' +
            "    echo Requesting administrative privileges..." + '\n' +
            "    goto UACPrompt" + '\n' +
            ") else ( goto gotAdmin )" + '\n' +
            ":UACPrompt" + '\n' +
            "    echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\\getadmin.vbs\"" + '\n' +
            "    set params= %*" + '\n' +
            "    echo UAC.ShellExecute \"cmd.exe\", \"/c \"\"%~s0\"\" %params:\"=\"\"%\", \"\", \"runas\", 1 >> \"%temp%\\getadmin.vbs\"" + '\n' +
            "    \"%temp%\\getadmin.vbs\"" + '\n' +
            "    del \"%temp%\\getadmin.vbs\"" + '\n' +
            "    exit /B" + '\n' +
            ":gotAdmin" + '\n' +
            "    pushd \"%CD%\"" + '\n' +
            "    CD /D \"%~dp0\"" + '\n' +
            ":--------------------------------------" + '\n' +
            "set LOGFILE=C:\\ITAMEssential\\EventLogCSV\\EnablePasswordExpiry.csv" + '\n' +
            "call :LOG > %LOGFILE%" + '\n' +
            "exit /B" + '\n' +
            ":LOG" + '\n' +
            "wmic useraccount where name=\"%USERNAME%\" set passwordexpires=true" + '\n' +
            "ECHO EnablePasswordExpiry bat executed"
        //Creating the script:
        const path5 = 'C:/ITAMEssential/EnablePasswordExpiry.bat';
        fs.writeFile(path5, content5, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5005: ${err}`)
            } else {
                try {
                    console.log('EnablePasswordExpiry Bat File Created');
                    // Execution part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\EnablePasswordExpiry.bat"]);
                    child.on("exit", function () {
                        console.log("EnablePasswordExpiry Script Executed");
                        setTimeout(function () {
                            readPMCSV("EnablePasswordExpiry", output_res);
                        }, 20000);//20 secs
                        // readPMCSV("EnablePasswordExpiry", output_res); // To upload CSV function
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5020: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Disable Password Expiry') {
        content5 = "@echo off" + '\n' +
            ":: BatchGotAdmin" + '\n' +
            ":-------------------------------------" + '\n' +
            "REM  --> Check for permissions" + '\n' +
            "    IF \"%PROCESSOR_ARCHITECTURE%\" EQU \"amd64\" (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\SysWOW64\\cacls.exe\" \"%SYSTEMROOT%\\SysWOW64\\config\\system\"" + '\n' +
            ") ELSE (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\system32\\cacls.exe\" \"%SYSTEMROOT%\\system32\\config\\system\"" + '\n' +
            ")" + '\n' +
            "REM --> If error flag set, we do not have admin." + '\n' +
            "if '%errorlevel%' NEQ '0' (" + '\n' +
            "    echo Requesting administrative privileges..." + '\n' +
            "    goto UACPrompt" + '\n' +
            ") else ( goto gotAdmin )" + '\n' +
            ":UACPrompt" + '\n' +
            "    echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\\getadmin.vbs\"" + '\n' +
            "    set params= %*" + '\n' +
            "    echo UAC.ShellExecute \"cmd.exe\", \"/c \"\"%~s0\"\" %params:\"=\"\"%\", \"\", \"runas\", 1 >> \"%temp%\\getadmin.vbs\"" + '\n' +
            "    \"%temp%\\getadmin.vbs\"" + '\n' +
            "    del \"%temp%\\getadmin.vbs\"" + '\n' +
            "    exit /B" + '\n' +
            ":gotAdmin" + '\n' +
            "    pushd \"%CD%\"" + '\n' +
            "    CD /D \"%~dp0\"" + '\n' +
            ":--------------------------------------" + '\n' +
            "set LOGFILE=C:\\ITAMEssential\\EventLogCSV\\DisablePasswordExpiry.csv" + '\n' +
            "call :LOG > %LOGFILE%" + '\n' +
            "exit /B" + '\n' +
            ":LOG" + '\n' +
            "wmic useraccount where name=\"%USERNAME%\" set passwordexpires=false" + '\n' +
            "ECHO DisablePasswordExpiry bat executed"
        //Creating the script:
        const path5 = 'C:/ITAMEssential/DisablePasswordExpiry.bat';
        fs.writeFile(path5, content5, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5067: ${err}`)
            } else {
                try {
                    console.log('DisablePasswordExpiry Bat File Created');
                    // Execution part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\DisablePasswordExpiry.bat"]);
                    child.on("exit", function () {
                        console.log("DisablePasswordExpiry Script Executed");
                        setTimeout(function () {
                            readPMCSV("DisablePasswordExpiry", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5081: ${error}`)
                }
            }
        });
    }
}


function Preventive_Maintenance_Powershell_Scripts(Process_Name, output_res = []) {
    const path4 = 'C:/ITAMEssential/PM_execSecurity.bat';
    const path5 = 'C:/ITAMEssential/PM_execAntivirus.bat';
    const path8 = 'C:/ITAMEssential/EnableUSBPorts.bat';
    const path9 = 'C:/ITAMEssential/DisableUSBPorts.bat';
    const path13 = 'C:/ITAMEssential/Bitlocker.bat';
    const path15 = 'C:/ITAMEssential/WindowsUpdate.bat';
    if (Process_Name == 'Security Log') {

        // BATCH FILE FOR BYPASSING EXECUTION POLICY:                
        fs.writeFile(path4, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\PM_Security.ps1', function (err) {
            if (err) throw err;
            console.log('Security Bypass Bat is created successfully.');
        });

        // Powershell Script content for Security and Antivirus:

        content3 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "exit;" + '\n' +
            "}" + '\n' +
            "Get-EventLog -LogName security | Select TimeGenerated,InstanceID,Message -First 10 | Out-File -Encoding ASCII -FilePath C:\\ITAMEssential\\EventLogCSV\\PM_Security.csv"

        // Powershell Script File Creation and Bat Execution for Security and Antivirus:  
        const path6 = 'C:/ITAMEssential/PM_Security.ps1';
        fs.writeFile(path6, content3, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5122: ${err}`)
            } else {
                try {
                    console.log('Security Powershell Script File Created');
    
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\PM_execSecurity.bat"]);
                    child.on("exit", function () {
                        console.log("Security bat executed");
                        setTimeout(function () {
                            readPMCSV("Security_Log", output_res); // To upload CSV function
                            // },20000);//20 secs
                        }, 60000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5138: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Antivirus Details') {
        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path5, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\PM_Antivirus.ps1', function (err) {
            if (err) throw err;
            console.log('Antivirus Bypass Bat is created successfully.');
        });
        // Powershell Script content for Security and Antivirus:
        content4 = "Get-WmiObject -Namespace root\\SecurityCenter2 -Class AntiVirusProduct | Select DisplayName,Timestamp | Where-Object { $_ -notlike '*Windows Defender*' } |  Out-File -Encoding ASCII -FilePath C:\\ITAMEssential\\EventLogCSV\\PM_Antivirus_Details.csv"
        // Powershell Script File Creation and Bat Execution for Security and Antivirus:  
        const path7 = 'C:/ITAMEssential/PM_Antivirus.ps1';
        fs.writeFile(path7, content4, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5161: ${error}`)
            } else {
                try {
                    console.log('Antivirus Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\PM_execAntivirus.bat"]);
                    child.on("exit", function () {
                        console.log("Antivirus bat executed");
                        setTimeout(function () {
                            readPMCSV("Antivirus_Details", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5175: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Disable USB Ports') {
        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path9, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\DisableUSBPorts.ps1', function (err) {
            if (err) throw err;
            console.log('Antivirus Bypass Bat is created successfully.');
        });
        content5 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "exit;" + '\n' +
            "}" + '\n' +
            "REG ADD HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR /v Start /t REG_DWORD /d 4 /f | Out-File -FilePath C:\\ITAMEssential\\EventLogCSV\\DisableUSBPorts.csv"
        // Powershell Script File Creation and Execution for DisableUSBPorts:
        const path10 = 'C:/ITAMEssential/DisableUSBPorts.ps1';
        fs.writeFile(path10, content5, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5201: ${err}`)
            } else {
                try {
                    console.log('DisableUSBPorts Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\DisableUSBPorts.bat"]);
                    child.on("exit", function () {
                        console.log("DisableUSBPorts ps1 executed");
                        setTimeout(function () {
                            readPMCSV("DisableUSBPorts", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5215: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Enable USB Ports') {
        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path8, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\EnableUSBPorts.ps1', function (err) {
            if (err) throw err;
            console.log('Antivirus Bypass Bat is created successfully.');
        });
        content6 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "exit;" + '\n' +
            "}" + '\n' +
            "REG ADD HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\USBSTOR /v Start /t REG_DWORD /d 3 /f | Out-File -FilePath C:\\ITAMEssential\\EventLogCSV\\EnableUSBPorts.csv"
        // Powershell Script File Creation and Execution for EnableUSBPorts:
        const path11 = 'C:/ITAMEssential/EnableUSBPorts.ps1';
        fs.writeFile(path11, content6, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                output_res['pm_type'] = pm_type;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5241: ${err}`)
            } else {
                try {
                    console.log('EnableUSBPorts Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\EnableUSBPorts.bat"]);
                    child.on("exit", function () {
                        console.log("EnableUSBPorts ps1 executed");
                        setTimeout(function () {
                            readPMCSV("EnableUSBPorts", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5255: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Bit Locker') {
        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path13, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\Bitlocker.ps1', function (err) {
            if (err) throw err;
            console.log('Bitlocker Bypass Bat is created successfully.');
        });
        content7 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "exit;" + '\n' +
            "}" + '\n' +
            "Get-BitLockerVolume | Format-Table @{L='Drives';E={$_.MountPoint}},LockStatus |  Out-File -Encoding ASCII -FilePath C:\\ITAMEssential\\EventLogCSV\\Bitlocker.csv"
        // Powershell Script File Creation and Execution for EnableUSBPorts:
        const path14 = 'C:/ITAMEssential/Bitlocker.ps1';
        fs.writeFile(path14, content7, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5280: ${err}`)
            } else {
                try {
                    console.log('Bitlocker Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Bitlocker.bat"]);
                    child.on("exit", function () {
                        console.log("Bitlocker ps1 executed");
                        setTimeout(function () {
                            readPMCSV("Bitlocker", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5294: ${error}`)
                }
            }
        });
    }
    if (Process_Name == 'Windows Update') {
        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path15, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\WindowsUpdate.ps1', function (err) {
            if (err) throw err;
            console.log('WindowsUpdate Bypass Bat is created successfully.');
        });
        content8 = "(Get-HotFix | Select Description,InstalledOn | Sort-Object -Property InstalledOn)[-1] | Out-File -Encoding ASCII -FilePath C:\\ITAMEssential\\EventLogCSV\\WindowsUpdate.csv"
        // Powershell Script File Creation and Execution for EnableUSBPorts:
        const path16 = 'C:/ITAMEssential/WindowsUpdate.ps1';
        fs.writeFile(path16, content8, function (err) {
            if (err) {
                output_res['script_status'] = 'Failed';
                output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device. Failed to write bat file.';
                output_res['result_data'] = err;
                updatePreventiveMaintenance(output_res);
                // throw err;
                logEverywhere(`ERROR at 5315: ${err}`)
            } else {
                try {
                    console.log('WindowsUpdate Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\WindowsUpdate.bat"]);
                    child.on("exit", function () {
                        console.log("WindowsUpdate ps1 executed");
                        setTimeout(function () {
                            readPMCSV("WindowsUpdate", output_res); // To upload CSV function
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 5329: ${error}`)
                }
            }
        });
    }
}


function readPMCSV(CSV_name, output_res = []) {

    console.log(CSV_name);
    console.log('inside readPMCSV function');

    var filepath1 = 'C:\\ITAMEssential\\EventLogCSV\\PM_Security.csv';
    var filepath2 = 'C:\\ITAMEssential\\EventLogCSV\\PM_Antivirus_Details.csv';
    var filepath3 = 'C:\\ITAMEssential\\EventLogCSV\\Browser_Cache_Clear.csv';
    var filepath4 = 'C:\\ITAMEssential\\EventLogCSV\\Windows_Cache_Clear.csv';
    var filepath5 = 'C:\\ITAMEssential\\EventLogCSV\\Bitlocker.csv';
    var filepath6 = 'C:\\ITAMEssential\\EventLogCSV\\logonpasswordchg.csv';
    var filepath7 = 'C:\\ITAMEssential\\EventLogCSV\\EnablePasswordExpiry.csv';
    var filepath8 = 'C:\\ITAMEssential\\EventLogCSV\\DisablePasswordExpiry.csv';
    var filepath9 = 'C:\\ITAMEssential\\EventLogCSV\\EnableUSBPorts.csv';
    var filepath10 = 'C:\\ITAMEssential\\EventLogCSV\\DisableUSBPorts.csv';
    var filepath11 = 'C:\\ITAMEssential\\EventLogCSV\\WindowsUpdate.csv';

    // filepath1 for Security
    // filepath2 for Antivirus

    // see readSecurityCSVFile
    if (CSV_name == "Security_Log" || CSV_name == "Windows_Cache" || CSV_name == "Browser_Cache" || CSV_name == 'Antivirus_Details' || CSV_name == "Bitlocker" || CSV_name == "logonpasswordchg" || CSV_name == "EnablePasswordExpiry" || CSV_name == "DisablePasswordExpiry" || CSV_name == "EnableUSBPorts" || CSV_name == "DisableUSBPorts" || CSV_name == "WindowsUpdate") {

        newFilePath = (CSV_name == 'Security_Log') ? filepath1 : (CSV_name == 'Windows_Cache') ? filepath4 : (CSV_name == 'Browser_Cache') ? filepath3 : (CSV_name == 'Antivirus_Details') ? filepath2 : (CSV_name == 'logonpasswordchg') ? filepath6 : (CSV_name == 'EnablePasswordExpiry') ? filepath7 : (CSV_name == 'DisablePasswordExpiry') ? filepath8 : (CSV_name == 'EnableUSBPorts') ? filepath9 : (CSV_name == 'DisableUSBPorts') ? filepath10 : (CSV_name == 'WindowsUpdate') ? filepath11 : filepath5; // filepath5 is Bitlocker

        if (fs.existsSync(newFilePath)) {
            var final_arr = [];
            var new_Arr = [];
            var ultimate = [];
            const converter = csv({ noheader: true, output: "line" })
                .fromFile(newFilePath)
                .then((json) => {
                    if (json != []) {
                        if (CSV_name == "EnablePasswordExpiry" || CSV_name == "DisablePasswordExpiry" || CSV_name == "Windows_Cache" || CSV_name == "Browser_Cache" || CSV_name == "logonpasswordchg" || CSV_name == "EnableUSBPorts" || CSV_name == "DisableUSBPorts") {
                            new_Arr = 'Property(s) update successful';
                            ultimate.push(new_Arr);
                            json = ultimate;
                        }
                        //  console.log(output_res);
                        console.log(json);
                        require('dns').resolve('www.google.com', function (err) {
                            if (err) {
                                console.log("No connection");
                            } else {
                                console.log(output_res); // comment out
                                var body = JSON.stringify({
                                    "funcType": 'updateActivity',
                                    "result_data": json,
                                    "asset_id": output_res['asset_id'],
                                    "script_id": output_res['script_id'],
                                    "login_user": output_res['login_user'],
                                    "maintenance_id": output_res['maintenance_id'],
                                    "activity_id": output_res['activity_id'],
                                    "script_status": output_res['script_status'],
                                    "script_remark": output_res['script_remark'],
                                    "pm_type": output_res['pm_type']
                                });
                                console.log('body' + body);
                                const request = net.request({
                                    method: 'POST',
                                    url: root_url + '/preventive_maintenance.php'
                                });
                                request.on('response', (response) => {
                                    console.log(`STATUS: ${response.statusCode}`)
                                    response.on('data', (chunk) => {
                                        console.log(`${chunk}`);
                                        console.log(chunk);
                                    })

                                    response.on('end', () => {
                                        if (newFilePath != "") { // if filepath has been passed and uploading done
                                            fs.unlinkSync(newFilePath); // This deletes the created csv
                                        }
                                    })
                                })
                                request.on('error', (error) => {
                                    console.log(`ERROR: ${(error)}`)
                                })
                                request.setHeader('Content-Type', 'application/json');
                                request.write(body, 'utf-8');
                                request.end();
                            }
                        });
                    }
                })
        } else {
            console.log("No CSV found at path " + newFilePath);
            output_res['script_status'] = 'Failed';
            output_res['script_remark'] = 'Permission not given in time/Permission Denied.';
            output_res['result_data'] = null;
            updatePreventiveMaintenance(output_res);
        }; // update for: if permission not given in time or no output found at output location
    } else {
        console.log("CSV_name incorrect");
        output_res['script_status'] = 'Failed';
        output_res['script_remark'] = 'Failed to perform Maintainance Activity on this device.';
        output_res['result_data'] = null;
        updatePreventiveMaintenance(output_res);
    } // update for: if function called without proper CSV_name
}



// ------------------------------ Patch Management Starts here : ------------------------------------------------------------

function Patch_Management_Main(form_data, pm_type) {
    //logEverywhere('In Patch_Management_Main');

    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {

                    si.system()
                        .then(systemInfo => {
                            const globalDeviceId = systemInfo.uuid;
                            console.log('PM Device ID:', globalDeviceId);


                            if (cookies.length > 0) {

                                var body = JSON.stringify({ "funcType": 'getPatchManagementList', "sys_key": cookies[0].name, "maintenance_type": pm_type, "system_device_id": globalDeviceId });
                                const request = net.request({
                                    method: 'POST',
                                    url: root_url + '/patch_management.php'
                                }); console.log(cookies[0].name);
                                request.on('response', (response) => {

                                    response.on('data', (chunk) => {
                                        console.log(`${chunk}`);         // comment out

                                        if (chunk) {
                                            let a;
                                            try {
                                                var obj = JSON.parse(chunk);
                                                if (obj.status == 'valid') {

                                                    const output_data = [];
                                                    output_data['management_id'] = obj.result.management_id;
                                                    output_data['patch_management_type'] = obj.result.patch_management_type;
                                                    output_data['login_user'] = obj.result.login_user;


                                                    // To Powershell Scripts
                                                    if (obj.result.patch_management_type == 'Gap Analysis') {
                                                        Patch_Management_Scripts('Last Installed Windows Update', output_data);
                                                    }

                                                    if (obj.result.patch_management_type == 'Gap Analysis') {
                                                        Patch_Management_Scripts('Available Pending Updates', output_data);
                                                    }

                                                    if (chunk.includes('Quick Update')) // Including optional drivers updates
                                                    {
                                                        Patch_Management_Scripts('Install_All_Updates_Available', output_data);
                                                    }

                                                    if (chunk.includes('Install_Specific_Updates')) {
                                                        Patch_Management_Scripts('Install_Specific_Updates', output_data);
                                                    }

                                                    if (chunk.includes('Uninstall_Updates')) {
                                                        Patch_Management_Scripts('Uninstall_Updates', output_data);
                                                    }
                                                }
                                            } catch (e) {
                                                return console.log('getPatchManagementList: No proper response received'); // error in the above string (in this case, yes)!
                                            }
                                        }
                                    })
                                    response.on('end', () => { });
                                })
                                request.on('error', (error) => {
                                    console.log(`ERROR: ${(error)}`);
                                })
                                request.setHeader('Content-Type', 'application/json');
                                request.write(body, 'utf-8');
                                request.end();
                            }

                        });



                });
        };
    });
}


function Patch_Management_Specific(form_data, pm_type) {
    console.log("Patch Management Type: " + pm_type);
    // logEverywhere('In Patch_Management_Specific');
    console.log('inside Patch_Management_Specific');

    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log(err);
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "funcType": 'getPatchManagementList_Specific', "sys_key": cookies[0].name, "maintenance_type": pm_type });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/patch_management.php'
                        });
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);         // comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        if (obj.status == 'valid') {

                                            const output_data = [];
                                            // output_data['patch_id'] = obj.result.patch_id;
                                            // output_data['asset_id']    = obj.result.asset_id;
                                            // output_data['patch_management_type']   = obj.result.patch_management_type;             
                                            // output_data['pm_status'] = "Completed";             


                                            output_data['update_id'] = obj.result.update_id;
                                            output_data['management_id'] = obj.result.management_id;
                                            output_data['login_user'] = obj.result.login_user;
                                            output_data['action_type'] = obj.result.action_type;
                                            output_data['KBArticleID'] = obj.result.kb_id;

                                            // console.log("Action Type is "+obj.result.action_type);
                                            // console.log("KB_ID is "+obj.result.kb_id);
                                            // console.log("Update_ID is "+obj.result.update_id);



                                            // To Powershell Scripts
                                            if (obj.result.action_type.includes('Install')) {
                                                Patch_Management_Scripts('Install_Specific_Update', output_data);
                                            }

                                            if (obj.result.action_type.includes('Uninstall')) {
                                                Patch_Management_Scripts('Uninstall_Specific_Update', output_data);
                                            }
                                        }
                                    } catch (e) {
                                        return console.log('getPatchManagementList_Specific: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { });
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`);
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
}


// ------------------------------ Backup Files Starts here : ------------------------------------------------------------
const file_lists = [];
function backupMyFiles(localPath, remotePath, conn) {
    var backupIncrementalFiles = [];
    conn.sftp((err, sftp) => {
        if (err) throw err;
        // Get list of local files
        const localFiles = fs.readdirSync(localPath);
        // Get list of remote files
        sftp.readdir(remotePath, (err, remoteFiles) => {
            if (err) {
                // If directory doesn't exist, create it
                if (err.code === 2) {
                    sftp.mkdir(remotePath, (err) => {
                        if (err) throw err;
                    });
                } else {
                    throw err;
                }
            }

            // Check for modified files
            localFiles.forEach((localFile) => {
                const localStats = fs.statSync(localPath + localFile);
                const remoteFile = remoteFiles.find((file) => file.filename === localFile);
                if (!remoteFile || localStats.size > remoteFile.attrs.size) {
                    // Copy modified file to server
                    console.log('In Backup sftp localFiles : ' + localFile);

                    const readStream = fs.createReadStream(localPath + localFile);
                    const writeStream = sftp.createWriteStream(remotePath + localFile);
                    if (readStream.pipe(writeStream)) {
                        console.log("Here");
                        backupIncrementalFiles.push({
                            'file_name': localFile,
                            'file_size': localStats.size,
                            'file_created_on': localStats.atime,
                            'file_modified_on': localStats.mtime,
                            'file_date': localStats.ctime,
                            'file_birthtime': localStats.birthtime
                        });
                    }
                }
            });

        });
    });

    return backupIncrementalFiles;
}
// function deleteFile(localPath, remotePath, conn) {
//   const remoteFile = remotePath + '/' + path.basename(localPath);
//   conn.exec('rm ' + remoteFile, (err, stream) => {
//     if (err) throw err;
//     stream.on('close', () => {
//       console.log('File deleted from CentOS server');
//     });
//   });
// }
ipcMain.on('check_backup_files_request', function (e) {
    // logEverywhere('In BFR');
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Backup Call');
        //logEverywhere('Inside Backup Call');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Backup Cookies");
                        console.log(cookies[0].name);

                        var body = JSON.stringify({ "sys_key": cookies[0].name, 'functionType': 'get_list' });

                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/backup_files.php'
                        });
                        request.on('response', (response) => {
                            // console.log(response);
                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);         // comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        console.log(obj);
                                        if (obj.status == 'valid') {
                                            var bck_server_details = obj.result.backup_connect
                                            var file_extension = obj.result.file_extension;
                                            var file_path = obj.result.file_path;
                                            var login_user_id = obj.result.asset_id;
                                            var file_extension_arr = obj.result.file_extension_arr;
                                            const output_data = [];
                                            UploadFileName = obj.result.file_path;
                                            UploadFileExt = obj.result.file_extension;
                                            UploadFileAsset = obj.result.asset_id;

                                            var destinationFolder = bck_server_details.folder_path; //server actual path where files being copied
                                            var hostName = bck_server_details.server_url; //server url where backup files needs to copy
                                            var bckUserName = bck_server_details.server_user; //server url where backup files needs to copy
                                            var bckPassword = bck_server_details.server_password; //server url where backup files needs to copy

                                            var backupResult = [];

                                            const conn = new Client();


                                            conn.connect({
                                                host: hostName,
                                                port: 22,
                                                username: bckUserName,
                                                password: bckPassword
                                            });

                                            conn.on('ready', () => {
                                                console.log('In Backup New');
                                                // Backup files on button click
                                                const localPath = UploadFileName;
                                                const remotePath = destinationFolder;
                                                console.log('In Backup After taking path');
                                                // console.log(remotePath);
                                                // console.log(localPath);
                                                backupResult = backupMyFiles(localPath, remotePath, conn);

                                                // const watcher = chokidar.watch('/path/to/watched/directory', {
                                                //   ignored: /(^|[\/\\])\../, // ignore dotfiles
                                                //   persistent: true
                                                // });

                                                // // Delete file on server if deleted locally
                                                // watcher.on('unlink', (localPath) => {
                                                //   deleteFile(localPath, remotePath, conn);
                                                // });

                                                output_data["backup_id"] = obj.result.bf_id;
                                                output_data['bf_asset_id'] = obj.result.bf_asset_id;
                                                output_data["remote_path"] = destinationFolder;

                                                output_data["frequency"] = obj.result.frequency;
                                                output_data['functionType'] = 'update_backup_status';

                                                setTimeout(function () {
                                                    output_data["list_of_files"] = backupResult;
                                                    updateBackupDetails(output_data);
                                                }, 10000);

                                            });



                                        }
                                    } catch (e) {
                                        return console.log('get_list: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
});


// for failed scripts
function updateBackupDetails(output_data = []) {
    console.log("Inside updateBackupDetails function for success scripts");
    console.log(output_data);

    var body = JSON.stringify({
        "backup_id": output_data['backup_id'],
        "bf_asset_id": output_data['bf_asset_id'],
        "remote_path": output_data['remote_path'],
        "frequency": output_data['frequency'],
        "status": "Success",
        "list_of_files": output_data['list_of_files'],
        'functionType': 'update_backup_status'
    });
    console.log(body);
    const request = net.request({
        method: 'POST',
        url: root_url + '/backup_files.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
            console.log("Inside chunk");
        })
        response.on('end', () => {

            // global.stdoutputArray = []; // Emptying array to stop previous result from getting used

        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Backup outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};

// ---------------------------------Backup Files Ends here : ---------------------------------------------------------------- 

ipcMain.on('loadAllocDepartment', function (e, data) {
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside loadAllocDepartment Call');
        if (err) {
            console.log("No connection");
        } else {

            console.log('User Id' + data.user_id);
            var body = JSON.stringify({ "funcType": 'getAllocDepartment', "user_id": data.user_id });
            const request = net.request({
                method: 'POST',
                url: root_url + '/login.php'
            });
            console.log('Before chunk: ');
            request.on('response', (response) => {
                //console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            console.log('chunk: ' + chunk);
                            console.log(obj.status)
                            if (obj.status == 'valid') {
                                e.reply('setAllocDepartment', obj.result);
                            } else {
                                e.reply('setAllocDepartment', '');
                            }
                        } catch (e) {
                            return console.log('getAllocDepartment: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                log.info('Error while getting allocated Department detail ' + `${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();

        };
    });
});

// ------------------------------ Uninstall App when asset is scrap code Starts here : ------------------------------------------------------------


function check_scrap_asset_request() {
    //  logEverywhere('In CSAR');
    require('dns').resolve('www.google.com', function (err) {
        //  logEverywhere('Inside Scrap Asset Call');
        if (err) {
            // logEverywhere("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        //logEverywhere("Inside Scrap Asset Cookies");

                        console.log(cookies[0].name);
                        //   logEverywhere(cookies[0].name);
                        var body = JSON.stringify({ "sys_key": cookies[0].name, "functionType": 'get_scrap_asset' });
                        // console.log(body);
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/scrap_asset.php'
                        });
                        request.on('response', (response) => {
                            //  console.log(response);
                            response.on('data', (chunk) => {
                                // console.log(`${chunk}`);         // comment out
                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        console.log(obj);
                                        //  logEverywhere(obj);
                                        if (obj.status == 'valid') {
                                            //  logEverywhere("Inside Scrap Asset In Valid");             

                                            if (process.platform === 'win32') {
                                                // logEverywhere('Hello win32');
                                                //  logEverywhere(app.getPath('exe'));
                                                console.log(app.getPath('exe'));
                                                try {                                                  
                                                    exec(`"C:\\Users\\%USERNAME%\\AppData\\Local\\Programs\\eprompto-ITAM\\Uninstall eprompto-ITAM.exe" --uninstall`, (err, stdout, stderr) => {
                                                        console.log(err);
                                                        console.log(stdout);
                                                        console.log(stderr);
                                                        //   logEverywhere("err: "+err);
                                                        // logEverywhere("stdout: "+stdout);
                                                        //logEverywhere("stderr: "+stderr);
                                                        if (err) {
                                                            //logEverywhere('Error uninstalling app');
                                                            console.log(`Error uninstalling app: ${err}`);
                                                        } else {
                                                            const output_data = [];
                                                            //If successfuly execute ps file then update itam status
                                                            // output_data["asset_id"] = obj.result.asset_id;
                                                            console.log(obj.result.asset_id);
                                                            //  logEverywhere(obj.result.asset_id);
                                                            console.log(`Uninstalled app successfully: ${stdout}`);
                                                            update_scrap_status(obj.result.asset_id);
                                                            //  logEverywhere('Uninstalled app successfully');
                                                            console.log(`Uninstalled app successfully: ${stdout}`);
                                                        }
                                                    });
                                                } catch (error) {
                                                    console.log('ERROR ln 5854:',error)
                                                }
                                            } else {
                                                console.log('Uninstalling app is not supported on this platform.');
                                            }



                                        }
                                        else {
                                            //logEverywhere("Inside Scrap Asset In Valid Else Part");   
                                        }
                                    } catch (e) {
                                        return console.log('get_scrap_asset: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
}


function update_scrap_status(asset_id) {
    //logEverywhere('Inside update_scrap_status function for success scripts');
    console.log("Inside update_scrap_status function for success scripts");

    var body = JSON.stringify({
        "asset_id": asset_id,
        'functionType': 'update_scrap_status'
    });

    const request = net.request({
        method: 'POST',
        url: root_url + '/scrap_asset.php'
    });
    request.on('response', (response) => {

        response.on('data', (chunk) => {
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    //  logEverywhere(obj.message); 
                    //  logEverywhere(obj.sql); 
                    console.log(obj.sql);
                } catch (e) {
                    return console.log('update_scrap_status: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => {

            // global.stdoutputArray = []; // Emptying array to stop previous result from getting used

        });
    })
    request.on('error', (error) => {
        log.info('Error while updating scrap asset status ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};

// ---------------------------------Uninstall App when asset is scrap code Ends here : ---------------------------------------------------------------- 


//-----------------------------------Hide App Start Here : ------------------------------------------------------------------

ipcMain.on('hideEpromptoApp', function (e) {
    console.log("Inside Hide App");
    content = "$RegPaths = @(\n'HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',\n'HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*',\n'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'\n)\n$AppsToHide = @(\n'*Node.js*',\n'*eprompto-ITAM " + versionItam + "*'\n)\nforeach ($App in $AppsToHide) {\nforeach ($Path in $RegPaths) {\n$AppKey = (Get-ItemProperty $Path -ErrorAction SilentlyContinue| Where-Object { $_.DisplayName -like $($App) }).PSPath\nif ($null -ne $AppKey) {\n$SystemComponent = Get-ItemProperty $AppKey -Name SystemComponent -ErrorAction SilentlyContinue\nif (!($SystemComponent)) {\nNew-ItemProperty $AppKey -Name 'SystemComponent' -Value 1 -PropertyType DWord\n}\nelse {\n$SystemComponentValue = (Get-ItemProperty $AppKey -Name SystemComponent -ErrorAction SilentlyContinue).SystemComponent\nif ($SystemComponentValue -eq 0) {\nSet-ItemProperty '$AppKey' -Name 'SystemComponent' -Value 1\n}\n}\n}\n}\n}";

    const path27 = 'C:/ITAMEssential/hideapp.ps1';
    fs.writeFile(path27, content, function (err) {
        if (err) {
            // throw err;
            logEverywhere(`ERROR at 6023: ${err}`)
        } else {
            try {
                console.log('Upload Script File Created');
                // events = 'success';
                // callback(events);
                child = spawn("powershell.exe", ["C:\\ITAMEssential\\hideapp.ps1"]);
                child.on("exit", function () {
                    console.log("Powershell Upload Script finished");
                    child.stdin.end(); //end input
    
                });
            } catch (error) {
                logEverywhere(`ERROR at 6036: ${error}`)
            }
        }
    });
});

//-----------------------------------Hide App End Here : --------------------------------------------------------------------

// ------------------------------ Patch Management Starts here : ------------------------------------------------------------

function Patch_Management_Scripts(Process_Name, output_res = []) {

    console.log("Inside Patch_Management_Scripts function :");
    //logEverywhere("Inside Patch_Management_Scripts function :");
    // console.log(output_res);

    KBArticleID = output_res['KBArticleID'];

    const path15 = 'C:\\ITAMEssential\\WindowsUpdate.bat';
    const path17 = 'C:\\ITAMEssential\\PendingUpdates.bat';
    const path19 = 'C:\\ITAMEssential\\Install_All_Updates_Available.bat';
    const path21 = 'C:\\ITAMEssential\\Install_Specific_Update.bat';
    const path25 = 'C:\\ITAMEssential\\EventLogCSV\\Update-in-Progress.csv';

    fs.writeFile(path25, 'Update-in-Progress', function (err) {
        if (err) throw err;
        console.log('Update-in-Progress is created successfully.');
    });


    if (Process_Name == 'Last Installed Windows Update') {
        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path15, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\WindowsUpdate.ps1', function (err) {
            if (err) throw err;
            console.log('WindowsUpdate Bypass Bat is created successfully.');
        });
        content8 = "(Get-HotFix | Select Description,InstalledOn | Sort-Object -Property InstalledOn)[-1] | Export-csv -NoTypeInformation -Path C:\\ITAMEssential\\EventLogCSV\\Patch_Last_Update.csv"
        // Powershell Script File Creation and Execution
        const path16 = 'C:/ITAMEssential/WindowsUpdate.ps1';
        fs.writeFile(path16, content8, function (err) {
            if (err) {
                output_res['pm_status'] = 'Failed';
                output_res['remark'] = 'Failed to perform Patch Management Last Update on this device.';
                updatePatchManagement(output_res);
                // throw err;
                logEverywhere(`ERROR at 6081: ${err}`)
            } else {
                try {
                    console.log('WindowsUpdate Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\WindowsUpdate.bat"]);
                    child.on("exit", function () {
                        console.log("WindowsUpdate ps1 executed");
                        output_res['last_install_status'] = "Completed";
                        setTimeout(function () {
                            read_Patch_Management_CSV("Last_Update", output_res); // To upload CSV function
                        }, 10000);//10 secs                    
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 6096: ${error}`)
                }
            }
        });
    }

    if (Process_Name == 'Available Pending Updates') {
        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path17, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\PendingUpdates.ps1', function (err) {
            if (err) throw err;
            console.log('PendingUpdates Bypass Bat is created successfully.');
        });


        content9 = "$UpdateSearcher = New-Object -ComObject	 Microsoft.Update.Searcher" + '\n' +
            "$UpdateSearcher.Search(\"IsInstalled=0\").Updates | select  Title,@{ n = 'KB_id'; e = { 'KB'+$_.KBArticleIDs } }, @{ n=\"Category\"; e={$_.Categories[0]|Select Name}}, @{Name=\"maxdownloadsize\";Expression={[math]::round($_.maxdownloadsize/1MB)}},RebootRequired | Export-csv -NoTypeInformation -Path C:\\ITAMEssential\\EventLogCSV\\Patch_Pending_Updates.csv"

        const path18 = 'C:/ITAMEssential/PendingUpdates.ps1';
        fs.writeFile(path18, content9, function (err) {
            if (err) {
                output_res['pm_status'] = 'Failed';
                output_res['remark'] = 'Failed to perform Patch Management on this device.';
                updatePatchManagement(output_res);
                // throw err;
                logEverywhere(`ERROR at 6120: ${err}`)
            } else {
                try {
                    console.log('PendingUpdates Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\PendingUpdates.ps1"]);
                    child.on("exit", function () {
                        console.log("PendingUpdates ps1 executed");
    
                        output_res['pm_status'] = "In-progress";
                        read_Patch_Management_CSV("Update-in-Progress", output_res);
    
                        setTimeout(function () {
                            read_Patch_Management_CSV("Pending_Updates", output_res); // To upload CSV function
                        }, 20000);//20 secs 
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 6138: ${error}`)
                }
            }
        });
    }

    if (Process_Name == 'Install_All_Updates_Available') { // Including optional drivers updates


        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path19, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\Install_All_Updates.ps1', function (err) {
            if (err) throw err;
            console.log('Install_All_Updates Bypass Bat is created successfully.');
        });


        content9 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "  Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "  exit;" + '\n' +
            "}" + '\n' +
            "If(-not(Get-InstalledModule PSWindowsUpdate)){" + '\n' +
            "    echo \"Required dependencies do not exist. Installing now... Please wait a moment.\"" + '\n' +
            "    Install-PackageProvider -Name NuGet -Confirm:$false -Force" + '\n' +
            "    Install-Module PSWindowsUpdate -Confirm:$False -Force" + '\n' +
            "}" + '\n' +
            "else" + '\n' +
            "{" + '\n' +
            "    Install-WindowsUpdate -MicrosoftUpdate -AcceptAll -IgnoreReboot *>&1 | Export-csv -NoTypeInformation -Path C:\\ITAMEssential\\EventLogCSV\\Patch_Install_All_Updates.csv" + '\n' +
            "}"

        const path20 = 'C:/ITAMEssential/Install_All_Updates.ps1';
        fs.writeFile(path20, content9, function (err) {
            if (err) {
                output_res['pm_status'] = 'Failed';
                output_res['remark'] = 'Failed to perform Patch Management on this device.';
                updatePatchManagement(output_res);
                // throw err;
                logEverywhere(`ERROR at 6175: ${err}`)
            } else {
                try {
                    console.log('Install_All_Updates Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Install_All_Updates.ps1"]);
                    child.on("exit", function () {
                        console.log("Install_All_Updates ps1 executed");
    
    
                        output_res['pm_status'] = "In-progress";
                        read_Patch_Management_CSV("Update-in-Progress", output_res);
    
                        setTimeout(function () {
                            output_res['pm_status'] = "Completed";
                            read_Patch_Management_CSV("Install_All_Updates", output_res); // To upload CSV function
    
                        }, 4500000);// 1 hour 15 mins
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 6196: ${error}`)
                }
            }
        });
    }

    if (Process_Name == 'Install_Specific_Update') {

        console.log("INSIDE SPECIFIC UPDATE SCRIPT GENERATION");

        fs.writeFile(path21, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\Install_Specific_Updates.ps1', function (err) {
            if (err) throw err;
            console.log('Install_Specific_Update Bypass Bat is created successfully.');
        });



        content9 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "  Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "  exit;" + '\n' +
            "}" + '\n' +
            "If(-not(Get-InstalledModule PSWindowsUpdate)){" + '\n' +
            "    echo \"Required dependencies do not exist. Installing now... Please wait a moment.\"" + '\n' +
            "    Install-PackageProvider -Name NuGet -Confirm:$false -Force" + '\n' +
            "    Install-Module PSWindowsUpdate -Confirm:$False -Force" + '\n' +
            "}" + '\n' +
            "else" + '\n' +
            "{" + '\n' +
            "    Get-WindowsUpdate -KBArticleID '" + KBArticleID + "' -Install -AcceptAll -IgnoreReboot *>&1 | Export-csv -NoTypeInformation -Path C:\\ITAMEssential\\EventLogCSV\\Patch_Install_Specific_Update.csv" + '\n' +
            "}"

        const path22 = 'C:/ITAMEssential/Install_Specific_Updates.ps1';
        fs.writeFile(path22, content9, function (err) {
            if (err) {
                output_res['action_status'] = 'Completed';
                output_res['remark'] = 'Failed to perform Patch Management on this device.';
                updatePatchManagement(output_res);
                // throw err;
                logEverywhere(`ERROR at 6234: ${err}`)
            } else {
                try {
                    console.log('Install_Specific_Updates Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Install_Specific_Updates.ps1"]);
                    child.on("exit", function () {
                        console.log("Install_Specific_Updates ps1 executed");
    
    
                        output_res['action_status'] = "In-progress";
                        read_Patch_Management_CSV("Update-in-Progress-Specific", output_res);
    
                        setTimeout(function () {
                            output_res['action_status'] = "Completed";
                            output_res['remark'] = "Installation Complete";
                            read_Patch_Management_CSV("Install_Specific_Update", output_res); // To upload CSV function      
                            // },600000); // 10mins
                        }, 3600000);// 1 hour            
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 6256: ${error}`)
                }
            }
        });
    }

    if (Process_Name == 'Uninstall_Specific_Update') {

        KBArticleID = KBArticleID.replace('KB', '');


        output_res['action_status'] = "In-progress";
        read_Patch_Management_CSV("Update-in-Progress-Specific", output_res);


        content9 = "@echo off" + '\n' +
            ":: BatchGotAdmin" + '\n' +
            ":-------------------------------------" + '\n' +
            "REM  --> Check for permissions" + '\n' +
            "    IF \"%PROCESSOR_ARCHITECTURE%\" EQU \"amd64\" (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\SysWOW64\\cacls.exe\" \"%SYSTEMROOT%\\SysWOW64\\config\\system\"" + '\n' +
            ") ELSE (" + '\n' +
            ">nul 2>&1 \"%SYSTEMROOT%\\system32\\cacls.exe\" \"%SYSTEMROOT%\\system32\\config\\system\"" + '\n' +
            ")" + '\n' +
            "REM --> If error flag set, we do not have admin." + '\n' +
            "if '%errorlevel%' NEQ '0' (" + '\n' +
            "    echo Requesting administrative privileges..." + '\n' +
            "    goto UACPrompt" + '\n' +
            ") else ( goto gotAdmin )" + '\n' +
            ":UACPrompt" + '\n' +
            "    echo Set UAC = CreateObject^(\"Shell.Application\"^) > \"%temp%\\getadmin.vbs\"" + '\n' +
            "    set params= %*" + '\n' +
            "    echo UAC.ShellExecute \"cmd.exe\", \"/c \"\"%~s0\"\" %params:\"=\"\"%\", \"\", \"runas\", 1 >> \"%temp%\\getadmin.vbs\"" + '\n' +
            "    \"%temp%\\getadmin.vbs\"" + '\n' +
            "    del \"%temp%\\getadmin.vbs\"" + '\n' +
            "    exit /B" + '\n' +
            ":gotAdmin" + '\n' +
            "    pushd \"%CD%\"" + '\n' +
            "    CD /D \"%~dp0\"" + '\n' +
            ":--------------------------------------" + '\n' +
            "set LOGFILE=C:\\ITAMEssential\\EventLogCSV\\Patch_Uninstall_Specific.csv" + '\n' +
            "call :LOG > %LOGFILE%" + '\n' +
            "exit /B" + '\n' +
            ":LOG" + '\n' +
            "wusa.exe /uninstall /kb:" + KBArticleID + "" + '\n' +
            "ECHO Executed"

        const path24 = 'C:/ITAMEssential/Uninstall_Updates.bat';
        fs.writeFile(path24, content9, function (err) {
            if (err) {
                output_res['action_status'] = 'Completed';
                output_res['remark'] = 'Failed to perform Patch Management on this device.';
                updatePatchManagement(output_res);
                // throw err;
                logEverywhere(`ERROR at 6310: ${err}`)
            } else {
                try {
                    console.log('Uninstall_Updates Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Uninstall_Updates.bat"]);
                    child.on("exit", function () {
                        console.log("Uninstall_Updates ps1 executed");
                        setTimeout(function () {
                            read_Patch_Management_CSV("Uninstall_Updates", output_res); // To upload CSV function
                        }, 900000);//15 mins 
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 6324: ${err}`)
                }
            }
        });
    }
}

// read_Patch_Management_CSV('Last_Update')
function read_Patch_Management_CSV(CSV_name, output_res = []) {

    console.log('inside read_Patch_Manangement_CSV function');

    var filepath1 = 'C:\\ITAMEssential\\EventLogCSV\\Patch_Last_Update.csv';
    var filepath2 = 'C:\\ITAMEssential\\EventLogCSV\\Patch_Pending_Updates.csv';
    var filepath3 = 'C:\\ITAMEssential\\EventLogCSV\\Patch_Install_All_Updates.csv';
    var filepath4 = 'C:\\ITAMEssential\\EventLogCSV\\Patch_Install_Specific_Update.csv';
    var filepath5 = 'C:\\ITAMEssential\\EventLogCSV\\Patch_Uninstall_Specific.csv';
    var filepath6 = 'C:\\ITAMEssential\\EventLogCSV\\Update-in-Progress.csv';

    if (CSV_name == "Last_Update" || CSV_name == "Pending_Updates" || CSV_name == "Install_All_Updates" || CSV_name == 'Install_Specific_Update' || CSV_name == "Uninstall_Updates" || CSV_name == "Update-in-Progress" || CSV_name == "Update-in-Progress-Specific") {

        newFilePath = (CSV_name == 'Last_Update') ? filepath1 : (CSV_name == 'Pending_Updates') ? filepath2 : (CSV_name == 'Install_All_Updates') ? filepath3 : (CSV_name == 'Install_Specific_Update') ? filepath4 : (CSV_name == 'Uninstall_Updates') ? filepath5 : filepath6  // filepath6 is Update in progress for both all updates or specific update

        if (fs.existsSync(newFilePath)) {
            var final_arr = [];
            var new_Arr = [];
            var ultimate = [];
            const converter = csv()
                .fromFile(newFilePath)
                .then((json) => {
                    if (json != []) {

                        // console.log(CSV_name);
                        // console.log(json);

                        if (CSV_name == 'Last_Update') {
                            for (j = 0; j < json.length; j++) {
                                ultimate = [json[j]['Description'], json[j]['InstalledOn']];
                            }
                        }

                        if (CSV_name == 'Pending_Updates') {
                            for (j = 0; j < json.length; j++) {
                                new_Arr = [json[j]['Title'], json[j]['KB_id'], json[j]['Category'], json[j]['maxdownloadsize'], json[j]['RebootRequired']];
                                ultimate.push(new_Arr);
                            }
                        }

                        if (CSV_name == 'Install_All_Updates') {
                            for (j = 0; j < json.length; j++) {
                                new_Arr = [json[j]['Size'], json[j]['ComputerName'], json[j]['KB'], json[j]['Title'], json[j]['LastDeploymentChangeTime'], json[j]['Result'], json[j]['RebootRequired']];
                                if (new_Arr.indexOf("Installed") > -1) {
                                    ultimate.push(new_Arr);
                                } else if (new_Arr.indexOf("Failed") > -1) {
                                    ultimate.push(new_Arr);
                                }
                            }

                        }

                        if (CSV_name == 'Install_Specific_Update') {
                            for (j = 0; j < json.length; j++) {
                                new_Arr = [json[j]['Size'], json[j]['ComputerName'], json[j]['KB'], json[j]['Title'], json[j]['LastDeploymentChangeTime'], json[j]['Result'], json[j]['RebootRequired']];
                                if (new_Arr.indexOf("Installed") > -1) {
                                    ultimate.push(new_Arr);
                                } else if (new_Arr.indexOf("Failed") > -1) {
                                    ultimate.push(new_Arr);
                                }
                            }
                        }

                        if (CSV_name == 'Uninstall_Updates') {
                            ultimate.push(json);
                        }

                        console.log('ultimate' + ultimate);

                        require('dns').resolve('www.google.com', function (err) {
                            if (err) {
                                console.log("No connection");
                            } else {
                                console.log(output_res); // comment out
                                var body = JSON.stringify({
                                    "funcType": 'updateActivity',
                                    "result_data": ultimate,
                                    "CSV_name": CSV_name,
                                    "patch_id": output_res['patch_id'],
                                    "management_id": output_res['management_id'],
                                    "update_id": output_res['update_id'],
                                    "asset_id": output_res['asset_id'],
                                    "patch_management_type": output_res['patch_management_type'],
                                    "login_user": output_res['login_user'],
                                    "pm_status": output_res['pm_status'],
                                    "last_install_status": output_res['last_install_status'],
                                    "pending_status": output_res['pending_status'],
                                    "action_status": output_res['action_status']
                                });
                                const request = net.request({
                                    method: 'POST',
                                    url: root_url + '/patch_management.php'
                                });
                                request.on('response', (response) => {
                                    // console.log(`STATUS: ${response.statusCode}`)
                                    response.on('data', (chunk) => {
                                        console.log(`${chunk}`);
                                        //   console.log(chunk.toString('utf8'));
                                    })
                                    response.on('end', () => {
                                        if (newFilePath != "") { // if filepath has been passed and uploading done
                                            fs.unlinkSync(newFilePath); // This deletes the created csv
                                        }
                                    })
                                })
                                request.on('error', (error) => {
                                    console.log(`ERROR: ${(error)}`)
                                })
                                request.setHeader('Content-Type', 'application/json');
                                request.write(body, 'utf-8');
                                request.end();
                            }
                        });
                    } else {
                        // output_res['remark'] = 'No Updates Available.';
                    }
                })
        } else {
            console.log("No CSV found at path " + newFilePath);
            output_res['CSV_name'] = CSV_name;
            output_res['pm_status'] = 'Failed';
            output_res['action_status'] = 'Failed';
            output_res['remark'] = 'Permission Denied.';
            output_res['result_data'] = null;
            updatePatchManagement(output_res);
        }; // update for: if no output found at output location
    } else {
        console.log("CSV_name incorrect");
        output_res['pm_status'] = 'Failed';
        output_res['action_status'] = 'Failed';
        output_res['remark'] = 'Failed to perform Patch Management Activity on this device.';
        output_res['result_data'] = null;
        updatePatchManagement(output_res);
    } // update for: if function called without proper CSV_name
}


// for failed scripts
function updatePatchManagement(output_res = []) {
    console.log("Inside updatePatchManagement function for failed scripts");


    var body = JSON.stringify({
        "funcType": 'updateActivity_Failed',
        "result_data": output_res['result_data'],
        "CSV_name": output_res['CSV_name'],
        "patch_id": output_res['patch_id'],
        "management_id": output_res['management_id'],
        "update_id": output_res['update_id'],
        "asset_id": output_res['asset_id'],
        "patch_management_type": output_res['patch_management_type'],
        "login_user": output_res['login_user'],
        "pm_status": output_res['pm_status'],
        "last_install_status": output_res['last_install_status'],
        "pending_status": output_res['pending_status'],
        "action_status": output_res['action_status']
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/patch_management.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
        })
        response.on('end', () => {

            // global.stdoutputArray = []; // Emptying array to stop previous result from getting used

        });
    })
    request.on('error', (error) => {
        log.info('Error while updating PM outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};




function Network_Monitor_Main(form_data) {

    // logEverywhere('In NMM');
    console.log('inside Network_Monitor_Main function');

    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "funcType": 'getNetworkMonitorList', "sys_key": cookies[0].name });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/network_monitor.php'
                        });
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);         // comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        if (obj.status == 'valid') {

                                            const output_data = [];
                                            output_data['mapping_id'] = obj.result.mapping_id;
                                            output_data['block_id'] = obj.result.block_id;
                                            output_data['asset_id'] = obj.result.asset_id;
                                            output_data['websites'] = obj.result.websites;
                                            output_data['activity_type'] = obj.result.activity_type;
                                            output_data['block_status'] = "Completed";
                                            output_data['block_remark'] = 'Network Monitor Activity Performed Successfully on this device';


                                            // console.log(output_data);


                                            if (obj.result.activity_type.includes("Block Websites")) {
                                                Network_Monitor_Scripts('Block Websites', output_data);
                                            }

                                            if (obj.result.activity_type.includes("Unblock Websites")) {
                                                Network_Monitor_Scripts('Unblock Websites', output_data);
                                            }

                                        }
                                    } catch (e) {
                                        return console.log('getNetworkMonitorList: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { });
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`);
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
    // }});
}



function Network_Monitor_Scripts(Activity_Type, output_res = []) {

    console.log("Inside Network_Monitor_Scripts function :");

    // console.log(output_res);

    Websites_List = output_res['websites'];

    // Websites_List = Websites_List.replace('\'', '');        

    console.log(Websites_List);
    //const path25 = 'C:/ITAMEssential/EventLogCSV/Update-in-Progress.csv';
    const path30 = 'C:/ITAMEssential/Block_Websites.bat';
    const path33 = 'C:/ITAMEssential/Unblock_Websites.bat';


    if (Activity_Type == 'Block Websites') {

        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path30, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\Block_Websites.ps1', function (err) {
            if (err) throw err;
            console.log('Block_Websites Bypass Bat is created successfully.');
        });


        content1 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "  Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "  exit;" + '\n' +
            "}" + '\n' +
            "ipconfig /flushdns" + '\n' +
            "$global:websites = @(" + Websites_List + ")" + '\n' +
            "$global:is_blocked =  \"\"" + '\n' +
            "function Block-Website {" + '\n' +
            "    $hosts = \"C:\\Windows\\System32\\drivers\\etc\\hosts\";" + '\n' +
            "    foreach($i in $global:websites){" + '\n' +
            "        $is_blocked = Get-Content -Path $hosts | Select-String -Pattern ([regex]::Escape($i));" + '\n' +
            "        If(-not $is_blocked) {" + '\n' +
            "           Add-Content -Path $hosts -Value \"`r`n127.0.0.1 $i\"" + '\n' +
            "        }" + '\n' +
            "    }" + '\n' +
            "}" + '\n' +
            "Block-Website" + '\n' +
            "" + '\n' +
            "function Read-to-csv {" + '\n' +
            "  $InputFolder = 'C:\\ITAMEssential\\EventLogCSV\\Block_Websites.csv'" + '\n' +
            "  $FilePath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'" + '\n' +
            "  $content = Get-Content -Path $FilePath | Where {$_ -notmatch '^#.*'}" + '\n' +
            "  [System.IO.File]::WriteAllText($InputFolder, $content);" + '\n' +
            "  }" + '\n' +
            "Read-to-csv"




        const path31 = 'C:/ITAMEssential/Block_Websites.ps1';
        fs.writeFile(path31, content1, function (err) {
            if (err) {
                output_res['nm_status'] = 'Failed';
                output_res['remark'] = 'Failed to perform Network Monitor Activity on this device.';
                //updateNetworkMonitor(output_res);
                // throw err;
                logEverywhere(`ERROR at 6651: ${err}`)
            } else {
                try {
                    console.log('Block_Websites Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Block_Websites.ps1"]);
                    child.on("exit", function () {
                        console.log("Block_Websites ps1 executed");
                        setTimeout(function () {
                            read_NM_CSV("Block_Websites", output_res); // To upload CSV function              
                        }, 20000);//20 secs
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 6665: ${error}`)
                }
            }
        });
    }

    if (Activity_Type == 'Unblock Websites') {

        // BATCH FILES FOR BYPASSING EXECUTION POLICY:    
        fs.writeFile(path33, '@echo off' + '\n' + 'START /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\Unblock_Websites.ps1', function (err) {
            if (err) throw err;
            console.log('Unblock_Websites Bypass Bat is created successfully.');
        });


        content2 = "if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {" + '\n' +
            "  Start-Process PowerShell -Verb RunAs \"-NoProfile -ExecutionPolicy Bypass -Command `\"cd '$pwd'; & '$PSCommandPath';`\"\";" + '\n' +
            "  exit;" + '\n' +
            "}" + '\n' +
            "ipconfig /flushdns" + '\n' +
            "$global:websites = @(" + Websites_List + ")" + '\n' +
            "$global:is_blocked =  \"\"" + '\n' +
            "function Replace-TextInFile" + '\n' +
            "{" + '\n' +
            "    $FilePath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'" + '\n' +
            "      foreach($i in $global:websites){" + '\n' +
            "        $Pattern = Get-Content -Path $FilePath |" + '\n' +
            "        Select-String -Pattern ([regex]::Escape($i))" + '\n' +
            "        $Replacement = ''" + '\n' +
            "        [System.IO.File]::WriteAllText(" + '\n' +
            "            $FilePath," + '\n' +
            "            ([System.IO.File]::ReadAllText($FilePath) -replace $Pattern, $Replacement)" + '\n' +
            "        )           " + '\n' +
            "    }  " + '\n' +
            "}" + '\n' +
            "Replace-TextInFile" + '\n' +
            "" + '\n' +
            "function Read-to-csv {" + '\n' +
            "  $InputFolder = 'C:\\ITAMEssential\\EventLogCSV\\Unblock_Websites.csv'" + '\n' +
            "  $FilePath = 'C:\\Windows\\System32\\drivers\\etc\\hosts'" + '\n' +
            "  $content = Get-Content -Path $FilePath | Where {$_ -notmatch '^#.*'}" + '\n' +
            "  [System.IO.File]::WriteAllText($InputFolder, $content);" + '\n' +
            "  }" + '\n' +
            "Read-to-csv"


        const path34 = 'C:/ITAMEssential/Unblock_Websites.ps1';
        fs.writeFile(path34, content2, function (err) {
            if (err) {
                output_res['nm_status'] = 'Failed';
                output_res['remark'] = 'Failed to perform Network Monitor Activity on this device.';
                //updatePatchManagement(output_res);
                // throw err;
                logEverywhere(`ERROR at 6718: ${err}`)
            } else {
                try {
                    console.log('Unblock_Websites Powershell Script File Created');
                    // Execute bat file part:
                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\Unblock_Websites.ps1"]);
                    child.on("exit", function () {
                        console.log("Unblock_Websites ps1 executed");
                        setTimeout(function () {
                            read_NM_CSV("Unblock_Websites", output_res); // To upload CSV function              
                        }, 20000);//20 secs             
                        child.stdin.end(); //end input
                    });
                } catch (error) {
                    logEverywhere(`ERROR at 6732: ${error}`)
                }
            }
        });
    }


    // KBArticleID = KBArticleID.replace('KB', '');        

}


// read_NM_CSV("Block_Websites")
function read_NM_CSV(CSV_name, output_res = []) {

    // console.log(CSV_name);
    console.log('inside read_NM_CSV function');

    var filepath1 = 'C:\\ITAMEssential\\EventLogCSV\\Block_Websites.csv';
    var filepath2 = 'C:\\ITAMEssential\\EventLogCSV\\Unblock_Websites.csv';

    if (CSV_name == "Block_Websites" || CSV_name == "Unblock_Websites") {

        newFilePath = (CSV_name == 'Block_Websites') ? filepath1 : filepath2; // filepath2 == Unblock_Websites

        if (fs.existsSync(newFilePath)) {
            var final_arr = [];
            var new_Arr = [];
            var ultimate = [];
            const converter = csv({ noheader: true, output: "line" })
                .fromFile(newFilePath)
                .then((json) => {
                    if (json != []) {

                        // console.log(json);
                        // json = "Success"
                        //newjson = json.toString().replace(/#(.*?)(\n|$)/g,"");   
                        //  console.log(output_res);
                        //console.log(newjson);
                        require('dns').resolve('www.google.com', function (err) {
                            if (err) {
                                console.log("No connection");
                            } else {
                                console.log(output_res); // comment out
                                var body = JSON.stringify({
                                    "funcType": 'updateActivity',
                                    "result_data": json,
                                    "asset_id": output_res['asset_id'],
                                    "mapping_id": output_res['mapping_id'],
                                    "block_id": output_res['block_id'],
                                    "block_status": output_res['block_status'],
                                    "block_remark": output_res['block_remark']
                                });
                                const request = net.request({
                                    method: 'POST',
                                    url: root_url + '/network_monitor.php'
                                });
                                request.on('response', (response) => {
                                    console.log(`STATUS: ${response.statusCode}`)
                                    response.on('data', (chunk) => {
                                        console.log(`${chunk}`);
                                        console.log(chunk.toString('utf8'));
                                    })
                                    response.on('end', () => {
                                        if (newFilePath != "") { // if filepath has been passed and uploading done
                                            fs.unlinkSync(newFilePath); // This deletes the created csv
                                            console.log("File Unlinked");
                                        }
                                    })
                                })
                                request.on('error', (error) => {
                                    console.log(`ERROR: ${(error)}`)
                                })
                                request.setHeader('Content-Type', 'application/json');
                                request.write(body, 'utf-8');
                                request.end();
                            }
                        });
                    }
                })
        } else {
            console.log("No CSV found at path " + newFilePath);
            output_res['block_status'] = 'Failed';
            output_res['block_remark'] = 'Permission not given in time/Permission Denied.';
            output_res['result_data'] = null;
            updateNetworkMonitor(output_res);
        }; // update for: if permission not given in time or no output found at output location
    } else {
        console.log("CSV_name incorrect");
        output_res['block_status'] = 'Failed';
        output_res['block_remark'] = 'Failed to perform Maintainance Activity on this device.';
        output_res['result_data'] = null;
        updateNetworkMonitor(output_res);
    } // update for: if function called without proper CSV_name
}


// for failed scripts
function updateNetworkMonitor(output_res = []) {
    console.log("Inside updateNetworkMonitor function for failed scripts");
    // console.log(output_res);

    var body = JSON.stringify({
        "funcType": 'updateActivity',
        "result_data": output_res['result_data'],
        "asset_id": output_res['asset_id'],
        "mapping_id": output_res['mapping_id'],
        "block_id": output_res['block_id'],
        "block_status": output_res['block_status'],
        "block_remark": output_res['block_remark']
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/network_monitor.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
        })
        response.on('end', () => {

            // global.stdoutputArray = []; // Emptying array to stop previous result from getting used

        });
    })
    request.on('error', (error) => {
        log.info('Error while updating PM outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};




ipcMain.on('Task_Manager_Main', function (e, form_data, task_type_call) {
    // console.log("Task_Manager_Main Type: "+task_type_call);

    // console.log('inside Task_Manager_Main function');
    //logEverywhere('In TMM');
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        var body = JSON.stringify({ "funcType": 'getTaskManagerList', "sys_key": cookies[0].name, "task_type_call": task_type_call });
                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/task_manager.php'
                        });
                        request.on('response', (response) => {

                            response.on('data', (chunk) => {
                                // console.log(`${chunk}`);         // comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        if (obj.status == 'valid') {

                                            const output_data = [];
                                            output_data['mapping_id'] = obj.result.mapping_id;
                                            output_data['task_id'] = obj.result.task_id;
                                            output_data['task_type'] = obj.result.task_type;
                                            output_data['custom_title'] = obj.result.custom_title;
                                            output_data['custom_description'] = obj.result.custom_description;
                                            output_data['task_title'] = obj.result.task_title;
                                            output_data['task_description'] = obj.result.task_description;
                                            output_data['task_priority'] = obj.result.task_priority;
                                            output_data['task_status'] = obj.result.task_status;
                                            output_data['task_department'] = obj.result.task_department; // department_id
                                            output_data['task_start_date'] = obj.result.task_start_date;
                                            output_data['task_due_date'] = obj.result.task_due_date;
                                            output_data['task_updated_status'] = obj.result.task_updated_status;
                                            output_data['task_remark'] = obj.result.task_remark;
                                            output_data['asset_id'] = obj.result.asset_id;
                                            output_data['userid'] = obj.result.userid;
                                            output_data['clientid'] = obj.result.clientid; // the user's own clientid , not external clients from task manager



                                            if (!!obj.result.task_title) {
                                                output_data['task_title'] = obj.result.task_title;
                                                output_data['task_description'] = obj.result.task_description;
                                            } else {
                                                output_data['task_title'] = obj.result.custom_title;
                                                output_data['task_description'] = obj.result.custom_description;
                                            }






                                            // output_data['category']   = obj.result.category;
                                            // output_data['client']   = obj.result.client;                

                                            console.log(output_data); // comment out

                                            if (task_type_call == 'one-time') {
                                                Task_Manager_Notification('New Task', output_data);
                                            }
                                            if (task_type_call == 'recurring') {
                                                Task_Manager_Notification('New Task', output_data);
                                            }
                                            if (task_type_call == 'to_be_overdue') {
                                                Task_Manager_Notification('to_be_overdue', output_data);
                                            }
                                            if (task_type_call == 'overdue') {
                                                Task_Manager_Notification('overdue', output_data);
                                            }
                                        }
                                    } catch (e) {
                                        return console.log('getTaskManagerList: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { });
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`);
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
    // }});
})



function Task_Manager_Notification(Task_Type, output_res = []) {

    console.log("Inside Task_Manager_Notification function :");

    console.log(Task_Type);

    if (Task_Type == 'New Task') {


        title = 'New Task: ' + output_res['task_title']
        message = 'Date Range: ' + output_res['task_start_date'] + ' - ' + output_res['task_due_date'] + '\n' + 'Description: ' + output_res['task_description'];

        // message = 'Date Range: '+output_res['task_start_date']+' - '+output_res['task_due_date'] +'\n'+'Description: '+output_res['custom_description'];
        // message = 'Date Range: 01.01.2021 - 01.01.2021' output_res

        notifier.notify({
            title: title,
            message: message,
            icon: path.join(__dirname, 'logo.jpg'),
            actions: ['Accept Task'],
            appID: 'com.eprompto.itam',
            wait: true,
        }, function (err, response, metadata) {

            console.log("error is " + err, "response is " + response, "metadata " + metadata);

            if (response == undefined) {


                output_res['task_status'] = 'In-Progress';
                output_res['task_remark'] = 'Task In-Progress.';
                updateTaskManager(output_res);
            }
        });
    }
    if (Task_Type == 'to_be_overdue') {

        title = 'Task Due Reminder : ' + output_res['task_title'] + ' ' + output_res['task_title'];
        message = 'Date Range: ' + output_res['task_start_date'] + ' - ' + output_res['task_due_date'] + '\n' + 'Description: ' + output_res['task_description'];

        // message = 'Date Range: 01.01.2021 - 01.01.2021'          

        notifier.notify({
            title: title,
            message: message,
            icon: path.join(__dirname, 'logo.jpg'),
            appID: 'com.eprompto.itam',
            wait: true,
        }, function (err, response, metadata) {
            console.log("error is " + err, "response is " + response, "metadata " + metadata);
        });
    }
    if (Task_Type == 'overdue') {

        title = 'Task Overdue : ' + output_res['task_title'] + ' ' + output_res['task_title'];
        message = 'Date Range: ' + output_res['task_start_date'] + ' - ' + output_res['task_due_date'] + '\n' + 'Description: ' + output_res['task_description'];

        notifier.notify({
            title: title,
            message: message,
            icon: path.join(__dirname, 'logo.jpg'),
            appID: 'com.eprompto.itam',
            wait: true,
        }, function (err, response, metadata) {
            console.log("error is " + err, "response is " + response, "metadata " + metadata);
        });
    }
}


// for failed scripts
function updateTaskManager(output_res = []) {
    console.log("Inside updateTaskManager function");
    console.log(output_res);

    var body = JSON.stringify({
        "funcType": 'updateActivity',
        // "result_data" : output_res['result_data'],
        "asset_id": output_res['asset_id'],
        "task_id": output_res['task_id'],
        "userid": output_res['userid'],
        "task_status": output_res['task_status'],
        "task_remark": output_res['task_remark']
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/task_manager.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating PM outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};


function Get_Browser_History_Powershell_Script(Process_Name, sys_key, output_res = []) {

    const path5 = 'C:/ITAMEssential/Get_Browser_History.bat';
    const path7 = 'C:/ITAMEssential/BrowserData.ps1';
    //logEverywhere('In Browser Code Before if'); 

    if (Process_Name === 'Get_Browser_History') {
        // Create BAT file to bypass execution policy
        const batContent = '@echo off\nSTART /MIN c:\\windows\\system32\\WindowsPowerShell\\v1.0\\powershell.exe -WindowStyle Hidden -executionpolicy bypass C:\\ITAMEssential\\BrowserData.ps1';

        fs.writeFile(path5, batContent, function (err) {
            if (err) {
                console.log('Failed to create BAT file:', err);
                return;
            }
            console.log('Get_Browser_History Bypass BAT file created successfully.');
        });

        // PowerShell script content
        const psContent = `
      $UserName = "$ENV:USERNAME";
  
      function Get-ChromeHistory {
          $Path = "$Env:systemdrive\\Users\\$UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\History"
          if (-not (Test-Path -Path $Path)) {
              Write-Verbose "[!] Could not find Chrome History for username: $UserName"
          }
          $Regex = '(http|https)://([\\w-]+\\.)+[\\w-]+(/[\\w- ./?%&=]*)*?'
          $Value = Get-Content -Path "$Env:systemdrive\\Users\\$UserName\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\History" | Select-String -AllMatches $regex | % {($_.Matches).Value} | Sort -Unique
          $Value | ForEach-Object {
              $Key = $_
              if ($Key -match $Search) {
                  New-Object -TypeName PSObject -Property @{
                      Data = $_
                  }
              }
          }
      }
  
      function Get-InternetExplorerHistory {
          $Null = New-PSDrive -Name HKU -PSProvider Registry -Root HKEY_USERS
          $Paths = Get-ChildItem 'HKU:\\' -ErrorAction SilentlyContinue | Where-Object { $_.Name -match 'S-1-5-21-[0-9]+-[0-9]+-[0-9]+-[0-9]+$' }
          ForEach($Path in $Paths) {
              $User = ([System.Security.Principal.SecurityIdentifier] $Path.PSChildName).Translate([System.Security.Principal.NTAccount]) | Select -ExpandProperty Value
              $Path = $Path | Select-Object -ExpandProperty PSPath
              $UserPath = "$Path\\Software\\Microsoft\\Internet Explorer\\TypedURLs\\"
              if (-not (Test-Path -Path $UserPath)) {
                  Write-Verbose "[!] Could not find IE History for SID: $Path"
              }
              else {
                  Get-Item -Path $UserPath -ErrorAction SilentlyContinue | ForEach-Object {
                      $Key = $_
                      $Key.GetValueNames() | ForEach-Object {
                          $Value = $Key.GetValue($_)
                          if ($Value -match $Search) {
                              New-Object -TypeName PSObject -Property @{
                                  Data = $Value
                              }
                          }
                      }
                  }
              }
          }
      }
  
      function Get-FireFoxHistory {
          $Path = "$Env:systemdrive\\Users\\$UserName\\AppData\\Roaming\\Mozilla\\Firefox\\Profiles\\"
          if (-not (Test-Path -Path $Path)) {
              Write-Verbose "[!] Could not find FireFox History for username: $UserName"
          }
          else {
              $Profiles = Get-ChildItem -Path "$Path\\*.default\\" -ErrorAction SilentlyContinue
              $Regex = '(http|https)://([\\w-]+\\.)+[\\w-]+(/[\\w- ./?%&=]*)*?'
              $Value = Get-Content $Profiles\\places.sqlite | Select-String -Pattern $Regex -AllMatches | Select-Object -ExpandProperty Matches | Sort -Unique
              $Value.Value | ForEach-Object {
                  if ($_ -match $Search) {
                      ForEach-Object {
                          New-Object -TypeName PSObject -Property @{
                              Data = $_
                          }
                      }
                  }
              }
          }
      }
  
      Get-ChromeHistory | Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\BrowserData.csv -NoTypeInformation
      Get-FireFoxHistory | Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\BrowserData.csv -NoTypeInformation -Append
      Get-InternetExplorerHistory | Export-Csv -Path C:\\ITAMEssential\\EventLogCSV\\BrowserData.csv -NoTypeInformation -Append
    `;

        fs.writeFile(path7, psContent, function (err) {
            if (err) {
                console.log('Failed to create PowerShell script file:', err);
                return;
            }
            console.log('Get_Browser_History PowerShell Script File Created');

            try {
                // Execute the BAT file
                const child = spawn("powershell.exe", ["C:\\ITAMEssential\\Get_Browser_History.bat"]);
                child.on("exit", function () {
                    console.log("Get_Browser_History BAT executed");
                });
                child.stdin.end(); // End input
            } catch (error) {
                logEverywhere(`ERROR at 7188: ${error}`)
            }
        });
    }
    log.info('Get Browser History Code After if');
}



function updateUserBehaviour(sys_key, output) {
    console.log("Inside updateUserBehaviour function");
    var body = JSON.stringify({
        "funcType": 'updateUserBehaviour',
        "result_data": output['result_data'],
        "script_status": output['script_status'],
        "script_remark": output['script_remark'],
        "asset_id": sys_key,

    });

    const request = net.request({
        method: 'POST',
        url: root_url + '/main.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            // console.log(chunk);
            console.log(chunk.toString('utf8'));
            // arr.push(...chunk.toString('utf8'));
            // console.log(arr);
        })
        response.on('end', () => {

            global.stdoutputArray = []; // Emptying array to stop previous result from getting used

        });
    })
    request.on('error', (error) => {
        log.info('Error while updating PM outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};




ipcMain.on('Task_Tab_Update', function (e, form_data) {
    // logEverywhere('In TTU');
    var body = JSON.stringify({ "funcType": 'Task_Tab_Update', "global_sys_key": global.sysKey, "form_data": form_data });
    const request = net.request({
        method: 'POST',
        url: root_url + '/task_manager.php'
    });
    request.on('response', (response) => {
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);

            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    if (obj.status == 'success') {
                        log.info('Data Updated Sucesfully');
                    }
                    if (obj.status == 'failed') {
                        log.info('Error occured on updating itam policy');
                    }
                } catch (e) {
                    return console.log('Task_Tab_Update: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => { })
    })
    request.on('error', (error) => {
        log.info('Error occured on updating client master ' + `${(error)}`);
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();
});
// function logEverywhere(s) {
//   console.log(s);
//      console.log('In main window');
//            mainWindow.webContents.executeJavaScript(`console.log("${s}")`);
//       // }

//  }

function logEverywhere(message) {

    try {
        console.log(message)
        BrowserWindow.getAllWindows().forEach(window=>{
            window.webContents.executeJavaScript(`console.log(${message.replace(/"/g, '\\"')})`)
        })
    } catch (error) {
        console.log('ERROR at logEverywhere:', error)
    }

    // console.log(message); // Log to Node.js console (main process)

    // // Ensure `mainWindow` and `mainWindow.webContents` are defined
    // if (mainWindow && mainWindow.webContents) {
    //     console.log('In main window');
    //     // Safely escape the message to prevent injection issues
    //     const escapedMessage = message.replace(/"/g, '\\"');
    //     mainWindow.webContents.executeJavaScript(`console.log("${escapedMessage}")`);
    // } else {
    //     console.log('mainWindow or mainWindow.webContents is not defined');
    // }
}


ipcMain.on('get_company_logo', function (e, form_data) {
    // logEverywhere('In get_company_logo');

    console.log(form_data);
    si.system()
        .then(systemInfo => {
            const deviceId = systemInfo.uuid;
            console.log('Device ID:', deviceId);
            serialNumber(function (err, value) {

                require('dns').resolve('www.google.com', function (err) {
                    if (err) {

                        var split_data = [];
                        // openSoftwareList = "Get-Process | Where-Object {$_.mainWindowTitle} | select mainWindowtitle, StartTime | ConvertTo-Json";
                        // const path35 = 'C:/ITAMEssential/openSoftwareList.ps1';


                        //   console.log('Inside Open Software List Call');
                        //   logEverywhere('Inside Open Software Function');

                        //       console.log("Inside Inside Open Software List Cookies");
                        //  SetCron(cookies[0].name); 

                        // fs.writeFile(path35, openSoftwareList, function (err) 
                        //   {
                        //     if (err)
                        //     {
                        //       throw err;
                        //     }
                        //     else
                        //     {
                        //           var split_data = [];
                        //           var software_name = [];
                        //           var software_time = [];
                        //           var software_time_update = [];
                        //           console.log('Inside Open Software List Powershell Script File Created');
                        //           // Execute bat file part:
                        //           child = spawn("powershell.exe",["C:\\ITAMEssential\\openSoftwareList.ps1"]);
                        //           child.stdout.on("data",function(data)
                        //           {
                        //             console.log("Powershell Data: " + data);
                        //             // var obj = JSON.stringify(data);
                        //             // console.log(obj.toString('utf8'));
                        //             var obj = JSON.parse(data);
                        //             console.log("Powershell Data:----------- " +obj);
                        //             obj.forEach(function(line) {
                        //               software_name += line.MainWindowTitle;
                        //               software_time += line.StartTime;
                        //               //console.log(software_time);

                        //                // console.log(software_name);
                        //                 // console.log('time');

                        //                 //console.log(software_time_update);
                        //             })


                        //           });
                        //           child.on("exit",function()
                        //           {
                        //             console.log("Inside Open Software List Ps1 executed");

                        //             var nowDate = new Date(parseInt(software_time.substr(6)));
                        //            //console.log(nowDate);
                        //             var software_time_update = new Date().toLocaleString('en-GB');

                        //             store1.set('softwareName', software_name);
                        //             store1.set('softwareTime', software_time_update); 
                        //             console.log(store1.get('softwareName'));
                        //             console.log(store1.get('softwareTime'));
                        //             child.stdin.end(); //end input
                        //           });                  

                        //     }
                        //   });

                        console.log("No connection");
                    }
                    else {

                        session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                            .then((cookies) => {

                                if (cookies.length > 0) {

                                    console.log('Serial_num+++++++++++++++++++++++++=' + value);
                                    //logEverywhere('Inside CL1111'); console.log('Device ID:', deviceId);
                                    var body = JSON.stringify({ "funcType": 'get_company_logo', "sys_key": cookies[0].name, "deviceId": deviceId, "serial_num": value });
                                    console.log('get_company_logo', body)
                                    const request = net.request({
                                        method: 'POST',
                                        url: root_url + '/main.php'
                                    });
                                    //   logEverywhere('Inside CL');
                                    request.on('response', (response) => {
                                        //console.log(`STATUS: ${response.statusCode}`)
                                        response.on('data', (chunk) => {
                                            console.log(`getcompanylogo: ${chunk}`);

                                            if (chunk) {
                                                let a;
                                                try {
                                                    var obj = JSON.parse(chunk);

                                                    console.log('get_company_logo:', obj)
                                                    //  console.log('get_company_data'+obj.system_asset_id);
                                                    // logEverywhere(obj);
                                                    if (obj.status == 'valid') {
                                                        e.reply('checked_company_logo', obj.result, server_url, obj.System_Key, global.assetID, obj?.asset_status);
                                                    } else if (obj.status == 'invalid') {
                                                        e.reply('checked_company_logo', obj.result, server_url, obj.System_Key, global.assetID, obj?.asset_status);
                                                    }
                                                } catch (e) {
                                                    return console.log('get_company_logo: No proper response received'); // error in the above string (in this case, yes)!
                                                }
                                            }
                                        })
                                        response.on('end', () => { })
                                    })
                                    request.on('error', (error) => {
                                        console.log(`ERROR: ${(error)}`)
                                    })
                                    request.setHeader('Content-Type', 'application/json');
                                    request.write(body, 'utf-8');
                                    request.end();
                                }
                            }).catch((error) => {
                                // console.log(error)            // comment out
                            })
                    }
                });
            });
        });
});

// ------------------------Check Hardware Change Code Strat Here ------------------------------------------------------------------------
ipcMain.on('check_hardware_changes', function (e) {
    hardwareDetails();

});

function hardwareDetails(called_type = '') {
    console.log('userInfo: +++' + os.userInfo().username);
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Check Hardware Call');
        //logEverywhere('Inside Check Hardware Call  in log');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then(async (cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Check Hardware Cookies");
                        system_ip = ip.address();
                        var system_ip = ip.address();
                        // RAM = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
                        let RAM = [];
                        let ram_clockspeed = {}
                        const ram_layout = await si.memLayout()
                        ram_layout.forEach((ram, index) => {
                            // const ram_slot = "Slot " + (parseInt(ram.bank.replaceAll("/", "")) + 1)
                            // REGEX that removes everything except for digits.
                            const ram_slot_no = (parseInt(ram.bank.replaceAll(/\D/g, ''), 2) || index) + 1
                            const ram_slot = `Slot ${ram_slot_no}`
                            const ram_size = (ram.size / (1024 * 1024 * 1024)).toFixed(1) + " GB"
                            RAM.push(`${ram_slot}: ${ram_size}`);

                            ram_clockspeed[ram_slot] = ram.clockSpeed
                        })
                        RAM = RAM.join(", ")
                        console.log('rams:', RAM)
                        console.log('ram_clockspeed:', ram_clockspeed)
                        // 
                        const disks = nodeDiskInfo.getDiskInfoSync();
                        hdd_total = 0;

                        for (const disk of disks) {
                            if (disk.filesystem == 'Local Fixed Disk') {
                                hdd_total = hdd_total + disk.blocks;
                            }
                        }

                        hdd_total = hdd_total / (1024 * 1024 * 1024) + ' GB';

                        let hdd_type = []
                        const diskLayout = await si.diskLayout()
                        diskLayout.forEach(disk=>{
                            if(disk.type == "HD"){
                                hdd_type.push("HDD")
                            }else{
                                hdd_type.push(disk.type)
                            }
                        })
                        hdd_type = hdd_type.join(', ')

                        si.osInfo(function (data) {
                            os_release = data.kernel;
                            os_bit_type = data.arch;
                            os_serial = data.serial;
                            os_version = data.release;
                            os_name = data.distro;
                            os_OEM = data.codename;

                            os_data = os_name + ' ' + os_OEM + ' ' + os_bit_type + ' ' + os_version;

                            exec('wmic path SoftwareLicensingService get OA3xOriginalProductKey', function (err, stdout, stderr) {
                                if (stderr || err) {
                                    var product_key = '';
                                }
                                else {

                                    res = stdout.split('\n');
                                    var ctr = 0;
                                    var product_key = null;
                                    res.forEach(function (line) {
                                        ctr = Number(ctr) + Number(1);
                                        line = line.trim();
                                        var newStr = line.replace(/  +/g, ' ');
                                        var parts = line.split(/  +/g);
                                        if (ctr == 2) {
                                            product_key = parts;
                                        }
                                    });
                                }
                                console.log('product_key++++' + product_key);

                                si.bios(function (data) {
                                    bios_name = data.vendor;
                                    bios_version = data.bios_version;
                                    bios_released = data.releaseDate;



                                    si.cpu(function (data) {
                                        processor_OEM = data.vendor;
                                        processor_speed_ghz = data.speed;
                                        processor_model = data.brand;

                                        let cpu_speed_ghz = {}
                                        cpu_speed_ghz = {
                                            min: data.speedMin,
                                            max: data.speedMax,
                                            current: data.speed,
                                        }

                                        si.system(function (data) {
                                            sys_OEM = data.manufacturer;
                                            sys_model = data.model;
                                            device_name = os.hostname();
                                            cpuCount = os.cpus().length;
                                            itam_version = app.getVersion();

                                            serialNumber(function (err, value) {

                                                getAntivirus(function (antivirus_data) {
                                                    console.log('sys_key: ' + cookies[0].name);
                                                    console.log('version: ' + os_data);
                                                    console.log('license_key: ' + product_key);
                                                    console.log('biosname: ' + bios_name);
                                                    console.log('sys_ip: ' + system_ip);
                                                    console.log('serialNo: ' + bios_version);
                                                    console.log('biosDate: ' + bios_released);
                                                    console.log('processor: ' + processor_OEM);
                                                    console.log('brand: ' + processor_model);
                                                    console.log('speed: ' + processor_speed_ghz);
                                                    console.log('cpu_speed: ' + JSON.stringify(cpu_speed_ghz));
                                                    console.log('make: ' + sys_OEM);
                                                    console.log('model: ' + sys_model);
                                                    console.log('device_name: ' + device_name);
                                                    console.log('cpu_count: ' + cpuCount);
                                                    console.log('itamVersion: ' + itam_version);
                                                    console.log('serial_num: ' + value);

                                                    if (called_type == 'first') {
                                                        var funcType = 'update_hardware_data';
                                                    }
                                                    else {
                                                        var funcType = 'get_hardware_list';
                                                    }
                                                    var body = JSON.stringify({ 'funcType': funcType, "sys_key": cookies[0].name, 'version': os_data, "license_key": product_key, "biosname": bios_name, "biosDate": bios_released, "sys_ip": system_ip, "serialNo": bios_version, "processor": processor_OEM, "brand": processor_model, "make": sys_OEM, "model": sys_model, "device_name": device_name, "cpu_count": cpuCount, "itamVersion": itam_version, "antivirus_data": antivirus_data, "serial_num": value, "speed": processor_speed_ghz, "cpu_speed": cpu_speed_ghz, "ram": RAM, "ram_clockspeed": ram_clockspeed, "hdd_capacity": hdd_total, hdd_type });
                                                    console.log('hardware_list', body)
                                                    const request = net.request({
                                                        method: 'POST',
                                                        url: root_url + '/hardware_list.php'
                                                    });
                                                    request.on('response', (response) => {
                                                        // console.log(response);
                                                        response.on('data', (chunk) => {
                                                            console.log(`${chunk}`);         // comment out


                                                        })
                                                        response.on('end', () => { })
                                                    })
                                                    request.on('error', (error) => {
                                                        console.log(`ERROR: ${(error)}`)
                                                    })
                                                    request.setHeader('Content-Type', 'application/json');
                                                    request.write(body, 'utf-8');
                                                    request.end();


                                                });

                                            });
                                        });
                                    });
                                });

                            });

                        });

                    }
                });
        };
    });
}

//--------------------- Check Hardware Change Code End Here ------------------------------------------------------------------------


// ------------------------Check Software Change Code Strat Here ------------------------------------------------------------------------
ipcMain.on('check_software_changes', function (e) {
    softwareDetails();
});


function softwareDetails() {
    s1 = `
  $subkeys = Get-ChildItem -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
  foreach ($subkey in $subkeys) {
    try {
        $displayName = Get-ItemProperty -Path $subkey.PSPath -ErrorAction Stop
        if ($displayName.DisplayName -ne $null -and $displayName.DisplayName -notlike 'false' -and $displayName.SystemComponent -ne 1 -and  $displayName.Publisher -ne 'GoogleChrome' -and $displayName.ParentDisplayName -eq $null) {
            Write-Output "$($displayName.DisplayName)   $($displayName.DisplayVersion)   $($displayName.InstallDate)"
        }
    } catch {
        if ($_.Exception.Message -eq 'Specified cast is not valid.') {
            # Write-Output "Skipping problematic entry: $($subkey.Name)"
        } else { 
            # Write-Output "Error retrieving properties for $($subkey.Name): $_"
        }
    }
  }
`;
    s2 = `
$subkeys = Get-ChildItem -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
foreach ($subkey in $subkeys) {
  try {
      $displayName = Get-ItemProperty -Path $subkey.PSPath -ErrorAction Stop
      if ($displayName.DisplayName -ne $null -and $displayName.DisplayName -notlike 'false' -and $displayName.SystemComponent -ne 1 -and  $displayName.Publisher -ne 'GoogleChrome' -and $displayName.ParentDisplayName -eq $null) {
          Write-Output "$($displayName.DisplayName)   $($displayName.DisplayVersion)   $($displayName.InstallDate)"
      }
  } catch {
      if ($_.Exception.Message -eq 'Specified cast is not valid.') {
          # Write-Output "Skipping problematic entry: $($subkey.Name)"
      } else { 
          # Write-Output "Error retrieving properties for $($subkey.Name): $_"
      }
  }
}
`;
    //s2 = "Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' | Where-Object { $_.DisplayName -ne $null -and $_.DisplayName -notlike 'false' -and $_.SystemComponent -ne 1 -and  $_.Publisher -ne $null -and $_.Publisher -ne 'Google\Chrome' -and $_.ParentDisplayName -eq $null } | Select-Object DisplayName, DisplayVersion, InstallDate | ft -HideTableHeaders";
    s3 = `
  $subkeys = Get-ChildItem -Path 'HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
  foreach ($subkey in $subkeys) {
    try {
        $displayName = Get-ItemProperty -Path $subkey.PSPath -ErrorAction Stop
        if ($displayName.DisplayName -ne $null -and $displayName.DisplayName -notlike 'false' -and $displayName.SystemComponent -ne 1 -and  $displayName.Publisher -ne 'GoogleChrome' -and $displayName.ParentDisplayName -eq $null) {
            Write-Output "$($displayName.DisplayName)   $($displayName.DisplayVersion)   $($displayName.InstallDate)"
        }
    } catch {
        if ($_.Exception.Message -eq 'Specified cast is not valid.') {
            # Write-Output "Skipping problematic entry: $($subkey.Name)"
        } else { 
            # Write-Output "Error retrieving properties for $($subkey.Name): $_"
        }
    }
  }
  `;

    // s3 = "Get-ItemProperty -Path 'HKLM:\\Software\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*' | Where-Object { $_.DisplayName -ne $null -and $_.DisplayName -notlike 'false' -and $_.SystemComponent -ne 1 -and  $_.Publisher -ne $null -and $_.Publisher -ne 'Google\Chrome' -and $_.ParentDisplayName -eq $null } | Select-Object DisplayName, DisplayVersion, InstallDate | ft -HideTableHeaders";

    const path1 = 'C:/ITAMEssential/soft1.ps1';
    const path2 = 'C:/ITAMEssential/soft2.ps1';
    const path3 = 'C:/ITAMEssential/soft3.ps1';

    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside SD Call');
        // logEverywhere('Inside SD Call');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log(cookies[0].name);
                        var newData = [];

                        //First Script
                        fs.writeFile(path1, s1, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 7700: ${err}`)
                            } else {
                                try {
                                    var split_data = [];
                                    //  logEverywhere('SD S1 PS File Created');
                                    // Execute bat file part:
                                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\soft1.ps1"]);
                                    // mainWindow.webContents.openDevTools(); 
                                    child.stdout.on("data", function (data) {
                                        // logEverywhere("SD Powershell Data: S1");                    
                                        split_data.push(data);
                                    });
                                    //New Exit S1
                                    child.on("exit", function (errorcode) {
                                        // mainWindow.webContents.openDevTools();
                                        //logEverywhere("SD S1 Ps1 executed");
                                        var i = 0;
                                        res1 = split_data.toString();
                                        res = res1.split('\n');
                                        // console.log('res___+'+res);
                                        res.forEach(function (line) {
                                            i = Number(i) + Number(1);
                                            line = line.trim();
                                            // logEverywhere('Above line S1');
                                            var parts1 = line.split(/  +/g);
                                            let parts = parts1.map(element => element.replace(/,/g, ''));
                                            console.log('parts' + parts);
    
                                            //logEverywhere("Inside softwareList Call inside exec command S1");
                                            // logEverywhere(parts.length);
                                            if (parts.length >= 3) { //  logEverywhere("Inside softwareList in parts.length>=3"+parts);
                                                if (parts[0] != 'DisplayName' && parts[0] != '-----------' && parts[0] != '' && parts[1] != 'DisplayVersion' && parts[2] != 'InstallDate' && parts[1] != '-----------' && parts[2] != '-----------') {
                                                    var tempObj = { name: parts[0].trim(), version: parts[1], install_date: parts[2] };
                                                    newData.push(tempObj);
                                                }
                                            }
                                            else if (parts.length == 2) {
    
                                                // logEverywhere("Inside softwareList in parts.length>=2 S1"+parts[1]);
                                                //if part 1 contains . in string then it is version otherwise it is installation date
                                                if (parts[1] != '' && parts[1] != undefined && parts[1].indexOf(".") !== -1) {
                                                    // logEverywhere("Inside softwareList in parts.length-1 S1");
                                                    var tempObj = { name: parts[0].trim(), version: parts[1], install_date: '--' };
                                                    newData.push(tempObj);
                                                }
                                                else {
                                                    //logEverywhere("Inside softwareList in parts.length-1 else S1");
                                                    var result = Math.floor(parts[1]);
                                                    if (result) {
                                                        var tempObj = { name: parts[0].trim(), version: '--', install_date: parts[2] };
                                                        newData.push(tempObj);
                                                    }
                                                    else {
                                                        var tempObj = { name: parts[0].trim(), version: parts[1], install_date: '--' };
                                                        newData.push(tempObj);
                                                    }
                                                }
    
                                            }
                                            else {
                                                // logEverywhere('PartsElse'+line);
                                                if (parts[0] != '' && parts[0] != undefined) {
                                                    var tempObj = { name: parts[0], version: '--', install_date: '--' };
                                                    newData.push(tempObj);
                                                }
    
                                            }
                                        }); //End For Each
    
                                        child.stdin.end(); //end input
                                    });
                                } catch (error) {
                                    logEverywhere(`ERROR at 7772: ${error}`)
                                }
                                //New Child Exist End

                            }
                        });
                        //End 1st Script


                        //2nd Script
                        fs.writeFile(path2, s2, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 7785: ${err}`)
                            } else {
                                try {
                                    var split_data = [];
                                    //   logEverywhere('SD S2 PS File Created');
                                    // Execute bat file part:
                                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\soft2.ps1"]);
                                    child.stdout.on("data", function (data) {
                                        //  logEverywhere("SD Powershell Data: S2");                    
                                        split_data.push(data);
                                    });
                                    //New Exit S2
                                    child.on("exit", function (errorcode) {
                                        // logEverywhere("SD S2 Ps1 executed");
                                        var i = 0;
                                        res1 = split_data.toString();
                                        res = res1.split('\n');
                                        // console.log('res___'+res);
                                        res.forEach(function (line) {
                                            i = Number(i) + Number(1);
                                            line = line.trim();
                                            var parts1 = line.split(/  +/g);
                                            let parts = parts1.map(element => element.replace(/,/g, ''));
                                            // logEverywhere('s2'+parts);
                                            // logEverywhere("Inside softwareList Call inside exec command S2");
                                            //logEverywhere(parts);
                                            if (parts.length >= 3) {
                                                //logEverywhere("Inside softwareList in parts.length>=3"+parts);
                                                if (parts[0] != 'DisplayName' && parts[0] != '-----------' && parts[0] != '' && parts[1] != 'DisplayVersion' && parts[2] != 'InstallDate' && parts[1] != '-----------' && parts[2] != '-----------') {
                                                    var tempObj = { name: parts[0].trim(), version: parts[1], install_date: parts[2] };
                                                    newData.push(tempObj);
                                                }
                                            }
                                            else if (parts.length === 2) {
                                                //logEverywhere("Inside softwareList in parts.length>=2 S2"+parts[1]);
                                                if (parts[1].indexOf(".") !== -1) {
                                                    //  logEverywhere("Inside softwareList in parts.length-1 S2");
                                                    var tempObj = { name: parts[0].trim(), version: parts[1], install_date: '--' };
                                                    newData.push(tempObj);
                                                }
                                                else {
                                                    // logEverywhere("Inside softwareList in parts.length-1 else S2");
                                                    var result = Math.floor(parts[1]);
                                                    if (result) {
                                                        var tempObj = { name: parts[0].trim(), version: '--', install_date: parts[1] };
                                                        newData.push(tempObj);
                                                    }
                                                    else {
                                                        var tempObj = { name: parts[0].trim(), version: parts[1], install_date: '--' };
                                                        newData.push(tempObj);
                                                    }
                                                }
    
                                            }
                                            else {
                                                // logEverywhere('PartsElse'+line);
                                                var tempObj = { name: parts[0], version: '--', install_date: '--' };
                                                newData.push(tempObj);
                                            }
    
                                        }); //End For Each
    
                                        // logEverywhere("Inside softwareList After res.foreach S2");
                                        child.stdin.end(); //end input
                                    });
                                    //New Child Exist End
                                } catch (error) {
                                    logEverywhere(`ERROR at 7852: ${error}`)
                                }
                            }
                        });
                        //End 2nd Script

                        //3rd Script
                        fs.writeFile(path3, s3, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 7862: ${err}`)
                            } else {
                               try {
                                 var split_data = [];
                                 //   logEverywhere('SD S3 PS File Created');
                                 // Execute bat file part:
                                 child = spawn("powershell.exe", ["C:\\ITAMEssential\\soft3.ps1"]);
                                 child.stdout.on("data", function (data) {
                                     // logEverywhere("SD Powershell Data: S3");                    
                                     split_data.push(data);
                                 });
 
                                 //New Exit S3
                                 child.on("exit", function (errorcode) {
                                     //  logEverywhere("SD S3 Ps1 executed");
                                     var i = 0;
                                     res1 = split_data.toString();
                                     res = res1.split('\n');
 
                                     res.forEach(function (line) {
                                         i = Number(i) + Number(1);
                                         line = line.trim();
                                         //   logEverywhere('Above line S3');
                                         var parts1 = line.split(/  +/g);
                                         let parts = parts1.map(element => element.replace(/,/g, ''));
                                         //   console.log('parts+++++++++=='+parts);
 
                                         // logEverywhere("Inside softwareList Call inside exec command S3");
                                         //logEverywhere(parts);
                                         if (parts.length >= 3) {
                                             //  logEverywhere("Inside softwareList in parts.length>=3 S3");
                                             if (parts[0] != 'DisplayName' && parts[0] != '-----------' && parts[0] != '' && parts[1] != 'DisplayVersion' && parts[2] != 'InstallDate' && parts[1] != '-----------' && parts[2] != '-----------') {
                                                 var tempObj = { name: parts[0].trim(), version: parts[1], install_date: parts[2] };
                                                 newData.push(tempObj);
                                             }
                                         }
                                         else if (parts.length == 2) {
                                             //  logEverywhere("Inside softwareList in parts.length>=2 S3"+parts[1]);
                                             //if part 1 contains . in string then it is version otherwise it is installation date
                                             if (parts[1].indexOf(".") !== -1) {
                                                 //    logEverywhere("Inside softwareList in parts.length-1 S3");
 
                                                 var tempObj = { name: parts[0].trim(), version: parts[1], install_date: '--' };
                                                 newData.push(tempObj);
                                             }
                                             else {
 
                                                 //   logEverywhere("Inside softwareList in parts.length-1 else S3");
                                                 var result = Math.floor(parts[1]);
                                                 if (result) {
                                                     var tempObj = { name: parts[0].trim(), version: '--', install_date: parts[2] };
                                                     newData.push(tempObj);
                                                 }
                                                 else {
                                                     var tempObj = { name: parts[0].trim(), version: parts[1], install_date: '--' };
                                                     newData.push(tempObj);
                                                 }
                                             }
 
                                         }
                                         else {
                                             //    logEverywhere('PartsElse'+line);
                                             var tempObj = { name: parts[0], version: '--', install_date: '--' };
                                             newData.push(tempObj);
                                         }
                                     }); //End For Each
 
                                     child.stdin.end(); //end input
                                 });
                                 //New Child Exist End
                               } catch (error) {
                                logEverywhere(`ERROR at 7933: ${error}`)
                               }
                            }
                        });
                        //End 3rd Script

                        //update software call after 3 min
                        setTimeout(function () {
                            //logEverywhere("Inside Timeout In SoftwareDetails");
                            newData.forEach(function (software) {
                                //logEverywhere("Name: " + software.name);
                                //logEverywhere("version: " + software.version);
                            });
                            console.log('softwaredata' + newData);
                            updateSoftwareDetails(cookies[0].name, newData);
                        }, 120000);


                    } //set cookies if
                });
        }
    });
}



function updateSoftwareDetails(sys_key, output) {
    console.log("Inside updateSoftwareDetails function");
    // logEverywhere("Inside updateSoftwareDetails function");
    console.log(output);

    output.forEach(function (software) {
        // logEverywhere("Output Name: " + software.name);
    });
    var body = JSON.stringify({
        "funcType": 'softwareList',
        "sys_key": sys_key,
        "result": JSON.stringify(output),
        "itam_version": versionItam,
    });
    console.log(body);
    const request = net.request({
        method: 'POST',
        url: root_url + '/asset.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            console.log(chunk);
            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    console.log("In Software Call If Chunk condition"); // comment
                    console.log(obj.status);
                    // logEverywhere(obj.status);
                    //  logEverywhere(obj.message);
                    //  logEverywhere(obj.sql);
                    // console.log(obj.softwareEmailData);
                    // logEverywhere(obj.softwareEmailData);
                }
                catch (e) {
                    return console.log('softwarelist: No proper response received'); // error in the above string (in this case, yes)!
                }
            }
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Software Details outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};


//--------------------- Check Software Change Code End Here ------------------------------------------------------------------------


//----------------------Code for keyboard details Start Here--------------------------------------------------------------------

ipcMain.on('check_keyboard_changes', function (e) {
    // logEverywhere('In Keyboard Call');
    keyboardDetails();
});

function keyboardDetails() {
    keyboardContent = "Get-WmiObject -Class Win32_Keyboard | Select-Object -ExpandProperty Description";
    const path1 = 'C:/ITAMEssential/keyboard_details.ps1';
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside keyboard changes Call');
        // logEverywhere('Inside keyboard changes Function');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside keyboard changes Cookies");
                        fs.writeFile(path1, keyboardContent, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 8040: ${err}`)
                            }
                            else {
                                try {
                                    var split_data = [];
                                    console.log('Keyboard Powershell Script File Created');
                                    // Execute bat file part:
                                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\keyboard_details.ps1"]);
                                    child.stdout.on("data", function (data) {
                                        console.log("Powershell Data: " + data);
                                        split_data.push(data);
                                    });
                                    child.on("exit", function () {
                                        console.log("Keyboard Ps1 executed");
                                        updateKeyboardName(split_data, cookies[0].name);
                                        child.stdin.end(); //end input
                                    });
                                } catch (error) {
                                    logEverywhere(`ERROR at 8058: ${error}`)
                                }
                            }
                        });
                    }
                });
        }
    });
}

function updateKeyboardName(data, sys_key) {
    console.log("Inside updateKeyboardName function");
    console.log("updateKeyboardName " + data);

    keyboardName = data.toString('utf8');

    var finalKeyboardData = [];
    var letters = [].concat.apply([], data.map(function (v) {
        return v.toString().split('\r\n');
    }));


    console.log("Hw");


    finalKeyboardData = letters.filter((str) => str != '' && str != ' ');
    console.log(finalKeyboardData);


    var body = JSON.stringify({
        "funcType": 'updateKeyboardName',
        "keyboard_name": finalKeyboardData,
        "sys_key": sys_key,
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/hardware_list.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            console.log(chunk);
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Keyboard Name outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};
//----------------------Code for keyboard details Start Here--------------------------------------------------------------------

//----------------------Code for Mouse details Start Here--------------------------------------------------------------------
ipcMain.on('check_mouse_changes', function (e) {
    console.log("check_mouse_changes");
    mouseDetails();
});

function mouseDetails() {
    mouseContent = "(Get-CimInstance win32_POINTINGDEVICE | select Name).Name";
    const path1 = 'C:/ITAMEssential/mouse_details.ps1';

    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Mouse changes Call');
        //logEverywhere('Inside Mouse changes Function');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Mouse changes Cookies");

                        console.log(cookies[0].name);

                        fs.writeFile(path1, mouseContent, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 8142: ${err}`)
                            }
                            else {
                                try {
                                    var split_data = [];
                                    console.log('Mouse Powershell Script File Created');
                                    // Execute bat file part:
                                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\mouse_details.ps1"]);
                                    child.stdout.on("data", function (data) {
                                        console.log("Powershell Data: " + data);
                                        split_data.push(data);
                                    });
                                    child.on("exit", function () {
                                        console.log("Mouse Ps1 executed");
                                        //console.log()
                                        updateMouseName(split_data, cookies[0].name);
                                        child.stdin.end(); //end input
                                    });
                                } catch (error) {
                                    logEverywhere(`ERROR at 8161: ${error}`)
                                }

                            }
                        });
                    }
                });
        }
    });
}

function updateMouseName(data, sys_key) {
    console.log("Inside updateMouseName function");
    console.log("Here Buffer");

    mouseName = data.toString('utf8');

    var letters = [].concat.apply([], data.map(function (v) {
        return v.toString().split('\r\n');
    }));

    mouseData = mouseName.split("\r\n"); // get mouse name in array format.
    //Remove Empty string from Mouse Data
    console.log("Hw");
    finalMouseData = letters.filter((str) => str != '' && str != ' ');
    console.log(finalMouseData);
    var body = JSON.stringify({
        "funcType": 'updateMouseName',
        "mouse_name": finalMouseData,
        "sys_key": sys_key,
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/hardware_list.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Mouse Name outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};

//----------------------Code for Mouse details End Here--------------------------------------------------------------------

//----------------------Code for Graphic Card details Start Here--------------------------------------------------------------------

ipcMain.on('check_graphic_card', function (e) {
    //logEverywhere('In check_graphic_card');
    graphicCardDetails();
});

function graphicCardDetails() {
    graphicCard = "gwmi win32_VideoController | Select-Object -ExpandProperty Name";
    const path1 = 'C:/ITAMEssential/graphic_card_details.ps1';
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Graphic Card Call');
        // logEverywhere('Inside Graphic Card Call Function');

        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Graphic Card changes Cookies");
                        fs.writeFile(path1, graphicCard, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 8241: ${err}`)
                            }
                            else {
                               try {
                                 var split_data = [];
                                 console.log('Graphic Card Powershell Script File Created');
                                 // Execute bat file part:
                                 child = spawn("powershell.exe", ["C:\\ITAMEssential\\graphic_card_details.ps1"]);
                                 child.stdout.on("data", function (data) {
                                     console.log("Powershell Data: " + data);
                                     split_data.push(data);
                                 });
                                 child.on("exit", function () {
                                     console.log("Graphic Card Ps1 executed");
                                     updateGraphicCard(split_data, cookies[0].name);
                                     child.stdin.end(); //end input
                                 });
                               } catch (error) {
                                logEverywhere(`ERROR at 8259: ${error}`)
                               }
                            }
                        });
                    }
                });
        }
    });
}

function updateGraphicCard(data, sys_key) {
    console.log("Inside updateGraphicCard function");
    console.log("updateGraphicCard " + data);

    graphicCardName = data.toString('utf8');

    var finalGraphicCardData = [];
    var letters = [].concat.apply([], data.map(function (v) {
        return v.toString().split('\r\n');
    }));


    console.log("Hw");


    finalGraphicCardData = letters.filter((str) => str != '' && str != ' ');
    console.log(finalGraphicCardData);


    var body = JSON.stringify({
        "funcType": 'updateGraphicCard',
        "graphics_card": finalGraphicCardData,
        "sys_key": sys_key,
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/hardware_list.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            console.log(chunk);
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Graphics Card Name outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};
//----------------------Code for Graphic Card details Start Here--------------------------------------------------------------------

//----------------------Code for Mother Board details Start Here--------------------------------------------------------------------
ipcMain.on('check_motherboard_changes', function (e) {
    console.log("check_motherboard_changes");
    //logEverywhere('check_motherboard_changes');
    motherboardDetails();
});

function motherboardDetails() {
    motherboard = "Get-CimInstance -Class Win32_BaseBoard | ft Product, Version -HideTableHeaders";
    const path1 = 'C:/ITAMEssential/motherboard_details.ps1';

    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Motherboard changes Call');
        //logEverywhere('Inside Motherboard Function');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Motherboard changes Cookies");
                        //  SetCron(cookies[0].name); 
                        console.log(cookies[0].name);

                        fs.writeFile(path1, motherboard, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 8344: ${err}`)
                            }
                            else {
                               try {
                                 var split_data = [];
                                 console.log('Motherboard Powershell Script File Created');
                                 // Execute bat file part:
                                 child = spawn("powershell.exe", ["C:\\ITAMEssential\\motherboard_details.ps1"]);
                                 child.stdout.on("data", function (data) {
                                     console.log("Powershell Data: " + data);
                                     split_data.push(data);
                                 });
                                 child.on("exit", function () {
                                     console.log("Motherboard Ps1 executed");
                                     //console.log()
                                     updateMotherboard(split_data, cookies[0].name);
                                     child.stdin.end(); //end input
                                 });
                               } catch (error) {
                                logEverywhere(`ERROR at 8363: ${error}`)
                               }

                            }
                        });
                    }
                });
        }
    });
}

function updateMotherboard(data, sys_key) {
    console.log("Inside updateMotherboard function");
    console.log("Here Buffer");


    motherBoard = data.toString('utf8');

    //   var finalMotherboardData = [];
    //   var letters = [].concat.apply([],data.map(function(v){ 
    //    return v.toString().split('\r\n');
    //   }));

    //  //motherBoardData = motherBoard.split("\r\n"); 
    //   console.log("Hw");


    //   finalMotherboardData = letters.filter((str) => str != '' && str != ' ');
    //   console.log(finalMotherboardData);

    line = motherBoard.trim();
    //var newStr = line.replace(/  +/g, ' ');
    //   var parts = line.split(/  +/g);
    //   var product_name1 = parts[0];
    //   var product_version = parts[1];
    //   var product_name = product_name1.replace(/(^,)|(,$)/g, "");
    //  // var product_version = product_version1.replace(/(^,)|(,$)/g, "");


    var parts = line.split(/  +/g);
    //  var product_name = parts[0];
    //  var product_version = parts[1];
    //  var product_name = product_name.replace(/(^,)|(,$)/g, "");

    let product_name = parts[0] ? parts[0].replace(/(^,)|(,$)/g, "") : '';
    let product_version = parts[1] ? parts[1] : '';

    console.log('product_name' + product_name);
    var body = JSON.stringify({
        "funcType": 'updateMotherboardData',
        "motherboard_name": product_name,
        "motherboard_version": product_version,
        "sys_key": sys_key,
    });

    const request = net.request({
        method: 'POST',
        url: root_url + '/hardware_list.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Mouse Name outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};

//----------------------Code for Mother Board details End Here--------------------------------------------------------------------
// --------------------- Code for Monitor Details Store Start Here ------------------------------------------------

function monitorDetails() {
    console.log("Inside monitorDetails function");

    display = electron.screen.getPrimaryDisplay();

    // Display information
    const displayInfo = {
        name: display.name || 'Name not available',
        bounds: display.bounds,
        workArea: display.workArea,
        scaleFactor: display.scaleFactor,
        refreshRate: display.refreshRate || 'Refresh rate not available',
        bitDepth: display.colorDepth,
        orientation: display.size.width > display.size.height ? 'landscape' : 'portrait' || 'Orientation not available',

    };

    const size = display.size.width + ' X ' + display.size.height;
    console.log(displayInfo); console.log(size);
    session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
        .then((cookies) => {
            if (cookies.length > 0) {
                var body = JSON.stringify({
                    "funcType": 'updateMonitorDetails',
                    "displayInfo": displayInfo,
                    "displaySize": size,
                    "sys_key": cookies[0].name,
                });
                const request = net.request({
                    method: 'POST',
                    url: root_url + '/hardware_list.php'
                });
                request.on('response', (response) => {
                    // console.log(response);
                    //console.log(`STATUS: ${response.statusCode}`)
                    response.on('data', (chunk) => {
                        console.log(`${chunk}`);
                        // console.log(chunk);
                    })
                    response.on('end', () => {
                    });
                })
                request.on('error', (error) => {
                    log.info('Error while updating Monitor Details outputs ' + `${(error)}`)
                })
                request.setHeader('Content-Type', 'application/json');
                request.write(body, 'utf-8');
                request.end();
            }
        });

};
// --------------------- Code for Monitor Details Store End Here ------------------------------------------------

// ------------------------------ Location Service On Code Starts here : ------------------------------------------------------------

function location_service() {
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Location Service On Call');
        //logEverywhere('In Location Service On Call');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Location Service On Cookies");
                        content = "# Check if running as administrator\nif (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {\nWrite-Host 'Please run this script as an administrator.' -ForegroundColor Red\n exit 1\n}\n# Enable location service\ntry {\n# Attempt to enable location service via registry key\n$registryPath = 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\CapabilityAccessManager\\ConsentStore\\location'\n$registryProperty = 'Value'\nSet-ItemProperty -Path $registryPath -Name $registryProperty -Value 1\nWrite-Host 'Location service enabled successfully.' -ForegroundColor Green\n} catch {\nWrite-Host 'Failed to enable location service.' -ForegroundColor Red\n}";

                        const path34 = 'C:/ITAMEssential/location_service.ps1';

                        fs.writeFile(path34, content, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 8518: ${err}`)
                            } else {
                                try {
                                    var split_data = [];
                                    var locationData, location_data = data = '';
                                    console.log('Location Service On File Script Created');
                                    //logEverywhere('Location Service On  Script Created');
                                    // child = spawn("powershell.exe",["C:\\ITAMEssential\\location_service.ps1"]);
                                    const scriptPath = 'C:\\ITAMEssential\\location_service.ps1';
    
                                    // Execute PowerShell with administrative privileges using spawn
                                    const child = spawn('powershell.exe', ['-Command', `Start-Process powershell -Verb RunAs -ArgumentList '-File "${scriptPath}"'`]);
    
                                    child.stdout.on("data", function (data) {
                                        console.log("Location Data: " + data);
                                    });
    
                                    child.on("exit", function () {
                                        console.log("Location Service Ps1 executed");
                                        // logEverywhere("Location Service Ps1 executed");
                                        child.stdin.end(); //end input
                                    });
                                } catch (error) {
                                    logEverywhere(`ERROR at 8541: ${error}`)
                                }

                            }
                        });


                    }
                });
        };
    });
}
ipcMain.on('check_location_service_on_request', function (e) {
    location_service();
});


// ---------------------------------Location Service On Code Ends here : ---------------------------------------------------------------- 


// ------------------------------ Location Starts here : ------------------------------------------------------------


function check_location_track_request() {
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Location Track Call');
        //logEverywhere('In Location Track Call');
        const exePath = app.getPath('exe');
        console.log('exePath' + exePath);
        // logEverywhere('exePath'+exePath);
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Location Track Cookies");
                        content = 'Add-Type -AssemblyName System.Device\n' +
                            '$latitude_and_longitude = New-Object System.Device.Location.GeoCoordinateWatcher \n' +
                            '$latitude_and_longitude.Start()\n' +

                            'while (($latitude_and_longitude.Status -ne "Ready") -and ($latitude_and_longitude.Permission -ne "Denied")) { \n' +
                            'Start-Sleep -Milliseconds 100 ' +
                            '} \n' +

                            'if ($latitude_and_longitude.Permission -eq "Denied"){ \n' +
                            'Write-Error `Access Denied for Location Information` \n' +
                            '} else { \n' +
                            '$latitude_and_longitude.Position.Location | Select Latitude,Longitude | ft -HideTableHeaders | out-string  \n' +
                            '}';

                        const path34 = 'C:/ITAMEssential/track_location1.ps1';

                        fs.writeFile(path34, content, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 8597: ${err}`)
                            } else {
                                try {
                                    var split_data = [];
                                    var locationData, location_data = data = '';
                                    console.log('Tracking Location File Script Created');
                                    //   logEverywhere('Tracking Location File Script Created');
                                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\track_location1.ps1"]);
                                    child.stdout.on("data", function (data) {
                                        console.log("Location Data: " + data);
                                        split_data.push(data);
                                    });
    
                                    child.on("exit", function () {
                                        // console.log('split_data'+split_data);
                                        console.log("Track Location Ps1 executed");
                                        // logEverywhere("Track Location Ps1 executed");
                                        // logEverywhere(split_data);
    
                                        var location_data = split_data.toString('utf8');
                                        data = location_data.trim();
                                        if (data != null && data != '' && data != undefined) {
                                            locationData = data.split(" ");
                                            console.log(locationData[0]);
                                            console.log(locationData[1]);
                                            //   logEverywhere(locationData[0]);
                                            // logEverywhere(locationData[1]);
                                            //graphicCardName = split_data.toString('utf8'); 
                                            //console.log(graphicCardName);
                                            updateLocationDetails(locationData[0], locationData[1], cookies[0].name);
                                        }
                                        child.stdin.end(); //end input
                                    });
                                } catch (error) {
                                    logEverywhere(`ERROR at 8631: ${error}`)
                                }

                            }
                        });


                    }
                });
        };
    });
}


// for failed scripts
function updateLocationDetails(locationData1, locationData2, sys_key) {
    // logEverywhere('Inside updateLocationDetails function for success scripts');
    console.log("Inside updateLocationDetails function for success scripts");
    //  console.log(sys_key);
    //  console.log(locationData1);
    //  console.log(locationData2);

    //logEverywhere("In Update Call: Latitude: "+locationData1+' Longitude: '+locationData2);

    var body = JSON.stringify({
        "functionType": 'insert_track_location',
        "sys_key": sys_key,
        "latitude": locationData1,
        "longitude": locationData2,
    });

    const request = net.request({
        method: 'POST',
        url: root_url + '/track_location.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);

            if (chunk) {
                let a;
                try {
                    var obj = JSON.parse(chunk);
                    //  logEverywhere(obj.status);
                    // logEverywhere(obj.sql);
                    //  logEverywhere(obj.message);
                } catch (e) {
                    return console.log('track_location: No proper response received'); // error in the above string (in this case, yes)!
                }
            }

            //  logEverywhere('Inside Location Chunk');
            console.log("Inside chunk");

        })
        response.on('end', () => {

            // global.stdoutputArray = []; // Emptying array to stop previous result from getting used

        });
    })
    request.on('error', (error) => {
        log.info('Error while updating location outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};

// ---------------------------------Location Ends here : ---------------------------------------------------------------- 
//------------------------------Store Localstorage Strat Here :-----------------------------------------------


ipcMain.on('store_localdata_server', function (e) {
    // logEverywhere('In store_localdata_server');
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside store_localdata_server Call');
        //logEverywhere('Inside store_localdata_server Call');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside store_localdata_server Cookies");
                        console.log(cookies[0].name);
                        var softwareName, softwareTime;
                        softwareName = store1.get('softwareName');
                        softwareTime = store1.get('softwareTime');
                        console.log(softwareTime);
                        var body = JSON.stringify({ "sys_key": cookies[0].name, 'functionType': 'store_data', 'softwareName': softwareName, 'softwareTime': softwareTime });

                        const request = net.request({
                            method: 'POST',
                            url: root_url + '/store_localdata.php'
                        });
                        request.on('response', (response) => {
                            // console.log(response);
                            response.on('data', (chunk) => {
                                console.log(`${chunk}`);         // comment out

                                if (chunk) {
                                    let a;
                                    try {
                                        var obj = JSON.parse(chunk);
                                        console.log(obj);
                                        if (obj.status == 'valid') {
                                            console.log('Success');

                                        }
                                    } catch (e) {
                                        return console.log('store_data: No proper response received'); // error in the above string (in this case, yes)!
                                    }
                                }
                            })
                            response.on('end', () => { })
                        })
                        request.on('error', (error) => {
                            console.log(`ERROR: ${(error)}`)
                        })
                        request.setHeader('Content-Type', 'application/json');
                        request.write(body, 'utf-8');
                        request.end();
                    }
                });
        };
    });
});

//------------------------------Store Localstorage End Here :-----------------------------------------------
// --------------------- Code for Monitor Screen In inches Store Start Here ------------------------------------------------
function monitorInches() {
    var motherboardInch = "(Get-WmiObject -Namespace root\\wmi -Class WmiMonitorBasicDisplayParams | select @{N='size'; E={[System.Math]::Round(([System.Math]::Sqrt([System.Math]::Pow($_.MaxHorizontalImageSize, 2) + [System.Math]::Pow($_.MaxVerticalImageSize, 2))/2.54),2)} }).size";
    const path1 = 'C:/ITAMEssential/display_inches.ps1';

    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Monitor Inches Call');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log(cookies[0].name);

                        fs.writeFile(path1, motherboardInch, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 8782: ${err}`)
                            }
                            else {
                                try {
                                    var split_data = [];
                                    console.log('Monitor Inches Powershell Script File Created');
                                    // Execute bat file part:
                                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\display_inches.ps1"]);
                                    child.stdout.on("data", function (data) {
                                        //             console.log('++++++++++++++++++++++++++++++++++++++++++=');
                                        console.log("Powershell Data: " + data);
                                        split_data.push(data);
                                    });
                                    child.on("exit", function () {
                                        console.log("Monitor Inches Ps1 executed");
                                        console.log(split_data);
                                        updateMonitorInches(split_data, cookies[0].name);
                                        child.stdin.end(); //end input
                                    });
                                } catch (error) {
                                    logEverywhere(`ERROR at 8802: ${error}`)
                                }

                            }
                        });
                    }
                });
        }
    });
}

function updateMonitorInches(data, sys_key) {
    console.log("Inside updateMonitorInches function");
    console.log("Here Buffer");


    monitorInches = data.toString('utf8');
    var letters = [].concat.apply([], data.map(function (v) {
        return v.toString().split('\r\n');
    }));


    console.log("Hw");


    monitorInches = letters.filter((str) => str != '' && str != ' ');
    console.log('monitorInches======' + monitorInches);
    display_inches = monitorInches + " inch";
    console.log("monitorInches" + monitorInches);
    console.log("monitorInches" + display_inches);


    var body = JSON.stringify({
        "funcType": 'updateMonitorInches',
        "display_inches": display_inches,
        "sys_key": sys_key,
    });

    const request = net.request({
        method: 'POST',
        url: root_url + '/hardware_list.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Motherboard Inches outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};
// --------------------- Code for Monitor Screen In inches Store End Here ------------------------------------------------


//----------------------- Code for Fetching RAM Serial Number -------------------------------------------------

function RAMSerialNumber() {
    console.log("Inside ramSerialNumber function");
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Check RAMSerialNumber Cookies");

                        exec('wmic memorychip get serialnumber', (error, stdout, stderr) => {
                            if (error) {
                                console.log(`exec error: ${error}`);
                                return;
                            }

                            if (stderr || err) {
                                var product_key = '';
                            }
                            else {
                                var serial_number = [];
                                res = stdout.split('\n');
                                //    console.log(stdout);
                                res.forEach(function (line) {
                                    var i = Number(i) + Number(1);
                                    line = line.trim();
                                    //var newStr = line.replace(/  +/g, ' ');
                                    var parts = line.split(/  +/g);
                                    // console.log(parts[0]);

                                    if (parts[0] != 'SerialNumber' && parts[0] != '' && parts[0] != undefined) {
                                        serial_number.push(parts[0]);
                                    }

                                })
                                //  console.log(serial_number);
                            }
                            require('dns').resolve('www.google.com', function (err) {
                                if (err) {
                                    console.log("No connection");
                                } else {
                                    // console.log('rammmmserial_number'+serial_number);
                                    var body = JSON.stringify({ "funcType": 'RAMserialNumber', "sys_key": cookies[0].name, "RAM_serial_number": serial_number });
                                    const request = net.request({
                                        method: 'POST',
                                        url: root_url + '/hardware_list.php'
                                    });
                                    // console.log("here");
                                    request.on('response', (response) => {
                                        console.log(`STATUS: ${response.statusCode}`)
                                        // console.log(response);
                                        response.on('data', (chunk) => {
                                            // console.log("hhh");
                                            console.log(`${chunk}`);
                                        })
                                        response.on('end', () => { })
                                        console.log("hhh222");
                                    })
                                    request.on('error', (error) => {
                                        console.log(`ERROR: ${(error)}`)
                                    })
                                    request.setHeader('Content-Type', 'application/json');
                                    request.write(body, 'utf-8');
                                    request.end();
                                }
                            });
                        });
                    }
                });
        };
    });
};
// --------------------- Code for Fetching RAM Serial Number End Here ------------------------------------------------
//----------------------- Code for Fetching HDD/SSD/M.2/NVME Serial Number -------------------------------------------------

function HDDSerialNumber() {
    console.log("Inside HDDSerialNumber function");
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Check HDDSerialNumber Cookies");

                        exec('$disks = Get-WmiObject -Class Win32_DiskDrive\nforeach ($disk in $disks) {\n$diskType = "HDD"\nif ($disk.MediaType -eq "SSD") {\n $diskType = "SSD"\n}\n Write-Host "$($disk.Model),$diskType, $($disk.SerialNumber)"}', { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
                            if (error) {
                                console.log(`exec error: ${error}`);
                                return;
                            }

                            var app_list = [];
                            var version = "";
                            var i = 0;
                            stdout = stdout.replace(/  /g, "");
                            res = stdout.split('\n');
                            res.forEach(function (line) {
                                i = Number(i) + Number(1);
                                line = line.trim();
                                var parts = line.split(/  +/g);
                                if (parts[0] != '' && parts[0] != 'undefined') {
                                    version += '{"ssd/hdd_details":"' + parts[0] + '"},';
                                }
                            });
                            console.log('version' + version);
                            require('dns').resolve('www.google.com', function (err) {
                                if (err) {
                                    console.log("No connection");
                                } else {
                                    var body = JSON.stringify({ "funcType": 'HDDserialNumber', "sys_key": cookies[0].name, "hdd_serial_number": version });
                                    const request = net.request({
                                        method: 'POST',
                                        url: root_url + '/hardware_list.php'
                                    });
                                    // console.log("here");
                                    request.on('response', (response) => {
                                        console.log(`STATUS: ${response.statusCode}`)
                                        // console.log(response);
                                        response.on('data', (chunk) => {
                                            // console.log("hhh");
                                            console.log(`${chunk}`);
                                        })
                                        response.on('end', () => { })
                                        console.log("hhh222");
                                    })
                                    request.on('error', (error) => {
                                        console.log(`ERROR: ${(error)}`)
                                    })
                                    request.setHeader('Content-Type', 'application/json');
                                    request.write(body, 'utf-8');
                                    request.end();
                                }
                            });
                        });
                    }
                });
        };
    });
};
// --------------------- Code for Fetching HDD/SSD/M.2/NVME Serial Number End Here ------------------------------------------------
//----------------------- Code for Fetching Processor Serial Number -------------------------------------------------

function ProcessorSerialNumber() {
    console.log("Inside ProcessorSerialNumber function");
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Check ProcessorSerialNumber Cookies");

                        exec('wmic cpu get processorid', (error, stdout, stderr) => {
                            if (error) {
                                console.log(`exec error: ${error}`);
                                return;
                            }

                            if (stderr || err) {
                                var product_key = '';
                            }
                            else {
                                var serial_number = [];
                                res = stdout.split('\n');
                                //console.log(stdout);
                                res.forEach(function (line) {
                                    var i = Number(i) + Number(1);
                                    line = line.trim();
                                    //var newStr = line.replace(/  +/g, ' ');
                                    var parts = line.split(/  +/g);
                                    // console.log(parts[0]);

                                    if (parts[0] != 'ProcessorId' && parts[0] != '' && parts[0] != undefined) {
                                        serial_number.push(parts[0]);
                                    }

                                })
                                console.log(serial_number);
                            }
                            require('dns').resolve('www.google.com', function (err) {
                                if (err) {
                                    console.log("No connection");
                                } else {
                                    // console.log('rammmmserial_number'+serial_number);
                                    var body = JSON.stringify({ "funcType": 'ProcessorserialNumber', "sys_key": cookies[0].name, "processor_serial_number": serial_number });
                                    const request = net.request({
                                        method: 'POST',
                                        url: root_url + '/hardware_list.php'
                                    });
                                    // console.log("here");
                                    request.on('response', (response) => {
                                        console.log(`STATUS: ${response.statusCode}`)
                                        // console.log(response);
                                        response.on('data', (chunk) => {
                                            // console.log("hhh");
                                            console.log(`${chunk}`);
                                        })
                                        response.on('end', () => { })
                                        // console.log("hhh222");
                                    })
                                    request.on('error', (error) => {
                                        console.log(`ERROR: ${(error)}`)
                                    })
                                    request.setHeader('Content-Type', 'application/json');
                                    request.write(body, 'utf-8');
                                    request.end();
                                }
                            });
                        });
                    }
                });
        };
    });
};
// --------------------- Code for Fetching Processor Serial Number End Here ------------------------------------------------
//----------------------Code for clear cache or cookies when utilisation is above 90% Start Here-------------------------------------------
let functionExecuted = false;
ipcMain.on('check_getUtilisation', function (e) {
    getUtilisation();
});
function getUtilisation() {
    var result = [];
    const cpu = osu.cpu;
    const disks = nodeDiskInfo.getDiskInfoSync();

    // global.clientID = 8;
    // console.log(global.clientID);
    total_ram = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
    free_ram = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);
    utilised_RAM = (total_ram - free_ram).toFixed(1);


    cpu.usage()
        .then(info => {

            if (info == 0) {
                info = 1;
            }
            var ram_percentage = (utilised_RAM / total_ram) * 100;
            var percentage = 90;

            if (ram_percentage >= percentage || info >= percentage) {
                console.log(ram_percentage);
                // logEverywhere(ram_percentage);

                if (!functionExecuted) {
                    // Execute your function here
                    console.log("Function executed!");
                    functionExecuted = true;
                    dialog.showMessageBox({ message: "Your memory utilisation is above 90%" });
                }
            }
            else
                console.log('Your memory utilisation is less than 90%------------------------');
        })
}


//----------------------Code for clear cache or cookies when utilisation is above 90% End Here-------------------------------------------
// --------------------- Code of Install and Allocated Licenses Comparision Start Here ---------------------

ipcMain.on('checkinstalledlicenses', function (e, form_data) {
    console.log('checkinstalledlicenses', form_data);
    // logEverywhere('In check Call');

    var body = JSON.stringify({ "funcType": 'get_licenses_details', "email": form_data['email'] });
    console.log('body', body);
    
    const request = net.request({
        method: 'POST',
        url: root_url + '/licenses_detailis.php'
    });
    
    request.setHeader('Content-Type', 'application/json');

    request.on('response', (response) => {
        let data = '';
        response.on('data', (chunk) => {
            data += chunk;
            console.log('chunk:', chunk)
        });
        response.on('end', () => {
            console.log('data:', data)
            try {
                const obj = JSON.parse(data);
                console.log(obj.install_licenses);
                console.log(obj.allocated_licenses);
                console.log(obj.sql);
                if (obj.status === 'failed' || obj.status === 'success' || obj.status === 'error') {
                    e.reply('checked_installed_licenses', obj);
                    //  logEverywhere(`In check ${obj.status} Call`);
                } else {
                    console.log('Unexpected status:', obj.status);
                }
            } catch (e) {
                console.log('checkinstalledlicenses: No proper response received', e);
            }
        });
    });

    request.on('error', (error) => {
        console.log('Error while checking install and allocated licenses', error);
    });

    request.write(body, 'utf-8');
    request.end();
});


ipcMain.on('quit-app', () => {
    app.quit();
});
// --------------------- Code of Install and Allocated Licenses Comparision End Here --------------------
//----------------------- Start Code of check User Behaviour Permission ---------------------------------

let globalValidStatus = false; // Global variable to store valid status

function checkUserProductivityPermission() {
    console.log("Inside checkUserProductivityPermission function");
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Check checkUserProductivityPermission Cookies");

                        require('dns').resolve('www.google.com', function (err) {
                            if (err) {
                                console.log("No connection");
                            } else {
                                var body = JSON.stringify({ "funcType": 'check_user_productivity_permission', "sys_key": cookies[0].name });
                                console.log(body);
                                const request = net.request({
                                    method: 'POST',
                                    url: root_url + '/user_productivity.php'
                                });
                                // console.log("here");
                                request.on('response', (response) => {
                                    //console.log(`STATUS: ${response.statusCode}`)
                                    response.on('data', (chunk) => {
                                        console.log(`${chunk}`);
                                        if (chunk) {
                                            let a;
                                            try {
                                                var obj = JSON.parse(chunk);
                                                if (obj.status == 'valid') {
                                                    console.log(obj.message);
                                                    //  logEverywhere(obj.message);
                                                    console.log(obj.sql);
                                                    globalValidStatus = true;
                                                    //logEverywhere(globalValidStatus);
                                                }


                                            } catch (e) {
                                                return console.log('checkUserProductivityPermission: No proper response received'); // error in the above string (in this case, yes)!
                                            }
                                        }
                                    })
                                    response.on('end', () => { })
                                })
                                request.on('error', (error) => {
                                    console.log(`ERROR: ${(error)}`)
                                })
                                request.setHeader('Content-Type', 'application/json');
                                request.write(body, 'utf-8');
                                request.end();
                            }
                        });

                    }
                });
        };
    });
}
//----------------------- End Code of check User Behaviour Permission -----------------------------------

//----------------------- Start Code of User Behaviour Slots Available for Asset ---------------------------------
global.last_sync_date = '';

function getUserProductivity() {
    console.log("Inside getUserProductivity function");
    // logEverywhere("Inside getUserProductivity function");
    require('dns').resolve('www.google.com', function (err) {
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside getUserProductivity Cookies");

                        require('dns').resolve('www.google.com', function (err) {
                            if (err) {
                                console.log("No connection");
                            }
                            else {
                                var filePath = "C:/ITAMEssential/user_productivity.txt";
                                function readExistingData() {
                                    try {
                                        if (fs.existsSync(filePath)) {
                                            rawData = fs.readFileSync(filePath, 'utf8');
                                            return rawData;
                                        }
                                        return {}; // Return empty object if file doesn't exist or is empty
                                    } catch (error) {
                                        console.log('Error reading existing data:', error.message);
                                        return {}; // Return empty object on error
                                    }
                                }
                                const data = readExistingData();
                                var body = JSON.stringify({ "funcType": 'insert_user_productivity', "sys_key": cookies[0].name, "utilization_data": data });
                                const request = net.request({
                                    method: 'POST',
                                    url: root_url + '/user_productivity.php'
                                });
                                // console.log("here");
                                request.on('response', (response) => {
                                    //console.log(`STATUS: ${response.statusCode}`)
                                    response.on('data', (chunk) => {
                                        console.log(`${chunk}`);
                                        if (chunk) {
                                            let a;
                                            try {
                                                var obj = JSON.parse(chunk);
                                                if (obj.status == 'valid') {
                                                    console.log(obj.status);
                                                    console.log(obj.result);
                                                    fs.writeFile(filePath, '', (err) => {
                                                        if (err) {
                                                            return reject(`Error clearing the file: ${err.stack}`);
                                                        }

                                                    });
                                                }


                                            } catch (e) {
                                                return console.log('insert_user_productivity: No proper response received'); // error in the above string (in this case, yes)!
                                            }
                                        }
                                    })
                                    response.on('end', () => { })
                                })
                                request.on('error', (error) => {
                                    console.log(`ERROR: ${(error)}`)
                                })
                                request.setHeader('Content-Type', 'application/json');
                                request.write(body, 'utf-8');
                                request.end();
                            }
                        });

                    }
                });
        };
    });
}
//----------------------- End Code of check User Behaviour Slots Available for Asset -----------------------------------



// --------------------- New user Productivity Code Start Here ---------------------------------------

function runInstalledSoftwareScript() {
    return new Promise((resolve, reject) => {
        // logEverywhere('In runInstalledSoftwareScript');

        const scriptContent = `
          # PowerShell script to collect running software processes

          $backgroundProcesses = @(
              "csrss", "smss", "wininit", "services", "lsass", "svchost",
              "winlogon", "spoolsv", "explorer", "taskhostw", "System", 
              "Registry", "Idle", "dllhost", "sihost", "taskmgr"
          )

          $processes = Get-Process | Where-Object {
              $_.MainWindowTitle -ne "" -and
              $backgroundProcesses -notcontains $_.Name
          }

          $uniqueProcesses = $processes | Group-Object Name | ForEach-Object { $_.Group | Select-Object -First 1 }

          $processInfo = @()
          foreach ($process in $uniqueProcesses) {
              $cpuTime = $process.CPU
              $memoryMB = [math]::Round($process.WorkingSet64 / 1MB, 2)
              $processInfo += [PSCustomObject]@{
                  Name = $process.Name
                  MainWindowTitle = $process.MainWindowTitle
                  'CPU (s)' = [math]::Round($cpuTime, 2)
                  'Memory (MB)' = $memoryMB
              }
          }

          $json = $processInfo | ConvertTo-Json -Depth 3
          Write-Output $json
      `;

        const scriptPath = 'C:/ITAMEssential/used_software.ps1';

        fs.writeFile(scriptPath, scriptContent, (err) => {
            if (err) {
                // logEverywhere('Error writing PowerShell script: ' + err.message);
                logEverywhere(`ERROR at 9377: ${err}`)
                return reject(err);
            }

            // const child = spawn('powershell.exe', ['-File', scriptPath]);
            try {
                child = spawn("powershell.exe", ["C:\\ITAMEssential\\used_software.ps1"]);
                let scriptOutput = '';
    
                child.stdout.on('data', (data) => {
                    scriptOutput += data.toString();
                });
    
                child.stderr.on('data', (error) => {
                    //logEverywhere('Powershell Error: ' + error.toString());
                    return reject(new Error(error.toString()));
                });
    
                child.on('exit', (code) => {
                    //logEverywhere('Powershell Script exited with code ' + code);
                    scriptOutput = scriptOutput.replace(/\r?\n|\r|\s+/g, ''); // Remove extra spaces and newlines
                    console.log('Script Output: ' + scriptOutput);
                    //   logEverywhere('Powershell Executed of used software');
                    resolve(scriptOutput);
                });
            } catch (error) {
                logEverywhere(`ERROR at 9401: ${error}`)
            }
        });
    });
}

function escapeSingleQuotes(str) {
    return str.replace(/'/g, "''");
}

function fetchChromeHistoryScript() {
    return new Promise((resolve, reject) => {
        const d = global.last_sync_date;
        //logEverywhere('d: ' + d);

        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);

        const last_sync_date_js = global.last_sync_date ? new Date(global.last_sync_date) : startOfToday;


        //  logEverywhere('last_sync_date_js: ' + last_sync_date_js);

        const chromeHistoryPath = path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'User Data', 'Default', 'History');
        if (!fs.existsSync(chromeHistoryPath)) {
            //  logEverywhere('Chrome history not found.');
            console.log('Chrome history not found.');
            return reject('Chrome history not found.');
        }

        const tempChromeHistoryPath = path.join(process.env.TEMP, 'ChromeHistoryCopy');
        fs.copyFileSync(chromeHistoryPath, tempChromeHistoryPath);

        const db = new sqlite3.Database(tempChromeHistoryPath);

        const query = `
      SELECT url, title, datetime(last_visit_time/1000000-11644473600, 'unixepoch', 'localtime') as last_visit_time
      FROM urls
      ORDER BY last_visit_time DESC
    `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.log('Failed to fetch history:', err);
                //  logEverywhere('Failed to fetch history:');
                return reject(err);
            }

            const newHistoryEntries = rows
                .filter(entry => {

                    const lastVisitDate = new Date(entry.last_visit_time);
                    return lastVisitDate >= last_sync_date_js;
                })
                .map(entry => ({
                    url: escapeSingleQuotes(entry.url.replace(/\r?\n|\r|\s+/g, '')),
                    title: escapeSingleQuotes(entry.title.replace(/\r?\n|\r|\s+/g, '')),
                    last_visit_time: entry.last_visit_time.replace(/\r?\n|\r|\s+/g, '')
                }));
            // Assuming existing data is stored in a file, you can read it like this
            // let existingData;
            // try {
            //   const filePath = "C:/ITAMEssential/path/to/your/existingData.json"; // Specify the correct path to your file
            //   if (fs.existsSync(filePath)) {
            //     const rawData = fs.readFileSync(filePath, 'utf8');
            //     existingData = rawData ? JSON.parse(rawData) : [];
            //   } else {
            //     existingData = [];
            //   }
            // } catch (error) {
            //   console.error('Failed to read existing data:', error);
            //   existingData = [];
            // }

            //const updatedHistory = existingData.concat(newHistoryEntries);

            if (newHistoryEntries.length > 0) {
                // logEverywhere('New history found and appended to existing data.');
                resolve(newHistoryEntries);
            } else {
                //  logEverywhere('No new history entries found since last sync.');
                resolve('No new history entries found since last sync.');
            }

            db.close();
        });
    });
}




// function fetchChromeHistoryScript() {
//   return new Promise((resolve, reject) => {
//     //console.log('global.last_sync_date'+global.last_sync_date);
//     let d = global.last_sync_date;
//     logEverywhere('d'+d);
//     let without_time = d.split(' ');
//     logEverywhere(without_time);
//     let last_sync_date_js = without_time;
//     let last_sync_date;
//     logEverywhere('last_sync_date_js'+last_sync_date_js);
//     console.log('global.last_sync_date++++'+last_sync_date_js);

//    if (last_sync_date_js === null || last_sync_date_js === undefined || last_sync_date_js === '') {
//       let currentDate = new Date();
//       let formattedDate1 = currentDate.toISOString().slice(0, 19).replace('T', ' ');
//       let formattedDate = currentDate.toISOString().split('T')[0];
//       logEverywhere('Today'+formattedDate);
//       console.log('last_sync_date is null++++'+formattedDate);
//       last_sync_date = formattedDate;
//    } 
//    else 
//    {
//      last_sync_date = last_sync_date_js;
//      console.log('last_sync_date is not null-----'+last_sync_date);
//      logEverywhere('last_sync_date'+last_sync_date);

//    }
//    console.log('last_sync_date is not null-----'+last_sync_date);
//     const scriptContent = `
//     param (
//     [string]$last_sync_date
// )
//      # Ensure you have the SQLite module installed
// if (-not (Get-Module -ListAvailable -Name PSSQLite)) {
//     Install-Module -Name PSSQLite -Force -Scope CurrentUser
// }

// # Function to fetch Chrome history and its size
// function Get-ChromeHistory {
//     $chromeHistoryPath = "$env:LOCALAPPDATA\\Google\\Chrome\\User Data\\Default\\History"
//     if (-Not (Test-Path $chromeHistoryPath)) {
//         Write-Host "Chrome history not found."
//         return
//     }

//     $tempChromeHistoryPath = "$env:TEMP\\ChromeHistoryCopy"

//     # Retry mechanism to handle database lock
//     $retryCount = 5
//     $success = $false
//     for ($i = 0; $i -lt $retryCount; $i++) {
//         try {
//             Copy-Item -Path $chromeHistoryPath -Destination $tempChromeHistoryPath -Force
//             $success = $true
//             break
//         } catch {
//             Write-Host "Attempt $($i + 1) failed: Database is locked. Retrying..."
//             Start-Sleep -Seconds 2
//         }
//     }

//     if (-not $success) {
//         Write-Host "Failed to copy Chrome history database after multiple attempts."
//         return
//     }

//     Import-Module PSSQLite

//     $query = @"
//         SELECT url, title, datetime(last_visit_time/1000000-11644473600,'unixepoch','localtime') as last_visit_time
//         FROM urls
//         ORDER BY last_visit_time DESC
// "@

//     $history = Invoke-SqliteQuery -DataSource $tempChromeHistoryPath -Query $query
//     if ($history -eq $null) {
//         Write-Host "No history found or failed to fetch history."
//     } else {
//         $history | Format-Table -Property url, title, last_visit_time -AutoSize
//     }

//     # Calculate the size of the history
//     $sizeQuery = "PRAGMA page_count;"
//     $pageCount = (Invoke-SqliteQuery -DataSource $tempChromeHistoryPath -Query $sizeQuery).page_count
//     $pageSizeQuery = "PRAGMA page_size;"
//     $pageSize = (Invoke-SqliteQuery -DataSource $tempChromeHistoryPath -Query $pageSizeQuery).page_size
//     $totalSize = $pageCount * $pageSize

//     return @{
//         History = $history
//         Size = $totalSize
//     }
// }

// # Function to get the last sync time
// #function Get-LastSyncTime {
//  #   # Replace this with actual logic to retrieve the last sync time
//   #  # For demonstration, we'll use a hardcoded date
//    # return [datetime]::Parse("2024-01-11T12:00:00")
// #}

// # Fetch Chrome history
// $chromeHistory = Get-ChromeHistory
// if ($chromeHistory) {
//      $lastSyncTime = $last_sync_date

//    # Write-Host "$($chromeHistory.Size/1024) KB"

//     $newHistoryEntries = @()

//     # Compare last sync time with last visit time
//     foreach ($entry in $chromeHistory.History) {
//         $lastVisitTime = [datetime]::Parse($entry.last_visit_time)
//          $formattedLastVisitTime = $lastVisitTime.ToString("yyyy-MM-dd")

//          if ($formattedLastVisitTime -ge $lastSyncTime -or $formattedLastVisitTime -gt $lastSyncTime) 
//          {
//             $newEntry = [PSCustomObject]@{
//                 URL = $entry.url
//                 Title = $entry.title
//                 LastVisitTime = $entry.last_visit_time
//             }
//             $newHistoryEntries += $newEntry
//         }
//     }

//     if ($newHistoryEntries.Count -gt 0) {
//         $newHistoryJson = $newHistoryEntries | ConvertTo-Json -Depth 3
//         Write-Host $newHistoryJson
//     } else {
//         Write-Host "No new history entries found since last sync."
//     }
// }

// `;


//       const scriptPath = 'C:/ITAMEssential/get_chrome_history.ps1';

//       fs.writeFile(scriptPath, scriptContent, function(err) {
//           if (err) {
//               console.error('Error writing PowerShell script:', err);
//               reject(err);
//           }

//           //const child = spawn('powershell.exe', ['-File', scriptPath]);
//           const child = spawn('powershell.exe', ['-File', scriptPath, '-last_sync_date', last_sync_date]);

//           let scriptOutput = '';

//           child.stdout.on('data', function(data) {
//               scriptOutput += data.toString();
//           });

//           child.stderr.on('data', function(error) {
//               console.error('Powershell Error:', error.toString());
//           });

//           child.on('exit', function(code) {
//             //  console.log('Powershell Script exited with code ' + code);
//               scriptOutput = scriptOutput.replace(/\r?\n|\r|\s+/g, '');
//               logEverywhere('Powershell Executed of chrome history');
//             //  console.log(scriptOutput);
//            //   const chromeHistory = JSON.parse(scriptOutput);
//               resolve(scriptOutput);
//           });
//       });
//   });
// }


ipcMain.on('fetchUserProductivity', async function (e) {
    try {
        console.log('In fetchUserProductivity Function');

        if (globalValidStatus) {
            const output = await runInstalledSoftwareScript();

            // Await the result of fetchChromeHistoryScript
            const chromeHistory = await fetchChromeHistoryScript();

            console.log('chromeHistory:', chromeHistory);

            // Proceed with your other logic here
            const disks = nodeDiskInfo.getDiskInfoSync();
            total_ram = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1); // total RAM
            free_ram = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1); // free RAM
            utilised_RAM = (((total_ram - free_ram) / total_ram) * 100).toFixed(1); // % RAM used
            today = Math.floor(Date.now() / 1000);

            hdd_total = hdd_used = 0;
            hdd_name = '';
            for (const disk of disks) {
                if (disk.filesystem === 'Local Fixed Disk') {
                    hdd_total += disk.blocks;
                    hdd_used += disk.used;
                    used_drive = (disk.used / (1024 * 1024 * 1024)).toFixed(2); // disk used in GB
                    hdd_name = hdd_name.concat(disk.mounted + ' ' + used_drive + ' / ');
                }
            }

            hdd_total = hdd_total / (1024 * 1024 * 1024);
            hdd_used = hdd_used / (1024 * 1024 * 1024);

            const cpu = osu.cpu;
            cpu.usage().then(info => {
                cpu_used = info || 1;
                console.log('CPU Utilization:', cpu_used);

                const utilisation_data = {
                    cpu_util: cpu_used,
                    ram_util: utilised_RAM,
                    total_mem: total_ram,
                    hdd_total: hdd_total,
                    hdd_used: hdd_used,
                    hdd_name: hdd_name,
                    usedAppData: output,
                    chromeHistoryData: chromeHistory,  // Assign chromeHistory here
                };

                const filePath = "C:/ITAMEssential/user_productivity.txt";

                function readExistingData() {
                    try {
                        if (fs.existsSync(filePath)) {
                            const rawData = fs.readFileSync(filePath, 'utf8');
                            return JSON.parse(rawData);
                        }
                        return {};
                    } catch (error) {
                        console.log('Error reading existing data:', error.message);
                        return {};
                    }
                }

                function writeDataToFile(data) {
                    const jsonData = JSON.stringify(data, null, 2);
                    fs.writeFileSync(filePath, jsonData, 'utf8');
                    console.log(`Data has been written to ${filePath}`);
                }

                function formatDateTime(date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
                    const day = String(date.getDate()).padStart(2, '0');
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');

                    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
                }

                function addNewEntry() {
                    const data = readExistingData();
                    const dateTime1 = formatDateTime(new Date());
                    data[dateTime1] = utilisation_data;
                    writeDataToFile(data);
                    global.last_sync_date = dateTime1;

                }

                addNewEntry();
            });
        } else {
            console.log("Global variable is false, waiting for valid status...");
        }
    } catch (error) {
        console.log('Error in fetchUserProductivity:', error.message);
    }
});


//----------------------- New User Productivity Code End Here ----------------------------------------
//Level Fetching Code 

ipcMain.on('loadAllocLevel1', function (e, data) {
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside loadAllocLevel1 Call');
        if (err) {
            console.log("No connection");
        } else {

            console.log('User Id' + data.user_id);
            var body = JSON.stringify({ "funcType": 'getAllocLevel1', "user_id": data.user_id });
            const request = net.request({
                method: 'POST',
                url: root_url + '/login.php'
            });
            console.log('Before chunk: ');
            request.on('response', (response) => {
                //console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            console.log('chunk: ' + chunk);
                            console.log(obj.status);
                            console.log(obj.sql)
                            if (obj.status == 'valid') {
                                e.reply('setAllocLevel1', obj.result, obj.user_id);
                            } else {
                                e.reply('setAllocLevel1', '');
                            }
                        } catch (e) {
                            return console.log('getAllocLevel1: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                log.info('Error while getting allocated Department detail ' + `${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();

        };
    });
});
ipcMain.on('loadAllocLevel2', function (e, data) {
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside loadAllocLevel2 Call');
        if (err) {
            console.log("No connection");
        } else {
            const { user_id, level1_parent_id } = data;
            var body = JSON.stringify({ "funcType": 'getAllocLevel2', "user_id": data.user_id, "level1_id": data.level1_parent_id });
            const request = net.request({
                method: 'POST',
                url: root_url + '/login.php'
            });
            console.log('Before chunk: ');
            request.on('response', (response) => {
                //console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            console.log('chunk: ' + chunk);
                            console.log(obj.status)
                            if (obj.status == 'valid') {
                                e.reply('setAllocLevel2', obj.result, obj.user_id);
                            } else {
                                e.reply('setAllocLevel2', '');
                            }
                        } catch (e) {
                            return console.log('getAllocLevel2: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                log.info('Error while getting allocated Department detail ' + `${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();

        };
    });
});
ipcMain.on('loadAllocLevel3', function (e, data) {
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside loadAllocLevel3 Call');
        if (err) {
            console.log("No connection");
        } else {

            var body = JSON.stringify({ "funcType": 'getAllocLevel3', "user_id": data.user_id, "level2_id": data.level2_parent_id });
            const request = net.request({
                method: 'POST',
                url: root_url + '/login.php'
            });
            console.log('Before chunk: ');
            request.on('response', (response) => {
                //console.log(`STATUS: ${response.statusCode}`)
                response.on('data', (chunk) => {
                    if (chunk) {
                        let a;
                        try {
                            var obj = JSON.parse(chunk);
                            console.log('chunk: ' + chunk);
                            console.log(obj.status)
                            if (obj.status == 'valid') {
                                e.reply('setAllocLevel3', obj.result, obj.user_id);
                            } else {
                                e.reply('setAllocLevel3', '');
                            }
                        } catch (e) {
                            return console.log('getAllocLevel3: No proper response received'); // error in the above string (in this case, yes)!
                        }
                    }
                })
                response.on('end', () => { })
            })
            request.on('error', (error) => {
                log.info('Error while getting allocated Department detail ' + `${(error)}`)
            })
            request.setHeader('Content-Type', 'application/json');
            request.write(body, 'utf-8');
            request.end();

        };
    });
});

// --------------------------------- Start code of Notification -------------------------------------

// ipcMain.on('check_notifcation_asset_request',function(e) { 
//   console.log('check_notifcation_asset_request');
//   //  logEverywhere('In CSAR');
//     require('dns').resolve('www.google.com', function(err) {
//     //  logEverywhere('Inside Scrap Asset Call');
//      if (err) {
//      // logEverywhere("No connection");
//       } 
//       else 
//       {
//         session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
//         .then((cookies) => {
//         if(cookies.length > 0)
//         {
//             var body = JSON.stringify({ "sys_key": cookies[0].name, "functionType" : 'check_new_notification'}); 
//           // console.log(body);
//             const request = net.request({ 
//                 method: 'POST', 
//                 url: root_url+'/notification.php' 
//             }); 
//           request.on('response', (response) => {
//             //  console.log(response);
//               response.on('data', (chunk) => {
//               console.log(`${chunk}`);         // comment out
//                 if (chunk) {
//                   let a;
//                   try {
//                     var obj = JSON.parse(chunk);
//                       console.log(obj.policyData);
//                     //  logEverywhere(obj);
//                       if(obj.status == 'valid')
//                       {

//                         policyData = obj.policyData;
//                           asset_name = obj.asset_name;
//                           global.memberId = obj.client_id;
//                           var policy_data_new = policyData[0];
//                           if (policyData.length > 0) {
//                             var index_key = 0;
//                             policyData.forEach((policy, index) => {
//                               setTimeout(() => {

//                                 notifier.notify(
//                                   {
//                                     title: policy.title,
//                                     message: policy.policy,
//                                     wait: true // Wait for user action
//                                   },
//                                   function (err, response, metadata) {
//                                     if (err) {
//                                       console.error('Notification error:', err);
//                                     } else {
//                                       console.log('User response:', response);
//                                       console.log('Metadata:', metadata); // Useful for tracking user's interaction
//                                     }
//                                   }
//                                 );

//                               }, index * 600000); // Delay each policy display by 10 minute
//                           });
//                         }


//                       }
//                       else{
//                         //logEverywhere("Inside Scrap Asset In Valid Else Part");   
//                       }
//                   } catch (e) {
//                       return console.log('check_new_notification: No proper response received'); // error in the above string (in this case, yes)!
//                   }
//                 } 
//               })
//               response.on('end', () => {})
//           })
//           request.on('error', (error) => { 
//               console.log(`ERROR: ${(error)}`) 
//           })
//           request.setHeader('Content-Type', 'application/json'); 
//           request.write(body, 'utf-8'); 
//           request.end();
//       }
//     });
//   };
//   });});





// --------------------------------- End code of Notification -------------------------------------

// ------------------------------------- Start Code of domain name --------------------
function domainName() {
    domainName = '(systeminfo | Findstr /B /C:"Domain").Replace("Domain:", "").Trim()';
    const path21 = 'C:/ITAMEssential/domainName.ps1';

    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Mouse changes Call');
        //logEverywhere('Inside Mouse changes Function');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {
                    if (cookies.length > 0) {
                        console.log("Inside Domain Name Cookies");

                        console.log(cookies[0].name);

                        fs.writeFile(path21, domainName, function (err) {
                            if (err) {
                                // throw err;
                                logEverywhere(`ERROR at 10019: ${err}`)
                            }
                            else {
                                try {
                                    var split_data = [];
                                    console.log('Domain name Powershell Script File Created');
                                    // Execute bat file part:
                                    child = spawn("powershell.exe", ["C:\\ITAMEssential\\domainName.ps1"]);
                                    child.stdout.on('data', (data) => {
                                        console.log('PowerShell Output:', data.toString());
                                        const cleanOutput = data.toString().trim(); // Removes \r\n or any extra spaces
                                        console.log('Cleaned Output:', cleanOutput);
                                        split_data.push(cleanOutput);
                                    });
    
                                    child.stderr.on('data', (errData) => {
                                        console.log('++++++++++++++++++++++++++++++++++++==================');
                                        console.log('PowerShell Error:', errData.toString());
                                    });
                                    child.on("exit", function () {
                                        console.log("Domain Ps1 executed");
                                        console.log(split_data);
                                        var domain_data = split_data.toString('utf8');
                                        console.log('domain_data' + domain_data);
                                        updateDomainName(domain_data, cookies[0].name);
                                        child.stdin.end(); //end input
                                    });
                                } catch (error) {
                                    logEverywhere(`ERROR at 10047: ${error}`)
                                }

                            }
                        });
                    }
                });
        }
    });
}

function updateDomainName(data, sys_key) {
    console.log("Inside updateDomainName function");
    console.log("Here Buffer");


    var body = JSON.stringify({
        "funcType": 'updateDomainName',
        "domain_name": data,
        "sys_key": sys_key,
    });
    const request = net.request({
        method: 'POST',
        url: root_url + '/hardware_list.php'
    });
    request.on('response', (response) => {
        // console.log(response);
        //console.log(`STATUS: ${response.statusCode}`)
        response.on('data', (chunk) => {
            console.log(`${chunk}`);
            // console.log(chunk);
        })
        response.on('end', () => {
        });
    })
    request.on('error', (error) => {
        log.info('Error while updating Domain Name outputs ' + `${(error)}`)
    })
    request.setHeader('Content-Type', 'application/json');
    request.write(body, 'utf-8');
    request.end();

};


//-----------------------------End Of Domain Name Code -----------------------------------
// ---------------------- start last login code ---------------------------------------------

ipcMain.on('check_lastlogin', function (e) {
    itamLastLogin();

});
function itamLastLogin() {
    require('dns').resolve('www.google.com', function (err) {
        console.log('Inside Last Login Call');
        //logEverywhere('Inside Check Hardware Call  in log');
        if (err) {
            console.log("No connection");
        } else {
            session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
                .then((cookies) => {

                    var body = JSON.stringify({
                        "funcType": 'updateLastLogin',
                        "sys_key": cookies[0].name,
                    });
                    const request = net.request({
                        method: 'POST',
                        url: root_url + '/hardware_list.php'
                    });
                    request.on('response', (response) => {
                        // console.log(response);
                        //console.log(`STATUS: ${response.statusCode}`)
                        response.on('data', (chunk) => {
                            console.log(`${chunk}`);
                            // console.log(chunk);
                        })
                        response.on('end', () => {
                        });
                    })
                    request.on('error', (error) => {
                        log.info('Error while updating Mouse Name outputs ' + `${(error)}`)
                    })
                    request.setHeader('Content-Type', 'application/json');
                    request.write(body, 'utf-8');
                    request.end();

                });
        };
    });
}

//-------------------------------------------
//         get utilization graph
//-------------------------------------------
function convertBytes(bytes, format) {
    const formats = {
        'b': 1,
        'kb': 1024,
        'mb': 1024 ** 2,
        'gb': 1024 ** 3,
        'tb': 1024 ** 4,
    };

    if (!formats[format]) {
        throw new Error(`Invalid format: ${format}`);
    }

    const value = bytes / formats[format];
    return `${value.toFixed(2)} ${format}`.toUpperCase();
}

let last60SecRamUsage = []
async function getRamUsage() {
    const { total, free, used } = await si.mem()
    last60SecRamUsage.push({ total, free, used })
    if (last60SecRamUsage.length > 60) {
        last60SecRamUsage.shift()
    }
    return { total, free, used }
}
// setInterval(getRamUsage, 1000)
ipcMain.handle("get-ram-usage", getRamUsage)

// let ramDetails = undefined
async function getRamDetails() {
    const ramDetails = await si.memLayout()
    let parsedRamDetails = []

    // const deviceID = await (await si.bios()).serial
    ramDetails.forEach(ram => {
        // console.log({ram})
        parsedRamDetails.push({
            "Slot no": ram.bank.replaceAll("/", ""),
            "Type": ram.type,
            "Serial no": ram.serialNum,
            "Speed": ram.clockSpeed,
            "Size": convertBytes(ram.size, "gb")
        })
    })

    // ramDetails = parsedRamDetails
    return parsedRamDetails
}
// getRamDetails()
ipcMain.handle('get-ram-details', getRamDetails)
// ipcMain.handle('get-ram-details', () => {
// 	return ramDetails
// })


let last60SecCpuUsage = []
async function getCpuUsage() {
    const currentLoad = (await si.currentLoad()).currentLoad;
    // console.log((await si.currentLoad()).currentLoad)
    last60SecCpuUsage.push(currentLoad)
    if (last60SecCpuUsage.length > 60) {
        last60SecCpuUsage.shift()
    }
    return {
        currentLoad,
    }
}
// setInterval(getCpuUsage, 1000)
ipcMain.handle("get-cpu-usage", getCpuUsage)


async function getCpuDetails() {
    const cpu = await si.cpu()
    const cpuDetails = [
        {
            "Manufacturer": cpu.manufacturer,
            "Brand": cpu.brand,
            "Speed": cpu.speed,
            "Min speed": cpu.speedMin,
            "Max speed": cpu.speedMax,
        }, {
            "Cores": cpu.cores,
            "Physical cores": cpu.physicalCores,
            "Performance cores": cpu.performanceCores,
            "Processors": cpu.processors,
            "Virtualization": cpu.virtualization,
        }
    ]
    return cpuDetails
}
ipcMain.handle("get-cpu-details", getCpuDetails)


let last60SecDiskUsage = []
async function getDiskUsage() {
    const diskSizes = await si.fsSize()
    let diskUsage = {
        total: 0,
        used: 0,
        free: 0
    }
    for (let i = 0; i < diskSizes.length; i++) {
        diskUsage.total += diskSizes[i].size
        diskUsage.used += diskSizes[i].used
        diskUsage.free += diskSizes[i].available
    }
    last60SecDiskUsage.push(diskUsage)
    if (last60SecDiskUsage.length > 60) {
        last60SecDiskUsage.shift()
    }
    return diskUsage
}
// setInterval(getDiskUsage, 1000);
ipcMain.handle("get-disk-usage", getDiskUsage)


async function getDiskDetails() {
    const diskSizes = await si.fsSize()
    const diskLayout = await si.diskLayout()

    // console.log(diskSizes)

    let result = []
    for (let i = 0; i < diskSizes.length; i++) {
        result.push({
            "Label": diskSizes[i].mount.replaceAll(":", ""),
            "Serial no": diskLayout[i].serialNum,
            "File system": diskSizes[i].type,
            "Total size": convertBytes(diskSizes[i].size, "gb").toUpperCase(),
            "Used size": convertBytes(diskSizes[i].used, "gb").toUpperCase(),
            "Free size": convertBytes(diskSizes[i].available, "gb").toUpperCase(),
            "Used percentage": diskSizes[i].use,
            "Type": diskLayout[i].type,
            "Name": diskLayout[i].name,
            "Status": diskLayout[i].smartStatus,
            "Interface Type": diskLayout[i].interfaceType,
        })
    }
    return result
}
ipcMain.handle("get-disk-details", getDiskDetails)


// const MONTHS = 'jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec'.split(',')
function generateJSONFileName(date) {
    // const d = new Date(date)
    // return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}.json`
    return `${format(new Date(date), "d MMM yyyy")}.json`
}

const SAVE_INSTANT_UTILIZATION_DATA_EVERY = 1000 * 60 * 5 // 5 mins
let lastSaveTimestamp = Date.now() - SAVE_INSTANT_UTILIZATION_DATA_EVERY
const baseAppPath = "C:/ITAMEssential/";
// console.log('path',app.getAppPath())
const localDbPath = path.join("C:/ITAMEssential/", "db")
// const last60SecDataPath = path.join(dbPath, "last-60-sec-data.json")

async function saveInstantUtilization() {
    const [ram, cpu, disk] = await Promise.all([
        getRamUsage(),
        getCpuUsage(),
        getDiskUsage()
    ])
    const data = { [(new Date()).toISOString()]: { ram, cpu, disk } }

    if (!fs.existsSync(baseAppPath)) {
        fs.mkdirSync(baseAppPath)
    }

    const dbPathExist = fs.existsSync(localDbPath)
    if (!dbPathExist) {
        fs.mkdirSync(localDbPath)
    }

    if (Date.now() - lastSaveTimestamp < SAVE_INSTANT_UTILIZATION_DATA_EVERY) { return }

    const jsonFileNameOfToday = path.join(localDbPath, generateJSONFileName(new Date()));
    const isJsonFileOfTodayExist = fs.existsSync(jsonFileNameOfToday);

    if (!isJsonFileOfTodayExist) {
        fs.writeFileSync(jsonFileNameOfToday, JSON.stringify(data, null, 2));
        lastSaveTimestamp = Date.now()

        console.log('saved graph data in local json file at:', lastSaveTimestamp)
        return;
    }

    let fileData = JSON.parse(fs.readFileSync(jsonFileNameOfToday, 'utf-8'));
    fileData = { ...fileData, ...data }

    fs.writeFileSync(jsonFileNameOfToday, JSON.stringify(fileData, null, 2));
    lastSaveTimestamp = Date.now()

    console.log('save instantutilization:', { lastSaveTimestamp, data: JSON.stringify(data), jsonFileNameOfToday })
    // console.log('saved graph data in local json file at:', lastSaveTimestamp)
}
saveInstantUtilization()
setInterval(saveInstantUtilization, SAVE_INSTANT_UTILIZATION_DATA_EVERY);

function getLast60SecInstantUtilizationData() {
    return {
        ram: last60SecRamUsage,
        cpu: last60SecCpuUsage,
        disk: last60SecDiskUsage
    }
}
ipcMain.handle("get-last-60-sec-instant-utilization-data", getLast60SecInstantUtilizationData)

async function getInstantUtilizationDataByDateFilter(range) {
    console.log('graph filter data range:', range)

    if (range == "last-60-seconds") {
        return {
            ram: last60SecRamUsage,
            cpu: last60SecCpuUsage,
            disk: last60SecDiskUsage
        }
    }

    if (range == "today") {
        console.log(' -> inside today:')
        const filename = format(new Date(), "d MMM yyyy") + ".json"
        const filepath = path.join(localDbPath, filename)
        const file_exists = fs.existsSync(filepath)
        console.log(' -> inside today:', { filename, filepath, file_exists })
        if (file_exists) {
            // console.log('today graph filter data:',fs.readFileSync(filepath))
            return JSON.parse(fs.readFileSync(filepath))
        }
        return {}
    }

    if (range == "yesterday") {
        const filename = format(dateFnsSub(new Date(), { days: 1 }), "d MMM yyyy") + ".json"
        const filepath = path.join(localDbPath, filename)
        const file_exists = fs.existsSync(filepath)
        console.log(' -> inside yesterday:', { filename, filepath, file_exists })
        if (file_exists) {
            return JSON.parse(fs.readFileSync(filepath))
        }
        return {}
    }

    if (range == "last-7-days") {
        let results = {}
        for (let day = 1; day <= 7; day++) {
            const filename = format(dateFnsSub(new Date(), { days: day }), "d MMM yyyy") + ".json"
            const filepath = path.join(localDbPath, filename)
            const file_exists = fs.existsSync(filepath)
            console.log(' -> inside last-7-days:', { filename, filepath, file_exists })
            if (file_exists) {
                results = { ...results, ...JSON.parse(fs.readFileSync(filepath)) }
            }
        }
        return results
    }

    if (range == "last-30-days") {
        let results = {}
        for (let day = 1; day <= 30; day++) {
            const filename = format(dateFnsSub(new Date(), { days: day }), "d MMM yyyy") + ".json"
            const filepath = path.join(localDbPath, filename)
            const file_exists = fs.existsSync(filepath)
            console.log(' -> inside last-30-days:', { filename, filepath, file_exists })
            if (file_exists) {
                results = { ...results, ...JSON.parse(fs.readFileSync(filepath)) }
            }
        }
        return results
    }

    return undefined
}
ipcMain.handle("get-instant-utilization-data-by-date-filter", (event, arg) => {
    // console.log("last", arg)
    return getInstantUtilizationDataByDateFilter(arg)
})

// electron.ipcRenderer.invoke("")


// @AC
let windows = {}
function createMainWindow() {

    if (windows['main']) {
        windows['main'].show()
        windows['main'].focus()
        return
    }
    // const mainWindow = 
    windows['main'] = new BrowserWindow({
        width: 280,
        height: 300,
        x: width - (280 + 15),
        // y: 420,
        y: height - (300 + 40),
        icon: __dirname + '/images/ePrompto_png.png',
        titleBarStyle: 'hiddenInset',
        frame: false,
        resizable: false,
        transparent: true,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
        }
    });

    windows['main'].setMenuBarVisibility(false);

    windows['main'].loadURL(path.join(__dirname, 'index.html'));
    // mainWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, 'index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));

    // mainWindow.once('ready-to-show', () => {
    //     autoUpdater.checkForUpdates();
    //     // autoUpdater.checkForUpdatesAndNotify();
    //     // autoUpdater.onUpdateAvailable();
    // });

    // const gotTheLock = app.requestSingleInstanceLock();
    // if (!gotTheLock) {
    //     app.quit();
    // }

    // tray.on('click', function (e) {
    //     if (mainWindow.isVisible()) {
    //         mainWindow.hide();
    //     } else {
    //         mainWindow.show();
    //     }
    // });


    // mainWindow.on('close', function (e) {
    //     // if (process.platform !== "darwin") {
    //     //     app.quit();
    //     // }
    //     // // if (electron.app.isQuitting) {
    //     // //  return
    //     // // }
    //     // e.preventDefault();
    //     // mainWindow.hide();
    //     // // if (child.isVisible()) {
    //     // //     child.hide()
    //     // //   } 
    //     // //mainWindow = null;
    // });

    windows['main'].show()
    windows['main'].on('close', () => {
        delete windows['main']
        // windows['main']?.close()
        // windows['main'] = undefined;
    })
}

function show_exit_popup() {
    // const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = electron.screen.getPrimaryDisplay().bounds;
    // const window_height = 205
    // const window_width = 300
    // const exit_popup = new BrowserWindow({
    //     // width: 392,
    //     // width: 370,
    //     width: window_width,
    //     height: window_height,
    //     icon: __dirname + '/images/ePrompto_png.png',
    //     titleBarStyle: 'hiddenInset',
    //     title: 'Exit eprompto',
    //     // frame: false,
    //     // resizable: false,
    //     // transparent: true,
    //     x: Math.round(SCREEN_WIDTH / 2) - Math.round(window_width / 2),
    //     y: Math.round(SCREEN_HEIGHT / 2) - Math.round(window_height / 2),
    //     webPreferences: {
    //         nodeIntegration: true,
    //         enableRemoteModule: true,
    //     }
    // });

    // console.log("on exit")

    // exit_popup.setMenuBarVisibility(false);

    // // exit_popup.loadURL(path.join(__dirname, 'on_exit_popup.html'));
    // exit_popup.loadURL(url.format({
    //     pathname: path.join(__dirname, 'on_exit_popup.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));
    // exit_popup.show()
    // // app.quit()
    // // on_exit()

    /**************************************/
    /* ANYONE WITH ADMIN RIGHTS CAN EXIT **/
    /**************************************/
    exec('powershell start-process powershell -verb runas -ArgumentList exit', (err, stdout, stderr) => {
        if (err) {
            console.log('on_exit err', err)
            return
        }

        if (stderr) {
            console.log('on_exit stderr', stderr)
            return
        }

        app.exit()
        console.log('stdout', stdout)
    })
}

ipcMain.on('exit_app_form_submit', (event, arguments) => {
    require('dns').resolve('www.google.com', (err) => {
        if (err) {
            console.log("No connection");
            return
        }

        session.defaultSession.cookies.get({ url: 'http://www.eprompto.com' })
            .then((cookies) => {
                if (cookies.length <= 0) return

                const body = JSON.stringify({
                    // admin_email: '',
                    sys_key: cookies[0].name,
                    admin_password: arguments.admin_password
                })

                console.log(body, arguments.admin_password)
                // return

                const request = net.request({
                    method: 'POST',
                    url: root_url + '/itam_password_verify.php'
                });

                let response_data = ''
                request.on('response', (response) => {
                    response.on('data', chunk => {
                        if (chunk) response_data += chunk
                    })
                    response.on('end', () => {
                        console.log(
                            'itam_password_verify response:',
                            {
                                typeof: typeof response_data,
                                data: response_data
                            }
                        )

                        response_data = JSON.parse(response_data)
                        if (response_data?.result) {
                            app.exit()
                            return
                        }

                        event.sender.send('exit_app_form_error', response_data)
                        // console.log(response_data)
                    })
                })

                request.setHeader('Content-Type', 'application/json')
                request.write(body, 'utf-8')
                request.end()
            })
    })
});


function clearCookies(){
    session.defaultSession.clearStorageData([], function (data) {
        console.log(data);
    })
}

app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true
})
// 


//-------------------------------------------



async function setSystemKeyInCookie(key) {  

    await session.defaultSession.clearStorageData({
      storages: ['cookies'] // Clear only cookies
    })

    let cookies = await session.defaultSession.cookies.get({})
  
    cookies = cookies.filter(async cookie => {
      if (
        cookie.name == '' ||
        cookie.name == null ||
        cookie.value == '' ||
        cookie.value == null
      ) {
        await session.defaultSession.cookies.remove(cookie.domain, cookie.name)
        return false
      }
      return true
    })

    console.log('Cookies:',cookies)
  
    // let oldCookie = null
    const systemKeyRegExp = /^ePrompt\d+$/;
    for (let cookie of cookies) {
      // if (oldCookie) {
      //   session.defaultSession.cookies.remove(cookie.domain, cookie.name)
      //   continue
      // }
      if (systemKeyRegExp.test(cookie.name) && systemKeyRegExp.test(cookie.value) && cookie.name == cookie.value) {
        await session.defaultSession.cookies.remove(cookie.domain, cookie.name)
        // oldCookie = cookie
      }
    }
  
    await session.defaultSession.cookies.set({
      url: 'http://www.eprompto.com',
      name: key,
      value: key,
      expirationDate: 9999999999
    })
    .then(()=>console.log('Cookies set successfully', key))
    .catch((err)=>console.error('Cookie set error:',err))
    // console.log(oldCookie)
    // cookies.filter(cookie => { })
  }


// Optionally, to log all messages
ipcMain.eventNames()
.forEach((eventName) => {
    ipcMain.on(eventName, (event, ...args) => {
      console.log('IPC',eventName, args)
    });
  });


ipcMain.handle('get-device-info', async () => {
    const { system } = await si.get({ system: 'serial, uuid' })
    return { serial_num: system.serial, deviceId: system.uuid }
})
