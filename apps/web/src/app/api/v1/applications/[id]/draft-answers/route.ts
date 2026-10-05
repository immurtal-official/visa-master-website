import { intakeService } from "@/lib/services/intake-service";
import { body, handle, noContent } from "@/lib/api/http";

/**
 * Its own path rather than a flag on /answers, because the two have opposite
 * postures: /answers validates and refuses, this one keeps whatever it is
 * given. A mode switch on one endpoint would put "does this reject bad input?"
 * behind a boolean in a request body.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id } = await params;
    await intakeService.saveDraft(id, await body(request));
    return noContent();
  });
}
