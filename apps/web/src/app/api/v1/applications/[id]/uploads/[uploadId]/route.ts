import { uploadService } from "@/lib/services/upload-service";
import { handle, noContent } from "@/lib/api/http";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; uploadId: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id, uploadId } = await params;
    await uploadService.remove(id, uploadId);
    return noContent();
  });
}
