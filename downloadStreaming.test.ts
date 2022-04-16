import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.134.0/testing/asserts.ts";
import {
  ensureDirSync,
  existsSync,
} from "https://deno.land/std@0.134.0/fs/mod.ts";
import { Destination, DownlodedFile } from "./types.ts";
import { downloadStreaming } from "./downloadStreaming.ts";

// Test files for downloading (esp. big ones) can be found here:
// https://testfiledownload.com/
const url5GB = "http://speedtest-sgp1.digitalocean.com/5gb.test";

Deno.test({
  name: "Download 5 GB File to explicit destination",
  only: true,
  async fn(t): Promise<void> {
    // t = testcontext
    const reqInit: RequestInit = {
      method: "GET",
    };
    ensureDirSync("./playground");
    const destination: Destination = {
      file: "5gb.test",
      dir: "./playground",
      mode: 0o777,
    };
    const fileObj = await downloadStreaming(url5GB, destination, reqInit);

    t.step(`target file available?`, async () => {
      // tests that the file is successfully there
      const fileStats = await Deno.stat(fileObj.fullPath);
      assert(fileStats.isFile);
    });
  },
});

Deno.test({
  name: "Downloaded File Size",
  fn(): void {
    const fileInfo = Deno.lstatSync(fileObj.fullPath);
    assertEquals(fileInfo.size, fileObj.size);
    Deno.removeSync("./test", { recursive: true }); // remove folder in the last test
  },
});

// Deno.FileInfo.mode unstable as of now.
// Deno.test({
//   name: "Check File Permission",
//   fn(): void {
//      assertEquals( 0o777, fileInfo.mode);
//   },
// });
