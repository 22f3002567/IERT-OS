import { ArrowDownRight, ArrowUpRight, Plus, ReceiptText } from "lucide-react";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- SERVER ACTION: This runs securely on the backend ---
async function addTransaction(formData: FormData) {
  "use server";
  
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const rawAmount = Number(formData.get("amount"));
  const type = formData.get("type") as "income" | "expense";
  
  // Convert to paise to prevent floating point math errors
  // If it's an expense, we store it as a negative number
  const finalAmount = type === "income" ? rawAmount * 100 : -(rawAmount * 100);

  // Physically insert into Supabase
  await db.insert(transactions).values({
    title,
    amount: finalAmount,
    requestedBy: session.user.id,
    status: "completed", // Auto-completing for now, later we add an approval flow
  });

  // Tell Next.js to instantly refresh the page data
  revalidatePath("/dashboard/treasury");
}

export default async function TreasuryPage() {
  // --- SERVER FETCH: Pull real data from Supabase ---
  const dbTransactions = await db.select().from(transactions).orderBy(desc(transactions.timestamp));

  // --- DYNAMIC MATH ---
  const totalBalancePaise = dbTransactions.reduce((acc, txn) => acc + txn.amount, 0);
  const totalIncomePaise = dbTransactions.filter(t => t.amount > 0).reduce((acc, txn) => acc + txn.amount, 0);
  const totalExpensePaise = dbTransactions.filter(t => t.amount < 0).reduce((acc, txn) => acc + txn.amount, 0);

  return (
    <div className="space-y-8 fade-in">
      
      {/* HEADER */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Public Ledger</h1>
          <p className="text-gray-400 mt-1">Immutable financial tracking and transparency.</p>
        </div>
      </header>

      {/* THE TRANSACTION FORM */}
      <div className="bg-white/[0.02] border border-white/10 p-5 rounded-xl">
        <h2 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Plus size={16} /> Record New Transaction</h2>
        <form action={addTransaction} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-gray-400 mb-1 block">Title / Description</label>
            <input required name="title" type="text" placeholder="e.g., Domain Renewal" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
          </div>
          <div className="w-full md:w-32">
            <label className="text-xs text-gray-400 mb-1 block">Amount (₹)</label>
            <input required name="amount" type="number" min="1" placeholder="5000" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30" />
          </div>
          <div className="w-full md:w-40">
            <label className="text-xs text-gray-400 mb-1 block">Type</label>
            <select name="type" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30">
              <option value="income">Income (+)</option>
              <option value="expense">Expense (-)</option>
            </select>
          </div>
          <button type="submit" className="w-full md:w-auto bg-white text-black px-6 py-2 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors h-[38px]">
            Submit
          </button>
        </form>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl">
          <p className="text-sm text-gray-400 font-medium">Total Balance</p>
          <p className="text-3xl font-bold text-white mt-1">₹{(totalBalancePaise / 100).toLocaleString()}</p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl">
          <p className="text-sm text-gray-400 font-medium">Total Income (YTD)</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight size={20} /> ₹{(totalIncomePaise / 100).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl">
          <p className="text-sm text-gray-400 font-medium">Total Expenses (YTD)</p>
          <p className="text-2xl font-bold text-rose-400 mt-1 flex items-center gap-1">
            <ArrowDownRight size={20} /> ₹{(Math.abs(totalExpensePaise) / 100).toLocaleString()}
          </p>
        </div>
      </div>

      {/* THE LEDGER TABLE */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-white/[0.02] text-gray-300 font-medium border-b border-white/5 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Title / Description</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dbTransactions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No transactions recorded yet.</td></tr>
              )}
              {dbTransactions.map((txn) => {
                const isIncome = txn.amount > 0;
                return (
                  <tr key={txn.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{txn.id.split('-')[0]}...</td>
                    <td className="px-6 py-4 font-medium text-gray-200 flex items-center gap-3">
                      <div className={`p-2 rounded-md ${isIncome ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        <ReceiptText size={16} />
                      </div>
                      {txn.title}
                    </td>
                    <td className="px-6 py-4">{txn.timestamp.toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                        txn.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold font-mono ${isIncome ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isIncome ? '+' : '-'}₹{(Math.abs(txn.amount) / 100).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}