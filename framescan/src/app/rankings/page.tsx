import FrameCard from "@/app/components/Frame/FrameCard";
import Navbar from "../components/Navbar";
import { Analytics } from "@vercel/analytics/react";

const getFrames = async () => {
    try {
        const response = await fetch(
            "https://framescan.vercel.app/api/rankings"
        );
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        return data;
    } catch (err) {
        console.error(err);
        return [];
    }
};

const Rankings = async () => {
    const frames = await getFrames();

    return (
        <main className="flex flex-col min-h-screen">
            <Navbar />
            <div className="container mx-auto px-8 my-24">
                <div className="mx-auto w-max mb-8">
                    <p className="text-4xl">Global Frames Leaderboard</p>
                </div>
                {frames.length ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 pb-8">
                        {frames.map((frameData: any, id: number) => (
                            <FrameCard key={id} data={frameData} idx={id + 1} />
                        ))}
                    </div>
                ) : (
                    <div className="flex mx-auto w-max">
                        <p className="text-3xl">loading...</p>{" "}
                    </div>
                )}
            </div>
            <Analytics />
        </main>
    );
};

export default Rankings;
