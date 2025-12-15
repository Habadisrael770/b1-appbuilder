#!/usr/bin/env node
/**
 * Database Backup Script for B1 AppBuilder
 * 
 * Uses the DATABASE_URL from environment (injected by Manus)
 * Creates a compressed SQL dump with checksum verification
 * 
 * Usage: node scripts/db-backup.mjs [env_name]
 */

import { execSync, spawn } from 'child_process';
import { createWriteStream, existsSync, mkdirSync, writeFileSync, statSync } from 'fs';
import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { createGzip } from 'zlib';
import path from 'path';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

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
  // Format: mysql://user:pass@host:port/database?ssl=...
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
  const envName = process.argv[2] || 'staging';
  const databaseUrl = process.env.DATABASE_URL;

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

  // Setup paths
  const projectRoot = path.resolve(process.cwd());
  const backupDir = path.join(projectRoot, 'backups', envName);
  const timestamp = new Date().toISOString().replace(/[:-]/g, '').replace('T', '_').slice(0, 15);
  const sqlFile = path.join(backupDir, `backup_${envName}_${timestamp}.sql`);
  const gzFile = `${sqlFile}.gz`;
  const checksumFile = `${gzFile}.sha256`;

  // Create backup directory
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }

  log('\n' + '='.repeat(50));
  logInfo('Database Backup Started');
  log('='.repeat(50));
  logInfo(`Environment: ${envName}`);
  logInfo(`Database: ${dbConfig.database}`);
  logInfo(`Host: ${dbConfig.host}:${dbConfig.port}`);
  logInfo(`Timestamp: ${timestamp}`);
  logInfo(`Output: ${gzFile}`);
  log('');

  const startTime = Date.now();

  try {
    // Execute mysqldump
    logInfo('Running mysqldump...');
    
    const mysqldumpArgs = [
      `--host=${dbConfig.host}`,
      `--port=${dbConfig.port}`,
      `--user=${dbConfig.user}`,
      `--password=${dbConfig.password}`,
      '--ssl-mode=REQUIRED',
      '--skip-lock-tables',
      '--set-gtid-purged=OFF',
      dbConfig.database,
    ];

    // Run mysqldump and pipe to file
    const result = execSync(`mysqldump ${mysqldumpArgs.join(' ')}`, {
      maxBuffer: 100 * 1024 * 1024, // 100MB buffer
      encoding: 'buffer',
    });

    // Write to SQL file
    writeFileSync(sqlFile, result);
    
    const uncompressedSize = statSync(sqlFile).size;
    logInfo(`Uncompressed size: ${(uncompressedSize / 1024).toFixed(2)} KB`);

    // Compress the backup
    logInfo('Compressing backup...');
    await pipeline(
      createReadStream(sqlFile),
      createGzip(),
      createWriteStream(gzFile)
    );

    // Remove uncompressed file
    execSync(`rm -f "${sqlFile}"`);

    const compressedSize = statSync(gzFile).size;
    logInfo(`Compressed size: ${(compressedSize / 1024).toFixed(2)} KB`);

    // Generate checksum
    logInfo('Generating checksum...');
    const checksum = await calculateChecksum(gzFile);
    writeFileSync(checksumFile, `${checksum}  ${path.basename(gzFile)}\n`);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(1);

    log('\n' + '='.repeat(50));
    logInfo('Backup Complete');
    log('='.repeat(50));
    log(`  File: ${gzFile}`);
    log(`  Size: ${(compressedSize / 1024).toFixed(2)} KB`);
    log(`  Checksum: ${checksum.slice(0, 16)}...`);
    log(`  Duration: ${duration} seconds`);
    log('');

    // Verify checksum
    logInfo('Verifying checksum...');
    const verifyChecksum = await calculateChecksum(gzFile);
    if (verifyChecksum === checksum) {
      logInfo('Checksum verification: PASSED');
    } else {
      logError('Checksum verification: FAILED');
      process.exit(1);
    }

    log('');
    logInfo('Backup successful!');
    log(`  Backup: ${gzFile}`);
    log(`  Checksum: ${checksumFile}`);

  } catch (error) {
    logError(`Backup failed: ${error.message}`);
    if (error.stderr) {
      logError(`stderr: ${error.stderr.toString()}`);
    }
    process.exit(1);
  }
}

main().catch(console.error);
