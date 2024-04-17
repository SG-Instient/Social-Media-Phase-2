const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const postToFB = async (env, msg, imgPaths) => {
    const postToFBIn = async (msg, imgUrls) => {
        let pageId = '204962206024781';
        let accessToken = 'EAAEqbMZB9EPABO5v6yvadM1RHfQ7zwg3Yh9HucZCZC7XkE5hRfs3vpvphr1ybahMVwZA6QHyaXdwKCnfvtN76MCZCDPrqzmrtVq3KyYOGkGtMBGoiZCceRVX2uMz9NPNIRvwZBLMl5rD8h4ddinADmxLF9UVZBlIspxwE32Ux9nD9eD07VndYp6XG7eFs9RzBt4ZD';
    
        if (env === "prod") {
            pageId = '106284748445131';
            accessToken = 'EAAvKUvSvgpoBOZCuKCMT7auRl4SsccBEQI2R5n44bhYzK2fWTQZASa8BDLUpvCyM5N47kqtF7jKILv18jVL6Oi5lqFhsDv0tbGGZBWBsb0p7630cowgYRHMyHZBGVvpZBhABUmpXOZBNUMtUUtIUekyy5tfN30F7HmtZCiIKXnOSkdIjCzxmUkgt0gfvW04eVrGtuwMoOcT9YZBhy4UZD';
        }
    
        // Step 1: Upload Photos
        const uploadedPhotoIds = await uploadPhotos(imgUrls, accessToken);
    
        // Step 2: Publish Multi-Photo Post
        if (uploadedPhotoIds.length > 0) {
            await publishMultiPhotoPost(msg, uploadedPhotoIds, pageId, accessToken);
        } else {
            console.error('No photos were successfully uploaded.');
        }
    };
    
    const uploadPhotos = async (imgUrls, accessToken) => {
        const uploadedPhotoIds = [];
    
        for (const imgUrl of imgUrls) {
            const apiUrl = `https://graph.facebook.com/v18.0/me/photos`;
    
            const postData = new FormData();
            const imgStream = fs.createReadStream(imgUrl);
    
            postData.append('published', 'false');
            postData.append('access_token', accessToken);
            postData.append('source', imgStream); // Use 'source' instead of 'url'
    
            try {
                const response = await axios.post(apiUrl, postData, {
                    headers: {
                        ...postData.getHeaders(),
                    },
                });
    
                const photoId = response.data.id;
                uploadedPhotoIds.push(photoId);
                console.log(`FB Photo uploaded successfully with ID: ${photoId}`);
            } catch (error) {
                console.error('Error uploading photo:', error.response ? error.response.data : error.message);
            }
        }
    
        return uploadedPhotoIds;
    };
    
    // Function to publish multi-photo post
    const publishMultiPhotoPost = async (msg, uploadedPhotoIds, pageId, accessToken) => {
        const apiUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`;
    
        const postData = {
            message: msg,
            access_token: accessToken,
        };
    
        // Append attached_media with uploaded photo ids
        uploadedPhotoIds.forEach((photoId, index) => {
            postData[`attached_media[${index}]`] = `{"media_fbid":"${photoId}"}`;
        });
    
        try {
            const response = await axios.post(apiUrl, null, { params: postData });
            console.log('FB Multi-Photo Post created successfully:', response.data);
        } catch (error) {
            console.error('Error creating multi-photo post:', error.response ? error.response.data : error.message);
        }
    };
    
    postToFBIn(msg, imgPaths);
}

module.exports = postToFB;