export type TransactionType = "income" | "outcome";

export type TransactionItem = {
  id: string;
  title: string;
  amount: number;
  notes: string | null;
  type: TransactionType;
  date: string;
  created_at: string | null;
  transferPairId: string | null;
  payment_source_id: string | null;
  category_id: string | null;
  wallet_id: string | null;
  category: { id: string; name: string; icon: string | null; color: string | null } | null;
  paymentSource: { id: string; name: string; icon: string | null } | null;
  wallet: { id: string; title: string; icon: string | null } | null;
};

export type CategoryItem = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
};

export type PaymentSourceItem = {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  default?: boolean;
  wallets?: { id: string; title: string; icon: string | null }[];
};

export type WalletItem = {
  id: string;
  title: string;
  icon: string | null;
  color: string | null;
  amount: number;
  balance: number;
  spent: number;
  thisMonthFunded: number;
  thisMonthSpent: number;
  totalFunded: number;
  totalSpent: number;
  paymentSources: { id: string | null; name: string; icon: string | null; amount: number }[];
};

export type SummaryItem = {
  type: TransactionType;
  _sum: { amount: number | null };
};
