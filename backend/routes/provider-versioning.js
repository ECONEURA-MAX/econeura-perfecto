const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Sistema de versionado de configuraciones
class ProviderVersioningService {
  constructor() {
    this.versionsDir = path.join(__dirname, '../versions');
    this.configDir = path.join(__dirname, '../config');
    this.ensureVersionsDirectory();
  }

  ensureVersionsDirectory() {
    if (!fs.existsSync(this.versionsDir)) {
      fs.mkdirSync(this.versionsDir, { recursive: true });
    }
  }

  createVersion(description = '') {
    try {
      const timestamp = new Date().toISOString();
      const versionId = `v${Date.now()}`;
      
      const configs = {
        make: this.loadConfig('agents.json'),
        n8n: this.loadConfig('n8n-agents.json'),
        chatgpt: this.loadConfig('chatgpt-agents.json')
      };
      
      const version = {
        id: versionId,
        description,
        timestamp,
        configs,
        author: 'system',
        changes: this.detectChanges(configs)
      };
      
      const versionPath = path.join(this.versionsDir, `${versionId}.json`);
      fs.writeFileSync(versionPath, JSON.stringify(version, null, 2));
      
      // Actualizar índice de versiones
      this.updateVersionIndex(version);
      
      return {
        success: true,
        version,
        timestamp
      };
      
    } catch (error) {
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
      return {};
    }
  }

  detectChanges(configs) {
    // Detectar cambios básicos
    const changes = [];
    
    Object.entries(configs).forEach(([provider, config]) => {
      const agentCount = Object.keys(config).length;
      changes.push(`${provider}: ${agentCount} agents`);
    });
    
    return changes;
  }

  updateVersionIndex(version) {
    const indexPath = path.join(this.versionsDir, 'index.json');
    let index = [];
    
    if (fs.existsSync(indexPath)) {
      index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    }
    
    index.unshift({
      id: version.id,
      description: version.description,
      timestamp: version.timestamp,
      author: version.author
    });
    
    // Mantener solo las últimas 50 versiones
    if (index.length > 50) {
      index = index.slice(0, 50);
    }
    
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }

  listVersions() {
    try {
      const indexPath = path.join(this.versionsDir, 'index.json');
      
      if (!fs.existsSync(indexPath)) {
        return [];
      }
      
      return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    } catch (error) {
      console.error('Error listing versions:', error);
      return [];
    }
  }

  getVersion(versionId) {
    try {
      const versionPath = path.join(this.versionsDir, `${versionId}.json`);
      
      if (!fs.existsSync(versionPath)) {
        throw new Error('Version not found');
      }
      
      return JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    } catch (error) {
      throw new Error(`Error loading version: ${error.message}`);
    }
  }

  restoreVersion(versionId) {
    try {
      const version = this.getVersion(versionId);
      
      // Restaurar configuraciones
      Object.entries(version.configs).forEach(([provider, config]) => {
        const filename = provider === 'make' ? 'agents.json' : 
                        provider === 'n8n' ? 'n8n-agents.json' : 
                        'chatgpt-agents.json';
        
        const configPath = path.join(this.configDir, filename);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      });
      
      return {
        success: true,
        versionId,
        restored: version.timestamp,
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

  compareVersions(versionId1, versionId2) {
    try {
      const version1 = this.getVersion(versionId1);
      const version2 = this.getVersion(versionId2);
      
      const differences = [];
      
      Object.keys(version1.configs).forEach(provider => {
        const config1 = version1.configs[provider];
        const config2 = version2.configs[provider] || {};
        
        const agents1 = Object.keys(config1);
        const agents2 = Object.keys(config2);
        
        const added = agents2.filter(agent => !agents1.includes(agent));
        const removed = agents1.filter(agent => !agents2.includes(agent));
        const modified = agents1.filter(agent => 
          agents2.includes(agent) && 
          JSON.stringify(config1[agent]) !== JSON.stringify(config2[agent])
        );
        
        if (added.length > 0 || removed.length > 0 || modified.length > 0) {
          differences.push({
            provider,
            added,
            removed,
            modified
          });
        }
      });
      
      return {
        version1: versionId1,
        version2: versionId2,
        differences,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

const versioningService = new ProviderVersioningService();

// Endpoint para crear nueva versión
router.post('/version', (req, res) => {
  const { description } = req.body;
  const result = versioningService.createVersion(description);
  res.json(result);
});

// Endpoint para listar versiones
router.get('/versions', (req, res) => {
  const versions = versioningService.listVersions();
  res.json({
    versions,
    count: versions.length,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para obtener versión específica
router.get('/version/:id', (req, res) => {
  try {
    const { id } = req.params;
    const version = versioningService.getVersion(id);
    res.json(version);
  } catch (error) {
    res.status(404).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Endpoint para restaurar versión
router.post('/version/:id/restore', (req, res) => {
  const { id } = req.params;
  const result = versioningService.restoreVersion(id);
  res.json(result);
});

// Endpoint para comparar versiones
router.get('/version/compare/:id1/:id2', (req, res) => {
  const { id1, id2 } = req.params;
  const result = versioningService.compareVersions(id1, id2);
  res.json(result);
});

module.exports = router;
