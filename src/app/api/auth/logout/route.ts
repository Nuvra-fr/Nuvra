import { destroySession } from '@/lib/auth';
import { jsonOk } from '@/lib/http';

export async function POST(): Promise<Response> {
  await destroySession();
  return jsonOk({});
}
