export const STORAGE_KEY = 'suigo-site-data';
export const AUTH_KEY = 'suigo-admin-auth';

export async function loadSiteData() {
  const preview = new URLSearchParams(location.search).get('preview') === '1';
  const stored = localStorage.getItem(STORAGE_KEY);

  if (preview && stored) {
    try {
      return JSON.parse(stored);
    } catch {
      /* fall through */
    }
  }

  const res = await fetch('/data/site.json');
  if (!res.ok) throw new Error('Failed to load site data');
  return res.json();
}

export function saveSiteData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearPreviewData() {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportSiteData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'site.json';
  a.click();
  URL.revokeObjectURL(url);
}
