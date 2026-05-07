const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const isWindows = os.platform() === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const serverDir = path.join(__dirname, 'server');
const clientDir = path.join(__dirname, 'client');

function log(msg) {
  console.log(`[Startup] ${msg}`);
}

function checkDeps(dir) {
  const lockFile = path.join(dir, 'package-lock.json');
  if (!fs.existsSync(lockFile)) {
    log(`Installing dependencies in ${path.basename(dir)}...`);
    const install = spawn(npmCmd, ['install'], { cwd: dir, shell: true });
    install.on('close', (code) => {
      if (code !== 0) {
        log(`Failed to install dependencies in ${path.basename(dir)}`);
        process.exit(1);
      }
    });
  }
}

function startServer() {
  log('Starting server on http://localhost:4000 ...');
  const server = spawn(npmCmd, ['run', 'dev'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true
  });
  server.on('error', (err) => {
    log(`Server error: ${err.message}`);
  });
}

function startClient() {
  log('Starting client on http://localhost:3000 ...');
  const client = spawn(npmCmd, ['start'], {
    cwd: clientDir,
    stdio: 'inherit',
    shell: true
  });
  client.on('error', (err) => {
    log(`Client error: ${err.message}`);
  });
}

log('Gomoku Game Launcher');
log('--------------------');
checkDeps(serverDir);
checkDeps(clientDir);

startServer();
startClient();

log('Both services started!');
log('Open http://localhost:3000 in your browser');