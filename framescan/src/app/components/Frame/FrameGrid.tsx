import FrameCard from "./FrameCard";

// const getData = async () => {
//     const rankingResults = await fetch(
//         "https://graph.cast.k3l.io/frames/global/rankings"
//     );

//     const urlData = await rankingResults.json();
//     const frameDatas = [];

//     for (const data of urlData.result.slice(0, 6)) {
//         try {
//             const result = await unfurl(data.url);
//             const frameData = {
//                 title: result.title,
//                 description: result.description || "",
//                 url: data.url || "",
//                 imageUrl: result.open_graph?.images?.[0]?.url || "",
//             };

//             frameDatas.push(frameData);
//         } catch (err) {}
//     }

//     return frameDatas;
// };

const getFrames = async () => {
    try {
        const response = await fetch("/api/frames");
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

const FrameGrid = async () => {
    const frames = await getFrames();

    return (
        <div className="container mx-auto py-16 px-8">
            <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12">
                {frames.map((frameData: any, id: number) => (
                    <FrameCard key={id} data={frameData} />
                ))}
            </div>
        </div>
    );
};

export default FrameGrid;
