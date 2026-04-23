
import Database from 'better-sqlite3';
const db = new Database('/var/lib/agentpay/providers.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', JSON.stringify(tables));
tables.forEach(t => {
  const count = db.prepare('SELECT COUNT(*) as c FROM ' + t.name).get();
  console.log(t.name + ': ' + count.c + ' rows');
  const rows = db.prepare('SELECT * FROM ' + t.name + ' LIMIT 30').all();
  console.log(JSON.stringify(rows, null, 2));
});
