#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import Conf from 'conf';
import path from 'path';
import inquirer from 'inquirer';

import { encryptFile, decryptFile } from './lib/crypto.js';
import { initProject, pushWithToken, pullWithToken, git, switchBranch, createBranch } from './lib/git.js';

const program = new Command();
const config = new Conf({ projectName: 'aegis-cli' });

console.log(chalk.blueBright(figlet.textSync('AEGIS', { font: 'Slant', horizontalLayout: 'full' })));
console.log(chalk.bold.white('🛡️  Guard Your Code. Simplify Your Git.\n'));

program
  .name('aegis')
  .description('Modular Git & Encryption Tool')
  .version('1.0.0');

program
  .command('init')
  .description('Initialize new project')
  .option('-y, --yes', 'Quick init with defaults')
  .action(async (options) => {
    let name = path.basename(process.cwd());
    let description = 'Modular Aegis Project';
    let author = 'User';
    let licenseKey = 'default-secret-key';
    let expirationDate = '9999-12-31';

    if (!options.yes) {
      try {
        const answers = await inquirer.prompt([
          { type: 'input', name: 'name', message: 'Project Name:', default: name },
          { type: 'input', name: 'description', message: 'Description:', default: description },
          { type: 'input', name: 'author', message: 'Author:', default: author },
          { type: 'input', name: 'licenseKey', message: 'License/Secret Key:', default: licenseKey },
          { type: 'input', name: 'expirationDate', message: 'Expiration Date (YYYY-MM-DD):', default: expirationDate }
        ]);
        name = answers.name;
        description = answers.description;
        author = answers.author;
        licenseKey = answers.licenseKey;
        expirationDate = answers.expirationDate;
      } catch (err) {
        if (err.name === 'ExitPromptError') {
          console.log(chalk.yellow('\nInit dibatalkan.'));
          process.exit(0);
        }
      }
    }
    await initProject(name, description, author, licenseKey, expirationDate);
  });

program
  .command('add')
  .argument('[files...]', 'files to add', ['.'])
  .action(async (files) => {
    await git.add(files);
    console.log(chalk.green('✔ Added!'));
  });

program
  .command('commit')
  .argument('<message>')
  .action(async (msg) => {
    await git.commit(msg);
    console.log(chalk.green(`✔ Committed: ${msg}`));
  });

program
  .command('remote')
  .argument('<url>')
  .action(async (url) => {
    try {
      await git.addRemote('origin', url);
      console.log(chalk.green('✔ Remote origin added!'));
    } catch (e) {
      await git.remote(['set-url', 'origin', url]);
      console.log(chalk.yellow('✔ Remote origin updated!'));
    }
  });

program
  .command('push')
  .description('Push update ke GitHub')
  .argument('[branch]', 'branch name', 'main')
  .option('-f, --force', 'Paksa push (overwrite remote)')
  .action(async (branch, options) => {
    const token = config.get('git_token');
    if (!token) return console.log(chalk.red('Token not found! Use: aegis setup-git <token>'));
    await pushWithToken(token, branch, options.force);
  });

program
  .command('pull')
  .description('Ambil update terbaru dari GitHub')
  .argument('[branch]', 'branch name', 'main')
  .action(async (branch) => {
    const token = config.get('git_token');
    if (!token) return console.log(chalk.red('Token not found! Use: aegis setup-git <token>'));
    await pullWithToken(token, branch);
  });

program
  .command('checkout')
  .description('Pindah ke branch lain')
  .argument('<branch>', 'nama branch')
  .action(async (branch) => {
    await switchBranch(branch);
  });

program
  .command('branch')
  .description('Buat branch baru')
  .argument('<name>', 'nama branch baru')
  .action(async (name) => {
    await createBranch(name);
  });

program
  .command('setup-git')
  .argument('<token>')
  .action((token) => {
    config.set('git_token', token);
    console.log(chalk.green('✔ GitHub token saved!'));
  });

program
  .command('encrypt')
  .argument('<file>')
  .option('-p, --password <pass>', 'Optional: Override config secret')
  .action((file, opt) => encryptFile(file, opt.password));

program
  .command('decrypt')
  .argument('<file>')
  .option('-p, --password <pass>', 'Optional: Override config secret')
  .action((file, opt) => decryptFile(file, opt.password));

program
  .command('status')
  .action(async () => {
    const s = await git.status();
    console.log(chalk.cyan('\n--- Git Status ---'));
    console.log(s);
  });

program.parse();