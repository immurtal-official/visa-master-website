import { authService } from "@/lib/services/auth-service";
import { body, handle, noContent } from "@/lib/api/http";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    await authService.verifyOtp(await body(request));
    return noContent();
  });
}
