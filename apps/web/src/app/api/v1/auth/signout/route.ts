import { authService } from "@/lib/services/auth-service";
import { handle, noContent } from "@/lib/api/http";

export async function POST(): Promise<Response> {
  return handle(async () => {
    await authService.signOut();
    return noContent();
  });
}
