#!/usr/bin/env bash
# Run a command inside apps/api/.venv, or say how to create it.
#
# turbo and pnpm call this for apps/api's lint, typecheck and test, so a
# missing environment has to read as an instruction rather than as
# "command not found".
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -x .venv/bin/python ]; then
  echo "apps/api: no Python environment yet. Run: pnpm --filter @visa-master/api venv" >&2
  echo "          (needs uv and Python 3.12 — https://docs.astral.sh/uv/)" >&2
  exit 1
fi
export PATH="$PWD/.venv/bin:$PATH"
exec "$@"
