import { Card } from "@/components/ui/card";

/**
 * Placeholder page, replaced by the locale-prefixed landing page in the next
 * commit. It renders one token-driven surface so the design-system layer is
 * exercised by the build, and carries no copy of its own.
 */
export default function Page() {
  return (
    <main className="vm-container" style={{ paddingBlock: "var(--space-12)" }}>
      <Card>
        <div style={{ blockSize: "var(--space-16)" }} />
      </Card>
    </main>
  );
}
