import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction, CATEGORY_ICONS } from "@/lib/budget-data";
import { Pencil, Trash2, Search } from "lucide-react";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TransactionListProps {
    transactions: Transaction[];
    onUpdate: (id: string, tx: Omit<Transaction, "id">) => void;
    onDelete: (id: string) => void;
}

export function TransactionList({
    transactions,
    onUpdate,
    onDelete,
}: TransactionListProps) {
    const [editTx, setEditTx] = useState<Transaction | null>(null);
    const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
    const [search, setSearch] = useState("");

    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(n);

    const filtered = [...transactions]
        .filter((tx) => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
                tx.description.toLowerCase().includes(q) ||
                tx.category.toLowerCase().includes(q)
            );
        })
        .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

    return (
        <>
            <Card
                className="border-0 bg-card shadow-sm animate-fade-in"
                style={{ animationDelay: "0.25s" }}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-3">
                        <CardTitle className="font-display text-lg shrink-0">
                            Recent Transactions
                        </CardTitle>
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by description or category…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-9 text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-1 p-0 px-6 pb-6">
                    {filtered.length === 0 && (
                        <p className="text-sm text-muted-foreground py-6 text-center">
                            No transactions found.
                        </p>
                    )}
                    {filtered.slice(0, 8).map((tx) => (
                        <div
                            key={tx.id}
                            className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-lg">
                                {CATEGORY_ICONS[tx.category] || "📦"}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-sm">
                                    {tx.description}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {tx.category} ·{" "}
                                    {new Date(tx.date).toLocaleDateString(
                                        "en-US",
                                        { month: "short", day: "numeric" },
                                    )}
                                </p>
                            </div>
                            <p
                                className={`font-semibold text-sm tabular-nums ${
                                    tx.type === "income"
                                        ? "text-income"
                                        : "text-expense"
                                }`}
                            >
                                {tx.type === "income" ? "+" : "−"}
                                {fmt(tx.amount)}
                            </p>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => setEditTx(tx)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteTx(tx)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <EditTransactionDialog
                transaction={editTx}
                open={!!editTx}
                onOpenChange={(open) => !open && setEditTx(null)}
                onSave={onUpdate}
            />

            <AlertDialog
                open={!!deleteTx}
                onOpenChange={(open) => !open && setDeleteTx(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove "
                            {deleteTx?.description}" from your records.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteTx) onDelete(deleteTx.id);
                                setDeleteTx(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
