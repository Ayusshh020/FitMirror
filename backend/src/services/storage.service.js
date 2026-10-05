const path = require('path');
const fs = require('fs');

/**
 * Storage Service Abstraction
 * Handles local disk storage for uploaded garment and user images.
 */
class StorageService {
  /**
   * Process and get public relative URL for an uploaded file
   * @param {Object} file - Multer file object
   * @returns {Promise<string>} Relative accessible URL e.g. /uploads/filename.png
   */
  async uploadFile(file) {
    if (!file) return null;

    // Multer saves file to backend/uploads. Format accessible relative URL.
    return `/uploads/${file.filename}`;
  }

  /**
   * Delete file from local storage
   * @param {string} fileUrl - Relative URL e.g. /uploads/filename.png
   */
  async deleteFile(fileUrl) {
    if (!fileUrl) return;

    try {
      if (fileUrl.startsWith('/uploads/')) {
        const filename = path.basename(fileUrl);
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (err) {
      console.error('[StorageService] Error deleting file:', err.message);
    }
  }
}

module.exports = new StorageService();
