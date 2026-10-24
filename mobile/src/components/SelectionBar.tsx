import { Download, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import type { FileRow } from '../db/queries';
import { formatSize } from '../format';
import { Button, IconButton, Text, useTheme } from '../ui';

interface Props {
  rows: FileRow[];
  onSelectAll: () => void;
  onDownload: () => void;
  onClose: () => void;
}

/** Takes the place of the search bar while files are selected. */
export default function SelectionBar({ rows, onSelectAll, onDownload, onClose }: Props) {
  const { colors } = useTheme();
  const folders = rows.filter((r) => r.isDir).length;
  const bytes = rows.reduce((n, r) => n + (r.isDir ? 0 : r.size), 0);
  const detail = [bytes > 0 ? formatSize(bytes) : '', folders > 0 ? `${folders} ${folders === 1 ? 'folder' : 'folders'}` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={styles.bar}>
      <IconButton icon={X} label="Cancel selection" color={colors.text} onPress={onClose} />
      <View style={styles.texts} accessibilityLiveRegion="polite">
        <Text variant="bodyStrong">{rows.length} selected</Text>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      <Button title="All" variant="ghost" size="sm" onPress={onSelectAll} />
      <Button title="Download" icon={Download} size="sm" onPress={onDownload} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingTop: 8, minHeight: 60 },
  texts: { flex: 1 },
});