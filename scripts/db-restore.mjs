#!/usr/bin/env node
/**
 * Database Restore Script for B1 AppBuilder
 * 
 * Uses the DATABASE_URL from environment (injected by Manus)
 * Restores a compressed SQL dump with checksum verification
 * 
 * Usage: node scripts/db-restore.mjs <backup_file.sql.gz>
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function logInfo(message) {
  console.log(`${COLORS.green}[INFO]${COLORS.reset} ${message}`);
}

function logError(message) {
  console.log(`${COLORS.red}[ERROR]${COLORS.reset} ${message}`);
}

function logWarn(message) {
  console.log(`${COLORS.yellow}[WARN]${COLORS.reset} ${message}`);
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

async function main() {
  const backupFile = process.argv[2];
  const envName = process.env.ENV_NAME || 'staging';
  const databaseUrl = process.env.DATABASE_URL;

  if (!backupFile) {
    logError('Backup file path is required');
    console.log('Usage: node scripts/db-restore.mjs <backup_file.sql.gz>');
    process.exit(1);
  }

  if (!existsSync(backupFile)) {
    logError(`Backup file not found: ${backupFile}`);
    process.exit(1);
  }

  if (!databaseUrl) {
    logError('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // Parse database URL
  let dbConfig;
  try {
    dbConfig = parseDbUrl(databaseUrl);
  } catch (e) {
    logError(`Failed to parse DATABASE_URL: ${e.message}`);
    process.exit(1);
  }

  // Check for checksum file
  const checksumFile = `${backupFile}.sha256`;
  if (existsSync(checksumFile)) {
    logInfo('Verifying backup checksum...');
    const expectedChecksum = readFileSync(checksumFile, 'utf-8').split(' ')[0].trim();
    const actualChecksum = await calculateChecksum(backupFile);
    
    if (expectedChecksum === actualChecksum) {
      logInfo('Checksum verification: PASSED');
    } else {
      logError('Checksum verification: FAILED');
      logError('Backup file may be corrupted. Aborting restore.');
      process.exit(1);
    }
  } else {
    logWarn('No checksum file found. Proceeding without verification.');
  }

  const backupSize = (statSync(backupFile).size / 1024).toFixed(2);

  console.log('\n' + '='.repeat(50));
  logInfo('Database Restore Started');
  console.log('='.repeat(50));
  logInfo(`Environment: ${envName}`);
  logInfo(`Database: ${dbConfig.database}`);
  logInfo(`Host: ${dbConfig.host}:${dbConfig.port}`);
  logInfo(`Backup file: ${backupFile}`);
  logInfo(`Backup size: ${backupSize} KB`);
  console.log('');

  // Safety check for production
  if (envName === 'production' || envName === 'prod') {
    logWarn('⚠️  WARNING: You are about to restore to PRODUCTION!');
    logWarn('This will OVERWRITE all existing data.');
    logError('Production restore requires manual confirmation. Aborting.');
    process.exit(1);
  }

  // Record start time
  const startTime = Date.now();
  const startTimeStr = new Date().toISOString();
  logInfo(`Start time: ${startTimeStr}`);

  try {
    // Execute restore
    logInfo('Decompressing and restoring...');
    
    const mysqlArgs = [
      `--host=${dbConfig.host}`,
      `--port=${dbConfig.port}`,
      `--user=${dbConfig.user}`,
      `--password=${dbConfig.password}`,
      '--ssl-mode=REQUIRED',
      dbConfig.database,
    ];

    execSync(`gunzip -c "${backupFile}" | mysql ${mysqlArgs.join(' ')}`, {
      maxBuffer: 100 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Record end time
    const endTime = Date.now();
    const endTimeStr = new Date().toISOString();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    console.log('\n' + '='.repeat(50));
    logInfo('Restore Complete');
    console.log('='.repeat(50));
    logInfo(`End time: ${endTimeStr}`);
    logInfo(`Duration: ${duration} seconds`);
    console.log('');

    // Verify database is accessible
    logInfo('Verifying database connection...');
    const tablesResult = execSync(
      `mysql ${mysqlArgs.join(' ')} -N -e "SHOW TABLES"`,
      { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
    );
    const tableCount = tablesResult.trim().split('\n').filter(t => t).length;
    
    if (tableCount > 0) {
      logInfo(`Database verification: PASSED (${tableCount} tables found)`);
    } else {
      logWarn('Database verification: No tables found (may be expected for empty backup)');
    }

    console.log('');
    logInfo('Restore successful!');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Check health endpoint: curl <staging-url>/healthz');
    console.log('  2. Check readiness: curl <staging-url>/readyz');
    console.log('  3. Test critical functionality');
    console.log('');
    console.log('RTO Summary:');
    console.log(`  Start: ${startTimeStr}`);
    console.log(`  End: ${endTimeStr}`);
    console.log(`  Duration: ${duration} seconds`);

  } catch (error) {
    logError(`Restore failed: ${error.message}`);
    if (error.stderr) {
      logError(`stderr: ${error.stderr.toString()}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);
