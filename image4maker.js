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
async function addHeadingText(ctx) {

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  // const headingText = 'Heating Oil';
  // const fontSize = width/11;
  // const fontFamily = 'HK Grotesk';
  // const textColor = 'black';

  // const xPosition = (width) / 2;
  // const yPosition = height/10;

  // ctx.font = `bold ${fontSize}px ${fontFamily}`;
  // ctx.fillStyle = textColor;
  // ctx.textAlign = "center";
  // ctx.fillText(headingText, xPosition, yPosition);

  const logoImagePath = 'Images/Logos/HeatFleet_Logo.png';
    const logo = await loadImage(logoImagePath);
    const logoWidth = 75;
  
    ctx.fillStyle = 'black';
    ctx.font = 'bold 50px HK Grotesk';
            
    let heading = "HeatFleet.com";
  
    // Calculate the total width occupied by the logo and the heading
    const totalWidth = logoWidth + ctx.measureText(heading).width;
  
    // Calculate the starting position to center them on the page
    const startX = (width - totalWidth) / 2;
  
    // Draw the logo
    ctx.textAlign = 'left';
    ctx.drawImage(logo, startX, height * 0.06 - logoWidth * 0.55, logoWidth, logoWidth);
  
    // Draw the heading
    ctx.fillText(heading, startX + logoWidth, height * 0.06);
  
    heading = "Local Heating Oil Deal Finder";
    ctx.font = 'bold 25px HK Grotesk';
    ctx.textAlign = 'center';
    ctx.fillText(heading, (width + logoWidth) / 2, height*0.06 + 30);
  
    heading = "Heating Oil";
    ctx.font = 'bold 60px HK Grotesk';
    ctx.fillText(heading, width / 2, height*0.075 + 100);
  
    heading = "1 Week Trend";
    ctx.font = 'bold 35px HK Grotesk';
    ctx.fillText(heading, width / 2, height*0.075 + 150);
}

// function addSubHeading(ctx){

//   const width = ctx.canvas.width;
//   const height = ctx.canvas.height;

//   const headingText = "1 Week Trend";
//   const fontSize = width/17;
//   const fontFamily = 'HK Grotesk';
//   const textColor = 'black';

//   const xPosition = (width) / 2;
//   const yPosition = height/6.4;

//   ctx.font = `bold ${fontSize}px ${fontFamily}`;
//   ctx.fillStyle = textColor;
//   ctx.textAlign = "center";
//   ctx.fillText(headingText, xPosition, yPosition);
// }

// function addFooter1(ctx){
//     const width = ctx.canvas.width;
//     const height = ctx.canvas.height;

//     const xPosition = (width) / 50;
//     const yPosition = height * 0.99;

//     const logoImagePath = 'Images/Logos/HeatFleet_Logo.png';
//     const logoWidth = width/20;
//     loadImage(logoImagePath).then((logo) => {
//         ctx.drawImage(logo, xPosition, yPosition - logoWidth*0.8, logoWidth, logoWidth);
//     })

//     const footerText = `Heat Fleet`;
//     const fontSize = width/25;
//     const fontFamily = 'HK Grotesk';
//     const textColor = 'black';

//     ctx.font = `bold ${fontSize}px ${fontFamily}`;
//     ctx.fillStyle = textColor;
//     ctx.textAlign = "left";
//     ctx.fillText(footerText, xPosition + logoWidth, yPosition);
// }

// function addFooter2(ctx){
//     const width = ctx.canvas.width;
//     const height = ctx.canvas.height;

//     const xPosition = (width) * 49 / 50;
//     const yPosition = height * 0.99;

//     const footerText = `Local Oil Price Search`;
//     const fontSize = width/25;
//     const fontFamily = 'HK Grotesk';
//     const textColor = 'black';

//     ctx.font = `bold ${fontSize}px ${fontFamily}`;
//     ctx.fillStyle = textColor;
//     ctx.textAlign = "right";
//     ctx.fillText(footerText, xPosition, yPosition);
// }

