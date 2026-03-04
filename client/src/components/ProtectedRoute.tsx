import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const user = null; // your auth logic here

    if (!user) {
        return <div>Please login</div>;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
