#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = path.join(path.dirname(new URL(import.meta.url).pathname), '..');

console.log('Installing dependencies with npm...');
try {
  execSync('npm install', {
    cwd: projectRoot,
    stdio: 'inherit',
  });
  console.log('Dependencies installed successfully!');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
  process.exit(1);
}