const instance = axios.create({
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false
  })
});

const reqPrice = async (level, locationHash, county, quantity, priceType, paymentMethod, daysback) => {
  const baseUrl = `https://dev-api.heatfleet.com/api/prices?level=${level}&locationHash=${locationHash}&county=${county}&quantity=${quantity}&priceType=${priceType}&paymentMethod=${paymentMethod}&daysback=${daysback}`;

  try {
    const response = await instance.get(baseUrl);
    // console.log('Response:', locationHash, response.data.price);
    return (response.data.price.toFixed(3));
  } catch (error) {
    console.error('Error:', error.message);
    throw error; // Re-throw the error to handle it further upstream if needed
  }
}

async function getBestPrices(locations){

    const priceAmount = async (hash) => {
      let bestPrice = 0;
      if(hash != "LI"){
        bestPrice = (await reqPrice(1, hash, null, 100, "low", "best", 1))
      }
      else{
        bestPrice = (await reqPrice(2, 1, null, 100, "low", "best", 1))
      }
      return bestPrice;
    }

    let result = []
    for(let i = 0; i < locations.length; ++i){
      result.push(await priceAmount(locations[i]))
    }

    return result;

    // (1, "CT", null, 100, high, best, 0) - (1, "CT", null, 100, low, best, 0)
    // NY, CT, MA, PA, ME, LI
}

async function getWeekChanges(locations){
  async function weekChange(hash){
    let weekChangePrice = 0;
      if(hash != "LI"){
        weekChangePrice = (await reqPrice(1, hash, null, null, "average", "best", 1) - await reqPrice(1, hash, null, null, "average", "best", 7))
      }
      else{
        weekChangePrice = (await reqPrice(2, 1, null, null, "average", "best", 1) - await reqPrice(2, 1, null, null, "average", "best", 7))
      }
      return (weekChangePrice * 100).toFixed(0);
  }

  let result = [];
  for (let i = 0; i < locations.length; i++) {
    result.push(await weekChange(locations[i]))
  }
  return result;
}

