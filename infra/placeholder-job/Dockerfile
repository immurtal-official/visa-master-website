# A job container that produces a pack-shaped nothing.
#
# It exists to prove the pipeline without a model in it: the conductor claims a
# real job from the hosted database, starts a real container on the no-route
# network, waits for the real completion signal, uploads to the real bucket and
# destroys the scratch. Only the thinking is missing, which is exactly the
# variable worth removing while the plumbing is new.
#
# busybox because it is a few megabytes and has a shell — the image being small
# is the point; there is nothing to install and nothing to reach out for. The
# container has no default route, so a base image that phoned home on start
# would hang until the deadline rather than fail.
FROM busybox:1.37

COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

# No ENTRYPOINT: the conductor passes the command itself, from
# HERMES_JOB_COMMAND, and having it in one place rather than two is what keeps
# the executor image-agnostic.
