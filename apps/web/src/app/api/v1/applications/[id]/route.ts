import { applicationService } from "@/lib/services/application-service";
import { handle, json } from "@/lib/api/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id } = await params;
    return json(await applicationService.get(id));
  });
}
