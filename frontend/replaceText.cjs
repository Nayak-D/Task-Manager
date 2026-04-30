const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { from: /Create Notice/g, to: 'Create Task' },
  { from: /Create New Notice/g, to: 'Create New Task' },
  { from: /Manage Notices/g, to: 'Manage Tasks' },
  { from: /Total Notices/g, to: 'Total Tasks' },
  { from: /Recent Notices/g, to: 'Recent Tasks' },
  { from: /Urgent Notices/g, to: 'Urgent Tasks' },
  { from: /Active Notices/g, to: 'Active Tasks' },
  { from: /No notices/gi, to: 'No tasks' },
  { from: /No urgent notices/gi, to: 'No urgent tasks' },
  { from: /No matching notices/gi, to: 'No matching tasks' },
  { from: /Notice Details/gi, to: 'Task Details' },
  { from: /Notice Status/gi, to: 'Task Status' },
  { from: /Notice created/gi, to: 'Task created' },
  { from: /Notice updated/gi, to: 'Task updated' },
  { from: /Notice deleted/gi, to: 'Task deleted' },
  { from: /Notice pinned/gi, to: 'Task pinned' },
  { from: /Notice unpinned/gi, to: 'Task unpinned' },
  { from: /Pin notice/gi, to: 'Pin task' },
  { from: /Unpin notice/gi, to: 'Unpin task' },
  { from: /Edit notice/gi, to: 'Edit task' },
  { from: /Delete notice/gi, to: 'Delete task' },
  { from: /Digital Notice Board/gi, to: 'Digital Task Manager' },
  { from: /Digital Notice/gi, to: 'Digital Task' },
  { from: /New notice published/gi, to: 'New task published' },
  { from: /Notice Category/gi, to: 'Task Category' },
  { from: /Notice Title/gi, to: 'Task Title' },
  { from: /Publish Notice/gi, to: 'Publish Task' },
  { from: /Publish this notice/gi, to: 'Publish this task' },
  { from: /Delete Notice/gi, to: 'Delete Task' },
  { from: /Are you sure you want to delete this notice/gi, to: 'Are you sure you want to delete this task' },
  { from: />Notices</g, to: '>Tasks<' },
  { from: /'Notices'/g, to: "'Tasks'" },
  { from: /"Notices"/g, to: '"Tasks"' },
  { from: />Notice</g, to: '>Task<' },
  { from: /'Notice'/g, to: "'Task'" },
  { from: /"Notice"/g, to: '"Task"' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      for (const rule of replacements) {
        if (rule.from.test(content)) {
          content = content.replace(rule.from, rule.to);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated:', fullPath);
      }
    }
  }
}

processDirectory(srcDir);
console.log('Done replacing UI text!');
