import { notFound } from "next/navigation";

/**
 * Anything under a valid locale that matches no route.
 *
 * Without this, an unknown path falls through to the root 404, which has no
 * locale and would answer a Chinese reader in English.
 */
export default function CatchAllPage() {
  notFound();
}
