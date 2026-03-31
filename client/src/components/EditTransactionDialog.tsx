import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    Transaction,
} from "@/lib/budget-data";

interface EditTransactionDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (id: string, tx: Omit<Transaction, "id">) => void;
}

export function EditTransactionDialog({
    transaction,
    open,
    onOpenChange,
    onSave,
}: EditTransactionDialogProps) {
    const [type, setType] = useState<"income" | "expense">("expense");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        if (transaction) {
            setType(transaction.type);
            setDescription(transaction.description);
            setAmount(transaction.amount.toString());
            setCategory(transaction.category);
            setDate(transaction.date);
        }
    }, [transaction]);

    const categories =
        type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!transaction || !description || !amount || !category) return;
        onSave(transaction.id, {
            description,
            amount: parseFloat(amount),
            type,
            category,
            date,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display">
                        Edit Transaction
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={type === "expense" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => {
                                setType("expense");
                                setCategory("");
                            }}
                        >
                            Expense
                        </Button>
                        <Button
                            type="button"
                            variant={type === "income" ? "default" : "outline"}
                            className="flex-1"
                            onClick={() => {
                                setType("income");
                                setCategory("");
                            }}
                        >
                            Income
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Input
                            id="edit-description"
                            placeholder="What was this for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-amount">Amount</Label>
                        <Input
                            id="edit-amount"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                        {cat}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-date">Date</Label>
                        <Input
                            id="edit-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Save Changes
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
