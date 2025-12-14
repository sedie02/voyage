/**
 * ISO/IEC 25010 - Portability Tests
 * T1: Generic Node start
 * T2: Vendor-agnostisch gedrag
 */

import { execSync } from 'child_process';
import { spawn } from 'child_process';

describe('ISO 25010 - Portability', () => {
  let serverProcess: any;
  const testPort = 4010;

  afterEach(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });

  test('T1 - Generic Node build & start', async () => {
    // Unset platform-specific env vars
    const env = { ...process.env };
    delete env.VERCEL;
    delete env.NETLIFY;

    // Build
    execSync('npm run build', { env, stdio: 'pipe' });
    console.log('✅ Build successful (no platform deps)');

    // Start server - gebruik next start direct
    serverProcess = spawn('npx', ['next', 'start', '-p', testPort.toString()], {
      env,
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    // Wait for server to start (max 60s)
    const maxWait = 60000;
    const startTime = Date.now();
    let serverReady = false;

    while (Date.now() - startTime < maxWait && !serverReady) {
      try {
        const http = require('http');
        const response = await new Promise<boolean>((resolve) => {
          const req = http.get(`http://localhost:${testPort}/api/health`, (res: any) => {
            resolve(res.statusCode === 200);
          });
          req.on('error', () => resolve(false));
          req.setTimeout(1000, () => {
            req.destroy();
            resolve(false);
          });
        });
        if (response) {
          serverReady = true;
          break;
        }
      } catch (error) {
        // Server nog niet ready
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    expect(serverReady).toBe(true);
    console.log('✅ Server started successfully');
  }, 120000); // 120 seconden timeout

  test('T2 - Vendor-agnostisch: geen platform-SDK runtime errors', async () => {
    const env = { ...process.env };
    delete env.VERCEL;
    delete env.NETLIFY;

    // Start server - gebruik next start direct
    serverProcess = spawn('npx', ['next', 'start', '-p', testPort.toString()], {
      env,
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    // Wait for server
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Check for runtime errors in logs
    let hasErrors = false;
    serverProcess.stderr.on('data', (data: Buffer) => {
      const output = data.toString();
      if (
        output.includes('VERCEL') ||
        output.includes('NETLIFY') ||
        output.includes('Cannot find module') ||
        output.includes('platform')
      ) {
        hasErrors = true;
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 2000));

    expect(hasErrors).toBe(false);
    console.log('✅ No platform-specific runtime errors');
  }, 30000); // 30 seconden timeout
});
