'use client';

/**
 * Download Button - Download packinglist als TXT bestand
 */

interface DownloadButtonProps {
  categories: Array<{
    id: string;
    name: string;
  }>;
  itemsByCategory: Record<
    string,
    Array<{
      id: string;
      name: string;
      checked: boolean;
      taken_by: string | null;
    }>
  >;
  tripTitle: string;
}

export default function DownloadButton({
  categories,
  itemsByCategory,
  tripTitle,
}: DownloadButtonProps) {
  const handleDownload = () => {
    let content = `PACKINGLIST - ${tripTitle}\n`;
    content += `Gegenereerd op: ${new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}\n`;
    content += `${'='.repeat(60)}\n\n`;

    categories.forEach((category) => {
      const items = itemsByCategory[category.id] || [];
      if (items.length === 0) return;

      content += `[${category.name.toUpperCase()}]\n`;
      content += `${'-'.repeat(60)}\n`;

      items.forEach((item) => {
        const checkmark = item.checked ? '✓' : '○';
        const takenBy = item.taken_by ? ` – Meegenomen door: ${item.taken_by}` : '';
        content += `${checkmark} ${item.name}${takenBy}\n`;
      });

      content += `\n`;
    });

    content += `${'='.repeat(60)}\n`;
    content += `Totaal items: ${Object.values(itemsByCategory).flat().length}\n`;
    content += `Afgevinkt: ${
      Object.values(itemsByCategory)
        .flat()
        .filter((i) => i.checked).length
    }\n`;

    // Create download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `packinglist-${tripTitle.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-800"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Download lijst
    </button>
  );
}
