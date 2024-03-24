const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const dotenv = require("dotenv");

dotenv.config();

const csvFile = "/512566_2024_jan.csv";

async function main() {
    console.log(await validateFrameProperties("https://mint.farcaster.xyz/"));
}

async function validateFrameProperties(url) {
    try {
        const { data: htmlContent } = await axios.get(url);
        const $ = cheerio.load(htmlContent);
        const metaTags = $("meta");

        const requiredProperties = {
            "fc:frame": (content) => content === "vNext",
            "fc:frame:image": (content) => !!content,
            "og:image": (content) => !!content,
        };

        const results = {};

        metaTags.each((i, tag) => {
            const name = $(tag).attr("name");
            const content = $(tag).attr("content");

            if (requiredProperties[name] && requiredProperties[name](content)) {
                results[name] = content;
            }
        });

        console.log($("title").text());

        const image = $('meta[property="og:image"]').attr("content");

        if (!image || Object.keys(results).length !== 2) {
            return { isValid: false };
        }

        return {
            ...results,
            title: $('meta[property="og:title"]').attr("content"),
            description:
                $('meta[property="og:description"]').attr("content") || "",
            image,
            isValid: true,
        };
    } catch (error) {
        console.error("Error validating frame properties:", error);
        return {
            isValid: false,
        };
    }
}

main().catch((err) => console.error(err));
