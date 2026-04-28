import { OverviewCards } from "@/components/OverviewCards";
import { BudgetProgress } from "@/components/BudgetProgress";
import { SpendingChart } from "@/components/SpendingChart";
import { SpendingTrendChart } from "@/components/SpendingTrendChart";
import { TransactionList } from "@/components/TransactionList";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { useBudget } from "@/hooks/use-budget";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { FinancialChatBot } from "@/components/FinancialChatBot";

const Index = () => {
    const {
        transactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        totalIncome,
        totalExpenses,
        balance,
        categories,
        saveSingleBudget,
        deleteBudget,
        spendingByCategory,
        spendingTrend,
    } = useBudget();

    const { signOut } = useAuth();

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="container flex items-center justify-between py-4">
                    <div>
                        <h1 className="text-xl font-display font-bold tracking-tight">
                            💸 Numora
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            April 23, 2026
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <AddTransactionDialog onAdd={addTransaction} />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={signOut}
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container py-6 space-y-6">
                <OverviewCards
                    totalIncome={totalIncome}
                    totalExpenses={totalExpenses}
                    balance={balance}
                />

                <div className="grid gap-6 lg:grid-cols-2">
                    <SpendingChart data={spendingByCategory} />
                    <BudgetProgress
                        categories={categories}
                        onSaveBudget={saveSingleBudget}
                        onDeleteBudget={deleteBudget}
                    />
                </div>

                <SpendingTrendChart data={spendingTrend} />

                <TransactionList
                    transactions={transactions}
                    onUpdate={updateTransaction}
                    onDelete={deleteTransaction}
                />
            </main>

            <FinancialChatBot />
        </div>
    );
};

export default Index;
