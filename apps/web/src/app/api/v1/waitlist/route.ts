import { routeService } from "@/lib/services/route-service";
import { body, handle, noContent } from "@/lib/api/http";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    await routeService.joinWaitlist(await body(request));
    return noContent();
  });
}
