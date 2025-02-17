const inquirer = require('inquirer');
inquirer.prompt([
  {
    type: 'password',
    name: 'uninstallPassword',
    message: 'Enter password to uninstall the application:',
    mask: '*',
  }
]).then(answers => {
  if (answers.uninstallPassword === '123456') {
    // Allow uninstallation process to continue
    console.log('Password correct. Uninstallation proceeding.');
  } else {
    // Prevent uninstallation
    console.log('Incorrect password. Uninstallation aborted.');
    process.exit(1); // Exit with an error code to abort uninstall
  }
});