import { authService } from "@/lib/services/auth-service";
import { body, handle, json } from "@/lib/api/http";

export async function POST(request: Request): Promise<Response> {
  return handle(async () => {
    const { email } = await authService.requestOtp(await body(request));
    return json({ email });
  });
}
