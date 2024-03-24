// pages/api/frames.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

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
    req: NextRequest,
    res: NextResponse<Frame[] | { message: string }>
) {
    const frames = await prisma.frame.findMany({
        take: 1500,
        orderBy: {
            timestamp: "desc",
        },
    });

    const uniqueFrames = [];
    const titles = new Set();

    for (const frame of frames) {
        if (!titles.has(frame.title)) {
            uniqueFrames.push(frame);
            titles.add(frame.title);
        }
        if (uniqueFrames.length >= 500) break; // Stop once you have 500 unique titles
    }

    const convertedFrames = uniqueFrames.map((frame) => ({
        ...frame,
        fid: Number(frame.fid),
        id: Number(frame.id),
    }));

    return Response.json(convertedFrames);
}
