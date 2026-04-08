import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { BudgetCategory } from "@/lib/budget-data";
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

interface BudgetProgressProps {
    categories: BudgetCategory[];
    onSaveBudget: (
        category: string,
        budget: number,
        spent?: number,
    ) => Promise<void>;
    onDeleteBudget: (category: string) => Promise<void>;
}

export function BudgetProgress({
    categories,
    onSaveBudget,
    onDeleteBudget,
}: BudgetProgressProps) {
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editValue, setEditValue] = useState(0);
    const [editSpentValue, setEditSpentValue] = useState(0);
    const [deleteCategory, setDeleteCategory] = useState<string | null>(null);

    const fmt = (n: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(n);

    const startEdit = (cat: BudgetCategory) => {
        setEditingCategory(cat.name);
        setEditValue(cat.budget);
        setEditSpentValue(cat.spent); // Capture current spent amount
    };

    const saveEdit = async () => {
        if (editingCategory) {
            await onSaveBudget(
                editingCategory,
                Number(editValue),
                Number(editSpentValue),
            );
            setEditingCategory(null);
        }
    };

    return (
        <>
            <Card
                className="border-0 bg-card shadow-sm animate-fade-in"
                style={{ animationDelay: "0.15s" }}
            >
                <CardHeader className="pb-3">
                    <CardTitle className="font-display text-lg">
                        Budget Progress
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 p-0 px-6 pb-6">
                    {categories.map((cat) => {
                        const pct = Math.min(
                            (cat.spent / cat.budget) * 100,
                            100,
                        );
                        const isOver = cat.spent > cat.budget;
                        const isEditing = editingCategory === cat.name;

                        return (
                            <div
                                key={cat.name}
                                className="group rounded-lg p-2.5 transition-colors hover:bg-muted/50"
                            >
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2">
                                        <span>{cat.icon}</span>
                                        <span className="font-medium">
                                            {cat.name}
                                        </span>
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {isEditing ? (
                                            // <div className="flex items-center gap-1">
                                            //     <div className="relative w-24">
                                            //         <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                            //             $
                                            //         </span>
                                            //         <Input
                                            //             type="number"
                                            //             min={0}
                                            //             step={10}
                                            //             className="h-7 pl-5 text-right text-xs"
                                            //             value={editValue}
                                            //             onChange={(e) =>
                                            //                 setEditValue(
                                            //                     Math.max(
                                            //                         0,
                                            //                         Number(
                                            //                             e.target
                                            //                                 .value,
                                            //                         ),
                                            //                     ),
                                            //                 )
                                            //             }
                                            //             onKeyDown={(e) =>
                                            //                 e.key === "Enter" &&
                                            //                 saveEdit()
                                            //             }
                                            //             autoFocus
                                            //         />
                                            //     </div>
                                            //     <Button
                                            //         variant="ghost"
                                            //         size="icon"
                                            //         className="h-7 w-7"
                                            //         onClick={saveEdit}
                                            //     >
                                            //         <Check className="h-3.5 w-3.5 text-income" />
                                            //     </Button>
                                            //     <Button
                                            //         variant="ghost"
                                            //         size="icon"
                                            //         className="h-7 w-7"
                                            //         onClick={() =>
                                            //             setEditingCategory(null)
                                            //         }
                                            //     >
                                            //         <X className="h-3.5 w-3.5" />
                                            //     </Button>
                                            // </div>
                                            <div className="flex flex-col gap-2 bg-muted/30 p-2 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs w-12 text-muted-foreground">
                                                        Limit:
                                                    </span>
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                                            $
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            className="h-7 pl-5 text-right text-xs"
                                                            value={editValue}
                                                            onChange={(e) =>
                                                                setEditValue(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs w-12 text-muted-foreground">
                                                        Spent:
                                                    </span>
                                                    <div className="relative flex-1">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                                                            $
                                                        </span>
                                                        <Input
                                                            type="number"
                                                            className="h-7 pl-5 text-right text-xs"
                                                            value={
                                                                editSpentValue
                                                            } // You'll need a new state for this
                                                            onChange={(e) =>
                                                                setEditSpentValue(
                                                                    Number(
                                                                        e.target
                                                                            .value,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6"
                                                        onClick={saveEdit}
                                                    >
                                                        <Check className="h-3 w-3 text-income" />{" "}
                                                        Save
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-6"
                                                        onClick={() =>
                                                            setEditingCategory(
                                                                null,
                                                            )
                                                        }
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <span
                                                    className={
                                                        isOver
                                                            ? "text-expense font-semibold"
                                                            : "text-muted-foreground"
                                                    }
                                                >
                                                    {fmt(cat.spent)} /{" "}
                                                    {fmt(cat.budget)}
                                                </span>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() =>
                                                            startEdit(cat)
                                                        }
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                                        onClick={() =>
                                                            setDeleteCategory(
                                                                cat.name,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <Progress
                                    value={pct}
                                    className={`h-2 mt-1.5 ${isOver ? "[&>div]:bg-expense" : "[&>div]:bg-primary"}`}
                                />
                            </div>
                        );
                    })}
                </CardContent>
            </Card>

            <AlertDialog
                open={!!deleteCategory}
                onOpenChange={(open) => !open && setDeleteCategory(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset budget?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reset the "{deleteCategory}" budget back
                            to its default value.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (deleteCategory)
                                    onDeleteBudget(deleteCategory);
                                setDeleteCategory(null);
                            }}
                        >
                            Reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
