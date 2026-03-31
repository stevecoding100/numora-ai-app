import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { Plus } from "lucide-react";
import {
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    Transaction,
} from "@/lib/budget-data";

interface AddTransactionDialogProps {
    onAdd: (tx: Omit<Transaction, "id">) => void;
}

export function AddTransactionDialog({ onAdd }: AddTransactionDialogProps) {
    const [open, setOpen] = useState(false);
    const [type, setType] = useState<"income" | "expense">("expense");
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const categories =
        type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !category) return;
        onAdd({
            description,
            amount: parseFloat(amount),
            type,
            category,
            date,
        });
        setDescription("");
        setAmount("");
        setCategory("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display">
                        Add Transaction
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
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="What was this for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                            id="amount"
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
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full">
                        Add {type === "income" ? "Income" : "Expense"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
