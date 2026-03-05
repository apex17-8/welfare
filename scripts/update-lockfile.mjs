import { execSync } from 'child_process';

try {
  console.log('[v0] Updating pnpm lockfile...');
  execSync('pnpm install --frozen-lockfile=false', {
    cwd: '/vercel/share/v0-project',
    stdio: 'inherit'
  });
  console.log('[v0] Lockfile updated successfully');
} catch (error) {
  console.error('[v0] Error updating lockfile:', error.message);
  process.exit(1);
}
