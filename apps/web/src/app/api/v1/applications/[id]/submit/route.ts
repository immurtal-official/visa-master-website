import { submissionService } from "@/lib/services/submission-service";
import { handle, noContent } from "@/lib/api/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id } = await params;
    await submissionService.submit(id);
    return noContent();
  });
}
