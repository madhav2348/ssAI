import * as xlsx from "xlsx";
import type { ScreenshotAnalysis } from "../types/screenshot";

export class XlsxExporter {
  /**
   * Export screenshot analysis records to a real .xlsx Buffer.
   * Returns a Node Buffer that can be streamed or returned in a Response.
   */
  async export(records: ScreenshotAnalysis[]): Promise<Buffer> {
    // define the column order / headers
    const headers = [
      "id",
      "filename",
      "sourceType",
      "sourceRef",
      "storagePath",
      "description",
      "tags",
      "ocrText",
      "sourceName",
      "sourceUrl",
      "categories",
      "labels",
      "processedAt",
    ];

    // map records to plain objects for json_to_sheet
    const rows = records.map((rec) => {
      const metadata = rec.screenshot.metadata ?? {};
      return {
        id: rec.screenshot.id ?? "",
        filename: metadata.originalFileName ?? "",
        sourceType: rec.screenshot.sourceType ?? "",
        sourceRef: rec.screenshot.sourceRef ?? "",
        storagePath: rec.screenshot.storagePath ?? "",
        description: metadata.description ?? "",
        tags: Array.isArray(metadata.tags) ? metadata.tags.join(", ") : "",
        ocrText: rec.ocr?.text ?? "",
        sourceName: rec.source?.sourceName ?? "",
        sourceUrl: rec.source?.sourceUrl ?? "",
        categories: Array.isArray(rec.tagging?.categories)
          ? rec.tagging.categories.join(", ")
          : "",
        labels: Array.isArray(rec.tagging?.labels) ? rec.tagging.labels.join(", ") : "",
        processedAt: rec.processedAt ?? "",
      };
    });

    // create worksheet and workbook
    const worksheet = xlsx.utils.json_to_sheet(rows, { header: headers });
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "screenshots");

    // write workbook to buffer (Node Buffer)
    const buffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" }) as Buffer;
    return buffer;
  }
}
