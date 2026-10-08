# The agent plane

This directory is the untrusted half of the system: the network boundary a job
container runs inside, the proxy that is its only way out, and the compose
files that stand both of them up. The trusted half — `apps/web` and `apps/api`
on Vercel, `apps/conductor`, the database — is described in [CODEBASE.md](../CODEBASE.md);
what is actually deployed is in [STATUS.md](../STATUS.md).

Read [architecture v0.3](../doc/architecture-v0.3-en.md) §4a and §5.2 before
changing anything here. Everything in this directory exists because the thing
that produces a visa pack is an agent that writes and runs its own code, browses
the live web, and does both while holding someone's passport scan.

---

## 1. What is in here

| Path | What it is |
|---|---|
| `compose.local.yml` | The egress boundary on a developer machine: `vm-egress-internal` (`internal: true`, so a container attached only to it has no default route) and a dual-homed Squid aliased `proxy`. |
| `compose.vm.yml` | The same topology on the VM, plus the conductor as a supervised service. **Not deployed anywhere yet.** |
| `squid/squid.conf` | v0.3 §5.2 rules 1–3. The shortest file that explains the security model. |
| `squid/allowlist.txt` | Comments only, deliberately: an empty allowlist means no cleartext write leaves a job at all. |
| `placeholder-job/` | A job container that produces a pack-shaped nothing, so the pipeline can be proven with no model and no provider key in it. |

## 2. Where this work stands

