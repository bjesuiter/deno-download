/**
 * Downloads a file by streaming chunks of it directly into a temporary file instead of buffering it first.
 * This allows downloading big files (>4GB), which is not posible because TypedArray (the base for UInt8Array)
 * is likely limited to 2^32 bytes as in most runtimes.
 * (see this Stackoverflow Thread: https://stackoverflow.com/questions/61945050/how-can-i-download-big-files-in-deno)
 */
export async function downloadStreaming() {
}
