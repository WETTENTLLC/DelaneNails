/**
 * Deep Backup Search Tool
 * This script performs a comprehensive search for backup files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Base directories to search
const projectRoot = __dirname;
const userHome = process.env.USERPROFILE || process.env.HOME;
const possibleBackupLocations = [
    projectRoot,
    path.join(userHome, 'Downloads'),
    path.join(userHome, 'Desktop'),
    path.join(userHome, 'Documents'),
    path.join(userHome, 'OneDrive', 'Documents'),
    path.join(userHome, 'OneDrive', 'Desktop')
];

// File patterns to search for
const searchPatterns = [
    'index.html',
    'index.html.bak',
    'index.old.html',
    'index.*.html',
    'index_backup*.html',
    'delane*.html',
    'nails*.html',
    'site-backup*.html',
    'website-backup*.html'
];

// Time ranges for backups (in milliseconds)
const timeRanges = [
    { name: 'Last hour', time: 60 * 60 * 1000 },
    { name: 'Today', time: 24 * 60 * 60 * 1000 },
    { name: 'This week', time: 7 * 24 * 60 * 60 * 1000 },
    { name: 'This month', time: 30 * 24 * 60 * 60 * 1000 },
    { name: 'Older', time: Infinity }
];

console.log('=== DEEP BACKUP SEARCH ===');
console.log('Searching for possible backups of your website...\n');

// Check if Git is available
let hasGit = false;
try {
    execSync('git --version', { stdio: 'ignore' });
    hasGit = true;
    console.log('Git is available - checking Git history...');
    
    try {
        // Check if current directory is a git repository
        execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
        
        // Look for previous versions of index.html in git history
        const gitOutput = execSync('git log --pretty=format:"%h - %an, %ar : %s" -- index.html', { encoding: 'utf8' });
        
        if (gitOutput) {
            console.log('\nGit history for index.html:');
            console.log(gitOutput);
            console.log('\nTo restore a specific version:');
            console.log('1. Run: git checkout [commit-hash] -- index.html');
            console.log('2. Example: git checkout abc1234 -- index.html\n');
        } else {
            console.log('No Git history found for index.html\n');
        }
    } catch (error) {
        console.log('Not a Git repository or no history for index.html\n');
    }
} catch (error) {
    console.log('Git not available - skipping Git history check\n');
}

// Search for VSCode history files
const historyFolder = path.join(projectRoot, '.history');
if (fs.existsSync(historyFolder)) {
    console.log(`Found VSCode history folder: ${historyFolder}`);
    
    try {
        // Navigate through the folder structure to find index.html files
        function searchHistoryFolder(dir) {
            const items = fs.readdirSync(dir, { withFileTypes: true });
            let foundFiles = [];
            
            for (const item of items) {
                const itemPath = path.join(dir, item.name);
                
                if (item.isDirectory()) {
                    foundFiles = [...foundFiles, ...searchHistoryFolder(itemPath)];
                } else if (item.name.includes('index.html')) {
                    foundFiles.push({
                        path: itemPath,
                        time: fs.statSync(itemPath).mtime
                    });
                }
            }
            
            return foundFiles;
        }
        
        const historyFiles = searchHistoryFolder(historyFolder);
        
        if (historyFiles.length > 0) {
            console.log(`Found ${historyFiles.length} versions of index.html in history folder`);
            
            // Sort by time (newest first)
            historyFiles.sort((a, b) => b.time - a.time);
            
            // Group by time range
            console.log('\nAvailable backups by date:');
            const now = new Date();
            
            timeRanges.forEach(range => {
                const rangeFiles = historyFiles.filter(file => 
                    (now - file.time) <= range.time && 
                    (range === timeRanges[0] || (now - file.time) > timeRanges[timeRanges.indexOf(range) - 1].time)
                );
                
                if (rangeFiles.length > 0) {
                    console.log(`\n${range.name}:`);
                    rangeFiles.forEach((file, index) => {
                        console.log(`${index + 1}. ${file.path} (${file.time.toLocaleString()})`);
                    });
                }
            });
            
            console.log('\nTo restore a file:');
            console.log('1. Copy the file path');
            console.log('2. Create a copy as backup: copy "file-path" index.html.current');
            console.log('3. Restore the file: copy "file-path" index.html');
        } else {
            console.log('No index.html files found in history folder');
        }
    } catch (error) {
        console.error('Error searching history folder:', error.message);
    }
} else {
    console.log('No VSCode history folder found');
}

// Search for backup files in common locations
console.log('\nSearching for backup files in common locations...');

let allFoundFiles = [];

// Helper function to safely check if a file might be an HTML file
function isLikelyHtmlFile(filePath) {
    try {
        // Read first few bytes of the file
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(500);
        fs.readSync(fd, buffer, 0, 500, 0);
        fs.closeSync(fd);
        
        // Convert to string and check for HTML patterns
        const content = buffer.toString();
        return content.includes('<!DOCTYPE html>') || 
               content.includes('<html>') ||
               content.includes('<HTML>') ||
               content.includes('<body>') ||
               content.includes('<BODY>') ||
               content.includes('DelaneNails');
    } catch (error) {
        return false;
    }
}

// Search each location
possibleBackupLocations.forEach(location => {
    try {
        if (fs.existsSync(location)) {
            // Get all files in the directory
            function searchDirectory(dir, depth = 0) {
                if (depth > 2) return []; // Limit search depth
                
                const items = fs.readdirSync(dir, { withFileTypes: true });
                let foundFiles = [];
                
                for (const item of items) {
                    // Skip node_modules and hidden folders
                    if (item.name === 'node_modules' || item.name.startsWith('.')) continue;
                    
                    const itemPath = path.join(dir, item.name);
                    
                    try {
                        if (item.isDirectory()) {
                            foundFiles = [...foundFiles, ...searchDirectory(itemPath, depth + 1)];
                        } else {
                            // Check if the file matches our patterns
                            const isHtmlFile = item.name.endsWith('.html');
                            const isBackupFile = item.name.includes('backup') || 
                                                 item.name.includes('bak') || 
                                                 item.name.includes('old') ||
                                                 item.name.includes('.~');
                            
                            if ((isHtmlFile || isBackupFile) && isLikelyHtmlFile(itemPath)) {
                                foundFiles.push({
                                    path: itemPath,
                                    time: fs.statSync(itemPath).mtime,
                                    name: item.name
                                });
                            }
                        }
                    } catch (error) {
                        // Skip files with permission issues
                    }
                }
                
                return foundFiles;
            }
            
            const locationFiles = searchDirectory(location);
            allFoundFiles = [...allFoundFiles, ...locationFiles];
        }
    } catch (error) {
        console.error(`Error searching ${location}: ${error.message}`);
    }
});

// Display found backup files
if (allFoundFiles.length > 0) {
    console.log(`\nFound ${allFoundFiles.length} potential backup files`);
    
    // Sort by time (newest first)
    allFoundFiles.sort((a, b) => b.time - a.time);
    
    // Group by location
    const filesByLocation = {};
    allFoundFiles.forEach(file => {
        const dir = path.dirname(file.path);
        if (!filesByLocation[dir]) {
            filesByLocation[dir] = [];
        }
        filesByLocation[dir].push(file);
    });
    
    console.log('\nPotential backups by location:');
    Object.keys(filesByLocation).forEach(location => {
        console.log(`\n${location}:`);
        filesByLocation[location].forEach((file, index) => {
            console.log(`${index + 1}. ${file.name} (${file.time.toLocaleString()})`);
        });
    });
    
    console.log('\nTo restore a file:');
    console.log('1. Copy the file to your project directory');
    console.log('2. Rename it to index.html');
    console.log('3. Test it with your web server');
} else {
    console.log('No potential backup files found');
}

console.log('\n=== SEARCH COMPLETE ===');
