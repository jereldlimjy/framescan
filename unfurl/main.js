import { unfurl } from "unfurl.js";

async function main() {
    const result = await unfurl("https://stats-frame.degen.tips/");

    console.log(result.open_graph);
}

main().catch((err) => {
    console.log(err);
});
