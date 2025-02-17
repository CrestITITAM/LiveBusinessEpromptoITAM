const { ipcRenderer } = require('electron');

var timer = 3000; //for every 5 sec; default

// check Utilisation Code for local:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_fetchUtilisation',input_values);
//  },30000); // 5min

// // Insert User Productivity Data Call
//  setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('getUserProductivity',input_values);
//  },3600000); // 1hour

// Fetch User Productivity Call
setInterval(function () {
    const input_values = {};
    ipcRenderer.send('fetchUserProductivity', input_values);
}, 900000); // 15min

// Last Login Call
setInterval(function () {
    const input_values = {};
    ipcRenderer.send('check_lastlogin', input_values);
    //  },3600000); // 60  min
}, 1000 * 60 * 60); // 60 min

//Check Hardware Changes code starting point:
//  setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_hardware_changes',input_values);
// },600000); // 10min 

//  //Check Software Changes code starting point:
//  setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_software_changes',input_values);
// },300000); // 17min

// // Keyboard Update code start here 
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_keyboard_changes',input_values);
// },1200000); // 20min

// // Mouse Update code start here 
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_mouse_changes',input_values);
// },1320000); // 22min

// // Graphics Card Update code start here 
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_graphic_card',input_values);
// },1380000); // 23min

// // Motherboard Update code start here 
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_motherboard_changes',input_values);
// },1440000); // 24min

// // check scrap asset code:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_scrap_asset_request',input_values);
//  },180000); // 25min

// check notification request code:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_notifcation_asset_request',input_values);
//  },120000); // 2min

// preventive maintenance code starting point for One Time:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Preventive_Maintenance_Main',input_values,'One Time');
// },180000); // 3min

// // preventive maintenance code starting point for Scheduled:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Preventive_Maintenance_Main',input_values,'Scheduled');
// },120000); // 2mins

// // preventive maintenance code starting point for Recurring:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Preventive_Maintenance_Main',input_values,'Recurring');
// },1860000); // 31mins


// patch management code starting point:
//initial call on startup for Gap Analysis / Quick Update
// setTimeout(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Patch_Management_Main',input_values,'One Time');
// },40000); // 40 secs

//continuous call
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Patch_Management_Main',input_values,'One Time');
// },2100000); // 35min


// //continuous call for install_specific_update or uninstall_specific_update
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Patch_Management_Specific',input_values,'One Time');
// },2220000); // 37min

// Network Monitor
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Network_Monitor_Main',input_values,'One Time');
// },120000); // 40min

// // Task Manager starts here:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Task_Manager_Main',input_values,'one-time');
// },240000); // 4min


// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Task_Manager_Main',input_values,'recurring');
// },300000); // 5min

// setTimeout(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Task_Manager_Main',input_values,'to_be_overdue');
// },360000); // 6min

// setTimeout(function(){
// 	const input_values = {};
// 	ipcRenderer.send('Task_Manager_Main',input_values,'overdue');
// },480000); // 8min


// Find my files starting point:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('checkfmfselected',input_values);
// },3300000); //55min

// ipcRenderer.on('filecreated', (event, data) => {
// 	if(data['response'] == 'success'){ 
// 		const input_values = {
// 			fmf_asset_id : data['fmf_asset_id']
// 		};
// 		ipcRenderer.send('execFMFscript',input_values);
// 	}
// });
// Hide app code starting point:

// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('hideEpromptoApp',input_values);
// },9000); // 15secs

// copy my files code starting point:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_copy_my_files_request2',input_values);
// },3480000); //58min

// //Backup files code starting point:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_backup_files_request',input_values);
// },3600000); // 60min

// // User Behavior code starting point:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_user_behavior_request',input_values);
// },1800000);// 30 min

//Location Track code starting point:
// setInterval(function(){
// 	const input_values = {};
// 	ipcRenderer.send('check_location_track_request',input_values);
// },600000);// 10 min

// User Behavior code starting point:
// setInterval(function(){
// 	var input_values =  1000 * 60 * 60 * 24;
// 	ipcRenderer.send('store_localdata_server',input_values);
// },60000);// 30 min

