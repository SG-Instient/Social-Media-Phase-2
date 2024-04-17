const axios = require('axios');
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const { log } = require('console');

const makeImage1 = async () => {
    const randomNumber = () => Math.floor(Math.random() * 10) + 1;

    const loadBackgroundImage = async () => {
        const backgroundImagePath = `Images/Backgrounds/Background${randomNumber()}.jpg`;
        return await loadImage(backgroundImagePath);
    };

    const fetchData = async () => {
        try {
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
            const response = await axios.get('https://api.heatfleet.com/api/company/account/pricehistory', config);
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error.message);
            throw error;
        }
    };

    const drawSmoothCurve = async (dataPoints, canvas, ctx, months, monthIndices) => {
        const margin = 80;
        const marginY = canvas.height / 3;
        const width = canvas.width - 2 * margin;
        const height = canvas.height - 2 * marginY;
        const leftShift = margin;
        const upshift = 130;

        // Wait for the background image to load
        const img = await backgroundImage;

        // Draw background image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        (async function drawHeader(){
            const logoImagePath = 'Images/Logos/HeatFleet_Logo.png';
            const logo = await loadImage(logoImagePath);
            const logoWidth = 75;
  
            ctx.fillStyle = 'black';
            ctx.font = 'bold 50px HK Grotesk';
            
            let heading = "HeatFleet.com";
  
            // Calculate the total width occupied by the logo and the heading
            const totalWidth = logoWidth + ctx.measureText(heading).width;
  
            // Calculate the starting position to center them on the page
            const startX = (canvas.width - totalWidth) / 2;
  
            // Draw the logo
            ctx.textAlign = 'left';
            ctx.drawImage(logo, startX, height * 0.2 - logoWidth * 0.55, logoWidth, logoWidth);
  
            // Draw the heading
            ctx.fillText(heading, startX + logoWidth, height * 0.2);
  
            heading = "Local Heating Oil Deal Finder";
            ctx.font = 'bold 25px HK Grotesk';
            ctx.textAlign = 'center';
            ctx.fillText(heading, (canvas.width + logoWidth) / 2, height*0.2 + 30);
  
            heading = "U.S. Home Heating Oil";
            ctx.font = 'bold 60px HK Grotesk';
            ctx.fillText(heading, canvas.width / 2, height*0.3 + 100);
  
            heading = "Avg. Price per Gallon";
            ctx.font = 'bold 35px HK Grotesk';
            ctx.fillText(heading, canvas.width / 2, height*0.3 + 150);
        })();
  
        (function drawGraph(){
            let lastx = 0, lasty = 0, xhigh = 0, yhigh = 0, xlow = 0, ylow = 0;
  
            // Find the minimum and maximum values of the dataPoints
            const minValue = Math.min(...dataPoints);
            const maxValue = Math.max(...dataPoints);
  
            // Calculate the range and scale factor
            const range = maxValue - minValue;
            const scaleFactor = height*0.9  / range;
  
            function drawCurve() {
                // Draw smooth curve
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 6;
                ctx.beginPath();
  
                
                for (let i = 0; i < dataPoints.length; i++) {
                    const x = margin + (i / (dataPoints.length - 1)) * width - leftShift;
                    const y = marginY + height - scaleFactor * (dataPoints[i] - minValue) - upshift;
  
                    if (i === 0) {
                        ctx.moveTo(x - leftShift, y);
                    } else {
                        // Calculate control point for smooth curve
                        const cx = x - (x - (margin + (i - 1) / (dataPoints.length - 1) * width - leftShift)) / 2;
                        const cy = y - (y - (marginY + height - scaleFactor * (dataPoints[i - 1] - minValue) - upshift)) / 2;
  
                        // Draw smooth curve segment
                        ctx.quadraticCurveTo(cx, cy, x, y);
                    }
                    lastx = x;
                    lasty = y;
                    if(dataPoints[i] == minValue){
                        xlow = x;
                        ylow = y;
                    }
                    if(dataPoints[i] == maxValue){
                        xhigh = x;
                        yhigh = y;
                    }
                }
  
                ctx.stroke();
            }
            drawCurve();
  
            function writeLastPrice(){
                ctx.fillStyle = 'black';
                // ctx.font = '20px HK Grotesk';
                ctx.textAlign = 'left';
  
                // ctx.fillText("$", lastx + 5, lasty);
                ctx.font = '40px HK Grotesk';
  
                const lastData = dataPoints[dataPoints.length - 1].toFixed(2);
                ctx.fillText("$"+lastData, lastx + 15, lasty + 10);
            }
            writeLastPrice();
  
            function writeLowPrice() {
                ctx.textAlign = 'center';
                ctx.fillText("$"+minValue.toFixed(2) , xlow - 10, ylow + 55);
            }
            if(dataPoints.slice(0, 11).indexOf(minValue) == -1 && dataPoints.slice(-5).indexOf(minValue) == -1)
              writeLowPrice();
            
            function writeHighPrice() {
                ctx.textAlign = 'center';
                ctx.fillText("$"+maxValue.toFixed(2) , xhigh - 5, yhigh - 20);
            }
            if(dataPoints.slice(0, 11).indexOf(maxValue) == -1 && dataPoints.slice(-5).indexOf(maxValue) == -1)
              writeHighPrice();
  
            function drawXLabels(params) {
                // Draw month labels
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.font = '35px HK Grotesk';
                ctx.textAlign = 'center';
                for (let i = 0; i < monthIndices.length; i++) {
                    let monthIndex = monthIndices[i];
                    if((i == 0 && monthIndices[i+1] - monthIndex < 10) || (i == monthIndices.length - 1 && monthIndex - monthIndices[i+1] < 10)) continue;
                    monthIndex += 8;
                    const x = margin + (monthIndex / (dataPoints.length - 1)) * width - leftShift;
  
                    // Use the month from the months array
                    ctx.fillText(months[i], x, canvas.height/1.55); // Adjust Y-coordinate as needed
                }
            }
            drawXLabels();
  
            function drawYLabels(params) {
                // Draw month labels
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.font = '35px HK Grotesk';
                ctx.textAlign = 'left';
  
                // Round each value to the nearest integer
                const roundedValues = dataPoints.map(value => (value.toFixed(1)));
  
                // Use a Set to ensure unique values and convert back to an array
                const yLabels = [...new Set(roundedValues)];
  
                for (let i = 0; i < yLabels.length; i++) {
                    const y = marginY + height - scaleFactor * (yLabels[i] - minValue) - upshift;
                    
                    ctx.fillText('$' + Number(yLabels[i]).toFixed(2), 20, y);
                }
            }
            drawYLabels();
            
        })();
    };

    const saveAndUploadImage = async (canvas) => {
        const outputImagePath = 'Images/Result/image_1.jpg';
        const stream = fs.createWriteStream(outputImagePath);
        const streamOut = canvas.createPNGStream();

        await new Promise((resolve) => {
            streamOut.pipe(stream);
            stream.on('finish', () => {
                console.log('Image 1 modification completed successfully');
                resolve();
            });
        });
        return outputImagePath;
    };

    const backgroundImage = await loadBackgroundImage();

    if (!backgroundImage) {
        console.error('Error loading background image');
        return;
    }

    const dataPoints = await fetchData();

    if (!dataPoints) {
        console.error('Error fetching data');
        return;
    }

    const img = await backgroundImage;
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');

    let months = [];
    let monthIndices = [];
    let lastMonth = null;

    dataPoints.forEach((item, index) => {
        const date = new Date(item.date);
        const month = date.toLocaleString('default', { month: 'short' });
        if (month !== lastMonth) {
            months.push(month);
            monthIndices.push(index);
            lastMonth = month;
        }
    });

    await drawSmoothCurve(dataPoints.map(item => item.price), canvas, ctx, months, monthIndices);
    return await saveAndUploadImage(canvas);
};

// makeImage1();
module.exports = makeImage1;