const axios = require('axios');

const postToInsta = async (env, msg, imgUrls) => {
    let accessToken = 'EAAE4zcyR9ckBO7OSFiwazH9VeVXTOhNd4D374BnkzsPl5raFuSmmAl5F9cSfZBfZBBywabGTS14ExSEWFmJvPKriAETh2iHyQzFNaVNlHuZBAJVn0rAteghVIZC6EZApZBbwZCzYKZCF34kl6p7Gk8aml34o5u8QFnjT64pE9JuEexTwb9diUaIZCOJ3f'; // Replace with your Instagram User Access Token
    let ig_user_id = "17841463575872069";

    if(env === "prod") {
        accessToken = 'EAAKUZCBefgZBUBOxGMlBoGjgK4WcAmL85xYWKpIPp35wEriDmFeT9XRWjpyMaSDcfzwAfSOZC03ZCVUpcC9hBRemc5HnkGqVxWgvrWdEQ5Kzy6uCt6fY8iynBFuZBhNYvk9N4YZCSQ7BMymwSS7ZCxycSOmINRDuxvmPmg0hKvgAicytKB69DI6FFDIYZA1pamE70eG3haZBB';
        ig_user_id = "17841457653112981";
    }

    const apiUrl = `https://graph.facebook.com/v18.0/${ig_user_id}/media`;

    const multiple_image_data = []
    imgUrls.forEach(imgUrl => {
        multiple_image_data.push({
            image_url: imgUrl,
            caption: msg,
            access_token: accessToken
        })
    });

    try {
        const imgContainerIds = []
        for(let i = 0; i < multiple_image_data.length; ++i){
            imgContainerIds.push((await axios.post(apiUrl, null, { params: multiple_image_data[i] })).data.id);
        }

        const postData = {
            media_type: "CAROUSEL",
            caption: msg,
            access_token: accessToken,
            children: imgContainerIds
        };

        const response = await axios.post(apiUrl, null, { params: postData });
        console.log('Insta Container created successfully:', response.data);

        const postInfo = {
            creation_id: response.data.id,
            access_token: accessToken
        };

        const apiUrlPublish = `https://graph.facebook.com/v18.0/${ig_user_id}/media_publish`;

        try {
            const publishResponse = await axios.post(apiUrlPublish, null, { params: postInfo });
            console.log('Insta Media publish successful:', publishResponse.data);
            // await storeInDb(msg, imgUrls);
        } catch (publishError) {
            console.error('Error publishing Insta media:', publishError.response ? publishError.response.data : publishError.message);
            throw publishError;
        }

    } catch (error) {
        console.error('Error creating Insta container:', error.message);
    }
};

module.exports = postToInsta;
// postToInsta('prod', "test new key", ['https://ik.imagekit.io/nearme/tempInsta/my_upload_2_19_2024__1_03_14_PM_sbRe0A-1i-.jpg'])