import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, it, vi } from "vitest";

/**
 * The exported rules data and the conformance vectors are current.
 *
 * `pnpm intake:export` writes them (UPDATE_CONFORMANCE=1); this test, in every
 * other run, fails when what is committed is not what packages/core now says —
 * so a rule cannot change here without the backend's copy of its data, and the
 * vectors the backend is held to, changing with it in the same commit.
 */

const DATA = fileURLToPath(
  new URL("../../../../apps/api/app/rules/generated/intake.json", import.meta.url),
);
const VECTORS = fileURLToPath(new URL("../../conformance/vectors.json", import.meta.url));

beforeAll(async () => {
  const { NOW } = await import("./vectors");
  vi.useFakeTimers({ now: new Date(NOW), toFake: ["Date"] });
});
afterAll(() => {
  vi.useRealTimers();
});

const render = (value: unknown) => `${JSON.stringify(value, null, 1)}\n`;

it("导出的规则数据和一致性测试数据是最新的", async () => {
  const { intakeData } = await import("./export");
  const { NOW, buildVectors } = await import("./vectors");
  const data = render(intakeData());
  // One vector per line: diffable, and a fraction of the size indented.
  const vectors =
    `{"now":${JSON.stringify(NOW)},"vectors":[\n` +
    `${buildVectors((t) => vi.setSystemTime(new Date(t)))
      .map((v) => JSON.stringify(v))
      .join(",\n")}\n]}\n`;

  if (process.env.UPDATE_CONFORMANCE) {
    writeFileSync(DATA, data);
    writeFileSync(VECTORS, vectors);
    return;
  }

  const stale = [
    readFileSync(DATA, "utf8") !== data ? "apps/api/app/rules/generated/intake.json" : null,
    readFileSync(VECTORS, "utf8") !== vectors ? "packages/core/conformance/vectors.json" : null,
  ].filter(Boolean);
  expect(
    stale,
    `${stale.join(" 和 ")} 不是最新的：问卷或规则改了，后端用的副本还没更新。\n` +
      "请运行 pnpm check:intake（它会先重新生成这两个文件），然后把它们一起提交。",
  ).toEqual([]);
});
