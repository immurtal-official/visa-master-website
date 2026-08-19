import { routeService } from "@/lib/services/route-service";
import { body, handle, json } from "@/lib/api/http";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => json(routeService.check(await body(request))));
}
