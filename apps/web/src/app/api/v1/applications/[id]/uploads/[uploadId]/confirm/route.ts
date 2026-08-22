import { uploadService } from "@/lib/services/upload-service";
import { handle, noContent } from "@/lib/api/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; uploadId: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id, uploadId } = await params;
    await uploadService.confirm(id, uploadId);
    return noContent();
  });
}
