import { useState, useEffect, useCallback } from "react";
import { Transaction, BudgetCategory } from "@/lib/budget-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const budgetCategories: BudgetCategory[] = [
    { name: "Housing", icon: "🏠", budget: 1500, spent: 0, color: "chart-1" },
    { name: "Food", icon: "🍔", budget: 400, spent: 0, color: "chart-2" },
    { name: "Transport", icon: "🚗", budget: 200, spent: 0, color: "chart-3" },
    {
        name: "Entertainment",
        icon: "🎬",
        budget: 100,
        spent: 0,
        color: "chart-4",
    },
    { name: "Shopping", icon: "🛍️", budget: 200, spent: 0, color: "chart-5" },
    { name: "Health", icon: "💊", budget: 100, spent: 0, color: "chart-1" },
    { name: "Utilities", icon: "💡", budget: 150, spent: 0, color: "chart-2" },
];

export function useBudget() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

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
    }, [fetchTransactions]);

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

    const categories: BudgetCategory[] = budgetCategories.map((cat) => ({
        ...cat,
        spent: transactions
            .filter((t) => t.type === "expense" && t.category === cat.name)
            .reduce((sum, t) => sum + t.amount, 0),
    }));

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
        spendingByCategory,
        spendingTrend,
        loading,
    };
}
