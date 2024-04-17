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
    ctx.drawImage(logo, startX, height * 0.07 - logoWidth * 0.55, logoWidth, logoWidth);
  
    // Draw the heading
    ctx.fillText(heading, startX + logoWidth, height * 0.07);
  
    heading = "Local Heating Oil Deal Finder";
    ctx.font = 'bold 25px HK Grotesk';
    ctx.textAlign = 'center';
    ctx.fillText(heading, (width + logoWidth) / 2, height*0.07 + 30);
  
    heading = "Heating Oil";
    ctx.font = 'bold 60px HK Grotesk';
    ctx.fillText(heading, width / 2, height*0.085 + 100);
  
    heading = "1 Week Trend";
    ctx.font = 'bold 35px HK Grotesk';
    ctx.fillText(heading, width / 2, height*0.085 + 150);
}

// function addSubHeading(ctx){

//     const width = ctx.canvas.width;
//     const height = ctx.canvas.height;

//     const headingText = "1 Week Trend";
//     const fontSize = width/17;
//     const fontFamily = 'HK Grotesk';
//     const textColor = 'black';

//     const xPosition = (width) / 2;
//     const yPosition = height/6.4;

//     ctx.font = `bold ${fontSize}px ${fontFamily}`;
//     ctx.fillStyle = textColor;
//     ctx.textAlign = "center";
//     ctx.fillText(headingText, xPosition, yPosition);
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

//     const footerText = `Instant Heating Oil Price Search`;
//     const fontSize = width/25;
//     const fontFamily = 'HK Grotesk';
//     const textColor = 'black';

//     ctx.font = `bold ${fontSize}px ${fontFamily}`;
//     ctx.fillStyle = textColor;
//     ctx.textAlign = "right";
//     ctx.fillText(footerText, xPosition, yPosition);
// }

async function addContent(ctx){
    async function priceData(){
      const config = {
        headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.9",
            "davos-ismobile": "false",
            "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site",
            "x-api-key": "oiwe43raiasdl4kha6sdf123",
            "Referer": "https://heatfleet.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
      };
      const response = (await axios.get('https://api.heatfleet.com/api/company/account/pricehistory', config)).data;
      
      const prices = response.map(item => item.price.toFixed(2));
        return prices.reverse().slice(0, 7).reverse();
    }
    function getLast7Days() {
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
    
      const last7Days = Array.from({ length: 11 }, (_, index) => {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() - index - 1);
    
        const dayName = daysOfWeek[currentDate.getDay()];
        if (dayName === 'Sun' || dayName === 'Sat') return null;
    
        const formattedDate = `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
    
        return [dayName, formattedDate];
      }).filter(Boolean);
    
      return last7Days.slice(0, 7).reverse();
    }
    const days = getLast7Days();
    // console.log(days);

    const prices = await priceData();
    // console.log(prices);
    // const prices = [
    //     '3.30', '3.27',
    //     '3.26', '3.17',
    //     '3.20', '3.24',
    //     '3.29'
    //   ];
      
      const width = ctx.canvas.width;
      const height = ctx.canvas.height;
      
      const barWidth = width/18;
      const barSpacing = width/17 * (7 / prices.length);
      const maxValue = Math.max(...prices.map(Number));
      const minValue = Math.min(...prices.map(Number));
      const factor = (maxValue - minValue) * 0.3;

      function writePrice(ctx, x, y, price){
        let fontSize = width/28;
        const fontFamily = 'HK Grotesk';
        const textColor = 'black';

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "left";
        ctx.fillText(price.toFixed(2), x, y);

        fontSize = width/50;
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillText("$", x - fontSize*0.6, y - fontSize * 0.5);
      }

      let i = 0;
      function writeDays(ctx, x, y) {
        let fontSize = width/28;
        const fontFamily = 'HK Grotesk';
        const textColor = 'black';

        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText(days[i][0], x, y);

        y += fontSize;

        fontSize = width/40;
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillText(days[i][1], x, y);

        i++;
      }
      
      function roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        ctx.arcTo(x, y + height, x, y, radius);
        ctx.arcTo(x, y, x + width, y, radius);
        ctx.closePath();
        ctx.fill();
      }
      
      // Function to draw a vertical bar at a specific position
      function drawBar(x, value) {
        const barHeight = ((value-minValue + factor) / (maxValue-minValue + factor)) * height / 3;
        roundRect(ctx, x, (height / 1.7) - barHeight, barWidth, barHeight, barWidth/2);
        writePrice(ctx, x, (height / 1.73) - barHeight, value);
        writeDays(ctx, x + barWidth/2, height / 1.6)
      }
      
      // Set up bar color
      ctx.fillStyle = 'rgba(12, 4, 4)';
      
      // Draw bars on the canvas
      let currentX = (width - (barWidth + barSpacing) * prices.length + barSpacing) / 2;
      for (const value of prices) {
        drawBar(currentX, parseFloat(value));
        currentX += barWidth + barSpacing;
      } 
      
      function yLable() {
        const xPosition = width/15;
        let yPosition = height * 0.4;

        const fontSize = width/40;
        const fontFamily = 'HK Grotesk';
        const textColor = 'black';
        
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";

        let labelText = `U.S.`;
        ctx.fillText(labelText, xPosition, yPosition);
        yPosition += fontSize;
        labelText = `Average`;
        ctx.fillText(labelText, xPosition, yPosition);
        yPosition += fontSize;
        labelText = `per`;
        ctx.fillText(labelText, xPosition, yPosition);
        yPosition += fontSize;
        labelText = `Gallon`;
        ctx.fillText(labelText, xPosition, yPosition);
      }
      yLable();

      // function xLabel() {
        
      //   console.log(getLast7Days());
      // }
      // xLabel();
}

// Main execution function
async function makeImage3() {
  try {
    const randomNumber = () => Math.floor(Math.random() * 11) + 1;

    const inputImagePath = `Images/Backgrounds/Background${randomNumber()}.jpg`;
    const outputImagePath = 'Images/Result/image_3.jpg';

    await modifyImage(inputImagePath, outputImagePath, async (ctx) => {

      await addHeadingText(ctx);
      // addSubHeading(ctx);
      // addFooter1(ctx);
      // addFooter2(ctx);
      await addContent(ctx);
    });

    console.log('Image 3 modification completed successfully');
    return outputImagePath;
  } catch (error) {
    console.error('Error in main:', error);
    throw error;
  }
}

makeImage3();
module.exports = makeImage3;