#!/bin/sh
# One job, faked.
#
# The contract with the conductor is small enough to state in full: the scratch
# directory is mounted at $HERMES_JOB_DIR, the sanitized input is already at
# input.json inside it, and the run is complete when qa-report.json AND
# delivery/ both exist there. Nothing else about this container is observed —
# not its exit code, not its logs — which is why the real pack producer can end
# by starting a foreground server and still be judged correctly.
#
# Everything below writes into that directory and nothing reaches the network,
# because this container has no route to one.
set -eu

JOB_DIR="${HERMES_JOB_DIR:-/opt/data/job}"

# Long enough that the conductor's poll loop sees `running` at least once, and
# short enough that a person watching does not lose interest. A run that
# completed before the first poll would leave the running state untested.
SLEEP_SECONDS="${PLACEHOLDER_SLEEP_SECONDS:-10}"

echo "placeholder-job: job dir $JOB_DIR"
if [ -f "$JOB_DIR/input.json" ]; then
  echo "placeholder-job: input staged, $(wc -c < "$JOB_DIR/input.json") bytes"
else
  # Not fatal: the point of this container is to exercise the pipeline, and a
  # missing input is a finding to read in the log rather than a reason to stop
  # before the artifact that the finding would be attached to.
  echo "placeholder-job: WARNING no input.json in $JOB_DIR"
fi
if [ -f "$JOB_DIR/documents.json" ]; then
  echo "placeholder-job: $(ls "$JOB_DIR/documents" | wc -l) document file(s) staged"
fi

sleep "$SLEEP_SECONDS"

# The delivery tree first, then the report. The conductor treats the pair as
# the completion signal, and it polls: writing the report last means it can
# never observe a report that claims to describe files that are not there yet.
mkdir -p "$JOB_DIR/delivery"

cat > "$JOB_DIR/delivery/README.txt" <<'TXT'
Placeholder delivery.

Produced by infra/placeholder-job to prove that a job travels from the jobs
table, through a container on the no-default-route network, into the private
artifacts bucket. No embassy form, itinerary or letter was generated, and
nothing here is a visa pack.
TXT

cp "$JOB_DIR/input.json" "$JOB_DIR/delivery/input-echo.json" 2>/dev/null ||
  echo '{}' > "$JOB_DIR/delivery/input-echo.json"

# `visual-review-required` rather than `passed`, deliberately: it is the
# ordinary outcome of a real run and the one the week-4 review gate exists for,
# so the pipeline gets exercised on its normal path instead of its happiest one.
# Written to a temporary name and renamed into place. A plain redirect creates
# the file empty and fills it a moment later, and the conductor's poll only
# stats it — so a poll landing in that window (measured here at 1-2 ms, hit in
# roughly 3 of every 4 runs by a tight poller) sees the completion signal,
# reads zero bytes, and records validation_failed for a container that did
# everything right. A same-directory rename is atomic, so the signal is
# all-or-nothing.
cat > "$JOB_DIR/.qa-report.json.tmp" <<'JSON'
{
  "status": "visual-review-required",
  "issues": 0,
  "note": "placeholder-job — pipeline proof, not a pack"
}
JSON
mv "$JOB_DIR/.qa-report.json.tmp" "$JOB_DIR/qa-report.json"

echo "placeholder-job: artifact written"
