export async function fetchBugStats(tabKey) {
  const res = await fetch(`/api/projects/${tabKey}/bug-stats`);
  const body = await res.json();

  if (!res.ok) {
    const message = body?.error?.message || `Error ${res.status} al consultar ${tabKey}`;
    throw new Error(message);
  }

  return body;
}
