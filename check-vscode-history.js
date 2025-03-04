/**
 * VSCode History Checker
 * This script checks for VSCode history files
 */

const fs = require('fs');
const path = require('path');

// Define paths to search
const projectRoot = __dirname;
const historyFolder = path.join(projectRoot, '.history');
const vscodeFolders = [
    path.join(projectRoot, '.vscode'),
    path.join(projectRoot, '.vscode-insiders')
];

console.log('Checking for VSCode history files...');

// Check if history folder exists
try {
    if (fs.existsSync(historyFolder)) {
        console.log('Found history folder:', historyFolder);
        
        // List files in history folder
        const items = fs.readdirSync(historyFolder, { withFileTypes: true });
        
        console.log('\nContents:');
        items.forEach(item => {
            const itemType = item.isDirectory() ? 'Directory' : 'File';
            console.log(`${itemType}: ${item.name}`);
        });
        
        console.log('\nTo recover files:');
        console.log('1. Browse through the history folder');
        console.log('2. Find the most recent backup of index.html');
        console.log('3. Copy it to your project root');
    } else {
        console.log('No VSCode history folder found.');
    }
} catch (error) {
    console.error('Error checking history folder:', error.message);
}

// Check for VSCode folders
console.log('\nChecking for VSCode folders...');

vscodeFolders.forEach(folder => {
    try {
        if (fs.existsSync(folder)) {
            console.log('Found VSCode folder:', folder);
            
            // Check for potential backup locations
            const backupsFolder = path.join(folder, 'backups');
            
            if (fs.existsSync(backupsFolder)) {
                console.log('Found backups folder:', backupsFolder);
                
                const backups = fs.readdirSync(backupsFolder);
                
                console.log('\nBackup files:');
                backups.forEach(backup => {
                    console.log(backup);
                });
            }
        }
    } catch (error) {
        console.error('Error checking VSCode folder:', error.message);
    }
});

console.log('\nScript completed. Check the output for potential backup locations.');