async function addContent(ctx){
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // ctx.textAlign = "center";

    const locations = ["CT", "MA", "NY", "LI"]
    const bestPrices = await getBestPrices(locations);
    // const bestPrices = [ '2.990', '3.160', '2.640', '2.640' ];
    // console.log(bestPrices);

    for (let i = 0; i < locations.length; i++) {
        let x = width * (i + 1) / 5 + i*width/50;
        let y = height/3.9;

        let fontSize = width/18;
        const fontFamily = 'HK Grotesk';
        const textColor = 'black';

        let text = Number(bestPrices[i]).toFixed(2);
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(text, x, y);

        x -= ctx.measureText(text).width/2;
        y -= width/50;

        fontSize = width/30;
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.textAlign = "right";

        ctx.fillText("$", x, y);

        x += ctx.measureText(text).width * 1.65;
        ctx.textAlign = "left";

        ctx.fillText(Math.floor(bestPrices[i] * 1000) % 10, x, y);

        const logoImagePath = `Images/Logos/${locations[i]}.png`;
        const logo = await loadImage(logoImagePath);

        const logoWidth = width/7;
        const logoHeight = (logo.height / logo.width) * logoWidth
        // const logoHeight = (3 / 4) * logoWidth

        x = width * (i + 1) / 5 + i*width/50 - logoWidth/2;
        y = height/3.4;
        
        if(locations[i] ==  'LI'){
          const zoom = 1.3;
          ctx.drawImage(logo, x - logoWidth * (zoom - 1) * 0.5, y*1.04, logoWidth * zoom, logoHeight * zoom);
        }
        else if(locations[i] ==  'MA'){
          const zoom = 1.3;
          ctx.drawImage(logo, x - logoWidth * (zoom - 1) * 0.3, y, logoWidth * zoom, logoHeight * zoom);
        }
        else{
          ctx.drawImage(logo, x, y, logoWidth, logoHeight);
        }

    }
    
    function xLabels(){
      let x = width/15;
      let y = height/4.2;

      let fontSize = width/40;
      const fontFamily = 'HK Grotesk';
      const textColor = 'black';

      let text = "Best";
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(text, x, y);

      y += fontSize;

      text = "Price";
      ctx.fillText(text, x, y);

      y = height/2.1;

      text = "1 Week";
      ctx.fillText(text, x, y);

      y += fontSize;

      text = "Change";
      ctx.fillText(text, x, y);
    }
    xLabels();

    function drawArrow(x, y, length, value) {
      const arrowColor = value == 0 ? 'black' : value > 0 ? 'red' : 'green';

      // Set arrow properties
      ctx.strokeStyle = arrowColor;
      ctx.fillStyle = arrowColor;
      ctx.lineWidth = width/20;

      length += ctx.lineWidth;
      y += (height/7 - length) / 2;

      // Draw the vertical line of the arrow
      ctx.beginPath();
      if(value > 0){
        ctx.moveTo(x, y + ctx.lineWidth);
        ctx.lineTo(x, y + length);
      }
      else if(value < 0){
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + length  - ctx.lineWidth);
      }
      else{
        y += height/50;
        ctx.lineWidth = width/15;
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + ctx.lineWidth * 0.1);
      }
      ctx.stroke();

      // Draw the arrowhead
      ctx.beginPath();
      if (value>0) {
        ctx.moveTo(x, y);
        ctx.lineTo(x - ctx.lineWidth, y + ctx.lineWidth);
        ctx.lineTo(x + ctx.lineWidth, y + ctx.lineWidth);
      } else if (value<0) {
        ctx.moveTo(x, y + length);
        ctx.lineTo(x - ctx.lineWidth, y + length - ctx.lineWidth);
        ctx.lineTo(x + ctx.lineWidth, y + length - ctx.lineWidth);
      }
      ctx.fill();
    }

    const weekChange = await getWeekChanges(locations);
    // // console.log(weekChange);
    // const weekChange = [ '-20', '0', '1', '3' ];

    function drawArrows() {
      let maxVal = Math.max(...weekChange.map(change => Math.abs(parseInt(change))));
      if(maxVal == 0){
        for(let i = 0; i < weekChange.length; ++i){
          const x = width*(i+1)/5 + i*width/50;
          const y = height/2.3 + (height/7 - width/30)/2;

          drawArrow(x, y, 0, 0);
        }
      }
      else{
        maxVal = maxVal < 20 ? 20 : maxVal;
        for(let i = 0; i < weekChange.length; ++i){
          const value = parseInt(weekChange[i]);
          const length = Math.abs((value / maxVal) * (height/7));

          const x = width*(i+1)/5 + i*width/50;
          const y = height/2.4;

          drawArrow(x, y, length, value);
        }
      }
    }
    drawArrows();

    function writePriceChanges(){
      for (let i = 0; i < weekChange.length; i++) {
        let price = weekChange[i];
        if(price == "-0") price = "0";
        
        const x = width*(i+1)/5 + i*width/50;
        const y = height/1.55;

        let fontSize = width/18;
        const fontFamily = 'HK Grotesk';
        const textColor = 'black';

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(price + "¢", x, y);
      }
    }
    writePriceChanges();
}

// Main execution function
async function makeImage4() {
  try {
    const randomNumber = () => Math.floor(Math.random() * 11) + 1;

    const inputImagePath = `Images/Backgrounds/Background${randomNumber()}.jpg`;
    const outputImagePath = 'Images/Result/image_4.jpg';

    await modifyImage(inputImagePath, outputImagePath, async (ctx) => {

      await addHeadingText(ctx);
      // addSubHeading(ctx);
      // addFooter1(ctx);
      // addFooter2(ctx);
      await addContent(ctx);
    });

    console.log('Image 4 modification completed successfully');
    return outputImagePath;
  } catch (error) {
    console.error('Error in main:', error);
    throw error;
  }
}

// makeImage4();
module.exports = makeImage4;