const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sistema de backup automático de configuraciones
class ProviderBackupService {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.configDir = path.join(__dirname, '../config');
    this.ensureBackupDirectory();
    this.startAutoBackup();
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  startAutoBackup() {
    // Backup cada 6 horas
    setInterval(() => {
      this.createBackup();
    }, 6 * 60 * 60 * 1000);
  }

  createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(this.backupDir, `config-backup-${timestamp}.json`);
      
      const configs = {
        make: this.loadConfig('agents.json'),
        n8n: this.loadConfig('n8n-agents.json'),
        chatgpt: this.loadConfig('chatgpt-agents.json'),
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      };
      
      fs.writeFileSync(backupPath, JSON.stringify(configs, null, 2));
      
      // Limpiar backups antiguos (mantener solo 10)
      this.cleanOldBackups();
      
      return {
        success: true,
        backupPath,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Backup error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  loadConfig(filename) {
    try {
      const configPath = path.join(this.configDir, filename);
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
      return {};
    } catch (error) {
      console.error(`Error loading ${filename}:`, error);
      return {};
    }
  }

  cleanOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('config-backup-'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          stats: fs.statSync(path.join(this.backupDir, file))
        }))
        .sort((a, b) => b.stats.mtime - a.stats.mtime);
      
      // Mantener solo los últimos 10 backups
      if (files.length > 10) {
        const toDelete = files.slice(10);
        toDelete.forEach(file => {
          fs.unlinkSync(file.path);
        });
      }
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  listBackups() {
    try {
      const files = fs.readdirSync(this.backupDir)
        .filter(file => file.startsWith('config-backup-'))
        .map(file => {
          const filePath = path.join(this.backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        })
        .sort((a, b) => b.modified - a.modified);
      
      return files;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  restoreBackup(backupName) {
    try {
      const backupPath = path.join(this.backupDir, backupName);
      
      if (!fs.existsSync(backupPath)) {
        throw new Error('Backup not found');
      }
      
      const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
      
      // Restaurar configuraciones
      if (backup.make) {
        fs.writeFileSync(
          path.join(this.configDir, 'agents.json'),
          JSON.stringify(backup.make, null, 2)
        );
      }
      
      if (backup.n8n) {
        fs.writeFileSync(
          path.join(this.configDir, 'n8n-agents.json'),
          JSON.stringify(backup.n8n, null, 2)
        );
      }
      
      if (backup.chatgpt) {
        fs.writeFileSync(
          path.join(this.configDir, 'chatgpt-agents.json'),
          JSON.stringify(backup.chatgpt, null, 2)
        );
      }
      
      return {
        success: true,
        restored: backupName,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

const backupService = new ProviderBackupService();

// Endpoint para crear backup manual
router.post('/backup', (req, res) => {
  const result = backupService.createBackup();
  res.json(result);
});

// Endpoint para listar backups
router.get('/backups', (req, res) => {
  const backups = backupService.listBackups();
  res.json({
    backups,
    count: backups.length,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para restaurar backup
router.post('/backup/restore', (req, res) => {
  const { backupName } = req.body;
  
  if (!backupName) {
    return res.status(400).json({
      error: 'Backup name required',
      timestamp: new Date().toISOString()
    });
  }
  
  const result = backupService.restoreBackup(backupName);
  res.json(result);
});

// Endpoint para obtener información de backup
router.get('/backup/info', (req, res) => {
  const backups = backupService.listBackups();
  const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);
  
  res.json({
    totalBackups: backups.length,
    totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    autoBackupEnabled: true,
    backupInterval: '6 hours',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
