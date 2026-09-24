async function fetchJson(url, what) {
  const res = await fetch(url);
  const body = await res.json();

  if (!res.ok) {
    const message = body?.error?.message || `Error ${res.status} al consultar ${what}`;
    throw new Error(message);
  }

  return body;
}

export function fetchBugStats(tabKey) {
  return fetchJson(`/api/projects/${tabKey}/bug-stats`, tabKey);
}

export function fetchPlanning(tabKey) {
  return fetchJson(`/api/projects/${tabKey}/planning`, `la planificación de ${tabKey}`);
}
