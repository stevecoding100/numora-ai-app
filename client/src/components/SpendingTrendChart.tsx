import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface SpendingTrendChartProps {
    data: { day: string; amount: number }[];
}

const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(n);

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
    return (
        <Card
            className="border-0 bg-card shadow-sm animate-fade-in"
            style={{ animationDelay: "0.35s" }}
        >
            <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">
                    Daily Spending Trend
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="hsl(var(--border))"
                                vertical={false}
                            />
                            <XAxis
                                dataKey="day"
                                tick={{
                                    fill: "hsl(var(--muted-foreground))",
                                    fontSize: 12,
                                }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{
                                    fill: "hsl(var(--muted-foreground))",
                                    fontSize: 12,
                                }}
                                axisLine={false}
                                tickLine={false}
                                tickFormatter={(v) => `$${v}`}
                            />
                            <Tooltip
                                formatter={(value: number) => [
                                    fmt(value),
                                    "Spent",
                                ]}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    border: "1px solid hsl(var(--border))",
                                    borderRadius: "0.5rem",
                                    fontSize: "0.875rem",
                                }}
                            />
                            <Bar
                                dataKey="amount"
                                fill="hsl(var(--expense))"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
