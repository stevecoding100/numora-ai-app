import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface SpendingChartProps {
    data: { name: string; value: number; icon: string }[];
}

const COLORS = [
    "hsl(160, 55%, 45%)",
    "hsl(200, 65%, 55%)",
    "hsl(45, 85%, 55%)",
    "hsl(280, 55%, 60%)",
    "hsl(4, 65%, 55%)",
    "hsl(160, 40%, 55%)",
    "hsl(200, 50%, 45%)",
];

export function SpendingChart({ data }: SpendingChartProps) {
    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(n);

    return (
        <Card
            className="border-0 bg-card shadow-sm animate-fade-in"
            style={{ animationDelay: "0.2s" }}
        >
            <CardHeader className="pb-3">
                <CardTitle className="font-display text-lg">
                    Spending Breakdown
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                    <div className="h-48 w-48 shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {data.map((_, i) => (
                                        <Cell
                                            key={i}
                                            fill={COLORS[i % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => fmt(value)}
                                    contentStyle={{
                                        backgroundColor: "hsl(var(--card))",
                                        border: "1px solid hsl(var(--border))",
                                        borderRadius: "0.5rem",
                                        fontSize: "0.875rem",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 text-sm">
                        {data.map((item, i) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="h-3 w-3 rounded-full shrink-0"
                                    style={{
                                        backgroundColor:
                                            COLORS[i % COLORS.length],
                                    }}
                                />
                                <span className="text-muted-foreground truncate">
                                    {item.icon} {item.name}
                                </span>
                                <span className="ml-auto font-medium">
                                    {fmt(item.value)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
