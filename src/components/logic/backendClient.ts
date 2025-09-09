export type CreateCallResponse = {
  token: string;
  call_id: string;
};

export async function createCall(userId = "USR004", avatarId?: number): Promise<CreateCallResponse> {
  const rawBase = process.env.NEXT_PUBLIC_BACKEND_API_URL || "";
  const base = rawBase.trim().replace(/\/$/, "");
  if (!base) throw new Error("NEXT_PUBLIC_BACKEND_API_URL no configurada");

  const url = new URL(`${base}/call/${userId}`);
  if (typeof avatarId === "number") {
    url.searchParams.set("avatar_id", String(avatarId));
  }

  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Fallo al crear la llamada (${res.status}): ${text}`);
  }
  const data = await res.json().catch(() => ({}));

  const token = data?.token as string | undefined;
  const call_id = data?.call_id as string | undefined;
  if (!token || !call_id) {
    throw new Error("Respuesta de backend inválida: faltan token o call_id");
  }
  return { token, call_id };
}
