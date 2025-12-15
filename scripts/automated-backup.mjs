#!/usr/bin/env node
/**
 * Automated Database Backup Script for B1 AppBuilder
 * 
 * Features:
 * - Daily backup with timestamp
 * - Retention policy (default: 7 days)
 * - Checksum verification
 * - Failure alerting via notifyOwner API
 * 
 * Usage: 
 *   node scripts/automated-backup.mjs [environment]
 *   
 * Environment: staging (default) or production
 * 
 * Cron example (daily at 2 AM):
 *   0 2 * * * cd /home/ubuntu/b1-appbuilder && node scripts/automated-backup.mjs staging >> /var/log/b1-backup.log 2>&1
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, unlinkSync, statSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import path from 'path';

// Configuration
const CONFIG = {
  retentionDays: 7,
  backupDir: '/home/ubuntu/b1-appbuilder/backups',
  logFile: '/home/ubuntu/b1-appbuilder/backups/backup.log',
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
  const logLine = `[${timestamp}] [${level}] ${message}`;
  console.log(`${color}${logLine}${COLORS.reset}`);
  
  // Also append to log file
  try {
    const logDir = path.dirname(CONFIG.logFile);
    if (!existsSync(logDir)) {
      mkdirSync(logDir, { recursive: true });
    }
    writeFileSync(CONFIG.logFile, logLine + '\n', { flag: 'a' });
  } catch (e) {
    // Ignore log file errors
  }
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

async function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function sendAlert(title, content) {
  // Use the notifyOwner API directly
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

function cleanOldBackups(envDir) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - CONFIG.retentionDays);
  
  if (!existsSync(envDir)) {
    return 0;
  }
  
  const files = readdirSync(envDir);
  let deletedCount = 0;
  
  for (const file of files) {
    if (!file.startsWith('backup_') || !file.endsWith('.sql.gz')) {
      continue;
    }
    
    const filePath = path.join(envDir, file);
    const stats = statSync(filePath);
    
    if (stats.mtime < cutoffDate) {
      log('INFO', `Deleting old backup: ${file}`);
      unlinkSync(filePath);
      
      // Also delete checksum file if exists
      const checksumFile = `${filePath}.sha256`;
      if (existsSync(checksumFile)) {
        unlinkSync(checksumFile);
      }
      
      deletedCount++;
    }
  }
  
  return deletedCount;
}

async function runBackup(envName) {
  const startTime = Date.now();
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  
  const dbConfig = parseDbUrl(databaseUrl);
  const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const envDir = path.join(CONFIG.backupDir, envName);
  const outputFile = path.join(envDir, `backup_${envName}_${timestamp}.sql.gz`);
  
  // Ensure backup directory exists
  if (!existsSync(envDir)) {
    mkdirSync(envDir, { recursive: true });
  }
  
  log('INFO', `Starting backup for ${envName}`);
  log('INFO', `Database: ${dbConfig.database}`);
  log('INFO', `Output: ${outputFile}`);
  
  // Run mysqldump
  const dumpArgs = [
    `--host=${dbConfig.host}`,
    `--port=${dbConfig.port}`,
    `--user=${dbConfig.user}`,
    `--password=${dbConfig.password}`,
    '--ssl-mode=REQUIRED',
    '--skip-lock-tables',
    '--routines',
    '--triggers',
    '--set-gtid-purged=OFF',
    dbConfig.database,
  ];
  
  const dumpFile = outputFile.replace('.gz', '');
  
  execSync(`mysqldump ${dumpArgs.join(' ')} > "${dumpFile}"`, {
    maxBuffer: 100 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  
  // Compress
  execSync(`gzip -f "${dumpFile}"`, {
    maxBuffer: 10 * 1024 * 1024,
  });
  
  // Generate checksum
  const checksum = await calculateChecksum(outputFile);
  const checksumFile = `${outputFile}.sha256`;
  writeFileSync(checksumFile, `${checksum}  ${path.basename(outputFile)}\n`);
  
  // Verify checksum
  const verifyChecksum = await calculateChecksum(outputFile);
  if (checksum !== verifyChecksum) {
    throw new Error('Checksum verification failed');
  }
  
  const fileSize = (statSync(outputFile).size / 1024).toFixed(2);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  
  return {
    file: outputFile,
    size: fileSize,
    checksum: checksum.slice(0, 16) + '...',
    duration,
  };
}

async function main() {
  const envName = process.argv[2] || 'staging';
  const envDir = path.join(CONFIG.backupDir, envName);
  
  log('INFO', '='.repeat(50));
  log('INFO', 'Automated Backup Started');
  log('INFO', '='.repeat(50));
  log('INFO', `Environment: ${envName}`);
  log('INFO', `Retention: ${CONFIG.retentionDays} days`);
  
  let success = false;
  let result = null;
  let errorMessage = null;
  
  try {
    // Run backup
    result = await runBackup(envName);
    
    log('INFO', '='.repeat(50));
    log('INFO', 'Backup Complete');
    log('INFO', '='.repeat(50));
    log('INFO', `File: ${result.file}`);
    log('INFO', `Size: ${result.size} KB`);
    log('INFO', `Checksum: ${result.checksum}`);
    log('INFO', `Duration: ${result.duration}s`);
    
    // Clean old backups
    const deletedCount = cleanOldBackups(envDir);
    if (deletedCount > 0) {
      log('INFO', `Cleaned ${deletedCount} old backup(s)`);
    }
    
    success = true;
    
  } catch (error) {
    errorMessage = error.message;
    log('ERROR', `Backup failed: ${errorMessage}`);
    
    // Send failure alert
    await sendAlert(
      `🔴 Backup Failed: ${envName}`,
      `Database backup for ${envName} failed at ${new Date().toISOString()}\n\nError: ${errorMessage}\n\nPlease investigate immediately.`
    );
  }
  
  // Log final status
  log('INFO', '='.repeat(50));
  log('INFO', `Status: ${success ? 'SUCCESS' : 'FAILED'}`);
  log('INFO', '='.repeat(50));
  
  // Exit with appropriate code
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  log('ERROR', `Unhandled error: ${error.message}`);
  process.exit(1);
});
