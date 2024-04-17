const { TwitterApi } = require("twitter-api-v2");
const fs = require("fs");
const path = require("path");

const postToTwitter = async (env, msg, imgPaths) => {
    let client = new TwitterApi({
        appKey: "ZvaHqGH55KsAZpwNMLrCzr7aF",
        appSecret: "eUyc1GKYYx6cInNSxANW2qIHB8axd30HrG3Yd8YWsWsHqiddoO",
        accessToken: "1735296950902087680-ODl4pKaV1yDqkg2cWPdmK06t65BvOW",
        accessSecret: "vU06iN5awgD6fGiiAdxcwStHIXkgWPaU6N2cX6MpTntJV"
    });

    if (env == "prod") {
        client = new TwitterApi({
            appKey: "wYPKVJrMX03oAf1uDHgyr4Ty0",
            appSecret: "LQKt39eGaL92POpiAE1lTGHM92WCh2MUZXau2Y5VChJ4mKdPQq",
            accessToken: "1615349544455213057-UrfwnDBq8Yqmhg983wj9eeAsjrZOnK",
            accessSecret: "1MXzat4ZuHNj2PCtNpoA0sM6yjSx0630BwOO7enqZQtwY",
        });
    }

    const twitterClient = client.readWrite;

    const uploadMedia = async (twitterClient, filePath) => {
        const mediaData = fs.readFileSync(filePath);
        const mediaType = path.extname(filePath).slice(1); // Extracts file extension and removes the dot
        const response = await twitterClient.v1.uploadMedia(mediaData, { mimeType: `image/${mediaType}` });
        return response;
    };

    try {
        // Step 1: Upload all images and get their media IDs
        const mediaIds = await Promise.all(imgPaths.map(imgUrl => uploadMedia(twitterClient, imgUrl)));

        // Step 2: Tweet with the text and media IDs
        const result = await twitterClient.v2.tweet(msg, { media: { media_ids: mediaIds } });
        console.log("Tweeted Successfully: ", result);
    } catch (e) {
        console.log("Error creating tweet: " + e);
    }
};

module.exports = postToTwitter;