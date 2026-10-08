
"use client";

import { useEffect, useState } from "react";
import { AiOutlineDollar,AiOutlinePercentage  } from "react-icons/ai";
import { IoIosTrendingUp } from "react-icons/io";
import { FaArrowTrendDown } from "react-icons/fa6";


type Trade = {
  id: string;
  date: string;
  balance: number;
  amount: number;
  result: "win" | "loss";
  profit: number;
  balanceAfter: number;
  createdAt: string;
};

type Dashboard = {
  date: string;
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  currentBalance: number | null;
  trades: Trade[];
  formOpen: boolean;
};

const API = "http://localhost:8000/api";

export default function TradingDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [history, setHistory] = useState<Trade[]>([]);
  const [balance, setBalance] = useState("");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<"win" | "loss" | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    const [dashboardRes, historyRes] = await Promise.all([
      fetch(`${API}/dashboard`, { cache: "no-store" }),
      fetch(`${API}/trades`, { cache: "no-store" }),
    ]);

    if (!dashboardRes.ok || !historyRes.ok) {
      throw new Error("ডাটা লোড করা যায়নি");
    }

    const dashboard: Dashboard = await dashboardRes.json();
    const trades: Trade[] = await historyRes.json();

    setData(dashboard);
    setHistory(trades);

    if (dashboard.currentBalance !== null) {
      setBalance(String(dashboard.currentBalance));
    }
  }

  useEffect(() => {
    loadData().catch(() => setError("সার্ভারের সাথে সংযোগ করা যাচ্ছে না"));
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const balanceValue = Number(balance);
    const amountValue = Number(amount);

    if (!Number.isFinite(balanceValue) || balanceValue < 0 ||
        !Number.isFinite(amountValue) || amountValue <= 0) {
      setError("সঠিক ব্যালেন্স ও এন্ট্রি অ্যামাউন্ট দিন");
      return;
    }

    if (!result) {
      setError("ট্রেডের ফলাফল নির্বাচন করুন");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          balance: balanceValue,
          amount: amountValue,
          result,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || "ট্রেড জমা হয়নি");
      }

      setMessage("ট্রেড সফলভাবে সংরক্ষণ হয়েছে");
      setAmount("");
      setResult("");
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-100 p-8 text-center">
        <p>{error || "ড্যাশবোর্ড লোড হচ্ছে..."}</p>
      </main>
    );
  }

  const stats = [
    { label: "আজকের মোট ট্রেড", Icon: <AiOutlineDollar className="text-2xl text-gray-400" />, value: data.total, color: "text-slate-900" },
    { label: "বর্তমান ব্যালেন্স", Icon: <AiOutlineDollar className="text-2xl text-gray-400" />, value: `$${data.currentBalance?.toLocaleString()}`, color: "text-slate-600" },
    { label: "মোট Win", Icon: <IoIosTrendingUp className="text-2xl text-green-400" />, value: data.wins, color: "text-green-400" },
    { label: "মোট Loss", Icon: <FaArrowTrendDown className="text-2xl text-red-400" />, value: data.losses, color: "text-red-400" },
    { label: "Win Rate", Icon: <AiOutlinePercentage className="text-2xl text-gray-400" />, value: `${data.winRate}%`, color: "text-blue-600" },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Trading Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Daily trading record · {data.date}
            </p>
          </div>
          <span className={`rounded-full px-4 py-2 text-sm font-semibold ${
            data.formOpen
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}>
            {data.formOpen ? "Trading Open" : "Trading Closed"}
          </span>
        </header>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
              <div className="flex items-center justify-between gap-3">
              
                <p className="text-sm text-slate-500">{stat.label}</p>
                <div className="">  {stat.Icon}</div>
              </div>
              <p className={`mt-3 text-3xl  ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">
              New Trade
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              প্রতিদিন সর্বোচ্চ ২টি ট্রেড
            </p>

            {data.formOpen ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    বর্তমান ব্যালেন্স
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    required
                    disabled={data.total > 0}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 disabled:bg-slate-100"
                    placeholder="যেমন: 10000"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    এন্ট্রি অ্যামাউন্ট
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={balance || undefined}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="যেমন: 1000"
                  />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">
                    ট্রেডের ফলাফল
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setResult("win")}
                      className={`rounded-xl border-2 p-3 font-bold ${
                        result === "win"
                          ? "border-green-600 bg-green-50 text-green-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      WIN
                    </button>
                    <button
                      type="button"
                      onClick={() => setResult("loss")}
                      className={`rounded-xl border-2 p-3 font-bold ${
                        result === "loss"
                          ? "border-red-600 bg-red-50 text-red-700"
                          : "border-slate-200 text-slate-600"
                      }`}
                    >
                      LOSS
                    </button>
                  </div>
                </div>

                {error && (
                  <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                {message && (
                  <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !result}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {loading ? "Saving..." : "Save Trade"}
                </button>
              </form>
            ) : (
              <div className="mt-6 rounded-xl bg-amber-50 p-5 text-center">
                <h3 className="font-bold text-amber-800">
                  আজকের ট্রেডিং বন্ধ
                </h3>
                <p className="mt-2 text-sm text-amber-700">
                  {data.losses > 0
                    ? "আজ Loss হয়েছে, তাই আর ট্রেড করা যাবে না।"
                    : "আজকের ২টি ট্রেড সম্পন্ন হয়েছে।"}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <h2 className="text-xl font-bold text-slate-900">
              Today&apos;s Trades
            </h2>
            <div className="mt-5 space-y-3">
              {data.trades.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-6 text-center text-slate-500">
                  আজ এখনো কোনো ট্রেড নেই।
                </p>
              ) : data.trades.map((trade, index) => (
                <div key={trade.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <p className="font-semibold text-slate-800">
                      Trade {index + 1}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Entry: ${trade.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(trade.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                      trade.result === "win"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {trade.result.toUpperCase()}
                    </span>
                    <p className={`mt-2 font-bold ${
                      trade.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {trade.profit >= 0 ? "+" : "-"}৳
                      {Math.abs(trade.profit).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">
                      Balance: ৳{trade.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">
            All Trade History
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Balance</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Result</th>
                  <th className="p-3">Profit / Loss</th>
                  <th className="p-3">After Balance</th>
                </tr>
              </thead>
              <tbody>
                {history.map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-100">
                    <td className="p-3">{trade.date}</td>
                    <td className="p-3">${trade.balance.toLocaleString()}</td>
                    <td className="p-3">${trade.amount.toLocaleString()}</td>
                    <td className={`p-3 font-semibold ${
                      trade.result === "win" ? "text-green-600" : "text-red-600"
                    }`}>
                      {trade.result.toUpperCase()}
                    </td>
                    <td className={`p-3 font-semibold ${
                      trade.profit >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {trade.profit >= 0 ? "+" : "-"}$
                      {Math.abs(trade.profit).toLocaleString()}
                    </td>
                    <td className="p-3">${trade.balanceAfter.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}