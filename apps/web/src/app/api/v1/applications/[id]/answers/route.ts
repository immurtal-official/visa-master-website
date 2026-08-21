import { intakeService } from "@/lib/services/intake-service";
import { body, handle, json } from "@/lib/api/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handle(async () => {
    const { id } = await params;
    return json(await intakeService.saveAnswer(id, await body(request)));
  });
}
