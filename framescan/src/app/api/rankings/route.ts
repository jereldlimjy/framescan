import { NextRequest, NextResponse } from "next/server";
import { unfurl } from "unfurl.js";

export async function GET(
    req: NextRequest,
    res: NextResponse<{ message: string }>
) {
    const rankingResults = await fetch(
        "https://graph.cast.k3l.io/frames/global/rankings"
    );

    const urlData = await rankingResults.json();
    const frameDatas = [];

    for (const data of urlData.result.slice(0, 10)) {
        try {
            const result = await unfurl(data.url);
            const frameData = {
                title: result.title,
                description: result.description || "",
                url: data.url || "",
                imageurl: result.open_graph?.images?.[0]?.url || "",
            };
            console.log(result);
            frameDatas.push(frameData);
        } catch (err) {
            console.error(err);
        }
    }

    return Response.json(frameDatas);
}
