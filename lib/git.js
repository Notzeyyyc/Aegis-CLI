import { simpleGit } from 'simple-git';
import chalk from 'chalk';
import fs from 'fs';

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
    const remotes = await git.getRemotes(true);
    const origin = remotes.find(r => r.name === 'origin');
    if (!origin) throw new Error('Remote origin not found!');
    
    let url = origin.refs.push; // Kita pake ref yang sama buat pull
    if (url.startsWith('https://')) {
      url = url.replace('https://', `https://${token}@`);
    }
    
    console.log(chalk.blue(`Pulling from ${branch}...`));
    await git.pull(url, branch);
    console.log(chalk.green('✔ Pull success! Local updated.'));
  } catch (err) {
    console.log(chalk.red('Pull Error: ' + err.message));
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