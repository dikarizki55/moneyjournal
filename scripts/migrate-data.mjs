import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const BACKUP_DIR = path.join(process.cwd(), "scripts", "backups");
const BACKUP_FILE = path.join(
  BACKUP_DIR,
  `migration-backup-${Date.now()}.json`,
);

async function queryAll(table) {
  try {
    return await prisma.$queryRawUnsafe(
      `SELECT * FROM "moneyjournal"."${table}"`,
    );
  } catch (e) {
    console.log(`  Table "${table}" not found or error: ${e.message}`);
    return [];
  }
}

async function backup() {
  console.log("=== Step 1: Backing up existing data ===");

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const users = await queryAll("users");
  const transactions = await queryAll("transaction");
  const paymentSources = await queryAll("payment_source");
  // wallet table may still have old columns (category, default_payment_source_id)
  // if user renamed monthly_outcome → wallet manually
  const wallets = await queryAll("wallet");

  const backup = { users, transactions, paymentSources, wallets };
  fs.writeFileSync(BACKUP_FILE, JSON.stringify(backup, null, 2));
  console.log(`  Backup saved to ${BACKUP_FILE}`);
  console.log(
    `  Users: ${users.length}, Transactions: ${transactions.length}, ` +
    `PaymentSources: ${paymentSources.length}, Wallets: ${wallets.length}`,
  );

  return backup;
}

async function migrate(backup) {
  console.log("\n=== Step 2: Migrating data ===");

  const { transactions, wallets } = backup;

  // --- Create categories from old transaction.category + wallet.category ---
  const userCategoryNames = new Map();
  const userCategoryMap = new Map();

  for (const tx of transactions) {
    if (tx.user_id && tx.category) {
      if (!userCategoryNames.has(tx.user_id)) {
        userCategoryNames.set(tx.user_id, new Set());
      }
      userCategoryNames.get(tx.user_id).add(tx.category);
    }
  }
  for (const w of wallets) {
    if (w.user_id && w.category) {
      if (!userCategoryNames.has(w.user_id)) {
        userCategoryNames.set(w.user_id, new Set());
      }
      userCategoryNames.get(w.user_id).add(w.category);
    }
  }

  for (const [userId, names] of userCategoryNames) {
    const map = new Map();
    for (const name of names) {
      const existing = await prisma.category.findFirst({
        where: { user_id: userId, name, deleted_at: null },
      });
      if (existing) {
        map.set(name, existing.id);
      } else {
        const cat = await prisma.category.create({
          data: { user_id: userId, name, icon: "tag", color: "#6366f1" },
        });
        map.set(name, cat.id);
      }
    }
    userCategoryMap.set(userId, map);
  }
  console.log(`  Categories created for ${userCategoryMap.size} users`);

  // --- Determine a default payment source per user ---
  const userIdDefaultPs = {};
  for (const tx of transactions) {
    if (tx.user_id && !userIdDefaultPs[tx.user_id] && tx.payment_source_id) {
      userIdDefaultPs[tx.user_id] = tx.payment_source_id;
    }
  }
  for (const w of wallets) {
    if (w.user_id && !userIdDefaultPs[w.user_id] && w.default_payment_source_id) {
      userIdDefaultPs[w.user_id] = w.default_payment_source_id;
    }
  }

  for (const tx of transactions) {
    if (tx.user_id && !userIdDefaultPs[tx.user_id]) {
      const ps = await prisma.paymentSource.create({
        data: {
          user_id: tx.user_id,
          name: "Default",
          icon: "wallet",
          default: true,
        },
      });
      userIdDefaultPs[tx.user_id] = ps.id;
    }
  }

  // --- Link wallets to their default payment source ---
  for (const w of wallets) {
    if (w.default_payment_source_id) {
      try {
        await prisma.walletPaymentSource.create({
          data: {
            wallet_id: w.id,
            payment_source_id: w.default_payment_source_id,
          },
        });
      } catch {
        // may already exist
      }
    }
  }
  // Also link all existing payment sources to all wallets for each user
  // so every wallet has at least the user's payment sources available
  for (const w of wallets) {
    const userPs = await prisma.paymentSource.findMany({
      where: { user_id: w.user_id, deleted_at: null },
    });
    for (const ps of userPs) {
      try {
        await prisma.walletPaymentSource.create({
          data: { wallet_id: w.id, payment_source_id: ps.id },
        });
      } catch {
        // already linked
      }
    }
  }

  // --- Migrate transactions ---
  let migratedCount = 0;
  for (const tx of transactions) {
    const categoryMap = userCategoryMap.get(tx.user_id);
    const categoryId = categoryMap?.get(tx.category) || null;

    // After user renamed monthly_outcome → wallet, savingsContainer
    // still references the same UUID, which is now a wallet ID
    const walletId = tx.savingsContainer || null;
    const finalWalletId =
      walletId ||
      (tx.isSavings ? wallets[0]?.id || null : null);

    const psId = tx.payment_source_id || userIdDefaultPs[tx.user_id];

    await prisma.transaction.update({
      where: { id: tx.id },
      data: {
        category_id: categoryId || "",
        wallet_id: finalWalletId,
        payment_source_id: psId || "",
      },
    });
    migratedCount++;
  }
  console.log(`  Transactions migrated: ${migratedCount}`);
  console.log("\n=== Migration complete! ===");
}

async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || "backup";

  if (mode === "backup") {
    await backup();
    console.log(
      "\nNext step: run 'npx prisma db push' to apply the new schema," +
      " then run: node scripts/migrate-data.mjs restore",
    );
  } else if (mode === "restore") {
    const files = fs
      .readdirSync(BACKUP_DIR)
      .filter((f) => f.startsWith("migration-backup-"))
      .sort()
      .reverse();
    if (files.length === 0) {
      console.error("No backup file found. Run 'backup' mode first.");
      process.exit(1);
    }
    const backup = JSON.parse(
      fs.readFileSync(path.join(BACKUP_DIR, files[0]), "utf-8"),
    );
    await migrate(backup);
  } else {
    const data = await backup();
    await migrate(data);
  }

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Migration failed:", e);
  prisma.$disconnect();
  process.exit(1);
});
