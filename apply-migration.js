require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) {
    console.error('No POSTGRES_URL found in .env.local');
    return;
  }
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');
    
    const sql = fs.readFileSync('supabase/migrations/20261006000000_auth_trigger_and_backfill.sql', 'utf8');
    await client.query(sql);
    console.log('Migration applied successfully!');
  } catch (err) {
    console.error('Error applying migration:', err);
  } finally {
    await client.end();
  }
}

run();
