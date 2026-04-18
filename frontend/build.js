import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const vitePath = join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');

console.log('🚀 Starting Vite build...');
console.log('📍 Vite path:', vitePath);

const build = spawn('node', [vitePath, 'build'], {
  stdio: 'inherit',
  cwd: __dirname,
  shell: true
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ Build failed with code:', code);
    process.exit(code);
  }
  console.log('✅ Build completed successfully!');
});

build.on('error', (err) => {
  console.error('❌ Build error:', err);
  process.exit(1);
});