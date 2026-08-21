import { uploadService } from "@/lib/services/upload-service";
import { handle, json } from "@/lib/api/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id } = await params;
    return json(await uploadService.listForApplication(id));
  });
}
