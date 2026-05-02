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
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization" }),
                {
                    status: 401,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_ANON_KEY")!,
            { global: { headers: { Authorization: authHeader } } },
        );

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

        const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY");
        // 1. Updated Model ID for 2026
        const MODEL_ID = "gemini-3-flash-preview";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:streamGenerateContent?alt=sse&key=${GOOGLE_AI_API_KEY}`;

        const contents = messages.map((m: any) => ({
            // Gemini 3 still uses 'user' and 'model'
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: contents,
                systemInstruction: {
                    parts: [{ text: systemPrompt }],
                },
                generationConfig: {
                    temperature: 0.7,
                    // Gemini 3 supports much larger output,
                    // but 1000 is good for a concise chat.
                    maxOutputTokens: 1000,
                },
            }),
        });
        if (!response.ok) {
            const err = await response.text();
            console.error("Gemini Error:", err);
            return new Response(
                JSON.stringify({ error: "AI service failed" }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }
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
