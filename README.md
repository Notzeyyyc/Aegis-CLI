# AEGIS CLI 🛡️

**Aegis** is a lightweight, modular CLI tool designed for Termux users to simplify Git operations and secure files with AES-256 encryption. No more hassle with GitHub tokens every time you push!

---

## 🚀 Features

- **Automated Git Push**: Save your GitHub Personal Access Token (PAT) once and push without re-entering credentials.
- **File Encryption**: Secure your sensitive files using AES-256-CBC encryption.
- **Project Initializer**: Quickly set up new projects with a customized `aegis.json` and Git repository.
- **Modular Git Helpers**: Easy-to-use commands for `add`, `commit`, `branch`, and `checkout`.
- **Terminal Friendly**: Optimized for Termux with a beautiful ASCII art banner.

## 📥 Installation

1. **Clone this repository:**
   ```bash
   https://github.com/Notzeyyyc/Aegis-CLI.git
   cd Aegis-CLI
   ```

2. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

---

## 🛠️ Usage

### Git Operations
- **Setup your GitHub Token:**
  ```bash
  aegis setup-git <your_token>
  ```
- **Initialize a new project:**
  ```bash
  aegis init
  # or use defaults
  aegis init -y
  ```
- **Add & Commit:**
  ```bash
  aegis add .
  aegis commit "feat: initial commit"
  ```
- **Push to GitHub:**
  ```bash
  aegis push main
  ```

### Branching
- **Create a new branch:**
  ```bash
  aegis branch <new-branch-name>
  ```
- **Switch branch:**
  ```bash
  aegis checkout <branch-name>
  ```

### File Security
- **Encrypt a file:**
  ```bash
  aegis encrypt secret.txt -p yourpassword
  ```
- **Decrypt a file:**
  ```bash
  aegis decrypt secret.txt.aegis -p yourpassword
  ```

---

# AEGIS CLI (Bahasa Indonesia) 🇮🇩

**Aegis** adalah tools CLI modular yang dirancang untuk pengguna Termux guna mempermudah urusan Git dan mengamankan file dengan enkripsi AES-256. Gak perlu ribet input token setiap kali push!

## 🚀 Fitur Utama

- **Push Git Otomatis**: Simpan token GitHub lo sekali, dan push tanpa perlu ketik kredensial lagi.
- **Enkripsi File**: Amankan file sensitif lo pake enkripsi AES-256-CBC.
- **Project Initializer**: Setup project baru dengan cepat lengkap dengan `aegis.json` dan repo Git.
- **Git Helpers**: Command yang simpel buat `add`, `commit`, `branch`, dan `checkout`.
- **Tampilan Keren**: Dilengkapi banner ASCII art yang mantap buat terminal lo.

## 📥 Cara Install

1. **Clone repository ini:**
   ```bash
   git clone https://github.com/yourusername/aegis-cli.git
   cd aegis-cli
   ```

2. **Jalankan script setup:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

## 🛠️ Cara Pakai

- **Set Token GitHub:** `aegis setup-git <token_lo>`
- **Init Project:** `aegis init`
- **Push:** `aegis push <branch>`
- **Enkripsi:** `aegis encrypt <file> -p <password>`
- **Dekripsi:** `aegis decrypt <file.aegis> -p <password>`

---

**Author:** Your Name / Aegis Team  
**License:** GPL-3.0
