"use client";

import Link from "next/link";
import { format } from "date-fns";

const truncateDescription = (text: string, maxLength: number) => {
    const words = text.split(" ");
    if (words.length <= maxLength) {
        return text;
    }

    return `${words.slice(0, maxLength).join(" ")}...`;
};

const getClasses = (idx: number) => {
    switch (idx) {
        case 1:
            // Gold
            return "text-4xl text-gold";
        case 2:
            // Silver
            return "text-4xl text-silver";
        case 3:
            // Bronze
            return "text-4xl text-bronze";
        default:
            return "text-xl text-gray-700"; // Default style for others
    }
};

const FrameCard = ({ data, idx }: { data: any; idx?: number }) => {
    const truncatedDescription = truncateDescription(data.description, 60);

    return (
        <div className="relative p-8 rounded-xl bg-white border border-gray-200">
            <Link href={data.url} target="_blank">
                {/* <div
                        aria-hidden="true"
                        className="inset-0 absolute aspect-video border rounded-full bg-gradient-to-b from-violet-600 to-white blur-2xl opacity-20"
                    ></div> */}

                <div className="flex flex-col justify-center">
                    {!!idx && (
                        <div className="mx-auto">
                            <p className={`mb-2 ${getClasses(idx)}`}>#{idx}</p>
                        </div>
                    )}
                    <img
                        src={data.imageurl || "/placeholder.jpeg"}
                        className="overflow-hidden h-[200px] max-w"
                        onError={(e) =>
                            ((e.target as HTMLImageElement).src =
                                "/placeholder.jpeg")
                        }
                    />
                </div>

                <div className="mt-6 pb-4">
                    <p className="text-gray-700 text-lg font-medium">
                        {data.title}
                    </p>
                </div>
                <div className="flex flex-col -mb-6 py-4 border-t border-gray-200">
                    <p className="text-gray-700 text-sm">
                        {truncatedDescription}
                    </p>
                    {data.timestamp && (
                        <p className="text-sm text-gray-500 mt-1">
                            Created on:{" "}
                            {format(new Date(data.timestamp), "MMMM d, yyyy")}
                        </p>
                    )}
                </div>
            </Link>
        </div>
    );
};

export default FrameCard;
