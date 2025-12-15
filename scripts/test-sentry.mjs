#!/usr/bin/env node
/**
 * Sentry Verification Test Script
 * 
 * Purpose: Verify Sentry error capture is working correctly
 * Usage: node scripts/test-sentry.mjs [backend|frontend|all]
 * 
 * Prerequisites:
 * - SENTRY_DSN and VITE_SENTRY_DSN configured
 * - Server running locally or deployed
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function checkEnvVars() {
  log('\n📋 Checking environment variables...', 'cyan');
  
  const requiredBackend = ['SENTRY_DSN', 'SENTRY_ENVIRONMENT'];
  const requiredFrontend = ['VITE_SENTRY_DSN', 'VITE_SENTRY_ENVIRONMENT'];
  
  let allPresent = true;
  
  log('\nBackend:', 'blue');
  for (const envVar of requiredBackend) {
    if (process.env[envVar]) {
      log(`  ✅ ${envVar}: ${process.env[envVar].substring(0, 30)}...`, 'green');
    } else {
      log(`  ❌ ${envVar}: NOT SET`, 'red');
      allPresent = false;
    }
  }
  
  log('\nFrontend:', 'blue');
  for (const envVar of requiredFrontend) {
    if (process.env[envVar]) {
      log(`  ✅ ${envVar}: ${process.env[envVar].substring(0, 30)}...`, 'green');
    } else {
      log(`  ❌ ${envVar}: NOT SET`, 'red');
      allPresent = false;
    }
  }
  
  if (!allPresent) {
    log('\n❌ Missing required environment variables. Please configure them first.', 'red');
    process.exit(1);
  }
  
  log('\n✅ All environment variables present\n', 'green');
}

function testBackendError(serverUrl) {
  log('\n🧪 Testing backend error capture...', 'cyan');
  
  try {
    const response = execSync(`curl -s -w "\\n%{http_code}" ${serverUrl}/test-sentry-error`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    
    const lines = response.trim().split('\n');
    const statusCode = lines[lines.length - 1];
    
    if (statusCode === '500') {
      log('✅ Backend error triggered (HTTP 500)', 'green');
      log('\n📊 Next steps:', 'yellow');
      log('  1. Go to Sentry → Projects → b1-appbuilder-backend', 'yellow');
      log('  2. Check Issues tab', 'yellow');
      log('  3. Look for: "🧪 Test backend error - Sentry verification"', 'yellow');
      log('  4. Verify stacktrace is readable (not minified)', 'yellow');
      log('  5. Check Additional Data for PII leaks', 'yellow');
      return true;
    } else {
      log(`❌ Unexpected status code: ${statusCode}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Failed to trigger backend error: ${error.message}`, 'red');
    return false;
  }
}

function testFrontendError(serverUrl) {
  log('\n🧪 Testing frontend error capture...', 'cyan');
  log('⚠️  Frontend test requires manual interaction:', 'yellow');
  log(`  1. Open ${serverUrl} in your browser`, 'yellow');
  log('  2. Open DevTools Console', 'yellow');
  log('  3. Run: throw new Error("🧪 Test frontend error - Sentry verification")', 'yellow');
  log('  4. Check Sentry → Projects → b1-appbuilder-frontend', 'yellow');
  log('  5. Verify error appears within 60 seconds', 'yellow');
  log('  6. Verify stacktrace shows React component names', 'yellow');
  log('  7. Verify no PII in error event', 'yellow');
}

function testPIIScrubbing() {
  log('\n🔒 Testing PII scrubbing...', 'cyan');
  log('Manual verification required:', 'yellow');
  log('  1. In Sentry error event, check "Additional Data"', 'yellow');
  log('  2. Verify NO presence of:', 'yellow');
  log('     - Email addresses', 'yellow');
  log('     - JWT tokens', 'yellow');
  log('     - Cookie values', 'yellow');
  log('     - Authorization headers', 'yellow');
  log('     - Passwords or secrets', 'yellow');
  log('  3. If any PII found → FIX IMMEDIATELY', 'red');
}

function testAlerts() {
  log('\n🔔 Testing alert delivery...', 'cyan');
  log('Steps:', 'yellow');
  log('  1. Trigger 6+ errors in 5 minutes (to exceed spike threshold)', 'yellow');
  log('  2. Wait up to 5 minutes', 'yellow');
  log('  3. Check email or Slack for alert notification', 'yellow');
  log('  4. Verify alert contains error details and link to Sentry', 'yellow');
}

function printSummary() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 SENTRY VERIFICATION SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log('\n✅ Completed Tests:', 'green');
  log('  - Environment variables check', 'green');
  log('  - Backend error trigger', 'green');
  
  log('\n⏳ Manual Verification Required:', 'yellow');
  log('  - Frontend error capture (browser console)', 'yellow');
  log('  - PII scrubbing (check Sentry dashboard)', 'yellow');
  log('  - Alert delivery (email/Slack)', 'yellow');
  log('  - Sourcemaps (readable stacktraces)', 'yellow');
  
  log('\n🎯 Success Gates:', 'blue');
  log('  [ ] Backend error in Sentry (<60s)', 'blue');
  log('  [ ] Frontend error in Sentry (<60s)', 'blue');
  log('  [ ] Stacktraces readable (not minified)', 'blue');
  log('  [ ] No PII in error events', 'blue');
  log('  [ ] Alert notification delivered', 'blue');
  
  log('\n📚 Documentation:', 'cyan');
  log('  See SENTRY_SETUP_CHECKLIST.md for detailed instructions', 'cyan');
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'all';
  const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
  
  log('🚀 Sentry Verification Test', 'cyan');
  log(`Mode: ${mode}`, 'blue');
  log(`Server: ${serverUrl}`, 'blue');
  
  checkEnvVars();
  
  if (mode === 'backend' || mode === 'all') {
    testBackendError(serverUrl);
  }
  
  if (mode === 'frontend' || mode === 'all') {
    testFrontendError(serverUrl);
  }
  
  if (mode === 'all') {
    testPIIScrubbing();
    testAlerts();
  }
  
  printSummary();
}

main().catch((error) => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});
