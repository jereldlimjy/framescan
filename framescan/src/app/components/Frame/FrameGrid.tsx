"use client";

import { useEffect, useState } from "react";
import Searchbar from "../Searchbar";
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
        const response = await fetch("https://framescan.vercel.app/api/frames");
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

const debounce = (func: any, wait: number) => {
    let timeout: any;
    return function executedFunction(...args: any[]) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const FrameGrid = () => {
    const [allFrames, setAllFrames] = useState([]);
    const [filteredFrames, setFilteredFrames] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const frameRes = await getFrames();
            setAllFrames(frameRes);
        };

        if (searchQuery === "") {
            fetchData();
        }
    }, []);

    const debouncedSearch = debounce(async () => {
        const filteredFrames = allFrames.filter((frame: any) => {
            return frame.title
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
        });

        setFilteredFrames(filteredFrames);
    }, 300); // 300 ms delay

    useEffect(() => {
        if (searchQuery !== "") {
            debouncedSearch(searchQuery);
        }
    }, [searchQuery]);

    return (
        <>
            <Searchbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <div className="container mx-auto px-8 -my-12">
                {!!allFrames.length ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-12 pb-8">
                        {searchQuery.length === 0
                            ? allFrames.map((frameData: any, id: number) => (
                                  <FrameCard key={id} data={frameData} />
                              ))
                            : filteredFrames.map(
                                  (frameData: any, id: number) => (
                                      <FrameCard key={id} data={frameData} />
                                  )
                              )}
                    </div>
                ) : (
                    <div className="flex mx-auto w-max">
                        <p className="text-3xl">loading...</p>{" "}
                    </div>
                )}
            </div>
        </>
    );
};

export default FrameGrid;
