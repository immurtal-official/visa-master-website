import { requireUser } from "@/lib/services/auth-service";
import { handle, json } from "@/lib/api/http";

export async function GET(): Promise<Response> {
  return handle(async () => {
    const { userId, email } = await requireUser();
    return json({ userId, email });
  });
}
