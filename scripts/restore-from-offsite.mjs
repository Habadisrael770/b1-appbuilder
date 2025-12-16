#!/usr/bin/env node
/**
 * Restore from Off-site Backup Script for B1 AppBuilder
 * 
 * Downloads backup from S3 and restores to database.
 * 
 * Usage:
 *   node scripts/restore-from-offsite.mjs <s3-key>
 *   
 * Example:
 *   node scripts/restore-from-offsite.mjs db-backups/staging/backup_staging_20251215210704.sql.gz
 */

import { execSync } from 'child_process';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(level, message) {
  const timestamp = new Date().toISOString();
  const colorMap = {
    INFO: COLORS.green,
    ERROR: COLORS.red,
    WARN: COLORS.yellow,
    DEBUG: COLORS.blue,
  };
  const color = colorMap[level] || COLORS.reset;
  console.log(`${color}[${timestamp}] [${level}] ${message}${COLORS.reset}`);
}

function getStorageConfig() {
  const baseUrl = process.env.BUILT_IN_FORGE_API_URL;
  const apiKey = process.env.BUILT_IN_FORGE_API_KEY;
  
  if (!baseUrl || !apiKey) {
    throw new Error('Storage proxy credentials missing');
  }
  
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

async function getDownloadUrl(relKey) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = relKey.replace(/^\/+/, '');
  
  const downloadApiUrl = new URL('v1/storage/downloadUrl', baseUrl + '/');
  downloadApiUrl.searchParams.set('path', key);
  
  const response = await fetch(downloadApiUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get download URL: ${response.status}`);
  }
  
  const result = await response.json();
  return result.url;
}

async function downloadFile(url, destPath) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  
  const buffer = await response.arrayBuffer();
  writeFileSync(destPath, Buffer.from(buffer));
  return destPath;
}

function parseDbUrl(url) {
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: match[4],
    database: match[5],
  };
}

async function main() {
  const s3Key = process.argv[2];
  
  if (!s3Key) {
    console.error('Usage: node scripts/restore-from-offsite.mjs <s3-key>');
    console.error('Example: node scripts/restore-from-offsite.mjs db-backups/staging/backup_staging_20251215210704.sql.gz');
    process.exit(1);
  }
  
  log('INFO', '='.repeat(50));
  log('INFO', 'Restore from Off-site Backup');
  log('INFO', '='.repeat(50));
  log('INFO', `S3 Key: ${s3Key}`);
  
  const tempDir = '/tmp/offsite-restore';
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }
  
  const localFile = path.join(tempDir, path.basename(s3Key));
  const startTime = Date.now();
  
  try {
    // Get download URL
    log('INFO', 'Getting download URL from S3...');
    const downloadUrl = await getDownloadUrl(s3Key);
    
    // Download file
    log('INFO', 'Downloading backup file...');
    await downloadFile(downloadUrl, localFile);
    log('INFO', `Downloaded to: ${localFile}`);
    
    // Decompress
    log('INFO', 'Decompressing...');
    const sqlFile = localFile.replace('.gz', '');
    execSync(`gunzip -f "${localFile}"`, { maxBuffer: 100 * 1024 * 1024 });
    
    // Restore
    log('INFO', 'Restoring to database...');
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL not set');
    }
    
    const dbConfig = parseDbUrl(databaseUrl);
    
    const mysqlArgs = [
      `--host=${dbConfig.host}`,
      `--port=${dbConfig.port}`,
      `--user=${dbConfig.user}`,
      `--password=${dbConfig.password}`,
      '--ssl-mode=REQUIRED',
      dbConfig.database,
    ];
    
    execSync(`mysql ${mysqlArgs.join(' ')} < "${sqlFile}"`, {
      maxBuffer: 100 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    // Cleanup
    if (existsSync(sqlFile)) {
      unlinkSync(sqlFile);
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    log('INFO', '='.repeat(50));
    log('INFO', 'Restore Complete');
    log('INFO', '='.repeat(50));
    log('INFO', `Duration: ${duration}s`);
    log('INFO', 'Status: SUCCESS');
    
  } catch (error) {
    log('ERROR', `Restore failed: ${error.message}`);
    process.exit(1);
  }
}

main().catch((error) => {
  log('ERROR', `Unhandled error: ${error.message}`);
  process.exit(1);
});
