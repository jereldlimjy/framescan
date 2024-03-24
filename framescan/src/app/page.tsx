import FrameGrid from "./components/Frame/FrameGrid";
import Navbar from "./components/Navbar";
import { Analytics } from "@vercel/analytics/react";

export default function Home() {
    return (
        <main className="flex min-h-screen">
            <Navbar />
            <FrameGrid />
            <Analytics />
        </main>
    );
}