The goal of this work (`feat/agent-plane-local`, merged in PRs #11 and #14) is narrow and worth
stating precisely, because "the agent plane runs" would be a much larger claim
than the one being made:

> Close the loop from a queued job to an artifact in the private bucket, running
> the conductor on a developer laptop against the **hosted** database, with a
> placeholder container doing the work — and write the VM compose file at the
> same time, so moving it later is a relocation rather than a design exercise.

### Built and verified on this machine

- **`placeholder-job/`** — run through the executor's exact container
  invocation (same network, same bind mount, same `HERMES_JOB_DIR`, same
  `--security-opt no-new-privileges`). It reads the staged `input.json` and
  writes `qa-report.json` plus `delivery/`, which is the entire contract
  `apps/conductor/src/executors/docker.ts` has with any image. When the job
  names the applicant's documents, the conductor has already put them in
  `documents/` beside `documents.json` (which file is which checklist item and
  page) before the container starts — downloaded with the conductor's own
  credential, so the container holds none (`apps/conductor/src/documents.ts`).
- **The egress boundary still denies**, checked from a container on
  `vm-egress-internal`: `169.254.169.254` is *Network is unreachable*, a direct
  request gets *bad address* (no external DNS), and `proxy:3128` is reachable.
- **`apps/conductor/Dockerfile`** — builds, starts, and fails with the intended
  `DATABASE_URL is required`; the docker CLI is present, which the executor
  needs because it shells out to `docker run`.
- **`compose.vm.yml`** — passes `docker compose config`.
- **`pnpm --filter @visa-master/conductor test` — 47/47** when this was written; the suite
  is now 61 tests, with document staging and extraction write-back.

### Not done

- **The conductor has never run against the hosted database.** No job has gone
  through this pipeline end to end. Section 3 is how to do that; until someone
  has, this is a set of parts that each work alone.
- **No VM exists.** `compose.vm.yml` has never been applied to a host.
- **`apps/conductor/.env.example` does not mention the placeholder image.** The
  configuration in section 3.2 is documented here and nowhere else, which is the
  wrong place for it; it belongs in that file next to the variables it sets.
- **The LLM gateway is absent**, from both compose files, on purpose — it lands
  with the provider credential. Until then nothing produces a real pack.

---

## 3. Finishing it: the local end-to-end run

Roughly thirty minutes, most of it waiting. Everything below happens on the
laptop; nothing is provisioned and nothing is spent.

### 3.1 Prerequisites

Docker running, and the hosted Supabase project's **database password** — the
one set when the project was created. It is not any of the API keys. If it is
lost, Supabase dashboard → Settings → Database → Reset database password;
resetting it affects nothing else.

### 3.2 Configure the conductor

`apps/conductor/.env.local` (gitignored, never committed):

```
DATABASE_URL=postgresql://postgres.rmsdyqmuztydicfintbs:<db-password>@aws-0-us-west-2.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://rmsdyqmuztydicfintbs.supabase.co
SUPABASE_SECRET_KEY=<the sb_secret_… key>
HERMES_IMAGE=visa-master-placeholder-job:latest
HERMES_JOB_COMMAND=/usr/local/bin/run.sh
HERMES_CPUS=1
HERMES_MEMORY=512m
```

Four things here are easy to get wrong and quiet when you do:

1. **The pooler host, not the direct one.** Supabase's direct database endpoint
   resolves to IPv6 only; `…pooler.supabase.com` is what answers over IPv4. The
   pooler URL is cached, without the password, at
   `packages/db/supabase/.temp/pooler-url`.
2. **Percent-encode the password** if it contains `@ : / ? # &`.
3. **`SUPABASE_URL` and `SUPABASE_SECRET_KEY` are both required for uploads.**
   `index.ts` builds the artifact store only when both are set; with either
   missing it logs one warning, and then every finished pack stays in a scratch
   directory that `destroy()` erases. Jobs still reach `awaiting_review` — with
   nothing to review.
4. **`HERMES_JOB_COMMAND` being set is what selects the real docker executor.**
   Unset, the conductor silently uses the fake one, which produces no container
   and uploads nothing.

The secret key can be fetched rather than copied by hand:

```bash
supabase projects api-keys --project-ref rmsdyqmuztydicfintbs -o json | jq -rj '.[] | select(.api_key | startswith("sb_secret_")) | .api_key'
```

### 3.3 Build the job image and bring up the boundary

```bash
docker build -t visa-master-placeholder-job:latest infra/placeholder-job
docker compose -f infra/compose.local.yml up -d
```

### 3.4 Run the conductor

```bash
pnpm --filter @visa-master/conductor start
```

The first line it prints is the one that matters:

```
conductor: hermes -> docker (visa-master-placeholder-job:latest on vm-egress-internal)
```

If it says `HERMES_JOB_COMMAND unset — using the fake executor`, section 3.2 is
wrong and everything after this will look like it worked.

### 3.5 Put a job in the queue

From a second terminal:

```bash
pnpm --filter @visa-master/conductor enqueue:placeholder
```

This is an operator diagnostic, not a second enqueue path — it needs
`DATABASE_URL`, which no client has. It exists because two of the states worth
trusting cannot be produced from a browser at all: a run that outlives its
deadline, and a retry.

The real end-to-end test is still submitting an application at
`https://app.wdnx.world`; do that too, once the diagnostic path is green. It is
the only thing that also exercises enqueueing.

### 3.6 What to check

| # | Check | How |
|---|---|---|
| 1 | The row moves `queued → leased → running → validating → awaiting_review` | read the `jobs` row; the conductor logs each transition |
| 2 | The artifacts really left the machine | the `artifacts` bucket contains `applications/<job-id>/attempts/<n>/qa-report.json` and the `delivery/` tree — **this is the step the fake executor never exercised**, so it is the one worth looking at with your own eyes |
| 3 | Nothing is left behind | `docker ps -a` shows no `vm-job-*` container, and the scratch directory under `$TMPDIR/visa-master-scratch` is gone — check after a success *and* after a forced failure |
| 4 | The deadline actually kills | `enqueue:placeholder -- --deadline 5`, which is shorter than the container's ten-second sleep: the watchdog should force-destroy and mark the job rather than wait for the process |
| 5 | The boundary still denies | `pnpm --filter @visa-master/conductor test` — `egress.test.ts` asserts each denial against real containers |

### 3.7 Then, and only then

Update [STATUS.md](../STATUS.md). Its staging section currently says the agent
plane is not deployed and a submitted application enqueues a job nothing will
claim. After a green run that is no longer true for the placeholder path — and
the new truth is narrower than "it works": the pipeline is closed, the work
inside is fake, and no pack is produced.

---

## 4. Later: putting it on a VM

`compose.vm.yml` is written and reviewed but has never been applied. When it is:

```bash
scp -r <repo> vm:/opt/visa-master/src
ssh vm 'mkdir -p /opt/visa-master/scratch'
# put /etc/visa-master/conductor.env in place, mode 0600, root-owned
ssh vm 'cd /opt/visa-master/src && docker build -t visa-master-placeholder-job:latest infra/placeholder-job'
ssh vm 'cd /opt/visa-master/src && docker compose -f infra/compose.vm.yml up -d --build'
```

Two things about that file deserve to be read before it runs:

- **`TMPDIR` is load-bearing.** The conductor runs inside a container but calls
  `docker run -v <scratch>:/opt/data/job` against the *host's* daemon, so that
  path is resolved by the host, not by the conductor's filesystem.
  `scratchDirFor()` builds it from `os.tmpdir()`, which is why `TMPDIR` and the
  bind mount must name the same path on both sides. Get it wrong and nothing
  errors: the job container receives an empty directory and the run fails in a
  way that looks like the agent's fault.
- **Nothing publishes a port, and that is the posture.** The VM makes outbound
  connections only — it polls the jobs table and uploads artifacts — so there is
  no inbound surface. Do not add `ports:`.

The machine itself is proposed but not bought, and since 2026-10-08 open again: Hetzner CAX31, 8 vCPU / 16 GB
arm64, ≈ $19/mo, sized so the job container keeps its full 4 vCPU / 8 GB with
headroom for the Docker daemon, Squid and the conductor
([plan v2](../doc/platform-and-dev-plan-v2-en.md) §B.5). Two things have changed
since that was written and are worth re-checking rather than inheriting: the
database is now in `us-west-2` while Hetzner's arm64 machines are, as far as we
know, European only; and Vercel Sandbox — ephemeral microVMs for untrusted code
— did not exist in that comparison. Moving the executor there would hand the
egress-audit model to a vendor, which is an ADR, not a configuration change.

---

## 5. Known gaps, unfixed

Found by review of this branch and deliberately left, so that they are known
rather than discovered:

- **`ubuntu/squid:latest` is unpinned**, in both compose files, on the one
  service that *is* the egress boundary. The claim that local and VM run an
  identical boundary does not survive a floating tag.
- **`docker compose up -d` without `--build` is a silent no-op** for the
  conductor: the service carries both `build:` and `image:`, so a redeploy after
  an `scp` of new source reuses the old image and says nothing.
- **`depends_on: [squid]` orders startup only** — it waits for the container to
  exist, not for Squid to be listening. The containers that actually need the
  proxy are started by the conductor through the host daemon and are outside the
  compose project entirely, so this is closer to documentation than to a
  dependency.
- **No write-completion barrier for `delivery/`**, which is a pre-existing gap
  recorded in STATUS.md, not something this branch introduced: a real agent
  writing into `delivery/` can have its artifact collected mid-write. The
  placeholder avoids it by writing the report last and renaming it into place,
  which is the fix a real producer would also need.
