import { useState, useEffect, useCallback } from "react";
import { Transaction, BudgetCategory } from "@/lib/budget-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const DEFAULT_BUDGETS: Record<string, number> = {
    Housing: 1500,
    Food: 400,
    Transport: 200,
    Entertainment: 100,
    Shopping: 200,
    Health: 100,
    Utilities: 150,
};

const CATEGORY_META: { name: string; icon: string; color: string }[] = [
    { name: "Housing", icon: "🏠", color: "chart-1" },
    { name: "Food", icon: "🍔", color: "chart-2" },
    { name: "Transport", icon: "🚗", color: "chart-3" },
    { name: "Entertainment", icon: "🎬", color: "chart-4" },
    { name: "Shopping", icon: "🛍️", color: "chart-5" },
    { name: "Health", icon: "💊", color: "chart-1" },
    { name: "Utilities", icon: "💡", color: "chart-2" },
];

export function useBudget() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [customBudgets, setCustomBudgets] = useState<Record<string, number>>(
        {},
    );
    const [loading, setLoading] = useState(true);

    const fetchBudgets = useCallback(async () => {
        if (!user) return;
        const { data } = await supabase
            .from("budget_categories")
            .select("category, budget");
        if (data) {
            const map: Record<string, number> = {};
            data.forEach((r) => {
                map[r.category] = Number(r.budget);
            });
            setCustomBudgets(map);
        }
    }, [user]);

    const fetchTransactions = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("transactions")
            .select("*")
            .order("date", { ascending: false });

        if (error) {
            toast.error("Failed to load transactions");
            console.error(error);
            return;
        }

        setTransactions(
            (data ?? []).map((t) => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                type: t.type as "income" | "expense",
                category: t.category,
                date: t.date,
            })),
        );
        setLoading(false);
    }, [user]);

    useEffect(() => {
        fetchTransactions();
        fetchBudgets();
    }, [fetchTransactions, fetchBudgets]);

    const addTransaction = async (tx: Omit<Transaction, "id">) => {
        if (!user) return;
        const { error } = await supabase.from("transactions").insert({
            user_id: user.id,
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            category: tx.category,
            date: tx.date,
        });
        if (error) {
            toast.error("Failed to add transaction");
            console.error(error);
            return;
        }
        fetchTransactions();
    };

    const updateTransaction = async (
        id: string,
        tx: Omit<Transaction, "id">,
    ) => {
        const { error } = await supabase
            .from("transactions")
            .update({
                description: tx.description,
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                date: tx.date,
            })
            .eq("id", id);
        if (error) {
            toast.error("Failed to update transaction");
            console.error(error);
            return;
        }
        fetchTransactions();
    };

    const deleteTransaction = async (id: string) => {
        const { error } = await supabase
            .from("transactions")
            .delete()
            .eq("id", id);
        if (error) {
            toast.error("Failed to delete transaction");
            console.error(error);
            return;
        }
        fetchTransactions();
    };

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const categories: BudgetCategory[] = CATEGORY_META.map((cat) => ({
        ...cat,
        budget: customBudgets[cat.name] ?? DEFAULT_BUDGETS[cat.name] ?? 0,
        spent: transactions
            .filter((t) => t.type === "expense" && t.category === cat.name)
            .reduce((sum, t) => sum + t.amount, 0),
    }));

    const saveBudgets = async (budgets: Record<string, number>) => {
        if (!user) return;
        const rows = Object.entries(budgets).map(([category, budget]) => ({
            user_id: user.id,
            category,
            budget,
        }));
        // Upsert all budget categories
        const { error } = await supabase
            .from("budget_categories")
            .upsert(rows, { onConflict: "user_id,category" });
        if (error) throw error;
        setCustomBudgets(budgets);
    };

    const spendingByCategory = categories
        .filter((c) => c.spent > 0)
        .map((c) => ({ name: c.name, value: c.spent, icon: c.icon }));

    const dailySpending = transactions
        .filter((t) => t.type === "expense")
        .reduce<Record<string, number>>((acc, t) => {
            const day = t.date.slice(8, 10);
            acc[day] = (acc[day] || 0) + t.amount;
            return acc;
        }, {});

    const spendingTrend = Object.entries(dailySpending)
        .map(([day, amount]) => ({ day: `Day ${parseInt(day)}`, amount }))
        .sort((a, b) =>
            a.day.localeCompare(b.day, undefined, { numeric: true }),
        );

    return {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalIncome,
        totalExpenses,
        balance,
        categories,
        saveBudgets,
        spendingByCategory,
        spendingTrend,
        loading,
    };
}
