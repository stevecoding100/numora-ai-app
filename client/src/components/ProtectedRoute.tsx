import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

export default function ProtectedRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        const getSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setLoading(false);
        };

        getSession();
    }, []);

    if (loading) return <div>Loading...</div>;

    if (!session) return <Navigate to="/" replace />;

    return <>{children}</>;
}
