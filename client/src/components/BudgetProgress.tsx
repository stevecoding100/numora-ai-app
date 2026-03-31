import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BudgetCategory } from "@/lib/budget-data";

interface BudgetProgressProps {
    categories: BudgetCategory[];
}

export function BudgetProgress({ categories }: BudgetProgressProps) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(n);

    return (
        <Card
            className="border-0 bg-card shadow-sm animate-fade-in"
            style={{ animationDelay: "0.15s" }}
        >
            <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">
                    Budget Progress
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {categories.map((cat) => {
                    const pct = Math.min((cat.spent / cat.budget) * 100, 100);
                    const isOver = cat.spent > cat.budget;
                    return (
                        <div key={cat.name} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <span>{cat.icon}</span>
                                    <span className="font-medium">
                                        {cat.name}
                                    </span>
                                </span>
                                <span
                                    className={
                                        isOver
                                            ? "text-expense font-semibold"
                                            : "text-muted-foreground"
                                    }
                                >
                                    {fmt(cat.spent)} / {fmt(cat.budget)}
                                </span>
                            </div>
                            <Progress
                                value={pct}
                                className={`h-2 ${isOver ? "[&>div]:bg-expense" : "[&>div]:bg-primary"}`}
                            />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
