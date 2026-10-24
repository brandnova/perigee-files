import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native'; 
import { formatSize } from './format';
import { copyText } from './clipboard';
import DetailsSheet from './components/DetailsSheet';
import DownloadsBar from './components/DownloadsBar';
import DownloadsSheet from './components/DownloadsSheet';
import FilterSheet from './components/FilterSheet';
import UploadSheet from './components/UploadSheet';
import { isPinned, listDescendantFiles, setPinned, type FileRow, type FilterSpec } from './db/queries';
import { enqueueDownload, enqueueMany } from './downloadQueue';
import { DEFAULT_FILTERS, toSpec, type FilterState } from './filters';
import { useToast } from './hooks';
import { fullPcPath } from './pcPaths';
import { Toast } from './ui';

interface Actions {
  showDetails: (row: FileRow) => void;
  togglePin: (path: string, name: string) => Promise<void>;
  copyFolderPath: (path: string) => Promise<void>;
  notify: (message: string) => void;
  filters: FilterState;
  spec: FilterSpec;
  setFilters: (filters: FilterState) => void;
  openFilters: () => void;
  openUpload: () => void;
  download: (row: FileRow) => void; // adds a file to the download queue
  openDownloads: () => void;
  downloadMany: (rows: FileRow[]) => Promise<void>; // files and folders: folders expand to the files inside
}

const ActionsContext = createContext<Actions | null>(null);

export function useActions(): Actions {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error('useActions must be used inside ActionsProvider');
  return actions;
}

const MAX_BATCH = 500;

export function ActionsProvider({ bump, children }: { bump: () => void; children: ReactNode }) {
  const [toast, notify] = useToast();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [downloadsOpen, setDownloadsOpen] = useState(false);
  const [details, setDetails] = useState<{ row: FileRow; pcPath: string | null } | null>(null);
  const spec = useMemo(() => toSpec(filters), [filters]);

  const copy = useCallback(
    async (label: string, text: string) => {
      const ok = await copyText(text);
      notify(ok ? `${label} copied` : "Copy isn't available in this build");
    },
    [notify],
  );

  const copyFolderPath = useCallback(
    async (path: string) => {
      const pc = await fullPcPath(path);
      await copy(pc ? 'PC path' : 'App path', pc ?? path);
    },
    [copy],
  );

  const togglePin = useCallback(
    async (path: string, name: string) => {
      const pinned = await isPinned(path);
      await setPinned(path, !pinned);
      notify(pinned ? `Unpinned ${name}` : `Pinned ${name}`);
      bump();
    },
    [notify, bump],
  );

  const showDetails = useCallback((row: FileRow) => {
    setDetails({ row, pcPath: null });
    void fullPcPath(row.path).then((pcPath) =>
      setDetails((d) => (d && d.row.path === row.path ? { row, pcPath } : d)),
    );
  }, []);

  // The sheet is a separate window, so close it first: the toast shows in the main one.
  const onCopyFromSheet = useCallback(
    (label: string, text: string) => {
      setDetails(null);
      void copy(label, text);
    },
    [copy],
  );

  const download = useCallback(
    (row: FileRow) => {
      const result = enqueueDownload(row);
      notify(result === 'added' ? `Added to downloads: ${row.name}` : `Already in your downloads: ${row.name}`);
    },
    [notify],
  );

  const downloadMany = useCallback(
    async (rows: FileRow[]) => {
      const files: FileRow[] = [];
      const seen = new Set<string>();
      const add = (f: FileRow) => {
        if (!seen.has(f.path)) {
          seen.add(f.path);
          files.push(f);
        }
      };
      for (const r of rows) {
        if (r.isDir) (await listDescendantFiles(r.path, MAX_BATCH + 1)).forEach(add);
        else add(r);
        if (files.length > MAX_BATCH) break;
      }

      if (files.length === 0) {
        notify('There are no files to download in that selection.');
        return;
      }
      if (files.length > MAX_BATCH) {
        Alert.alert('That is a lot of files', `One batch is limited to ${MAX_BATCH} files. Pick a smaller folder, or select fewer files.`);
        return;
      }

      const start = () => {
        const { added, skipped } = enqueueMany(files);
        notify(
          added === 0
            ? 'Those files are already in your downloads.'
            : `Added ${added} ${added === 1 ? 'file' : 'files'} to downloads${skipped ? ` (${skipped} already there)` : ''}`,
        );
      };
      const bytes = files.reduce((n, f) => n + f.size, 0);
      if (files.length > 20 || bytes > 500 * 1024 * 1024) {
        Alert.alert(`Download ${files.length} files?`, `${formatSize(bytes)} in total. They are saved together in Downloads, without their folders.`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Download', onPress: start },
        ]);
      } else {
        start();
      }
    },
    [notify],
  );

  const onDownloadFromSheet = useCallback(
    (row: FileRow) => {
      setDetails(null);
      download(row);
    },
    [download],
  );

  const onShowDownloadsFromSheet = useCallback(() => {
    setDetails(null);
    setDownloadsOpen(true);
  }, []);

  const value = useMemo<Actions>(
    () => ({
      showDetails,
      togglePin,
      copyFolderPath,
      notify,
      filters,
      spec,
      setFilters,
      openFilters: () => setFiltersOpen(true),
      openUpload: () => setUploadOpen(true),
      download,
      downloadMany,
      openDownloads: () => setDownloadsOpen(true),
    }),
    [showDetails, togglePin, copyFolderPath, notify, filters, spec, download, downloadMany],
  );

  return (
    <ActionsContext.Provider value={value}>
      {children}
      <DownloadsBar onPress={() => setDownloadsOpen(true)} />
      <Toast message={toast} />
      <FilterSheet visible={filtersOpen} value={filters} onChange={setFilters} onClose={() => setFiltersOpen(false)} />
      <UploadSheet visible={uploadOpen} onClose={() => setUploadOpen(false)} />
      <DownloadsSheet visible={downloadsOpen} onClose={() => setDownloadsOpen(false)} />
      <DetailsSheet
        row={details?.row ?? null}
        pcPath={details?.pcPath ?? null}
        onCopy={onCopyFromSheet}
        onDownload={onDownloadFromSheet}
        onShowDownloads={onShowDownloadsFromSheet}
        onClose={() => setDetails(null)}
      />
    </ActionsContext.Provider>
  );
}