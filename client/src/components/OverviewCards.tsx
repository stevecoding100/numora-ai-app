import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface OverviewCardsProps {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
}

export function OverviewCards({
    totalIncome,
    totalExpenses,
    balance,
}: OverviewCardsProps) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(n);

    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <Card className="animate-fade-in border-0 bg-card shadow-sm">
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                        <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <p className="text-2xl font-display font-bold tracking-tight">
                            {fmt(balance)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="animate-fade-in border-0 bg-card shadow-sm"
                style={{ animationDelay: "0.05s" }}
            >
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-income/10">
                        <TrendingUp className="h-6 w-6 text-income" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Income</p>
                        <p className="text-2xl font-display font-bold tracking-tight text-income">
                            {fmt(totalIncome)}
                        </p>
                    </div>
                </CardContent>
            </Card>

            <Card
                className="animate-fade-in border-0 bg-card shadow-sm"
                style={{ animationDelay: "0.1s" }}
            >
                <CardContent className="flex items-center gap-4 p-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-expense/10">
                        <TrendingDown className="h-6 w-6 text-expense" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Expenses
                        </p>
                        <p className="text-2xl font-display font-bold tracking-tight text-expense">
                            {fmt(totalExpenses)}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
