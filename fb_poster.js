const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const postToFB = async (env, msg, imgPaths) => {
    const postToFBIn = async (msg, imgUrls) => {
        let pageId = '204962206024781';
        let accessToken = 'EAAEqbMZB9EPABOwZBOm2SVrLUcf9cOjpr9Q96oPArfFcqZBmraQ92X95U9ZCIw8hZBqZBqioV1hnsNZBD5NpEXf3F0x5DLzZBtKIio8PPOVhCBxegZAUrhYijPvcwrqX6MDa2g3ugw43J4LZCHvvnE7eVlnbzvX7LFyo3Gqb33IdCTVIJCR0NHABXUUYHAko0kkL4ZD';
    
        if (env === "prod") {
            pageId = '106284748445131';
            accessToken = 'EAAvKUvSvgpoBO2KhsjSLwW9x8uEY7WhaTvh5gJakf1017fq8yj08Ad5WhdlkvpK1xZCtoy5e684bHZC981u9P5spFxmj8utDzU6yQLqkIafPjLYvav7r6GQCgFfnvOh6CudxTzQZBRF5KuFMZBZCPluj4BmcAg6qQzYPA6gZCHqR5wlCZAtecT5Yfi9HsYPaU5qbbUmNkT5IVkFf5cZD';
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