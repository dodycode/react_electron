const uuid = require('uuid-js');
const electron = require('electron');
const fs = require('fs');

const {
	app,
	BrowserWindow,
	Menu,
	ipcMain
} = electron;

let mainWindow, createWindow, listWindow;
let allAppointments = [];

//read db.json
fs.readFile('db.json', (err, jsonAppointments) => {
	if (!err) {
		const currAppointments = JSON.parse(jsonAppointments);
		allAppointments = currAppointments;
	}
})

app.on('ready', () => {
	mainWindow = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		title: 'Aplikasi Dokter'
	});

	const startUrl = process.env.ELECTRON_START_URL || `file://${__dirname}/build/index.html`

	mainWindow.loadURL(startUrl);
	mainWindow.on('closed', () => {

		//save data to json
		const jsonAppointments = JSON.stringify(allAppointments);
		fs.writeFileSync('db.json', jsonAppointments);

		app.quit();
		mainWindow = null;
	});

	if (process.env.ELECTRON_START_URL) {
		const mainMenu = Menu.buildFromTemplate(menuTemplate);
		Menu.setApplicationMenu(mainMenu);
	}else{
		Menu.setApplicationMenu(null);
	}
});

ipcMain.on('appointment:create', (event, appointment) => {
	appointment.id = uuid.create().toString();

	allAppointments.push(appointment);
	console.log('(index.js) Current Appointments: ',allAppointments);

	sendTodayAppointments();

	createWindow.close();
});

ipcMain.on('appointment:request:list', event => {
	listWindow.webContents.send('appointment:response:list', allAppointments);
});

ipcMain.on('appointment:request:today', event => {
	sendTodayAppointments();
});

ipcMain.on('appointment:done', (event, id) => {
	allAppointments.forEach(appointment => {
		if (appointment.id === id) {
			appointment.done = true;
		}
	});

	sendTodayAppointments();
});

const formatedDateNow = () => {
	var d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const sendTodayAppointments = () => {
	const today = formatedDateNow();
	const filtered = allAppointments.filter(
		appointment => appointment.date === today
	);

	mainWindow.webContents.send('appointment:response:today', filtered);
}

const menuTemplate = [
    {
        label:"View",
        submenu: [{role:"reload"}, {role:"toggledevtools"}],
    },
]