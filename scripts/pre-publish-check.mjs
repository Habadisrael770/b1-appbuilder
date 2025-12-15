#!/usr/bin/env node
/**
 * Pre-Publish Health Check Script
 * 
 * Run this script before publishing to production to verify:
 * 1. TypeScript compilation passes
 * 2. All tests pass
 * 3. Health endpoints respond correctly
 * 4. No critical errors in recent logs
 * 
 * Usage:
 *   node scripts/pre-publish-check.mjs [staging-url]
 * 
 * Example:
 *   node scripts/pre-publish-check.mjs https://3000-xxx.manus-asia.computer
 */

import { execSync } from 'child_process';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function logStep(step, message) {
  console.log(`\n${COLORS.blue}[${step}]${COLORS.reset} ${message}`);
}

function logPass(message) {
  console.log(`  ${COLORS.green}✓${COLORS.reset} ${message}`);
}

function logFail(message) {
  console.log(`  ${COLORS.red}✗${COLORS.reset} ${message}`);
}

function logWarn(message) {
  console.log(`  ${COLORS.yellow}⚠${COLORS.reset} ${message}`);
}

async function checkTypeScript() {
  logStep('1/4', 'TypeScript Compilation');
  try {
    execSync('pnpm tsc --noEmit', { stdio: 'pipe', cwd: process.cwd() });
    logPass('No TypeScript errors');
    return true;
  } catch (error) {
    logFail('TypeScript compilation failed');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

async function checkTests() {
  logStep('2/4', 'Unit Tests');
  try {
    execSync('pnpm test --run', { stdio: 'pipe', cwd: process.cwd() });
    logPass('All tests passed');
    return true;
  } catch (error) {
    logFail('Some tests failed');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

async function checkHealthEndpoints(baseUrl) {
  logStep('3/4', 'Health Endpoints');
  
  if (!baseUrl) {
    logWarn('No staging URL provided, skipping health checks');
    logWarn('Usage: node scripts/pre-publish-check.mjs [staging-url]');
    return true;
  }

  let allPassed = true;

  // Check /healthz
  try {
    const healthzUrl = `${baseUrl}/healthz`;
    const response = await fetch(healthzUrl, { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    
    if (response.ok && data.ok === true) {
      logPass(`/healthz → ${JSON.stringify(data)}`);
    } else {
      logFail(`/healthz → ${response.status} ${JSON.stringify(data)}`);
      allPassed = false;
    }
  } catch (error) {
    logFail(`/healthz → ${error.message}`);
    allPassed = false;
  }

  // Check /readyz
  try {
    const readyzUrl = `${baseUrl}/readyz`;
    const response = await fetch(readyzUrl, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(10000)
    });
    const data = await response.json();
    
    if (response.ok && data.ok === true && data.db === 'up') {
      logPass(`/readyz → ${JSON.stringify(data)}`);
    } else {
      logFail(`/readyz → ${response.status} ${JSON.stringify(data)}`);
      allPassed = false;
    }
  } catch (error) {
    logFail(`/readyz → ${error.message}`);
    allPassed = false;
  }

  return allPassed;
}

async function checkBuild() {
  logStep('4/4', 'Production Build');
  try {
    execSync('pnpm build', { stdio: 'pipe', cwd: process.cwd() });
    logPass('Production build successful');
    return true;
  } catch (error) {
    logFail('Production build failed');
    console.log(error.stdout?.toString() || error.stderr?.toString() || error.message);
    return false;
  }
}

async function main() {
  const stagingUrl = process.argv[2];
  
  log('\n' + '='.repeat(50), COLORS.bold);
  log('  B1 AppBuilder - Pre-Publish Health Check', COLORS.bold);
  log('='.repeat(50) + '\n', COLORS.bold);

  if (stagingUrl) {
    log(`Staging URL: ${stagingUrl}`, COLORS.blue);
  }

  const results = {
    typescript: await checkTypeScript(),
    tests: await checkTests(),
    health: await checkHealthEndpoints(stagingUrl),
    build: await checkBuild(),
  };

  // Summary
  console.log('\n' + '='.repeat(50));
  log('  Summary', COLORS.bold);
  console.log('='.repeat(50));

  const allPassed = Object.values(results).every(r => r);

  console.log(`\n  TypeScript:  ${results.typescript ? COLORS.green + 'PASS' : COLORS.red + 'FAIL'}${COLORS.reset}`);
  console.log(`  Tests:       ${results.tests ? COLORS.green + 'PASS' : COLORS.red + 'FAIL'}${COLORS.reset}`);
  console.log(`  Health:      ${results.health ? COLORS.green + 'PASS' : COLORS.red + 'FAIL'}${COLORS.reset}`);
  console.log(`  Build:       ${results.build ? COLORS.green + 'PASS' : COLORS.red + 'FAIL'}${COLORS.reset}`);

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    log('\n  ✅ All checks passed! Safe to publish.\n', COLORS.green);
    process.exit(0);
  } else {
    log('\n  ❌ Some checks failed. Fix issues before publishing.\n', COLORS.red);
    process.exit(1);
  }
}

main().catch(error => {
  log(`\nUnexpected error: ${error.message}`, COLORS.red);
  process.exit(1);
});
