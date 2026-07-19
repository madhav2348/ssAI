import fs from 'fs';
import Tesseract from 'tesseract.js';
import Database from 'better-sqlite3';

// Use a single database connection (adjust path as needed)
const db = new Database(process.env.DB_PATH || 'database.sqlite');

export class OCRWorker {
  async process(stagingPath: string, screenshotId: string): Promise<void> {
    try {
      const imageBuffer = fs.readFileSync(stagingPath);

      const result = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`[OCRWorker] Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text.trim();
      const confidence = result.data.confidence;

      console.log(`[OCRWorker] Screenshot ${screenshotId} processed.`);
      console.log(`[OCRWorker] Text length: ${text.length} chars, Confidence: ${confidence}%`);

      // Update the database with extracted text
      const updateStmt = db.prepare(`
        UPDATE screenshots
        SET ocr_text = ?, ocr_confidence = ?, status = 'PROCESSED'
        WHERE id = ?
      `);
      const info = updateStmt.run(text, confidence, screenshotId);

      if (info.changes === 0) {
        console.warn(`[OCRWorker] No screenshot found with id ${screenshotId}`);
      }

    } catch (error) {
      console.error(`[OCRWorker] Failed for ${screenshotId}:`, error);

      // Optionally mark as failed in DB
      try {
        const failStmt = db.prepare(`
          UPDATE screenshots 
          SET status = 'FAILED', error_log = ? 
          WHERE id = ?
        `);
        failStmt.run(String(error), screenshotId);
      } catch (dbError) {
        console.error('[OCRWorker] Could not log failure to DB:', dbError);
      }

      throw error; // re-throw for upstream queue handling
    }
  }
}