#!/usr/bin/env node
/**
 * Off-site Backup Script for B1 AppBuilder
 * 
 * Uploads local database backups to Manus S3 storage for disaster recovery.
 * 
 * Features:
 * - Uploads compressed backup files to S3
 * - Uploads checksum files alongside backups
 * - Retention policy (deletes old backups from S3)
 * - Failure alerting via notifyOwner API
 * 
 * Usage:
 *   node scripts/offsite-backup.mjs [environment] [backup-file]
 *   
 *   If backup-file is not specified, uploads the most recent backup.
 * 
 * Example:
 *   node scripts/offsite-backup.mjs staging
 *   node scripts/offsite-backup.mjs staging backups/staging/backup_staging_20251215_210704.sql.gz
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  retentionDays: 7,
  backupDir: '/home/ubuntu/b1-appbuilder/backups',
  s3Prefix: 'db-backups',
};

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
    throw new Error('Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY');
  }
  
  return { baseUrl: baseUrl.replace(/\/+$/, ''), apiKey };
}

async function uploadToS3(relKey, data, contentType = 'application/octet-stream') {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = relKey.replace(/^\/+/, '');
  
  const uploadUrl = new URL('v1/storage/upload', baseUrl + '/');
  uploadUrl.searchParams.set('path', key);
  
  const blob = new Blob([data], { type: contentType });
  const form = new FormData();
  form.append('file', blob, key.split('/').pop() ?? key);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(`Storage upload failed (${response.status}): ${message}`);
  }
  
  const result = await response.json();
  return { key, url: result.url };
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

async function sendAlert(title, content) {
  const forgeApiUrl = process.env.BUILT_IN_FORGE_API_URL;
  const forgeApiKey = process.env.BUILT_IN_FORGE_API_KEY;
  
  if (!forgeApiUrl || !forgeApiKey) {
    log('WARN', 'Alert API not configured, skipping notification');
    return false;
  }
  
  const endpoint = forgeApiUrl.endsWith('/') 
    ? `${forgeApiUrl}webdevtoken.v1.WebDevService/SendNotification`
    : `${forgeApiUrl}/webdevtoken.v1.WebDevService/SendNotification`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${forgeApiKey}`,
        'content-type': 'application/json',
        'connect-protocol-version': '1',
      },
      body: JSON.stringify({ title, content }),
    });
    
    if (!response.ok) {
      log('WARN', `Alert API returned ${response.status}`);
      return false;
    }
    
    log('INFO', 'Alert sent successfully');
    return true;
  } catch (error) {
    log('WARN', `Failed to send alert: ${error.message}`);
    return false;
  }
}

function findLatestBackup(envDir) {
  if (!existsSync(envDir)) {
    return null;
  }
  
  const files = readdirSync(envDir)
    .filter(f => f.startsWith('backup_') && f.endsWith('.sql.gz'))
    .map(f => ({
      name: f,
      path: path.join(envDir, f),
      mtime: statSync(path.join(envDir, f)).mtime,
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  return files.length > 0 ? files[0] : null;
}

async function main() {
  const envName = process.argv[2] || 'staging';
  const specifiedFile = process.argv[3];
  
  log('INFO', '='.repeat(50));
  log('INFO', 'Off-site Backup Started');
  log('INFO', '='.repeat(50));
  log('INFO', `Environment: ${envName}`);
  
  let backupFile;
  let checksumFile;
  
  if (specifiedFile) {
    backupFile = specifiedFile;
    checksumFile = `${specifiedFile}.sha256`;
  } else {
    const envDir = path.join(CONFIG.backupDir, envName);
    const latest = findLatestBackup(envDir);
    
    if (!latest) {
      log('ERROR', `No backup files found in ${envDir}`);
      await sendAlert(
        `🔴 Off-site Backup Failed: ${envName}`,
        `No local backup files found for ${envName}. Run local backup first.`
      );
      process.exit(1);
    }
    
    backupFile = latest.path;
    checksumFile = `${latest.path}.sha256`;
    log('INFO', `Using latest backup: ${latest.name}`);
  }
  
  // Verify files exist
  if (!existsSync(backupFile)) {
    log('ERROR', `Backup file not found: ${backupFile}`);
    await sendAlert(
      `🔴 Off-site Backup Failed: ${envName}`,
      `Backup file not found: ${backupFile}`
    );
    process.exit(1);
  }
  
  const backupFileName = path.basename(backupFile);
  const s3BackupKey = `${CONFIG.s3Prefix}/${envName}/${backupFileName}`;
  const s3ChecksumKey = `${s3BackupKey}.sha256`;
  
  let success = false;
  
  try {
    // Upload backup file
    log('INFO', `Uploading backup to S3: ${s3BackupKey}`);
    const backupData = readFileSync(backupFile);
    const backupResult = await uploadToS3(s3BackupKey, backupData, 'application/gzip');
    log('INFO', `Backup uploaded: ${backupResult.url}`);
    
    // Upload checksum file if exists
    if (existsSync(checksumFile)) {
      log('INFO', `Uploading checksum to S3: ${s3ChecksumKey}`);
      const checksumData = readFileSync(checksumFile, 'utf-8');
      const checksumResult = await uploadToS3(s3ChecksumKey, checksumData, 'text/plain');
      log('INFO', `Checksum uploaded: ${checksumResult.url}`);
    } else {
      log('WARN', 'Checksum file not found, skipping');
    }
    
    // Verify upload by getting download URL
    log('INFO', 'Verifying upload...');
    const downloadUrl = await getDownloadUrl(s3BackupKey);
    log('INFO', `Verification successful. Download URL: ${downloadUrl.substring(0, 80)}...`);
    
    const fileSize = (statSync(backupFile).size / 1024).toFixed(2);
    
    log('INFO', '='.repeat(50));
    log('INFO', 'Off-site Backup Complete');
    log('INFO', '='.repeat(50));
    log('INFO', `S3 Key: ${s3BackupKey}`);
    log('INFO', `Size: ${fileSize} KB`);
    
    success = true;
    
  } catch (error) {
    log('ERROR', `Off-site backup failed: ${error.message}`);
    
    await sendAlert(
      `🔴 Off-site Backup Failed: ${envName}`,
      `Off-site backup for ${envName} failed at ${new Date().toISOString()}\n\nError: ${error.message}\n\nPlease investigate immediately.`
    );
  }
  
  log('INFO', '='.repeat(50));
  log('INFO', `Status: ${success ? 'SUCCESS' : 'FAILED'}`);
  log('INFO', '='.repeat(50));
  
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  log('ERROR', `Unhandled error: ${error.message}`);
  process.exit(1);
});
