import { apiUrl } from "../lib/apiBase";

export async function deleteAccountOnServer(accessToken: string): Promise<void> {
  const res = await fetch(apiUrl("/api/account/delete"), {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (res.status === 204) return;

  let message = "Could not delete your account.";
  try {
    const data = (await res.json()) as { error?: string };
    if (typeof data.error === "string" && data.error.length) message = data.error;
  } catch {
    /* ignore */
  }
  throw new Error(message);
}
