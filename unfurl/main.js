import { unfurl } from "unfurl.js";

async function main() {
    const result = await unfurl("https://farhack.xyz");

    console.log(result.twitter_card);
}

main().catch((err) => {
    console.log(err);
});
