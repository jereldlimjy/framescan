// pages/api/frames.ts
import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";

const prisma = new PrismaClient();

// Assuming your Frame model is similar to the one described earlier
type Frame = {
    id: number;
    fid: number;
    title: string;
    description?: string | null;
    url: string;
    hash: Buffer;
    timestamp: Date;
    imageurl?: string | null;
};

export async function GET(
    req: NextApiRequest,
    res: NextApiResponse<Frame[] | { message: string }>
) {
    const frames = await prisma.frame.findMany({
        take: 500,
        orderBy: {
            timestamp: "desc",
        },
    });

    const convertedFrames = frames.map((frame) => ({
        ...frame,
        fid: Number(frame.fid),
        id: Number(frame.id),
    }));

    return Response.json(convertedFrames);
}
