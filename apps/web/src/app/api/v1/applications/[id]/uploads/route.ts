import { uploadService } from "@/lib/services/upload-service";
import { body, handle, json } from "@/lib/api/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id } = await params;
    return json(await uploadService.announce(id, await body(request)), 201);
  });
}
