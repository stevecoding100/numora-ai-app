import { useState } from "react";
import { Transaction, BudgetCategory } from "@/lib/budget-data";
import { v4 as uuidv4 } from "uuid";

const initialTransactions: Transaction[] = [
    {
        id: "1",
        description: "Monthly Salary",
        amount: 5200,
        type: "income",
        category: "Salary",
        date: "2026-02-25",
    },
    {
        id: "2",
        description: "Rent Payment",
        amount: 1400,
        type: "expense",
        category: "Housing",
        date: "2026-02-01",
    },
    {
        id: "3",
        description: "Grocery Store",
        amount: 89.5,
        type: "expense",
        category: "Food",
        date: "2026-02-24",
    },
    {
        id: "4",
        description: "Netflix & Spotify",
        amount: 28.99,
        type: "expense",
        category: "Entertainment",
        date: "2026-02-20",
    },
    {
        id: "5",
        description: "Gas Station",
        amount: 52.0,
        type: "expense",
        category: "Transport",
        date: "2026-02-22",
    },
    {
        id: "6",
        description: "Freelance Project",
        amount: 800,
        type: "income",
        category: "Freelance",
        date: "2026-02-15",
    },
    {
        id: "7",
        description: "Electric Bill",
        amount: 95.0,
        type: "expense",
        category: "Utilities",
        date: "2026-02-10",
    },
    {
        id: "8",
        description: "New Shoes",
        amount: 120.0,
        type: "expense",
        category: "Shopping",
        date: "2026-02-18",
    },
    {
        id: "9",
        description: "Pharmacy",
        amount: 34.5,
        type: "expense",
        category: "Health",
        date: "2026-02-19",
    },
    {
        id: "10",
        description: "Restaurant",
        amount: 65.0,
        type: "expense",
        category: "Food",
        date: "2026-02-23",
    },
];

const budgetCategories: BudgetCategory[] = [
    {
        name: "Housing",
        icon: "🏠",
        budget: 1500,
        spent: 1400,
        color: "chart-1",
    },
    { name: "Food", icon: "🍔", budget: 400, spent: 154.5, color: "chart-2" },
    { name: "Transport", icon: "🚗", budget: 200, spent: 52, color: "chart-3" },
    {
        name: "Entertainment",
        icon: "🎬",
        budget: 100,
        spent: 28.99,
        color: "chart-4",
    },
    { name: "Shopping", icon: "🛍️", budget: 200, spent: 120, color: "chart-5" },
    { name: "Health", icon: "💊", budget: 100, spent: 34.5, color: "chart-1" },
    { name: "Utilities", icon: "💡", budget: 150, spent: 95, color: "chart-2" },
];

export function useBudget() {
    const [transactions, setTransactions] =
        useState<Transaction[]>(initialTransactions);

    const addTransaction = (tx: Omit<Transaction, "id">) => {
        setTransactions((prev) => [{ ...tx, id: uuidv4() }, ...prev]);
    };

    const updateTransaction = (id: string, tx: Omit<Transaction, "id">) => {
        setTransactions((prev) =>
            prev.map((t) => (t.id === id ? { ...tx, id } : t)),
        );
    };

    const deleteTransaction = (id: string) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id));
    };

    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    // Recalculate budget categories from transactions
    const categories: BudgetCategory[] = budgetCategories.map((cat) => ({
        ...cat,
        spent: transactions
            .filter((t) => t.type === "expense" && t.category === cat.name)
            .reduce((sum, t) => sum + t.amount, 0),
    }));

    // Spending by category for chart
    const spendingByCategory = categories
        .filter((c) => c.spent > 0)
        .map((c) => ({ name: c.name, value: c.spent, icon: c.icon }));

    // Daily spending trend
    const dailySpending = transactions
        .filter((t) => t.type === "expense")
        .reduce<Record<string, number>>((acc, t) => {
            const day = t.date.slice(8, 10); // DD
            acc[day] = (acc[day] || 0) + t.amount;
            return acc;
        }, {});

    const spendingTrend = Object.entries(dailySpending)
        .map(([day, amount]) => ({ day: `Feb ${parseInt(day)}`, amount }))
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
    };
}
