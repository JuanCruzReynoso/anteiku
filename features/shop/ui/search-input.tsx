"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Buscar productos..." }: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);

  // Sync URL → input on mount (handles browser back/forward)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- legitimate URL sync
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // Debounced URL update
  const updateURL = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      router.push(`/shop?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query !== initialQuery) {
        updateURL(query);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, initialQuery, updateURL]);

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="h-12 bg-muted pl-11 pr-4"
      />
    </div>
  );
}
