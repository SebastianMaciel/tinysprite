export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === "undefined") return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function downloadText(text: string, filename: string, mimeType: string): void {
  const blob = new Blob([text], { type: `${mimeType};charset=utf-8` });
  downloadBlob(blob, filename);
}
