<#
.SYNOPSIS
   Deep Backup Search for Delane Nails Website
.DESCRIPTION
   This PowerShell script searches multiple locations for previous versions
   and backups of website files
#>

Write-Host "=== SYSTEM-WIDE BACKUP SEARCH ===" -ForegroundColor Cyan
Write-Host "Searching for backups of DelaneNails website files..." -ForegroundColor Cyan
Write-Host ""

# Search paths
$searchPaths = @(
    "$env:USERPROFILE\Documents",
    "$env:USERPROFILE\Desktop",
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\OneDrive\Documents",
    "$env:USERPROFILE\OneDrive\Desktop",
    "$env:LOCALAPPDATA\Temp",
    "$env:TEMP",
    $PSScriptRoot # Current directory
)

# File patterns to search for
$patterns = @(
    "*index.html*",
    "*delane*.html",
    "*nail*.html",
    "*backup*.html",
    "*.bak",
    "*_old*",
    "*.old.*"
)

# Check for Windows System Restore points
Write-Host "Checking for System Restore Points..." -ForegroundColor Yellow
try {
    $restorePoints = Get-ComputerRestorePoint -ErrorAction SilentlyContinue
    if ($restorePoints -and $restorePoints.Count -gt 0) {
        Write-Host "Found $($restorePoints.Count) System Restore Points" -ForegroundColor Green
        Write-Host "Most recent restore points:" -ForegroundColor Green
        $restorePoints | Sort-Object -Property CreationTime -Descending | Select-Object -First 5 |
            Format-Table SequenceNumber, Description, CreationTime -AutoSize
            
        Write-Host "To restore from a System Restore Point:" -ForegroundColor Yellow
        Write-Host "1. Open Control Panel > System > System Protection" -ForegroundColor Yellow
        Write-Host "2. Click 'System Restore' and follow the wizard" -ForegroundColor Yellow
        Write-Host ""
    }
    else {
        Write-Host "No System Restore Points found." -ForegroundColor Gray
    }
}
catch {
    Write-Host "Unable to check System Restore Points. Access denied or not supported." -ForegroundColor Gray
}

# Check for VSCode History
$historyPath = Join-Path -Path $PSScriptRoot -ChildPath ".history"
if (Test-Path -Path $historyPath) {
    Write-Host "Found VSCode history folder. Searching for index.html files..." -ForegroundColor Yellow
    
    $historyFiles = Get-ChildItem -Path $historyPath -Recurse -Filter "*index.html*" -ErrorAction SilentlyContinue
    
    if ($historyFiles -and $historyFiles.Count -gt 0) {
        Write-Host "Found $($historyFiles.Count) versions of index.html in history!" -ForegroundColor Green
        
        $groupedByDate = $historyFiles | 
            Sort-Object LastWriteTime -Descending |
            Group-Object { $_.LastWriteTime.ToString("yyyy-MM-dd") }
            
        foreach ($group in $groupedByDate) {
            Write-Host "`nDate: $($group.Name)" -ForegroundColor Yellow
            $group.Group | Sort-Object LastWriteTime -Descending | 
                Select-Object -First 10 |
                Format-Table Name, LastWriteTime, @{Name="Size(KB)"; Expression={[math]::Round($_.Length/1KB, 2)}}
        }
    }
    else {
        Write-Host "No index.html files found in VSCode history." -ForegroundColor Gray
    }
}

# Check for Windows File History
Write-Host "`nChecking for Windows File History..." -ForegroundColor Yellow
$fileHistoryPath = "$env:USERPROFILE\AppData\Local\Microsoft\Windows\FileHistory"
if (Test-Path -Path $fileHistoryPath) {
    Write-Host "File History is enabled. You may restore previous versions from File Explorer:" -ForegroundColor Green
    Write-Host "1. Right-click on your project folder" -ForegroundColor Green
    Write-Host "2. Select 'Restore previous versions'" -ForegroundColor Green
    Write-Host "3. Choose a backup point to recover from" -ForegroundColor Green
}
else {
    Write-Host "Windows File History not found or not enabled." -ForegroundColor Gray
}

# Search for backup files in common locations
Write-Host "`nSearching for backup files in common locations..." -F