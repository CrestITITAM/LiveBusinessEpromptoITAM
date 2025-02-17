const { exec } = require('child_process');
const readline = require('readline');
const app = require('electron');
let reqPath = app.getPath('exe');

// Define password for uninstall
const correctPassword = '123456';

// Create a readline interface to prompt for password
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt for password
rl.question('Enter password to uninstall the application: ', (password) => {
  if (password === correctPassword) {
    console.log('Password correct. Uninstalling application...');

    // Call Windows commands to uninstall the app
    exec('rmdir /S /Q '+reqPath, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error during uninstall: ${error.message}`);
        return;
      }
      console.log('Application uninstalled successfully.');
    });
  } else {
    console.log('Incorrect password. Uninstallation aborted.');
  }

  rl.close();
});
