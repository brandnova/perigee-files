import { useCallback, useMemo, useState } from 'react';
import type { FileRow } from './db/queries';

export interface Selection {
  active: boolean; // something is selected
  count: number;
  rows: FileRow[];
  revision: object; // changes with every change, so lists know to redraw
  has: (path: string) => boolean;
  toggle: (row: FileRow) => void;
  addAll: (rows: FileRow[]) => void;
  clear: () => void;
}

/** The files and folders the person has picked. Selecting the first one starts selection mode; unselecting the last ends it. */
export function useSelection(): Selection {
  const [chosen, setChosen] = useState<Record<string, FileRow>>({});

  const toggle = useCallback((row: FileRow) => {
    setChosen((cur) => {
      const next = { ...cur };
      if (next[row.path]) delete next[row.path];
      else next[row.path] = row;
      return next;
    });
  }, []);

  const addAll = useCallback((rows: FileRow[]) => {
    setChosen((cur) => {
      const next = { ...cur };
      for (const r of rows) next[r.path] = r;
      return next;
    });
  }, []);

  const clear = useCallback(() => setChosen({}), []);

  return useMemo(() => {
    const rows = Object.values(chosen);
    return { active: rows.length > 0, count: rows.length, rows, revision: chosen, has: (p: string) => p in chosen, toggle, addAll, clear };
  }, [chosen, toggle, addAll, clear]);
}