# File Analyzer Tool

This tool helps identify duplicate and potentially unused files in the DelaneNails project.

## Usage

1. Make sure you have Node.js installed
2. Open a terminal in the project root directory
3. Run the analyzer:

```bash
node tools/file-analyzer.js
```

## Understanding the Results

The tool will output two categories of files:

### Duplicate Files
Files with identical content but different paths. You can safely delete one while keeping the other.

### Possibly Unused Files
JavaScript and CSS files that don't appear to be referenced in any HTML or JS files. 
**Important:** Verify these files are actually unused before deleting them, as the detection is based on simple string matching.

## After Analysis

1. Review the list of duplicate files and decide which copies to keep
2. Carefully check each "possibly unused" file to confirm it's safe to remove
3. Update any references if necessary when removing files
4. Consider using version control (git) when making changes so you can recover if needed
