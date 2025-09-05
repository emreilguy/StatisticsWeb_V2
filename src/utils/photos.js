// src/utils/photos.js
export function buildPhotoKeyCandidates(row, effectiveCenterId) {
  const raw = row.photoKey || row.photo || "";
  const justFile = raw.split("___").pop().split("/").pop();
  return [`${effectiveCenterId}___${justFile}`, justFile];
}

export async function resolvePhotoUrl(getPhotoFn, candidates) {
  for (const key of candidates) {
    try {
      const url = await getPhotoFn(key);
      if (url) return { url, key };
    } catch (_) {}
  }
  throw new Error("No valid photo key found");
}
