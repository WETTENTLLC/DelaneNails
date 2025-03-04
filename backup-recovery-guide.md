# Backup Recovery Guide

This guide will help you recover your website from a backup.

## Finding Available Backups

### VSCode Backups

If you're using Visual Studio Code, check the following locations:

1. **Local History Extension**: If you have the Local History extension installed, check the `.history` folder in your project directory.

   ```
   /c:/Users/wette/OneDrive/Documents/GitHub/DelaneNails/.history/
   ```

2. **Auto-saved files**: VSCode sometimes creates temporary backups with extensions like `.~tmp` or in a temporary directory.

### Git Backups

If your project is a Git repository:

1. **View commit history**:

   ```bash
   git log --pretty=oneline -- index.html
   ```

2. **Restore a specific version**:

   ```bash
   git checkout <commit-hash> -- index.html
   ```

### Browser Cache

Your web browser might have cached the previous version:

1. Open your browser's developer tools (F12)
2. Go to the "Application" or "Storage" tab
3. Look for "Cache Storage" or similar options
4. Search for your page

### File Explorer Backups

1. **Check Recycle Bin**: Recently deleted files might be there
2. **Search for partial filenames**: Search your computer for "index.html" or "DelaneNails"
3. **Look for `.bak` files**: Some editors create `.bak` files automatically

## Restoring From a Backup

Once you've found a backup:

1. **Create a safety copy** of your current files
2. **Copy the backup** to the correct location (replacing the current file)
3. **Fix known issues**:
   - Fix client-personalization.js syntax errors
   - Add NailAide fallback to index.html
   - Update any broken image paths

## Manual Recovery Steps

If you can't find a full backup:

1. **Create a basic index.html** using the index.html.minimal file
2. **Add your content** incrementally, testing as you go
3. **Fix JavaScript issues** using the fix-client-personalization.js file

## Testing Your Recovery

After restoring:

1. **Run a local server** (VSCode Live Server or similar)
2. **Check the browser console** for errors
3. **Verify all functionality** works correctly

Need further assistance? Contact your web developer or IT support.
