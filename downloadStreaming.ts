import { Destination } from "./types.ts";
import { writableStreamFromWriter } from "https://deno.land/std@0.134.0/streams/mod.ts";
import { ensureDir } from "https://deno.land/std@0.134.0/fs/ensure_dir.ts";
import { join } from "https://deno.land/std@0.134.0/path/mod.ts";

/**
 * Downloads a file by streaming chunks of it directly into a file instead of buffering it first.
 * This allows downloading big files (>4GB), which is not posible because TypedArray (the base for UInt8Array)
 * is likely limited to 2^32 bytes as in most runtimes.
 * (see this Stackoverflow Thread: https://stackoverflow.com/questions/61945050/how-can-i-download-big-files-in-deno)
 */
export async function downloadStreaming(
  url: string | URL,
  destination?: Destination,
  options?: RequestInit,
) {
  /**
   * validate and prepare destination dir
   */
  let destDir = destination?.dir ??
    await Deno.makeTempDir({ prefix: "deno_dwld" });
  destDir = destDir.replace(/\/$/, "");
  await ensureDir(destDir);

  /**
   * start file download stream
   */

  const fileResponse = await fetch(url, options);
  if (fileResponse.status != 200) {
    throw new Deno.errors.Http(
      `status ${fileResponse.status}-'${fileResponse.statusText}' received instead of 200`,
    );
  }

  if (!fileResponse.body) {
    throw new Deno.errors.InvalidData(`The download response has no body!`);
  }

  /**
   * Prepare output file
   */
  const finalUrl = fileResponse.url.replace(/\/$/, "");
  const filename = destination?.file ??
    finalUrl.substring(finalUrl.lastIndexOf("/") + 1);
  const fullPath = join(destDir, filename);
  const mode = (destination?.mode) ? { mode: destination.mode } : {};

  /**
   * Open output file for streaming response body into it
   */
  const file = await Deno.open(fullPath, {
    write: true,
    create: true,
    ...mode,
  });

  const writableStream = writableStreamFromWriter(file);
  await fileResponse.body.pipeTo(writableStream);

  const fileStats = await file.stat();
  const size = fileStats.size;
  return { file, destDir, fullPath, size };
}
