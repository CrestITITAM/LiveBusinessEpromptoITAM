// uninstall.js
const readline = require('readline');
const regedit = require('regedit');

// Define the registry path for your application
const appRegistryPath = 'HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\991a8ee7-3dc9-538e-b794-90797918583c';
const correctPassword = '123456'; // Replace with your desired password

// Function to prompt for a password
function askPassword() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter password to uninstall: ', (input) => {
      rl.close();
      resolve(input);
    });
  });
}

// Function to handle uninstallation
async function handleUninstall() {
  const password = await askPassword();

  if (password === correctPassword) {
    console.log('Password correct. Proceeding with uninstallation.');

    // Uninstallation logic: removing the registry key
    regedit.deleteKey(appRegistryPath, (err) => {
      if (err) {
        console.error('Failed to uninstall the application:', err);
      } else {
        console.log('Application successfully uninstalled.');
      }
    });
  } else {
    console.log('Incorrect password. Uninstallation aborted.');
  }
}

// Run the uninstallation logic
handleUninstall();
