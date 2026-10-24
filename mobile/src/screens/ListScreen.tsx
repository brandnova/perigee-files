import { Clock, Pin, SlidersHorizontal } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useActions } from '../actions';
import { FileListRow, ROW_HEIGHT, subtitleFor } from '../components/FileRow';
import SelectionBar from '../components/SelectionBar';
import { useSelection } from '../useSelection';
import { hasFileFilters, listPinned, listRecent, type FileRow } from '../db/queries';
import { DEFAULT_FILTERS, activeCount, describe } from '../filters';
import { useSession } from '../session';
import { EmptyState, IconButton, SkeletonRows, Text, radius, useTheme, useThemedStyles, type Palette } from '../ui';

interface Props {
  kind: 'recent' | 'pinned';
  onOpenFolder: (path: string) => void;
}

export default function ListScreen({ kind, onOpenFolder }: Props) {
  const session = useSession();
  const { showDetails, togglePin, filters, setFilters, spec, openFilters, downloadMany } = useActions();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const selection = useSelection();

  const [rows, setRows] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const recent = kind === 'recent';
  const activeFilters = recent ? activeCount(filters) : 0;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (recent ? listRecent(spec) : listPinned())
      .then((r) => {
        if (!cancelled) {
          setRows(r);
          setLoading(false);
        }
      })
      .catch((e) => {
        console.error('loading the list failed', e);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [recent, spec, session.dataVersion]);

  return (
    <View style={styles.root}>
      {recent && selection.active ? (
        <SelectionBar
          rows={selection.rows}
          onSelectAll={() => selection.addAll(rows)}
          onDownload={() => {
            void downloadMany(selection.rows);
            selection.clear();
          }}
          onClose={selection.clear}
        />
      ) : (
      <View style={styles.header}>
        <View style={styles.titles}>
          <Text variant="title">{recent ? 'Recent files' : 'Pinned folders'}</Text>
          <Text variant="caption" tone="muted">
            {recent ? 'The newest files on your PC' : 'Your favourite folders, one tap away'}
          </Text>
        </View>
        {recent ? (
          <IconButton
            icon={SlidersHorizontal}
            label="Sort and filter"
            badge={activeFilters > 0}
            color={activeFilters > 0 ? colors.primary : colors.muted}
            onPress={openFilters}
          />
        ) : null}
      </View>
      )}

      {activeFilters > 0 ? (
        <View style={styles.filterBar}>
          <Text variant="caption" tone="primary" numberOfLines={1} style={styles.flex}>
            {describe(filters)}
          </Text>
          <Pressable onPress={() => setFilters(DEFAULT_FILTERS)} hitSlop={12} accessibilityRole="button" accessibilityLabel="Clear filters">
            <Text variant="label" tone="primary">
              Clear
            </Text>
          </Pressable>
        </View>
      ) : null}

      {loading && rows.length === 0 ? <SkeletonRows /> : null}

      {!loading && rows.length === 0 ? (
        recent ? (
          <EmptyState
            icon={Clock}
            title={hasFileFilters(spec) ? 'Nothing matches your filters' : 'No files yet'}
            message={hasFileFilters(spec) ? undefined : 'Update your file list from the Home tab.'}
            action={hasFileFilters(spec) ? { title: 'Clear filters', onPress: () => setFilters(DEFAULT_FILTERS) } : undefined}
          />
        ) : (
          <EmptyState
            icon={Pin}
            title="No pinned folders"
            message="Open a folder in Files, tap the three dots and choose Pin. Or press and hold a folder."
          />
        )
      ) : null}

      <FlatList
        style={styles.list}
        data={rows}
        extraData={selection.revision}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => (
          <FileListRow
            item={item}
            {...subtitleFor(item, kind)}
            selecting={recent && selection.active}
            selected={recent && selection.has(item.path)}
            onPress={recent ? (row) => (selection.active ? selection.toggle(row) : showDetails(row)) : (row) => onOpenFolder(row.path)}
            onLongPress={recent ? (row) => selection.toggle(row) : (row) => void togglePin(row.path, row.name)}
            onUnpin={recent ? undefined : (row) => void togglePin(row.path, row.name)}
          />
        )}
        getItemLayout={(_, index) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index })}
        initialNumToRender={20}
        windowSize={10}
      />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1 },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, paddingRight: 12, paddingTop: 12, paddingBottom: 8 },
    titles: { flex: 1, gap: 2 },
    filterBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginHorizontal: 16,
      marginBottom: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: radius.md,
      backgroundColor: c.primarySoft,
    },
    list: { flex: 1 },
  });