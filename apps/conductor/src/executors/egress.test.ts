import { execFileSync } from "node:child_process";
import { beforeAll, describe, expect, it } from "vitest";
import { join } from "node:path";

/**
 * The egress boundary, asserted from inside it.
 *
 * These run a throwaway container on the internal network and ask the proxy
 * for things the rules forbid. Every assertion here is a denial, because the
 * denials are the security property and they are deterministic; the allow
 * path (a permitted GET reaching the internet) is exercised implicitly by
 * every future real run and deliberately not asserted against a third-party
 * host in a test.
 *
 * v0.3 §5.2: (1) never to private or link-local space, (2) web ports only,
 * (3) POST only to allowlisted hosts — and the allowlist ships empty until
 * the gateway exists, so no POST leaves a job at all.
 */
const NETWORK = "vm-egress-internal";
const CURL = "curlimages/curl:latest";
const COMPOSE = join(__dirname, "../../../../infra/compose.local.yml");

function viaProxy(args: string[]): string {
  return execFileSync("docker", [
    "run",
    "--rm",
    "--network",
    NETWORK,
    CURL,
    "-s",
    "-x",
    "http://proxy:3128",
    "-o",
    "/dev/null",
    "-w",
    "%{http_code}",
    "--max-time",
    "10",
    ...args,
  ]).toString();
}

beforeAll(() => {
  // The proxy is part of the topology under test; bring it up if it is not.
  execFileSync("docker", ["compose", "-f", COMPOSE, "up", "-d", "--wait"], { stdio: "ignore" });
}, 120_000);

describe("the squid rules, from the job network", () => {
  it("denies the cloud metadata address", () => {
    expect(viaProxy(["http://169.254.169.254/"])).toBe("403");
  });

  it("denies private address space", () => {
    expect(viaProxy(["http://10.0.0.1/"])).toBe("403");
    expect(viaProxy(["http://192.168.1.1/"])).toBe("403");
  });

  it("denies ports that are not the web", () => {
    expect(viaProxy(["http://example.com:8080/"])).toBe("403");
  });

  it("denies POST to a host nobody allowlisted — the prompt-injection tripwire", () => {
    expect(viaProxy(["-X", "POST", "-d", "exfil=1", "http://example.com/"])).toBe("403");
    expect(viaProxy(["-X", "PUT", "-d", "exfil=1", "http://example.com/"])).toBe("403");
  });

  it("has no route at all without the proxy", () => {
    // Success here would be the failure: a zero exit means the internal
    // network leaked a gateway. curl exits 6/7/28 (resolve/connect/timeout),
    // docker run propagates it, execFileSync throws with that status.
    let status = 0;
    try {
      execFileSync(
        "docker",
        ["run", "--rm", "--network", NETWORK, CURL, "-s", "--max-time", "5", "http://example.com/"],
        { stdio: "ignore" },
      );
    } catch (error) {
      status = (error as { status?: number }).status ?? -1;
    }
    expect([6, 7, 28]).toContain(status);
  });
});
