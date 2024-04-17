var ImageKit = require("imagekit");
const fs = require('fs');

const makeImage1 = require("./image1maker.js");
const makeImage2 = require("./image2maker.js");
const makeImage3 = require("./image3maker.js");
const makeImage4 = require("./image4maker.js");
const makeImage5 = require("./image5maker.js");

async function uploadToImageKit(env, imagePath) {
    try {
        let folderPath = '/tempInsta/';
        if (env == "prod") folderPath = '/socialMediaPosts/';

        const imagekit = new ImageKit({
            publicKey: 'public_aJrh4fnXRZbr+vn+AoN9VzhNmqY=',
            privateKey: 'private_r72WT4yQ5QqGau6N5l00ncMCc5Y=',
            urlEndpoint: 'https://ik.imagekit.io/nearme',
        });

        const imageData = fs.readFileSync(imagePath);

        const result = await new Promise((resolve, reject) => {
            imagekit.upload({
                file: imageData, // required
                fileName: `my_upload_${new Date(Date.now()).toLocaleString('en-US')}.jpg`, // required
                folder: folderPath
            }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });

        // console.log("Image uploaded successfully:", result);
        return result.url;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw err;
    }
}

function rotateArrayByWeekNumber(array) {
    const currentDate = new Date();
    const weekNumber = getWeekNumber(currentDate);
    const rotation = weekNumber % array.length;
    return rotateArrayByAmount(array, rotation);
}

function rotateArrayByAmount(array, amount) {
    const rotatedArray = [];
    const totalItems = array.length;
    for (let i = 0; i < totalItems; i++) {
        const newIndex = (i + amount) % totalItems;
        rotatedArray[newIndex] = array[i];
    }
    return rotatedArray;
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

const allImageMaker = async (env) =>{
    try {
        let promises = [makeImage1(), makeImage3(), makeImage4()]
    
        let imgPaths = await Promise.all(promises);

        imgPaths = rotateArrayByWeekNumber(imgPaths);
    
        console.log('Img Paths :\n', imgPaths);
    
        promises = [];
        for (let i = 0; i < imgPaths.length; ++i) {
            promises.push(uploadToImageKit(env, imgPaths[i]));
        }

        const imgUrls = await Promise.all(promises);
        console.log('Img Urls :\n', imgUrls);

        return {imgPaths, imgUrls};
        
    } catch (err) {
        console.error(err);
        throw err;
    }
}

module.exports = allImageMaker;