import crypto from 'crypto';
import fs from 'fs';
import chalk from 'chalk';
import path from 'path';

const ALGORITHM = 'aes-256-cbc';

function getProjectConfig() {
  try {
    const configPath = path.resolve(process.cwd(), 'aegis.json');
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (e) {
    return null;
  }
  return null;
}

export function encryptFile(filePath, manualPassword) {
  try {
    const config = getProjectConfig();
    const password = manualPassword || (config && config.secret);
    const expiration = (config && config.expiration) || '9999-12-31';

    if (!password) {
      console.log(chalk.red('Error: No password provided and no aegis.json secret found.'));
      return;
    }

    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    const input = fs.readFileSync(filePath);
    const encrypted = Buffer.concat([cipher.update(input), cipher.final()]);
    
    const encryptedHex = encrypted.toString('hex');
    const ivHex = iv.toString('hex');
    const saltHex = salt.toString('hex');
    
    // Guardian Integrity Check: Hash of the encrypted payload
    const integrityHash = crypto.createHash('sha256').update(encryptedHex).digest('hex');

    // Create the "Guardian" protected JS wrapper
    const wrapperContent = `
/**
 * 🔒 Encrypted with Aegis
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');
const vm = require('vm');
const path = require('path');

// 🔒 SECURE PAYLOAD
const ENCRYPTED_DATA = "${encryptedHex}";
const IV_HEX = "${ivHex}";
const SALT_HEX = "${saltHex}";
const INTEGRITY_HASH = "${integrityHash}";
const EXPIRATION_DATE = "${expiration}";

function start() {
  // 1. Expiration Check
  const today = new Date().toISOString().split('T')[0];
  if (today > EXPIRATION_DATE) {
    console.error("\\n⛔ LICENSE EXPIRED");
    console.error("❌ This code is no longer valid. Please contact the author.");
    process.exit(1);
  }

  // 2. Integrity Check
  const currentHash = crypto.createHash('sha256').update(ENCRYPTED_DATA).digest('hex');
  if (currentHash !== INTEGRITY_HASH) {
    console.error("\\n❌ Error: File corrupted or tampered with.");
    process.exit(1);
  }

  // 3. Unlock
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('🔑 Enter License Code: ', (password) => {
    rl.close();
    try {
      const key = crypto.scryptSync(password, Buffer.from(SALT_HEX, 'hex'), 32);
      const decipher = crypto.createDecipheriv('${ALGORITHM}', key, Buffer.from(IV_HEX, 'hex'));
      
      let decrypted = decipher.update(ENCRYPTED_DATA, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Execute
      const script = new vm.Script(decrypted, { filename: 'decrypted.js' });
      script.runInThisContext();

    } catch (err) {
      console.error("\\n❌ Access Denied: Invalid License Code.");
      process.exit(1);
    }
  });
}

start();
`;

    const outputPath = filePath + '.enc.js';
    fs.writeFileSync(outputPath, wrapperContent);
    console.log(chalk.green(`✔ Encrypted: ${outputPath}`));
    console.log(chalk.gray(`  Expiration: ${expiration}`));

    // Delete original file for security
    try {
      fs.unlinkSync(filePath);
      console.log(chalk.yellow(`🗑️  Original file deleted: ${path.basename(filePath)}`));
    } catch (delErr) {
      console.log(chalk.red(`⚠ Could not delete original file: ${delErr.message}`));
    }
  } catch (err) {
    console.log(chalk.red('Encryption Error: ' + err.message));
  }
}

export function decryptFile(filePath, manualPassword) {
  try {
    const config = getProjectConfig();
    const password = manualPassword || (config && config.secret);

    if (!password) {
      console.log(chalk.red('Error: No password provided and no aegis.json secret found.'));
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Try to parse as Aegis Encrypted JS
    const encryptedMatch = fileContent.match(/const ENCRYPTED_DATA = "([a-f0-9]+)";/);
    const ivMatch = fileContent.match(/const IV_HEX = "([a-f0-9]+)";/);
    const saltMatch = fileContent.match(/const SALT_HEX = "([a-f0-9]+)";/);

    if (encryptedMatch && ivMatch && saltMatch) {
      // New Format
      const encryptedHex = encryptedMatch[1];
      const ivHex = ivMatch[1];
      const saltHex = saltMatch[1];

      const key = crypto.scryptSync(password, Buffer.from(saltHex, 'hex'), 32);
      const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, 'hex'));
      
      let decrypted = decipher.update(encryptedHex, 'hex');
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      
      // Determine original filename
      const originalPath = filePath.replace('.enc.js', '').replace('.secure.js', '').replace('.aegis', '');
      fs.writeFileSync(originalPath, decrypted);
      console.log(chalk.green(`✔ Decrypted: ${originalPath}`));

    } else {
      // Fallback to Old Binary Format
      const data = fs.readFileSync(filePath);
      const salt = data.subarray(0, 16);
      const iv = data.subarray(16, 32);
      const encryptedData = data.subarray(32);
      
      const key = crypto.scryptSync(password, salt, 32);
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
      
      const originalPath = filePath.replace('.aegis', '');
      fs.writeFileSync(originalPath, decrypted);
      console.log(chalk.green(`✔ File decrypted (Legacy): ${originalPath}`));
    }
  } catch (err) {
    console.log(chalk.red('Decryption Error: ' + err.message));
    console.log(chalk.gray('Ensure you are decrypting a valid Aegis encrypted file.'));
  }
}
