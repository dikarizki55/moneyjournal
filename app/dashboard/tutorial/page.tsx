import { BookOpen, Wallet, Tags, CreditCard, ArrowLeftRight } from "lucide-react";

const concepts = [
  {
    title: "Payment Source",
    icon: CreditCard,
    description: "Where your money actually lives — Cash, Bank Account (BCA, Mandiri), E-Wallet (GoPay, OVO), Credit Card. Every transaction must have a payment source.",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    details: [
      "Required for every transaction (income & outcome)",
      "Can be linked to multiple wallets",
      "Track balance per payment source",
      "Examples: Cash, BCA Account, GoPay, Visa Card",
    ],
  },
  {
    title: "Category",
    icon: Tags,
    description: "What the transaction is for — Food & Drinks, Gasoline, Shopping, Salary, etc. User-defined with custom icon & color.",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    details: [
      "User-defined, fully customizable",
      "Each transaction must have a category",
      "Visual identification with icon & color",
      "Helps organize and filter your spending",
    ],
  },
  {
    title: "Wallet",
    icon: Wallet,
    description: "Optional container for budget tracking. Group your payment sources and set a budget limit.",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950",
    border: "border-purple-200 dark:border-purple-800",
    details: [
      "Completely optional — use only if you want budget tracking",
      "Group related payment sources together",
      "Set a budget limit and track spending",
      "Fund wallet from global money, spend from wallet",
    ],
  },
  {
    title: "Global vs Wallet Money",
    icon: ArrowLeftRight,
    description: "Money without a wallet is 'global'. Fund a wallet to move money from global into a budget container.",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    details: [
      "Global: income/outcome without wallet association",
      "Wallet: money allocated to a specific budget",
      "Fund = move from Global → Wallet",
      "Withdraw = move from Wallet → Global",
      "Spend from wallet = money leaves the system",
    ],
  },
];

export default function TutorialPage() {
  return (
    <div className="p-6 space-y-8 w-full max-w-4xl mx-auto">
      <div className="text-center space-y-4 pb-6 border-b">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2">
          <BookOpen className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">How MoneyJournal Works</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Understand the key concepts to manage your money effectively.
        </p>
      </div>

      <div className="space-y-6">
        {concepts.map((concept) => (
          <div
            key={concept.title}
            className={`${concept.bg} ${concept.border} border rounded-xl p-6 space-y-4`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${concept.color} bg-background/80`}>
                <concept.icon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{concept.title}</h2>
                <p className="text-sm text-muted-foreground">{concept.description}</p>
              </div>
            </div>
            <ul className="space-y-2 ml-2">
              {concept.details.map((detail, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${concept.color} bg-current`} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-muted rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-bold">Quick Example</h2>
        <div className="space-y-3 text-sm">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            You receive salary → create <strong>Income</strong> with payment source <strong>BCA Account</strong>, category <strong>Salary</strong>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            You fund <strong>Monthly Budget</strong> wallet → allocates money from BCA Account into wallet
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            You buy gasoline → create <strong>Outcome</strong> with payment source <strong>Visa Card</strong>, category <strong>Gasoline</strong>, wallet <strong>Monthly Budget</strong>
          </p>
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Result: You know exactly <strong>what</strong> (Gasoline), <strong>how</strong> (Visa Card), and <strong>where from</strong> (Monthly Budget wallet)
          </p>
        </div>
      </div>
    </div>
  );
}
