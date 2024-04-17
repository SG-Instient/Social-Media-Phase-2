const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const fs = require('fs-extra');

const insta_poster = require("./insta_poster.js");
const fb_poster = require("./fb_poster.js");
const twitter_poster = require("./twitter_poster.js");
const createText = require("./post_text_creater.js")
const imgs_maker = require("./imgs_maker.js");

console.log('Script Started...');

const env = "dev";
// const env = "prod";

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

    const createConnection = (host) => {
        return mysql.createConnection({
            host,
            user: 'sqladmin',
            password: 'ohG1baechufeeVohc5aa',
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
                        Env: env,
                        Img1Url: imgUrls[0],
                        Img3Url: imgUrls[1],
                        Img4Url: imgUrls[2],
                        Text: msg,
                        Date: new Date().toISOString().split('T')[0]
                    };

                    connection.query('INSERT INTO socialMediaPosts SET ?', dataToInsert, (err, results) => {
                        if (err) {
                            console.error('Error executing INSERT query: ' + err.stack);
                            reject(err);
                            return;
                        }

                        console.log('Data inserted successfully. Inserted ID: ' + results.insertId);
                        resolve();

                        // Close the connection after the query is executed
                        connection.end();
                    });
                });
            });
        } catch (error) {
            console.error("Error inserting data into database:", error);
        }
    };

    const connection1 = createConnection('dev-db.heatfleet.com');
    await insertToDb(connection1);
    connection1.end();
    
    const connection2 = createConnection('161.35.56.53');
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