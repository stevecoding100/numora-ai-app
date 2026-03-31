export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: "income" | "expense";
    category: string;
    date: string;
}

export interface BudgetCategory {
    name: string;
    icon: string;
    budget: number;
    spent: number;
    color: string;
}

export const EXPENSE_CATEGORIES = [
    "Housing",
    "Food",
    "Transport",
    "Entertainment",
    "Shopping",
    "Health",
    "Utilities",
    "Other",
] as const;

export const INCOME_CATEGORIES = [
    "Salary",
    "Freelance",
    "Investment",
    "Gift",
    "Other",
] as const;

export const CATEGORY_ICONS: Record<string, string> = {
    Housing: "🏠",
    Food: "🍔",
    Transport: "🚗",
    Entertainment: "🎬",
    Shopping: "🛍️",
    Health: "💊",
    Utilities: "💡",
    Salary: "💰",
    Freelance: "💻",
    Investment: "📈",
    Gift: "🎁",
    Other: "📦",
};
