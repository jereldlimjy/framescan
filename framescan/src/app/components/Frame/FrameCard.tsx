"use client";

import Link from "next/link";

const truncateDescription = (text: string, maxLength: number) => {
    const words = text.split(" ");
    if (words.length <= maxLength) {
        return text;
    }

    return `${words.slice(0, maxLength).join(" ")}...`;
};

const FrameCard = ({ data }: any) => {
    console.log(data);
    const truncatedDescription = truncateDescription(data.description, 60);

    return (
        <div className="relative p-8 rounded-xl bg-white border border-gray-200">
            <Link href={data.url} target="_blank">
                <div
                    aria-hidden="true"
                    className="inset-0 absolute aspect-video border rounded-full bg-gradient-to-b from-violet-600 to-white blur-2xl opacity-25"
                ></div>
                <div className="flex justify-center">
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
                <div className="flex -mb-6 py-4 border-t border-gray-200">
                    <p className="text-gray-700 text-sm">
                        {truncatedDescription}
                    </p>
                </div>
            </Link>
        </div>
    );
};

export default FrameCard;
