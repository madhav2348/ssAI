import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getServerRuntime } from "@/server/runtime";
import { XlsxExporter } from "@/server/exports/xlsxExporter";

/**
 * GET /api/screenshots/[jobId]/export/xlsx
 *
 * Returns a downloadable .xlsx file for the screenshot record with id = jobId.
 */
export async function GET(_req: NextRequest, { params }: { params: { jobId: string } }) {
  const jobId = params.jobId;

  // get runtime (same import pattern used elsewhere in the repo)
  const runtime = await getServerRuntime();

  // repository is exported as `repository` in runtime.ts
  const repoAny = (runtime as any).repository;

  if (!repoAny) {
    return NextResponse.json(
      { error: "Server repository not found in runtime. Inspect src/server/runtime.ts" },
      { status: 500 },
    );
  }

  // Use the repository's findById method which exists on SqliteScreenshotRepository
  let record: any = null;
  if (typeof repoAny.findById === "function") {
    record = await repoAny.findById(jobId);
  } else if (typeof repoAny.getScreenshotById === "function") {
    record = await repoAny.getScreenshotById(jobId);
  } else if (typeof repoAny.findScreenshotById === "function") {
    record = await repoAny.findScreenshotById(jobId);
  } else {
    return NextResponse.json(
      {
        error:
          "Could not find a function to retrieve screenshot records on the server repository. Please inspect src/server/database/SqliteScreenshotRepository.ts and use the correct function name.",
      },
      { status: 500 },
    );
  }

  if (!record) {
    return NextResponse.json({ error: "Screenshot record not found" }, { status: 404 });
  }

  // Export and return xlsx buffer
  const exporter = new XlsxExporter();
  const buffer = await exporter.export([record]);

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="screenshot-${jobId}.xlsx"`,
    },
  });
}
