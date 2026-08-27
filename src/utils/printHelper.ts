/**
 * Utility helper for printing clean, isolated HTML documents (Reports, Invoices, Opname sheets)
 * without parent application artifacts, headers, or sidebar clutter.
 */

export const printElement = (element: HTMLElement | null, documentTitle: string = 'Laporan ADDA RASA KJD') => {
  if (!element) {
    window.print();
    return;
  }

  // Create an isolated hidden iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.title = 'Print Frame';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Build clean HTML with all necessary print styling
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${documentTitle}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 10mm 15mm 10mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #1a1b22;
          background-color: #ffffff;
          font-size: 12px;
          line-height: 1.4;
        }
        .font-mono {
          font-family: 'JetBrains Mono', monospace;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 6px 8px;
        }
        tr {
          page-break-inside: avoid;
        }
        .no-print {
          display: none !important;
        }
        /* Color helpers */
        .text-primary { color: #00288e; }
        .text-success { color: #006c49; }
        .text-danger { color: #ba1a1a; }
        .text-warning { color: #4c2e00; }
        .text-muted { color: #757684; }
        .bg-light { background-color: #f4f2fc; }
        .bg-primary-light { background-color: #dde1ff; }
        .border-primary { border-color: #00288e; }
      </style>
    </head>
    <body>
      ${element.innerHTML}
    </body>
    </html>
  `);
  doc.close();

  // Wait for images and styling to load before triggering print
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print fallback to window.print', e);
      window.print();
    } finally {
      // Clean up iframe after printing dialog closes
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 400);
};

export const downloadDocumentAsHtml = (
  contentHtml: string,
  fileName: string = 'Laporan_ADDA_RASA.html',
  documentTitle: string = 'Laporan Resmi ADDA RASA KJD'
) => {
  const fullHtml = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${documentTitle}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 10mm 15mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 24px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1b22;
      background-color: #f8fafc;
      font-size: 12px;
      line-height: 1.4;
    }
    .page-container {
      max-width: 900px;
      margin: 0 auto;
      background: #ffffff;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .print-button-bar {
      max-width: 900px;
      margin: 0 auto 16px auto;
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: none;
    }
    .btn-print {
      background: #00288e;
      color: #ffffff;
    }
    @media print {
      body {
        padding: 0;
        background: #ffffff;
      }
      .page-container {
        box-shadow: none;
        padding: 0;
        border-radius: 0;
        max-width: 100%;
      }
      .print-button-bar {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-button-bar">
    <button class="btn btn-print" onclick="window.print()">🖨️ Cetak / Simpan ke PDF</button>
  </div>
  <div class="page-container">
    ${contentHtml}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
