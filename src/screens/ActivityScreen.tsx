import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TransactionRow } from '../components/TransactionRow';
import { ActivityIcon, AgentsIcon, CardsIcon, FilterIcon } from '../components/Icons';
import { request, today, yesterday, type Transaction } from '../data';
import { colors, fonts } from '../theme';

type Props = {
  pending: boolean;
  resolved: Transaction | null;
  onReview: () => void;
  onFilterLongPress: () => void;
};

export function ActivityScreen({ pending, resolved, onReview, onFilterLongPress }: Props) {
  const insets = useSafeAreaInsets();
  const todayRows = resolved ? [resolved, ...today] : today;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 120 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Activity</Text>
          <Pressable
            onLongPress={onFilterLongPress}
            delayLongPress={500}
            style={({ pressed }) => [styles.filter, pressed && { opacity: 0.7 }]}
            accessibilityLabel="Filter"
          >
            <FilterIcon />
          </Pressable>
        </View>

        {pending && (
          <View style={styles.pendingWrap}>
            <View style={styles.pending}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.pendingAmount}>{request.amount}</Text>
                <Text style={styles.pendingMerchant}>{request.merchant}</Text>
              </View>
              <View style={styles.pendingRight}>
                <Text style={styles.eyebrow}>2 MINS AGO</Text>
                <Pressable
                  onPress={onReview}
                  style={({ pressed }) => [styles.review, pressed && { transform: [{ scale: 0.96 }] }]}
                >
                  <Text style={styles.reviewText}>Review</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        <Section label="TODAY" rows={todayRows} />
        <Section label="YESTERDAY" rows={yesterday} />
      </ScrollView>

      <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Tab label="Activity" active icon={<ActivityIcon color={colors.ink} />} />
        <Tab label="Agents" icon={<AgentsIcon color={colors.muted} />} />
        <Tab label="Cards" icon={<CardsIcon color={colors.muted} />} />
      </View>
    </View>
  );
}

function Section({ label, rows }: { label: string; rows: Transaction[] }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.eyebrow, { paddingBottom: 4 }]}>{label}</Text>
      {rows.map((tx) => (
        <TransactionRow key={tx.id} tx={tx} />
      ))}
    </View>
  );
}

function Tab({ label, icon, active }: { label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <View style={styles.tab}>
      {icon}
      <Text
        style={[
          styles.tabLabel,
          active ? { color: colors.ink, fontFamily: fonts.bold } : { color: colors.muted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    color: colors.ink,
    fontFamily: fonts.bold,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -1,
  },
  filter: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingWrap: { paddingHorizontal: 12, paddingVertical: 16 },
  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  pendingAmount: { color: colors.ink, fontFamily: fonts.monoMedium, fontSize: 15, lineHeight: 20 },
  pendingMerchant: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  pendingRight: { alignItems: 'flex-end', gap: 14 },
  review: {
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
    backgroundColor: colors.accent,
  },
  reviewText: { color: colors.bg, fontFamily: fonts.bold, fontSize: 14, lineHeight: 18 },
  eyebrow: {
    color: colors.muted,
    fontFamily: fonts.monoMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.88,
  },
  section: { paddingHorizontal: 20, paddingBottom: 20 },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    backgroundColor: 'rgba(14, 14, 14, 0.92)',
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4 },
  tabLabel: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14 },
});
