import type { ApplicationEntry } from "../types";

interface ApplicationLinksProps {
  companyName: string;
  entries?: ApplicationEntry[];
}

const isHttpUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
};

export function ApplicationLinks({ companyName, entries }: ApplicationLinksProps) {
  const validEntries = (entries ?? []).filter((entry) => isHttpUrl(entry.url));

  if (validEntries.length === 0) {
    return <p className="text-sm text-slate-500">投递入口待核验</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {validEntries.map((entry, index) => (
        <a
          key={`${entry.type}-${entry.url}-${index}`}
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`打开${companyName}${entry.label}页面`}
          className="rounded-lg border border-cyan-300/30 bg-cyan-300/5 px-3 py-2 text-xs font-medium text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
        >
          <span>{entry.label}</span>
          {entry.verifiedAt && (
            <span className="ml-2 text-[11px] text-slate-400">核验于 {entry.verifiedAt}</span>
          )}
        </a>
      ))}
    </div>
  );
}
