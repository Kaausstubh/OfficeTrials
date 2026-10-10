import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config';

export interface StorageResult {
  storagePath: string;
  checksumSha256: string;
  fileSize: number;
}

export class StorageService {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), config.STORAGE_LOCAL_DIR);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Save a file buffer to storage, computing its SHA-256 checksum
   */
  async saveFile(
    caseId: string,
    originalFilename: string,
    buffer: Buffer
  ): Promise<StorageResult> {
    const caseDir = path.join(this.baseDir, caseId);
    if (!fs.existsSync(caseDir)) {
      fs.mkdirSync(caseDir, { recursive: true });
    }

    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(originalFilename) || '.bin';
    const uniqueName = `${Date.now()}_${checksum.slice(0, 12)}${ext}`;
    const destination = path.join(caseDir, uniqueName);

    await fs.promises.writeFile(destination, buffer);

    const relativePath = path.join(caseId, uniqueName);
    return {
      storagePath: relativePath,
      checksumSha256: checksum,
      fileSize: buffer.length,
    };
  }

  /**
   * Retrieve file as Buffer
   */
  async getFile(storagePath: string): Promise<Buffer> {
    const fullPath = this.resolvePath(storagePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found in storage.');
    }
    return await fs.promises.readFile(fullPath);
  }

  /**
   * Delete file
   */
  async deleteFile(storagePath: string): Promise<void> {
    const fullPath = this.resolvePath(storagePath);
    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  /**
   * Resolve and sanitize path to prevent path traversal
   */
  resolvePath(storagePath: string): string {
    const safePath = path.normalize(storagePath).replace(/^(\.\.(\/|\\|$))+/, '');
    const resolved = path.join(this.baseDir, safePath);
    if (!resolved.startsWith(this.baseDir)) {
      throw new Error('Path traversal attempt detected.');
    }
    return resolved;
  }
}

export const storageService = new StorageService();
