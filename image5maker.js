const { createCanvas, loadImage } = require('canvas');
const fs = require('fs');
const axios = require('axios');
const https = require('https');

// General function to modify an image
async function modifyImage(inputImagePath, outputImagePath, operationCallback) {
  try {
    // Load the image
    const image = await loadImage(inputImagePath);

    // Create a canvas matching the image size
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    // Draw the image on the canvas
    ctx.drawImage(image, 0, 0, image.width, image.height);

    // Perform the custom operation
    await operationCallback(ctx);

    // Save the canvas as a new image
    const outputStream = fs.createWriteStream(outputImagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(outputStream);

    // Return a promise that resolves when the image is saved
    return new Promise((resolve, reject) => {
      outputStream.on('finish', () => resolve());
      outputStream.on('error', (error) => reject(error));
    });
  } catch (error) {
    console.error('Error:', error.message);
    throw error; // Rethrow the error for the caller to handle, if necessary
  }
}

// Operation: Adding heading text
function addHeadingText(ctx) {

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const headingText = 'Heat Fleet Pricing';
    const fontSize = width/12;
    const fontFamily = 'HK Grotesk';
    const textColor = 'black';

    const xPosition = (width) / 2;
    const yPosition = height/10;

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(headingText, xPosition, yPosition);
}

function addSubHeading(ctx){
    function getFormattedDate() {
        const today = new Date();
        const month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
        const day = today.getDate().toString().padStart(2, '0');
        return `${month}/${day}`;
      }

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const headingText = `${getFormattedDate()} - 100 gal. order`;
    const fontSize = width/24;
    const fontFamily = 'HK Grotesk';
    const textColor = 'black';

    const xPosition = (width) / 2;
    const yPosition = height/7;

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.fillText(headingText, xPosition, yPosition);
}

function addFooter1(ctx){
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const xPosition = (width) / 50;
    const yPosition = height * 0.99;

    const logoImagePath = 'Images/Logos/HeatFleet_Logo.png';
    const logoWidth = width/20;
    loadImage(logoImagePath).then((logo) => {
        ctx.drawImage(logo, xPosition, yPosition - logoWidth*0.8, logoWidth, logoWidth);
    })

    const footerText = `Heat Fleet`;
    const fontSize = width/25;
    const fontFamily = 'HK Grotesk';
    const textColor = 'black';

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "left";
    ctx.fillText(footerText, xPosition + logoWidth, yPosition);
}

function addFooter2(ctx){
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const xPosition = (width) * 49 / 50;
    const yPosition = height * 0.99;

    const footerText = `HeatFleet.com`;
    const fontSize = width/25;
    const fontFamily = 'HK Grotesk';
    const textColor = 'black';

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "right";
    ctx.fillText(footerText, xPosition, yPosition);
}

async function getPrices(locations){

    const instance = axios.create({
        httpsAgent: new https.Agent({  
          rejectUnauthorized: false
        })
      });

    const reqPrice = async (level, locationHash, county, quantity, priceType, paymentMethod, daysback) => {
        const baseUrl = `https://dev-api.heatfleet.com/api/prices?level=${level}&locationHash=${locationHash}&county=${county}&quantity=${quantity}&priceType=${priceType}&paymentMethod=${paymentMethod}&daysback=${daysback}`;
    
        try {
          const response = await instance.get(baseUrl);
          console.log('Response:', locationHash, response.data);
          return (response.data.price.toFixed(3));
        } catch (error) {
          console.error('Error:', error.message);
          throw error; // Re-throw the error to handle it further upstream if needed
        }
      }

    const priceAmount = async (hash) => {
      let saving = 0;
      if(hash != "LI"){
        price = (await reqPrice(1, hash, null, 100, "average", "best", 0) - 0)
      }
      else{
        price = (await reqPrice(2, 1, null, 100, "average", "best", 0) - 0)
      }
      return price.toFixed(2);
    }

    // const locations = ["NY", "CT", "MA", "PA", "ME", "LI"]

    let result = []
    for(let i = 0; i < locations.length; ++i){
      result.push(await priceAmount(locations[i]))
    }

    return result;

    // (1, "CT", null, 100, high, best, 0) - (1, "CT", null, 100, low, best, 0)
    // NY, CT, MA, PA, ME, LI
}

async function addContent(ctx){
    const row = 2, col = 3;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // ctx.textAlign = "center";

    const locations = ["NY", "CT", "MA", "PA", "ME", "LI"]
    // const saveAmounts = await getPrices(locations);
    const saveAmounts = [ '3.63', '3.50', '3.66', '3.66', '3.50', '3.58' ];
    console.log(saveAmounts);

    for (let i = 0; i < row; i++) {
        for (let j = 0; j < col; j++) {
            const logoImagePath = `Images/Logos/${locations[i*col+j]}.png`;
            const logo = await loadImage(logoImagePath);

            let logoWidth = width/5.5;
            let logoHeight = (logo.height / logo.width) * logoWidth
            // let logoHeight = (3 / 4) * width/5.5;
            // let logoWidth = (logo.width / logo.height) * logoHeight;

            let x = width * (j + 1) / 4 - logoWidth/2;
            let y = height/4 * (i + 1) - height*0.08;

            if(locations[i*col+j] ==  'ME'){
              logoHeight = (3 / 4) * width/5.5;
              logoWidth = (logo.width / logo.height) * logoHeight;

              ctx.drawImage(logo, x + logoWidth/2.5, y + logoHeight*0.3, logoWidth, logoHeight);
            }
            else if(locations[i*col+j] ==  'LI'){
              const zoom = 1.2;
              ctx.drawImage(logo, x - logoWidth * (zoom - 1) * 0.5, y + logoHeight*0.5, logoWidth * zoom, logoHeight * zoom);
            }
            else if(locations[i*col+j] ==  'MA'){
              const zoom = 1.2;
              ctx.drawImage(logo, x - logoWidth * (zoom - 1) * 0.3, y + logoHeight*0.4, logoWidth * zoom, logoHeight * zoom);
            }
            else{
              ctx.drawImage(logo, x, y + logoHeight*0.3, logoWidth, logoHeight);
            }

            x = x + width/11;
            y = y + (width/5.5) * 1.3;

            const text = `AVG`;
            let fontSize = width/25;
            const fontFamily = 'HK Grotesk';
            const textColor = 'rgba(0, 0, 0, 0.7)';

            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.fillStyle = textColor;
            ctx.textAlign = "center";
            ctx.fillText(text, x, y);

            y = y + width/17;

            fontSize = width/16;
            ctx.font = `bold ${fontSize}px ${fontFamily}`;

            const savings = saveAmounts[i*col+j]
            ctx.fillText(savings, x, y);

            const priceTextWidth = ctx.measureText(savings).width;
            x = x - priceTextWidth/2;
            y -= width/50;

            fontSize = width/25;
            ctx.font = `bold ${fontSize}px ${fontFamily}`;
            ctx.textAlign = "right";

            ctx.fillText("$", x, y);
        }
    }
}

// Main execution function
async function makeImage5() {
  try {
    const inputImagePath = 'Images/Backgrounds/InstaBackground002CorrectDim.jpg';
    const outputImagePath = 'Images/Result/image_5.jpg';

    await modifyImage(inputImagePath, outputImagePath, async (ctx) => {

      addHeadingText(ctx);
      addSubHeading(ctx);
      addFooter1(ctx);
      addFooter2(ctx);
      await addContent(ctx);
    });

    console.log('Image 5 modification completed successfully');
    return outputImagePath;
  } catch (error) {
    console.error('Error in main:', error);
    throw error;
  }
}

// makeImage5();

module.exports = makeImage5;