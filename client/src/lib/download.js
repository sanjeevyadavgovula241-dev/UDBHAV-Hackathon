function escapeCell(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
  downloadBlob(filename, new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }));
}

export function downloadText(filename, content, type = "text/markdown;charset=utf-8") {
  downloadBlob(filename, new Blob([content], { type }));
}
