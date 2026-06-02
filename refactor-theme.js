const fs = require("fs");
const path = require("path");

const dirsToScan = [
  "./app",
  "./components"
];

// Folders to explicitly skip because they are already dark-mode compliant or handled
const skipFolders = [
  "app\\(admin)\\admin",
  "app/(admin)/admin",
  "app\\settings",
  "app/settings",
  "components\\navbar",
  "components/navbar",
  "components\\Navbar.tsx",
  "components/Navbar.tsx"
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    
    // Check if we should skip this path
    if (skipFolders.some(skip => fullPath.includes(skip))) {
      return;
    }

    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(fullPath));
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      results.push(fullPath);
    }
  });
  
  return results;
}

// Replacement map: Keys are regex strings, Values are the replacement string
// Using negative lookbehind (?<![:a-zA-Z0-9-]) to prevent matching hover:bg-white or dark:bg-white
// Using negative lookahead (?![a-zA-Z0-9-]) to prevent matching bg-white-500
const replacements = [
  { pattern: /(?<![:a-zA-Z0-9-])bg-slate-50(?![a-zA-Z0-9-])/g, replacement: "bg-slate-50 dark:bg-slate-950" },
  { pattern: /(?<![:a-zA-Z0-9-])bg-white(?![a-zA-Z0-9-])/g, replacement: "bg-white dark:bg-slate-900" },
  { pattern: /(?<![:a-zA-Z0-9-])bg-slate-100(?![a-zA-Z0-9-])/g, replacement: "bg-slate-100 dark:bg-slate-800" },
  { pattern: /(?<![:a-zA-Z0-9-])bg-slate-200(?![a-zA-Z0-9-])/g, replacement: "bg-slate-200 dark:bg-slate-700" },
  
  { pattern: /(?<![:a-zA-Z0-9-])text-slate-900(?![a-zA-Z0-9-])/g, replacement: "text-slate-900 dark:text-slate-100" },
  { pattern: /(?<![:a-zA-Z0-9-])text-slate-800(?![a-zA-Z0-9-])/g, replacement: "text-slate-800 dark:text-slate-200" },
  { pattern: /(?<![:a-zA-Z0-9-])text-slate-700(?![a-zA-Z0-9-])/g, replacement: "text-slate-700 dark:text-slate-300" },
  { pattern: /(?<![:a-zA-Z0-9-])text-slate-600(?![a-zA-Z0-9-])/g, replacement: "text-slate-600 dark:text-slate-400" },
  { pattern: /(?<![:a-zA-Z0-9-])text-slate-500(?![a-zA-Z0-9-])/g, replacement: "text-slate-500 dark:text-slate-400" },
  
  { pattern: /(?<![:a-zA-Z0-9-])border-slate-100(?![a-zA-Z0-9-])/g, replacement: "border-slate-100 dark:border-slate-800" },
  { pattern: /(?<![:a-zA-Z0-9-])border-slate-200(?![a-zA-Z0-9-])/g, replacement: "border-slate-200 dark:border-slate-800" },
  { pattern: /(?<![:a-zA-Z0-9-])border-slate-300(?![a-zA-Z0-9-])/g, replacement: "border-slate-300 dark:border-slate-700" }
];

let changedFilesCount = 0;

dirsToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = walk(dir);
    
    files.forEach(file => {
      const originalContent = fs.readFileSync(file, "utf8");
      let content = originalContent;
      
      replacements.forEach(({ pattern, replacement }) => {
        content = content.replace(pattern, replacement);
      });
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
        changedFilesCount++;
      }
    });
  }
});

console.log(`\nSuccessfully updated ${changedFilesCount} files.`);
