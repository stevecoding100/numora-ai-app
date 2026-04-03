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
import { Settings } from "lucide-react";
import { BudgetCategory } from "@/lib/budget-data";
import { toast } from "sonner";

interface BudgetSettingsDialogProps {
    categories: BudgetCategory[];
    onSave: (budgets: Record<string, number>) => Promise<void>;
}

export function BudgetSettingsDialog({
    categories,
    onSave,
}: BudgetSettingsDialogProps) {
    const [open, setOpen] = useState(false);
    const [budgets, setBudgets] = useState<Record<string, number>>({});
    const [saving, setSaving] = useState(false);

    const handleOpen = (isOpen: boolean) => {
        if (isOpen) {
            const initial: Record<string, number> = {};
            categories.forEach((c) => {
                initial[c.name] = c.budget;
            });
            setBudgets(initial);
        }
        setOpen(isOpen);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(budgets);
            toast.success("Budget limits saved");
            setOpen(false);
        } catch {
            toast.error("Failed to save budget limits");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Budget settings">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="font-display">
                        Budget Limits
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    {categories.map((cat) => (
                        <div key={cat.name} className="flex items-center gap-3">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-sm font-medium flex-1">
                                {cat.name}
                            </span>
                            <div className="relative w-28">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                                    $
                                </span>
                                <Input
                                    type="number"
                                    min={0}
                                    step={10}
                                    className="pl-7 text-right"
                                    value={budgets[cat.name] ?? cat.budget}
                                    onChange={(e) =>
                                        setBudgets((prev) => ({
                                            ...prev,
                                            [cat.name]: Math.max(
                                                0,
                                                Number(e.target.value),
                                            ),
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "Save"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
