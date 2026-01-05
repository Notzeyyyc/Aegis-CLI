import { simpleGit } from 'simple-git';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const git = simpleGit();

export async function initProject(name, description, author, licenseKey, expirationDate) {
  const config = { 
    name, 
    description, 
    author, 
    secret: licenseKey || 'default-secret',
    expiration: expirationDate || '9999-12-31',
    createdAt: new Date().toISOString() 
  };
  fs.writeFileSync('aegis.json', JSON.stringify(config, null, 2));
  await git.init();
  if (!fs.existsSync('.gitignore')) {
    fs.writeFileSync('.gitignore', 'node_modules\n.env\n*.aegis\naegis.json\n');
  }
  console.log(chalk.green('✔ Aegis project & Git repo initialized!'));
}

export async function pushWithToken(token, branch = 'main', force = false) {
  try {
    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === 'origin');
    if (!origin) throw new Error('Remote origin not found!');
    
    let url = origin.refs.push;
    if (url.startsWith('https://')) {
      url = url.replace('https://', `https://${token}@`);
    }
    
    const options = force ? ['-f'] : [];
    console.log(chalk.blue(`${force ? 'Force pushing' : 'Pushing'} to ${branch}...`));
    await git.push(url, branch, options);
    console.log(chalk.green(`✔ ${force ? 'Force pushed' : 'Pushed'} successfully!`));
  } catch (err) {
    console.log(chalk.red('Push Error: ' + err.message));
  }
}

export async function pullWithToken(token, branch = 'main') {
  try {
    const status = await git.status();
    const currentBranch = status.current;

    // Smart Switch: Kalau target branch beda sama yg aktif, pindah dulu!
    if (branch !== currentBranch) {
      console.log(chalk.yellow(`⚠ You are on '${currentBranch}', switching to '${branch}' before pulling...`));
      await git.checkout(branch);
    }

    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === 'origin');
    if (!origin) throw new Error('Remote origin not found!');
    
    let url = origin.refs.push; // Kita pake ref yang sama buat pull
    if (url.startsWith('https://')) {
      url = url.replace('https://', `https://${token}@`);
    }
    
    console.log(chalk.blue(`Pulling from ${branch}...`));
    
    // Config: Paksa strategy MERGE (bukan rebase) biar gak error "divergent branches"
    // Ini solusi paling ampuh buat user yang males setting config manual
    await git.addConfig('pull.rebase', 'false');

    // Tambah flag allow-unrelated-histories buat jaga-jaga kalau history-nya putus
    await git.pull(url, branch, ['--allow-unrelated-histories']);
    console.log(chalk.green('✔ Pull success! Local updated.'));
  } catch (err) {
    console.log(chalk.red('Pull Error: ' + err.message));
  }
}

export async function updateAegis(type) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const rootDir = path.join(__dirname, '..');
  const sysGit = simpleGit(rootDir);

  const branch = type === 'pre' ? 'beta' : 'main';

  console.log(chalk.blue(`🔄 Updating Aegis System (${type.toUpperCase()})...`));
  console.log(chalk.gray(`Target: ${branch} branch`));

  try {
    // Check if remote exists, if not might act weird but assuming valid clone
    await sysGit.fetch();
    await sysGit.checkout(branch);
    await sysGit.pull('origin', branch);
    console.log(chalk.green(`✔ Core files updated to ${branch}.`));

    console.log(chalk.yellow('📦 Updating dependencies...'));
    execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
    console.log(chalk.green('✔ Dependencies installed.'));

    console.log(chalk.magentaBright('\n✨ Aegis has been updated successfully!'));
  } catch (err) {
    console.log(chalk.red('Update Failed: ' + err.message));
  }
}

export async function switchBranch(branch) {
  try {
    await git.checkout(branch);
    console.log(chalk.green(`✔ Switched to branch: ${branch}`));
  } catch (err) {
    console.log(chalk.red('Switch Error: ' + err.message));
  }
}

export async function createBranch(branch) {
  try {
    await git.checkoutLocalBranch(branch);
    console.log(chalk.green(`✔ Created and switched to new branch: ${branch}`));
  } catch (err) {
    console.log(chalk.red('Branch Creation Error: ' + err.message));
  }
}

export { git };
