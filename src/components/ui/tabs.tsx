"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Tabs({ tabs }: { tabs: { key: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.key);

  return (
    <div>
      <div className="flex flex-wrap gap-1 border-b border-nexo-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              active === tab.key
                ? "border-nexo-lime-dark text-nexo-text"
                : "border-transparent text-nexo-text-secondary hover:text-nexo-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.key} className={active === tab.key ? "mt-6" : "hidden"}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
