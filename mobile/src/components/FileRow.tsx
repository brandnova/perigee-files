import { Check, ChevronRight, PinOff } from 'lucide-react-native';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { FileRow } from '../db/queries';
import { iconFor } from '../fileTypes';
import { formatDate, formatRelative, formatSize } from '../format';
import { Text, useTheme, useThemedStyles, type Palette } from '../ui';

export const ROW_HEIGHT = 64;

export type RowMode = 'browse' | 'search' | 'recent' | 'pinned';

/** The second line under a file's name, depending on where the list is shown. */
export function subtitleFor(row: FileRow, mode: RowMode): { subtitle: string; headEllipsis: boolean } {
  switch (mode) {
    case 'search':
      return { subtitle: row.parent, headEllipsis: true };
    case 'recent':
      return { subtitle: `${formatRelative(row.mtime)} · ${row.parent}`, headEllipsis: false };
    case 'pinned':
      return { subtitle: row.path, headEllipsis: true };
    default:
      // Folders need no caption: the chevron says it all.
      return { subtitle: row.isDir ? '' : `${formatSize(row.size)} · ${formatDate(row.mtime)}`, headEllipsis: false };
  }
}

interface Props {
  item: FileRow;
  subtitle: string;
  headEllipsis?: boolean;
  selecting?: boolean; // a selection is under way: show the check circle
  selected?: boolean;
  onPress: (row: FileRow) => void;
  onLongPress?: (row: FileRow) => void;
  onUnpin?: (row: FileRow) => void;
}

export const FileListRow = memo(function FileListRow({
  item,
  subtitle,
  headEllipsis,
  selecting,
  selected,
  onPress,
  onLongPress,
  onUnpin,
}: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { Icon, color } = iconFor(item.ext, item.isDir, colors);

  const spoken = item.isDir ? `${item.name}, folder` : subtitle ? `${item.name}, ${subtitle}` : item.name;

  return (
    <Pressable
      onPress={() => onPress(item)}
      onLongPress={onLongPress ? () => onLongPress(item) : undefined}
      accessibilityRole="button"
      accessibilityLabel={spoken}
      accessibilityState={selecting ? { selected: Boolean(selected) } : undefined}
      accessibilityHint={selecting ? 'Tap to select or unselect' : onLongPress ? 'Press and hold for more options' : undefined}
      style={({ pressed }) => [styles.row, selected && styles.selected, pressed && styles.pressed]}
    >
      <View style={[styles.iconBox, { backgroundColor: `${color}22` }]} importantForAccessibility="no-hide-descendants">
        <Icon size={22} color={color} />
      </View>
      <View style={styles.text}>
        {/* The row has a fixed height, so text scaling is capped to keep big system fonts from clipping it. */}
        <Text variant="bodyStrong" numberOfLines={1} maxFontSizeMultiplier={1.3}>
          {item.name}
        </Text>
        {subtitle ? (
          <Text
            variant="caption"
            tone="muted"
            numberOfLines={1}
            ellipsizeMode={headEllipsis ? 'head' : 'tail'}
            maxFontSizeMultiplier={1.3}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {selecting ? (
        <View style={[styles.check, selected && styles.checkOn]} importantForAccessibility="no-hide-descendants">
          {selected ? <Check size={14} color="#FFFFFF" /> : null}
        </View>
      ) : onUnpin ? (
        <Pressable onPress={() => onUnpin(item)} hitSlop={14} accessibilityRole="button" accessibilityLabel={`Unpin ${item.name}`}>
          <PinOff size={18} color={colors.muted} />
        </Pressable>
      ) : item.isDir ? (
        <ChevronRight size={18} color={colors.muted} />
      ) : null}
    </Pressable>
  );
});

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      height: ROW_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: c.border,
    },
    selected: { backgroundColor: c.primarySoft },
    pressed: { backgroundColor: c.surfaceAlt },
    iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    text: { flex: 1 },
    check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    checkOn: { backgroundColor: c.primary, borderColor: c.primary },
  });