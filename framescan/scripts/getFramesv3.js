const { db } = require("@vercel/postgres");
const fs = require("fs");
const axios = require("axios");
const { parse } = require("csv-parse");
const dotenv = require("dotenv");
const cheerio = require("cheerio");

dotenv.config();

const csvFile = "/512590_2024_feb_01_10.csv";

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

    await client.query(`
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
  `);

    const validationPromises = csvData.flatMap((row) =>
        JSON.parse(row.embeds.replace(/\B'|'\B/g, '"')).map((urlObj) =>
            validateUrl(urlObj.url).then((result) =>
                result.valid
                    ? insertIntoFrames(client, row, result, urlObj.url)
                    : null
            )
        )
    );

    const results = await Promise.allSettled(validationPromises);
    const savedCastsCount = results.filter(
        (r) => r.status === "fulfilled"
    ).length;
    console.log(`Saved ${savedCastsCount} valid casts to database`);

    await client.end();
}

async function insertIntoFrames(client, row, result, url) {
    const isoTimestamp = convertToISO(row.timestamp);
    await client.query(
        `
    INSERT INTO frames (id, title, description, url, imageUrl, fid, hash, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (url) DO NOTHING;
  `,
        [
            row.id,
            result.title,
            result.description,
            url,
            result.image,
            row.fid,
            row.hash,
            isoTimestamp,
        ]
    );
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
            title:
                $('meta[property="og:title"]').attr("content") ||
                $("title").text(),
            description:
                $('meta[property="og:description"]').attr("content") ||
                $('meta[name="description"]').attr("content") ||
                "",
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
