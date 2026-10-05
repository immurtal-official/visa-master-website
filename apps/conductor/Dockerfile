# The conductor, as the VM runs it.
#
# Build from the REPOSITORY ROOT, not from this directory — the conductor is a
# workspace package and its dependency on @visa-master/executors is a
# workspace link:
#
#   docker build -f apps/conductor/Dockerfile -t visa-master-conductor:latest .
#
# Two things about this image are load-bearing and easy to get wrong:
#
# 1. It contains the docker CLI. The executor shells out to `docker run`
#    against the host's daemon over the mounted socket — the conductor is the
#    trusted plane, so having that reach is the design, not a leak.
#
# 2. It runs TypeScript through tsx rather than a build step. The conductor is
#    a long-lived process whose source is the artifact; adding a compile stage
#    would buy startup time this workload does not spend and cost a build to
#    keep in step with `pnpm test`, which also runs the source.
FROM node:22.12-alpine

# docker-cli only — not the daemon. The daemon is the host's, reached over the
# socket the compose file mounts.
RUN apk add --no-cache docker-cli

# pnpm installed directly rather than through corepack: the corepack shipped
# with this Node image carries npm registry signing keys that no longer match,
# so it fails before it can honour package.json's packageManager field. The
# version here must stay in step with that field.
RUN npm install -g pnpm@10.34.5

WORKDIR /app

# The workspace definition first, so an unchanged dependency graph keeps the
# install layer cached across source edits.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml tsconfig.base.json ./
COPY packages/executors/package.json packages/executors/
COPY apps/conductor/package.json apps/conductor/

RUN pnpm install --frozen-lockfile --filter @visa-master/conductor...

COPY packages/executors packages/executors
COPY apps/conductor apps/conductor

# Configuration arrives as environment, from the compose file's env_file. The
# image holds no credential and no default database URL: a conductor that
# started without being told which queue to drain would be a conductor that
# silently drained the wrong one.
#
# `start:container`, not `start`: the local script loads .env.local if it is
# there, and a dotenv file that reached this image would quietly supply every
# variable the real env_file did not. The .dockerignore keeps such a file out
# of the build context; this keeps the process from looking for one at all,
# because two independent reasons it cannot happen is the right number for a
# service-role key.
CMD ["pnpm", "--filter", "@visa-master/conductor", "start:container"]
