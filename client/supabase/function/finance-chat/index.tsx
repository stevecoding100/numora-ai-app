import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
    if (req.method === "OPTIONS")
        return new Response(null, { headers: corsHeaders });

    try {
        const authHeader = req.headers.get("Authorization");

        const supabaseUrl = Deno.env.get("SUPABASE_URL");
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

        if (!supabaseUrl || !supabaseAnonKey) {
            throw new Error(
                "Missing Supabase configuration environment variables.",
            );
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader || "" } },
        });

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { messages } = await req.json();

        // Fetch user's financial data
        const [txRes, budgetRes] = await Promise.all([
            supabase
                .from("transactions")
                .select("*")
                .order("date", { ascending: false })
                .limit(200),
            supabase.from("budget_categories").select("*"),
        ]);

        const transactions = txRes.data ?? [];
        const budgets = budgetRes.data ?? [];

        const totalIncome = transactions
            .filter((t: any) => t.type === "income")
            .reduce((s: number, t: any) => s + Number(t.amount), 0);
        const totalExpenses = transactions
            .filter((t: any) => t.type === "expense")
            .reduce((s: number, t: any) => s + Number(t.amount), 0);

        const byCategory: Record<string, number> = {};
        transactions
            .filter((t: any) => t.type === "expense")
            .forEach((t: any) => {
                byCategory[t.category] =
                    (byCategory[t.category] || 0) + Number(t.amount);
            });

        const budgetSummary = budgets.map((b: any) => ({
            category: b.category,
            budget: Number(b.budget),
            spent: byCategory[b.category] || 0,
            remaining: Number(b.budget) - (byCategory[b.category] || 0),
        }));

        const systemPrompt = `You are a friendly, expert financial advisor built into BudgetFlow. Analyze the user's real financial data and provide actionable insights.

FINANCIAL SUMMARY:
- Total Income: $${totalIncome.toFixed(2)}
- Total Expenses: $${totalExpenses.toFixed(2)}
- Net Balance: $${(totalIncome - totalExpenses).toFixed(2)}
- Savings Rate: ${totalIncome > 0 ? ((1 - totalExpenses / totalIncome) * 100).toFixed(1) : 0}%

SPENDING BY CATEGORY:
${Object.entries(byCategory)
    .map(([cat, amt]) => `- ${cat}: $${(amt as number).toFixed(2)}`)
    .join("\n")}

BUDGET GOALS:
${budgetSummary.length > 0 ? budgetSummary.map((b: any) => `- ${b.category}: $${b.spent.toFixed(2)} / $${b.budget.toFixed(2)} (${b.remaining >= 0 ? `$${b.remaining.toFixed(2)} remaining` : `$${Math.abs(b.remaining).toFixed(2)} over budget`})`).join("\n") : "No custom budgets set yet."}

RECENT TRANSACTIONS (last 10):
${transactions
    .slice(0, 10)
    .map(
        (t: any) =>
            `- ${t.date} | ${t.type} | ${t.category} | ${t.description} | $${Number(t.amount).toFixed(2)}`,
    )
    .join("\n")}

Keep responses concise, use emojis sparingly, and format with markdown. Focus on actionable advice.`;

        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (!LOVABLE_API_KEY)
            throw new Error("LOVABLE_API_KEY is not configured");

        const response = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${LOVABLE_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "google/gemini-3-flash-preview",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages,
                    ],
                    stream: true,
                }),
            },
        );

        if (!response.ok) {
            if (response.status === 429) {
                return new Response(
                    JSON.stringify({
                        error: "Rate limit exceeded. Please try again shortly.",
                    }),
                    {
                        status: 429,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    },
                );
            }
            if (response.status === 402) {
                return new Response(
                    JSON.stringify({
                        error: "AI credits exhausted. Please add funds.",
                    }),
                    {
                        status: 402,
                        headers: {
                            ...corsHeaders,
                            "Content-Type": "application/json",
                        },
                    },
                );
            }
            const t = await response.text();
            console.error("AI gateway error:", response.status, t);
            return new Response(
                JSON.stringify({ error: "AI service unavailable" }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        return new Response(response.body, {
            headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
    } catch (e) {
        console.error("financial-chat error:", e);
        return new Response(
            JSON.stringify({
                error: e instanceof Error ? e.message : "Unknown error",
            }),
            {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
