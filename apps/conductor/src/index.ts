/**
 * The workflow engine — the control plane's long-running half.
 *
 * It will lease jobs from Postgres with FOR UPDATE SKIP LOCKED, route each to
 * an executor, own the container lifecycle, watch for the completion artifact
 * rather than for process exit, and enforce the wall-clock deadline. It runs on
 * the agent VM because it needs the Docker socket, a filesystem watch, and
 * timers that outlive any serverless invocation.
 *
 * The package exists now so the workspace shape is real and typechecked from
 * the start. See doc/platform-and-dev-plan-en.md Part III §2, week 3.
 */
function main(): void {
  console.log("conductor: not implemented — arrives in week 3");
}

main();
