import { applicationService } from "@/lib/services/application-service";
import { body, handle, json } from "@/lib/api/http";

export async function GET(): Promise<Response> {
  return handle(async () => json({ applications: await applicationService.list() }));
}

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const created = await applicationService.create(await body(request));
    return json({ application: created }, 201);
  });
}
