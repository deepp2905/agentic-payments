import { StyleSheet, Text, View } from 'react-native';
import type { Transaction } from '../data';
import { colors, fonts } from '../theme';

export function TransactionRow({ tx }: { tx: Transaction }) {
  const inactive = tx.status !== 'paid';
  const struck = tx.status === 'declinedByYou';

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.initial}>{tx.agent[0]}</Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.merchant} numberOfLines={1}>
          {tx.merchant}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {tx.agent} · <Meta tx={tx} />
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          inactive && { color: struck ? colors.struck : colors.dim },
          struck && styles.struck,
        ]}
      >
        {tx.amount}
      </Text>
    </View>
  );
}

function Meta({ tx }: { tx: Transaction }) {
  switch (tx.status) {
    case 'declined':
      return <Text style={{ color: colors.danger }}>Declined</Text>;
    case 'expired':
      return <Text style={{ color: colors.danger }}>Expired</Text>;
    case 'declinedByYou':
      return <Text>Declined by you</Text>;
    case 'paid':
      return (
        <Text>
          Paid
          {tx.detail ? ` · ${tx.detail}` : ''}
          {tx.flag ? (
            <Text>
              {' · '}
              <Text style={{ color: colors.warning }}>{tx.flag}</Text>
            </Text>
          ) : null}
        </Text>
      );
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.avatar,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: colors.ink, fontFamily: fonts.extrabold, fontSize: 14, lineHeight: 18 },
  body: { flex: 1, gap: 2 },
  merchant: { color: colors.ink, fontFamily: fonts.semibold, fontSize: 15, lineHeight: 20 },
  meta: { color: colors.muted, fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  amount: {
    width: 88,
    textAlign: 'right',
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: 15,
    lineHeight: 20,
  },
  struck: { textDecorationLine: 'line-through' },
});
