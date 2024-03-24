const { db } = require("@vercel/postgres");
const fs = require("fs");
const axios = require("axios");
const { parse } = require("csv-parse");
const { unfurl } = require("unfurl.js");
const dotenv = require("dotenv");
const cheerio = require("cheerio");

dotenv.config();

const csvFile = "/512566_2024_jan.csv";

async function main() {
    const csvData = [];

    const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    parser.on("readable", function () {
        let data;
        while ((data = parser.read()) !== null) {
            csvData.push(data);
        }
    });

    // Catch any error
    parser.on("error", function (err) {
        console.error(err.message);
    });

    parser.on("end", function () {
        // console.log(csvData);
    });

    // open the file and pipe it into the parser
    fs.createReadStream(__dirname + csvFile).pipe(parser);

    const client = await db.connect();

    await client.sql`
      CREATE TABLE IF NOT EXISTS frames (
        id BIGINT PRIMARY KEY,
        fid BIGINT,
        title TEXT NOT NULL,
        description TEXT,
        url TEXT NOT NULL UNIQUE,
        hash BYTEA NOT NULL UNIQUE,
        timestamp TIMESTAMP WITHOUT TIME ZONE,
        imageUrl TEXT
      );
    `;

    let savedCastsCount = 0;
    let castsCount = 0;

    for (const row of csvData) {
        console.log(`${++castsCount} of ${csvData.length}`);
        try {
            let r = /\B'|'\B/g;
            embeds = row.embeds.replace(r, '"');
            const urls = JSON.parse(embeds);

            for (const urlObj of urls) {
                const url = urlObj.url;
                const result = await validateUrl(url);

                if (Object.keys(result).length === 0) continue;

                const isValid = result.valid;

                if (!isValid) continue;

                console.log("is valid:", result.title);

                await client.sql`
                    INSERT INTO frames (id, title, description, url, imageUrl, fid, hash, timestamp)
                    VALUES (${row.id}, ${result.title}, ${
                    result.description
                }, ${url}, ${result.image}, ${row.fid}, ${
                    row.hash
                }, ${convertToISO(row.timestamp)})
                    ON CONFLICT (url) DO NOTHING;
                `;

                savedCastsCount++;
            }
        } catch (err) {
            console.error(err, embeds);
        }

        castsCount++;
    }

    await client.end();
    console.log(`Saved ${savedCastsCount} valid casts to database`);
}

function convertToISO(dateString) {
    const parts = dateString.match(/(\d{2})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2})/);

    const year = parseInt(parts[3], 10) + 2000;
    const month = parts[2];
    const day = parts[1];
    const hours = parts[4];
    const minutes = parts[5];

    // Constructing ISO 8601 format date string
    const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;

    return isoDate;
}

async function validateUrl(url) {
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

        const image = $('meta[property="og:image"]').attr("content");

        if (!image || Object.keys(results).length !== 2) {
            return { valid: false };
        }

        return {
            ...results,
            title: $('meta[property="og:title"]').attr("content"),
            description:
                $('meta[property="og:description"]').attr("content") || "",
            image,
            valid: true,
        };
    } catch (error) {
        console.error("Error validating frame properties:", error);
        return {
            valid: false,
        };
    }
}

main().catch((err) => console.error(err));
