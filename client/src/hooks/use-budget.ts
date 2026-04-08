import { useState, useEffect, useCallback } from "react";
import { Transaction, BudgetCategory, CATEGORY_ICONS } from "@/lib/budget-data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const DEFAULT_BUDGETS: Record<string, number> = {
    Housing: 0,
    Food: 0,
    Transport: 0,
    Entertainment: 0,
    Shopping: 0,
    Health: 0,
    Utilities: 0,
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
    const [customBudgets, setCustomBudgets] = useState<
        Record<string, { budget: number; spent: number }>
    >({});
    const [loading, setLoading] = useState(true);

    // ** Initial Data Fetching Functions */
    const fetchBudgets = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("budget_categories")
            .select("category, budget, manual_spent");

        if (error) {
            console.error("Error fetching budgets:", error);
            return;
        }

        if (data) {
            const map: Record<string, { budget: number; spent: number }> = {};
            data.forEach((r) => {
                map[r.category] = {
                    budget: Number(r.budget || 0),
                    spent: Number(r.manual_spent || 0),
                };
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
    //** End of Initial Data Fetching Functions */

    //** Start of Transaction Management Functions */
    const addTransaction = async (tx: Omit<Transaction, "id">) => {
        if (!user) return;
        const { data, error } = await supabase
            .from("transactions")
            .insert({
                user_id: user.id,
                description: tx.description,
                amount: tx.amount,
                type: tx.type,
                category: tx.category,
                date: tx.date,
            })
            .select(); // Add .select() to get the new row back immediately

        if (error) {
            toast.error("Failed to add transaction");
            console.error(error);
            return;
        }

        if (data && data[0]) {
            // 2. Map the Supabase response to your Transaction interface
            const newTransaction: Transaction = {
                id: data[0].id,
                description: data[0].description,
                amount: Number(data[0].amount),
                type: data[0].type as "income" | "expense",
                category: data[0].category,
                date: data[0].date,
            };

            // 3. Update state: Put the newest transaction at the TOP of the list
            setTransactions((prev) => [newTransaction, ...prev]);
            toast.success("Transaction added");
        }
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
    //** End of Transaction Management Functions *//

    //** Start of Financial Calculation Functions */
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;
    // ** End of Financial Calculation Functions */

    // ** Start of Budget Category Functions */

    const categories: BudgetCategory[] = CATEGORY_META.map((cat) => {
        const custom = customBudgets[cat.name];

        const transactionSum = transactions
            .filter((t) => t.type === "expense" && t.category === cat.name)
            .reduce((sum, t) => sum + t.amount, 0);
        // 2. Get the manual adjustment from the database
        const manualAdjustment = custom?.spent ?? 0;

        return {
            ...cat,
            budget: custom?.budget ?? DEFAULT_BUDGETS[cat.name] ?? 0,
            // The display total is the Adjustment + any Transactions
            spent: manualAdjustment + transactionSum,
        };
    });
    // ** End of Budget Category Functions */

    //** Start of Budget Management Functions */
    const saveBudgets = async (budgets: Record<string, number>) => {
        if (!user) return;
        const rows = Object.entries(budgets).map(([category, budget]) => ({
            user_id: user.id,
            category,
            budget,
            // We need to include the existing manual_spent so it doesn't get reset to 0 by the upsert
            manual_spent: customBudgets[category]?.spent ?? 0,
        }));
        const { error } = await supabase
            .from("budget_categories")
            .upsert(rows, { onConflict: "user_id,category" });

        if (error) throw error;

        // Refresh local state
        // setCustomBudgets(budgets);
        fetchBudgets();
    };

    const saveSingleBudget = async (
        category: string,
        budget: number,
        targetTotalSpent: number,
    ) => {
        if (!user) return;

        // 1. Get current sum of real transactions
        const transactionSum = transactions
            .filter((t) => t.type === "expense" && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);

        // 2. The adjustment is the "gap" between your target and the real transactions
        // Example: You want $100 total, you have $30 in transactions. We save $70.
        const adjustment = targetTotalSpent - transactionSum;

        const { error } = await supabase.from("budget_categories").upsert(
            {
                user_id: user.id,
                category,
                budget,
                manual_spent: adjustment,
            },
            { onConflict: "user_id,category" },
        );
        if (error) {
            toast.error("Failed to save budget");
            return;
        }

        // 3. Update the local state so the UI refreshes instantly
        setCustomBudgets((prev) => ({
            ...prev,
            [category]: { budget, spent: adjustment },
        }));

        toast.success(`${category} updated`);
    };

    const deleteBudget = async (category: string) => {
        if (!user) return;
        // 1. Calculate the current transaction sum we want to "hide" from the progress bar
        const currentTransactionSum = transactions
            .filter((t) => t.type === "expense" && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);

        // 2. Set the budget to 0 and the manual_spent to the negative of the transactions
        // This makes: (Transaction Sum) + (Negative Adjustment) = 0
        const { error } = await supabase.from("budget_categories").upsert(
            {
                user_id: user.id,
                category,
                budget: 0,
                manual_spent: -currentTransactionSum,
            },
            { onConflict: "user_id,category" },
        );

        if (error) {
            toast.error("Failed to reset budget");
            return;
        }

        // 3. Update local state immediately
        setCustomBudgets((prev) => ({
            ...prev,
            [category]: { budget: 0, spent: -currentTransactionSum },
        }));

        toast.success(`${category} budget and progress reset to $0`);
    };
    //** End of Budget Management Functions */

    //** Start of Spending Analysis Functions */
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
    //** End of Spending Analysis Functions */

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
        saveSingleBudget,
        deleteBudget,
        spendingByCategory,
        spendingTrend,
        loading,
    };
}
