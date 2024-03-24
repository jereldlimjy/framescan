const { db } = require("@vercel/postgres");
const fs = require("fs");
const axios = require("axios");
const { parse } = require("csv-parse");
const { unfurl } = require("unfurl.js");
const dotenv = require("dotenv");

dotenv.config();

const csvFile = "/512631_2024_mar_20_curr.csv";

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

    const chunkSize = 1000;

    for (let i = 0; i < csvData.length; i += chunkSize) {
        const chunk = csvData.slice(i, i + chunkSize);
        console.log("chunk:", `${i} - ${i + chunkSize}`);
        await Promise.all(
            chunk.map(async (row) => {
                const urls = JSON.parse(row.embeds.replace(/\B'|'\B/g, '"'));

                return Promise.allSettled(
                    urls.map(async (urlObj) => {
                        const result = await validateUrl(urlObj.url);
                        if (
                            Object.keys(result).length === 0 ||
                            !result.frameDebug.valid
                        )
                            return null;

                        const unfurlResult = await unfurl(urlObj.url);
                        const description = unfurlResult?.description || "";

                        return client.sql`
                          INSERT INTO frames (id, title, description, url, imageUrl, fid, hash, timestamp)
                          VALUES (${row.id}, ${result.title}, ${description}, ${urlObj.url}, ${result.image}, ${row.fid}, ${row.hash}, ${row.timestamp})
                          ON CONFLICT (url) DO NOTHING;
                        `;
                    })
                );
            })
        );

        await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    await client.end();
    console.log(`Saved ${savedCastsCount} valid casts to database`);
}

async function validateUrl(url) {
    try {
        const response = await axios.post(
            `https://client.warpcast.com/v2/validate-frame`,
            { frameUrl: url },
            {
                headers: {
                    Authorization: process.env.BEARER_TOKEN,
                    Origin: "https://warpcast.com",
                    Referer: "https://warpcast.com",
                },
            }
        );

        if (!response.data) return {};

        return response.data.result;
    } catch (error) {
        console.error("Error validating URL:", error);
        return {};
    }
}

main().catch((err) => console.error(err));
