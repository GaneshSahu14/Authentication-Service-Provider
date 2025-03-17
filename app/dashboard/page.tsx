// app/dashboard/page.tsx
import { auth } from "@/auth";

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="flex h-screen items-center justify-center">
            <h1>Welcome to the Dashboard</h1>
            <pre>{JSON.stringify(session, null, 2)}</pre>
        </div>
    );
}