const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');

const insta_poster = require("./insta_poster.js");
const fb_poster = require("./fb_poster.js");
const twitter_poster = require("./twitter_poster.js");
const createText = require("./post_text_creater.js")
const imgs_maker = require("./imgs_maker.js");

console.log('Script Started...');

// const env = "dev";
const env = "prod";

async function sendEmail(env, text, imgPaths) {
    if (env === "dev") return;
    try {
        let transporter = nodemailer.createTransport({
            host: 'mail.privateemail.com',
            service: 'instient', // e.g., 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: 'shreyash@instient.com',
                pass: 'Shreyash!07'
            }
        });

        // Email content
        let mailOptions = {
            from: 'shreyash@instient.com',
            to: 'dbowman@davosenergy.com',
            subject: 'Social Media Post of Heat Fleet',
            text: text,
            attachments: [
                {
                    filename: 'image1.jpg',
                    path: imgPaths[0]
                },
                {
                    filename: 'image2.png',
                    path: imgPaths[1]
                },
                {
                    filename: 'image3.png',
                    path: imgPaths[2]
                }
            ]
        };

        // Send email with attachment
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully!', info.response);
    } catch (error) {
        console.error('Error occurred on sending email:', error.message);
    }
}

const storeInDb = async (env, msg, imgUrls) => {
    if (env === "dev") return;

    const contentLines = msg.split("\n");
    let title, subTitle, sponsor;
    if(contentLines.length > 3){
        title = contentLines[0];
        subTitle = contentLines[2];
        sponsor = contentLines[3];
    }
    msg = contentLines.slice(5).join('\n');

    const price = contentLines[5].split(' ')[contentLines[5].split(' ').length - 2];
    const images = [];
    const today = new Date();
    const threeMonthBackDate = new Date();
    const date7DaysBack = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    threeMonthBackDate.setMonth(threeMonthBackDate.getMonth() - 3);
    for (let i = 0; i < imgUrls.length; i++) {
        const url = imgUrls[i];
        let title, caption = null, alt;
        if(url.includes('US_Home_Heating_Oil')){
            title = `U.S. Home Heating Oil Prices ${threeMonthBackDate.toLocaleString('en-US', { month: 'long' })} - ${today.toLocaleString('en-US', { month: 'long' })} ${today.getFullYear()}`;
            alt = `Graph showing the average U.S. home heating oil prices from ${threeMonthBackDate.toLocaleString('en-US', { month: 'long' })} to ${today.toLocaleString('en-US', { month: 'long' })} ${today.getFullYear()}, declining to ${price} per gallon.`;
        }
        else if(url.includes('US_Weekly_Heating_Oil_Trend')){
            title = `Weekly Heating Oil Price Trend ${today.toLocaleString('en-US', { month: 'long' })} ${date7DaysBack.getDate()} - ${today.getDate()}, ${today.getFullYear()}`;
            alt = `Graph of U.S. heating oil prices from ${today.toLocaleString('en-US', { month: 'long' })} ${date7DaysBack.getDate()}-${today.getDate()}, ${today.getFullYear()}, with a fuel truck. Prices fluctuate slightly around ${price}.`;
        }
        else if(url.includes('Heating_Oil_Best_Prices')){
            title = `Heating Oil Price Trends for the Week of ${today.toLocaleString('en-US', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;
            alt = `Heating oil price trends for CT, MA, NY, and Long Island for the week of ${today.toLocaleString('en-US', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}.`;
        }

        images.push({
            url : url,
            title : title,
            caption : caption,
            alt : alt
        });
    }

    const createConnection = (host, password) => {
        return mysql.createConnection({
            host,
            user: 'sqladmin',
            password: password,
            database: 'davos',
            port: 3306
        });
    };

    const insertToDb = async (connection) => {
        try {
            await new Promise((resolve, reject) => {
                connection.connect((err) => {
                    if (err) {
                        console.error('Error connecting to MySQL: ' + err.stack);
                        reject(err);
                        return;
                    }

                    console.log('Connected to MySQL as id ' + connection.threadId);

                    const dataToInsert = {
                        Title: title,
                        Sub_Title: subTitle,
                        Sponsor: sponsor,
                        Text: msg,
                        Date: today
                    };

                    connection.query('INSERT INTO socialMediaPosts SET ?', dataToInsert, (err, results) => {
                        if (err) {
                            console.error('Error executing INSERT query: ' + err.stack);
                            reject(err);
                            return;
                        }

                        console.log('Data inserted to socialMediaPosts successfully. Inserted ID: ' + results.insertId);
                        resolve();

                        images.forEach(img => {
                            const dataToInsertImages = {
                                Post_Id: results.insertId,
                                Img_Url: img.url,
                                Title: img.title,
                                Caption: img.caption,
                                Alt_Text: img.alt
                            };
        
                            connection.query('INSERT INTO Social_Media_Post_Images SET ?', dataToInsertImages, (err, results) => {
                                if (err) {
                                    console.error('Error executing INSERT query: ' + err.stack);
                                    reject(err);
                                    return;
                                }
        
                                console.log('Data inserted to Social_Media_Post_Images successfully. Inserted ID: ' + results.insertId);
                                resolve();
                            });
                        });

                        resolve();
                        connection.end();
                    });
                });
            });
        } catch (error) {
            console.error("Error inserting data into database:", error);
        }
    };

    // const connection1 = createConnection('localhost', 'Instient');
    // await insertToDb(connection1);
    // connection1.end();

    const connection1 = createConnection('dev-db.heatfleet.com', 'U9F74xE41S5pS60ciV6jei1Ko');
    await insertToDb(connection1);
    connection1.end();
    
    const connection2 = createConnection('161.35.56.53', 'QaQltObVZbUlP9d0nt70RX1EpsNNnj');
    await insertToDb(connection2);
    connection2.end();
};

async function master_poster(env) {
    // Image Making
    const {imgPaths, imgUrls} = await imgs_maker(env);

    // FB
    let text = await createText();
    fb_poster(env, text, imgPaths);

    // Insta
    text = await createText();
    insta_poster(env, text, imgUrls);
    
    storeInDb(env, text, imgUrls);
    sendEmail(env, text, imgPaths);

    // Twitter
    const twitter = async () => {
        text = await createText();
        text = text.split("\n")
        text = text[2] + "\n" + text[3] + "\n\n" + text[5];
        if(text.length > 272)   twitter();
        else    twitter_poster(env, text, imgPaths);
    }
    twitter();
}

master_poster(env);
// storeInDb('prod', "Heating Oil Prices Drop $0.01 Per Gallon\n\nWeekly Oil Price Update - July 29th, 2024\nSponsored by: HeatFleet.com Local Heating Oil Deal Search\n\nOver the past week, retail home oil prices dipped 1 cents per gallon. The national average oil price changed from $3.28 on July 22nd, 2024 to $3.27 today.\n\nRegional Heating Oil Price Per Gallon Trends\nOne Week Change (week of 07/22/24 - 07/29/24)\nLong Island: $3.12 ↓ DOWN $0.03\nNew York: $3.27 ↓ DOWN $0.02\nMassachusetts: $3.24 ↓ DOWN $0.02\nConnecticut: $3.13 -- UNCHANGED\n\nLong Island #2 Heating Oil Price Trends\nAverage residential fuel oil prices in Long Island dipped from $3.15 to $3.12 in the last seven days.\nThis extends the longer term 30-day trend where Long Island residents have seen the price per gallon of home heating oil dip by 4 cents.\n\nNew York Oil Price Trends\nAverage oil prices in New York pulled back from $3.29 to $3.27 over the past seven days.\nThis extends the longer term 30-day trend where New York homeowners have seen the price per gallon of #2 heating oil fall by 5 cents.\n\nMassachusetts Home Oil Price Trends\nAverage heating oil prices in Massachusetts pulled back from $3.26 to $3.24 in the last seven days.\nThis extends the longer term 30-day trend where Massachusetts residents have seen the price per gallon of heating oil dip by 4 cents.\n\nConnecticut Residential Heating Oil Price Trends\nAverage #2 residential heating oil prices in Connecticut hold steady at $3.13 over the past seven days.\nOver the longer term, in the last month, Connecticut residents have seen the price per gallon of #2 heating oil drop by 1 cents.\n\nHeatFleet.com's local heating oil deal search saves homeowners as much as $100 per delivery all winter long.", ['https://media-cdn.heatfleet.com/socialMediaPosts/US_Home_Heating_Oil_2024_06_17.jpg', 'https://media-cdn.heatfleet.com/socialMediaPosts/US_Weekly_Heating_Oil_Trend_2024_06_17.jpg', 'https://media-cdn.heatfleet.com/socialMediaPosts/Heating_Oil_Best_Prices_2024_06_17.jpg'])