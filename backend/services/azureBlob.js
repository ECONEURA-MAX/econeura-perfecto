// Servicio de Azure Blob Storage con fallback a local
const path = require('path');
const fs = require('fs');
const { BlobServiceClient } = (() => {
  try { return require('@azure/storage-blob'); } catch { return {}; }
})();
// Logger no usado aquí - los errores se propagan

const containerName = process.env.AZURE_BLOB_CONTAINER || 'econeura-library';
const localDir = path.join(__dirname, '..', 'uploads');

function ensureLocalDir() {
  try { fs.mkdirSync(localDir, { recursive: true }); } catch { /* Error creating dir - ignore */ }
}

function isAzureConfigured() {
  return !!(process.env.AZURE_STORAGE_CONNECTION_STRING && BlobServiceClient && BlobServiceClient.BlobServiceClient);
}

async function uploadBuffer(buffer, storedName, mimeType) {
  if (isAzureConfigured()) {
    const blobServiceClient = BlobServiceClient.BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();
    const blockBlobClient = containerClient.getBlockBlobClient(storedName);
    await blockBlobClient.uploadData(buffer, { blobHTTPHeaders: { blobContentType: mimeType } });
    return { provider: 'azure', path: `${containerName}/${storedName}` };
  }
  ensureLocalDir();
  const target = path.join(localDir, storedName);
  fs.writeFileSync(target, buffer);
  return { provider: 'local', path: target };
}

async function downloadToBuffer(storageProvider, storagePath) {
  if (storageProvider === 'azure' && isAzureConfigured()) {
    const [container, ...rest] = storagePath.split('/');
    const blobName = rest.join('/');
    const blobServiceClient = BlobServiceClient.BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient(container);
    const blobClient = containerClient.getBlobClient(blobName);
    const download = await blobClient.download();
    const chunks = [];
    for await (const chunk of download.readableStreamBody) chunks.push(chunk);
    return Buffer.concat(chunks);
  }
  // local
  return fs.readFileSync(storagePath);
}

module.exports = { uploadBuffer, downloadToBuffer, isAzureConfigured };


