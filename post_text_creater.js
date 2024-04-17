const axios = require('axios');
const https = require('https');
const { subDays, format } = require('date-fns');

const createText = async () => {

    const instance = axios.create({
      httpsAgent: new https.Agent({  
        rejectUnauthorized: false
      })
    });
    
    const oilSynonyms = () => {
      const txt1 = Math.random() <= 0.2 ? "#2 " : "";
  
      let txt2 = "";
      let randomNumber = Math.random();
      if (randomNumber <= 0.3) {
        txt2 =  "residential ";
      } else if (randomNumber <= 0.6) {
        txt2 =  "home ";
      }
  
      let txt3 = ""
      randomNumber = Math.random();
      if (randomNumber <= 0.5) {
        txt3 =  "heating ";
      } else if (randomNumber <= 0.7) {
        txt3 =  "fuel ";
      }
  
      return txt1 + txt2 + txt3 + "oil";
    }
    const roseSynonyms = () => {
      const actions = ["rose", "climbed", "increased", "ascended", "advanced"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const riseSynonyms = () => {
      const actions = ["rise", "climb", "increase", "ascend", "advance"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const fallSynonyms = () => {
      const actions = ["fall", "dip", "drop", "pull back"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const fellSynonyms = () => {
      const actions = ["fell", "dipped", "dropped", "pulled back"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const inTheLastSynonyms = () => {
      const actions = ["in the last", "over the past"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const changedSynonyms = () => {
      const actions = ["changed", "moved", "progressed"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const continuesSynonyms = () => {
      const actions = ["continues", "extends"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const reversesSynonyms = () => {
      const actions = ["reverses","doubles back"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const residentsSynonyms = () => {
      const actions = ["residents", "homeowners"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const taglineSynonyms = () => {
      const actions = ["HeatFleet.com's local heating oil deal search saves homeowners as much as $100 per delivery all winter long.", "Homeowners like you save big with HeatFleet.com's local heating oil deal search.", "Save hundreds of dollars a month when you price-shop for heating oil with HeatFleet.com's local heating oil price search."];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const holdSteadySynonyms = () => {
      const actions = ["hold steady", "unchanged"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
    const heldSteadySynonyms = () => {
      const actions = ["held steady", "unchanged"];
      const randomIndex = Math.floor(Math.random() * actions.length);
      return actions[randomIndex];
    }
  
    function toTitleCase(inputString) {
      // Split the string into words
      const words = inputString.split(' ');
    
      // Capitalize the first letter of each word
      const titleCaseWords = words.map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
    
      // Join the words back together
      const titleCaseString = titleCaseWords.join(' ');
    
      return titleCaseString;
    }
  
    const datewords = (daysAgo) => {
      const currentDate = new Date();
  
      // Calculate the date by subtracting the given number of days
      const calculatedDate = subDays(currentDate, daysAgo);
  
      // Format the date in the specified format (e.g., "December 13th, 2023")
      const formattedDate = format(calculatedDate, 'MMMM do, yyyy');
  
      return formattedDate;
    }
    const datenumbers = (daysAgo) => {
      const currentDate = new Date();
  
      // Calculate the date by subtracting the number of days
      const calculatedDate = new Date(currentDate);
      calculatedDate.setDate(currentDate.getDate() - daysAgo);
  
      // Format the date as "MM/DD/YY"
      const formattedDate = new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' }).format(calculatedDate);
  
      return formattedDate;
    }
  
    const reqPrice = async (level, locationHash, county, quantity, priceType, paymentMethod, daysback) => {
      const baseUrl = `https://dev-api.heatfleet.com/api/prices?level=${level}&locationHash=${locationHash}&county=${county}&quantity=${quantity}&priceType=${priceType}&paymentMethod=${paymentMethod}&daysback=${daysback}`;
  
      try {
        const response = await instance.get(baseUrl);
        // console.log('Response:', response.data);
        return (response.data.price.toFixed(2));
      } catch (error) {
        console.error('Error:', error.message);
        throw error; // Re-throw the error to handle it further upstream if needed
      }
    }
  
    const p1 = (await reqPrice(0, null, null, null, "average", "credit", 1));
    const p2 = await reqPrice(0, null, null, null, "average", "credit", 7);
    const p3 = Number(Math.abs((p1 - p2) * 100).toFixed(0));
  
    //!if(PricePerGallon[US,100,average,credit,0]-!PPG[US,100,average,credit,7]>0,[*rise],[*fall] !PPG[US,100,average,credit,0]-!PPG[US,100,average,credit,7]*100 cents per gaillon
    let txt1 = `${oilSynonyms()} prices ${p1 - p2 == 0 ? holdSteadySynonyms() : (p1 - p2 > 0 ? riseSynonyms() : fallSynonyms()) + ` $${Math.abs(p1 - p2).toFixed(2)} per gallon`}`;
    txt1 = toTitleCase(txt1);
  
    // Weekly Oil Price Update - [*datewords,0]
    let txt2 = `Weekly Oil Price Update - ${datewords(0)}`;
    txt2 = toTitleCase(txt2);
  
    const p4 = p1;
    const p5 = p2;
  
    //[*In the last] week, retail [*oil] prices [if(PricePerGallon[US,100,average,credit,0]-!PPG[US,100,average,credit,7]>0,[*rose],[*fell]] !PPG[US,100,average,credit,0]-!PPG[US,100,average,credit,7]*100 cents per gallon. The national average oil price [*changed] from !PPG[USA,100,average,credit,7] on !Date(7) to !PPG[USA,100,average,credit,0] today.
    let txt3 = `Sponsored by: HeatFleet.com Local Heating Oil Deal Search\n\n${inTheLastSynonyms().replace(/^\w/, c => c.toUpperCase())} week, retail ${oilSynonyms()} prices ${p1 - p2 == 0 ? heldSteadySynonyms() + ` at $${(Number(p4)).toFixed(2)}` : (p1 - p2 > 0 ? roseSynonyms() : fellSynonyms()) + ` ${p3} cents`} per gallon. The national average oil price ${changedSynonyms()} from $${(Number(p5)).toFixed(2)} on ${datewords(7)} to $${(Number(p4)).toFixed(2)} today.\n`;
  
    let txt4 = "Regional Heating Oil Price Per Gallon Trends";
  
    const LIA = await reqPrice(2, 1, null, null, "average", "credit", 1);
    const LIC = ((LIA - await reqPrice(2, 1, null, null, "average", "credit", 7)).toFixed(2));
    const NYA = await reqPrice(1, "NY", null, null, "average", "credit", 1);
    const NYC = ((NYA - await reqPrice(1, "NY", null, null, "average", "credit", 7)).toFixed(2));
    const MA = await reqPrice(1, "MA", null, null, "average", "credit", 1);
    const MC = ((MA - await reqPrice(1, "MA", null, null, "average", "credit", 7)).toFixed(2));
    const CA = await reqPrice(1, "CT", null, null, "average", "credit", 1);
    const CC = ((CA - await reqPrice(1, "CT", null, null, "average", "credit", 7)).toFixed(2));
  
    //Week of [*datenumbers,7] - [*datenumbers,0]
    let txt5 = `One Week Change (week of ${datenumbers(7)} - ${datenumbers(0)})\nLong Island: $${(Number(LIA)).toFixed(2)} ${LIC == 0 ? "-- UNCHANGED" : `${LIC > 0 ? "↑ UP" : "↓ DOWN"} $${Math.abs(LIC).toFixed(2)}`}\nNew York: $${(Number(NYA)).toFixed(2)} ${NYC == 0 ? "-- UNCHANGED" : `${NYC > 0 ? "↑ UP" : "↓ DOWN"} $${Math.abs(NYC).toFixed(2)}`}\nMassachusetts: $${(Number(MA)).toFixed(2)} ${MC == 0 ? "-- UNCHANGED" : `${MC > 0 ? "↑ UP" : "↓ DOWN"} $${Math.abs(MC).toFixed(2)}`}\nConnecticut: $${(Number(CA)).toFixed(2)} ${CC == 0 ? "-- UNCHANGED" : `${CC > 0 ? "↑ UP" : "↓ DOWN"} $${Math.abs(CC).toFixed(2)}`}\n`;
  
    const p6 = await reqPrice(0, null, null, null, "average", "credit", 30); //PPG[US,100,average,credit,30]
    const LI30 = await reqPrice(2, 1, null, null, "average", "credit", 30);
    //[*Location] [*Oil] Price Trends
    let txt6 = toTitleCase(`Long Island ${oilSynonyms()} Price Trends`);
  
    //Average [*oil] prices in [*Location] [if(PricePerGallon[LongIsland,100,average,credit,0]-!PPG[LongIsland,100,average,credit,7]>0,[*rose],[*fell]] from !PPG[LongIsland,100,average,credit,7] to !PPG[LongIsland,100,average,credit,0] [*in the last] seven days.This [*continues]/[*reverses] the longer term 30 day trend where [*location] [*residents] have seen the price per gallon of [*oil] [*rise]/[*fall] by [PPG[US,100,average,credit,0]-!PPG[US,100,average,credit,30]*100] cents.
    let txt7 = `Average ${oilSynonyms()} prices in Long Island ${LIC == 0 ? holdSteadySynonyms() + ` at $${(Number(LIA)).toFixed(2)}` : (LIC > 0 ? roseSynonyms() : fellSynonyms()) + ` from $${((LIA - LIC).toFixed(2))} to $${(Number(LIA)).toFixed(2)}`} ${inTheLastSynonyms()} seven days.\n${LIC == 0 ? "Over the longer term, in the last month," : "This " + ((LIC > 0 && LIA - LI30 > 0) || (LIC < 0 && LIA - LI30 < 0) ? continuesSynonyms() : reversesSynonyms()) + " the longer term 30-day trend where"} Long Island ${residentsSynonyms()} have seen the price per gallon ${LI30 - LIA == 0 ? holdSteadySynonyms() + " at $" + (Number(LIA).toFixed(2)) : (`of ${oilSynonyms()} ${LIA - LI30 > 0 ? riseSynonyms() : fallSynonyms()} by ${Math.round(Math.abs(LIA - LI30) * 100)} cents`)}.\n`;
  
    const NY30 = await reqPrice(1, "NY", null, null, "average", "credit", 30);
    let txt8 = toTitleCase(`New York ${oilSynonyms()} Price Trends`);
    let txt9 = `Average ${oilSynonyms()} prices in New York ${NYC == 0 ? holdSteadySynonyms() + ` at $${(Number(NYA)).toFixed(2)}` : (NYC > 0 ? roseSynonyms() : fellSynonyms()) + ` from $${((NYA - NYC).toFixed(2))} to $${(Number(NYA)).toFixed(2)}`} ${inTheLastSynonyms()} seven days.\n${NYC == 0 ? "Over the longer term, in the last month," : "This " + ((NYC > 0 && NYA - NY30 > 0) || (NYC < 0 && NYA - NY30 < 0) ? continuesSynonyms() : reversesSynonyms()) + " the longer term 30-day trend where"} New York ${residentsSynonyms()} have seen the price per gallon ${NYA - NY30 == 0 ? holdSteadySynonyms() + " at $" + (Number(NYA).toFixed(2)) : (`of ${oilSynonyms()} ${NYA - NY30 > 0 ? riseSynonyms() : fallSynonyms()} by ${Math.round(Math.abs(NYA - NY30) * 100)} cents`)}.\n`;
    
    const M30 = await reqPrice(1, "MA", null, null, "average", "credit", 30);
    let txt10 = toTitleCase(`Massachusetts ${oilSynonyms()} Price Trends`);
    let txt11 = `Average ${oilSynonyms()} prices in Massachusetts ${MC == 0 ? holdSteadySynonyms() + ` at $${(Number(MA)).toFixed(2)}` : (MC > 0 ? roseSynonyms() : fellSynonyms()) + ` from $${((MA - MC).toFixed(2))} to $${(Number(MA)).toFixed(2)}`} ${inTheLastSynonyms()} seven days.\n${MC == 0 ? "Over the longer term, in the last month," : "This " + ((MC > 0 && MA - M30 > 0) || (MC < 0 && MA - M30 < 0) ? continuesSynonyms() : reversesSynonyms()) + " the longer term 30-day trend where"} Massachusetts ${residentsSynonyms()} have seen the price per gallon ${MA - M30 == 0 ? holdSteadySynonyms() + " at $" + (Number(MA).toFixed(2)) : (`of ${oilSynonyms()} ${MA - M30 > 0 ? riseSynonyms() : fallSynonyms()} by ${Math.round(Math.abs(MA - M30) * 100)} cents`)}.\n`;
    
    const C30 = await reqPrice(1, "CT", null, null, "average", "credit", 30);
    let txt12 = toTitleCase(`Connecticut ${oilSynonyms()} Price Trends`);
    let txt13 = `Average ${oilSynonyms()} prices in Connecticut ${CC == 0 ? holdSteadySynonyms() + ` at $${(Number(CA)).toFixed(2)}` : (CC > 0 ? roseSynonyms() : fellSynonyms()) + ` from $${((CA - CC).toFixed(2))} to $${(Number(CA)).toFixed(2)}`} ${inTheLastSynonyms()} seven days.\n${CC == 0 ? "Over the longer term, in the last month," : "This " + ((CC > 0 && CA - C30 > 0) || (CC < 0 && CA - C30 < 0) ? continuesSynonyms() : reversesSynonyms()) + " the longer term 30-day trend where"} Connecticut ${residentsSynonyms()} have seen the price per gallon ${CA - C30 == 0 ? holdSteadySynonyms() + " at $" + (Number(CA).toFixed(2)) : (`of ${oilSynonyms()} ${CA - C30 > 0 ? riseSynonyms() : fallSynonyms()} by ${Math.round(Math.abs(CA - C30) * 100)} cents`)}.\n`;
  
    let txt14 = taglineSynonyms();
  
    return (txt1 + "\n\n" + txt2 + "\n" + txt3 + "\n" + txt4 + "\n" + txt5 + "\n" + txt6 + "\n" + txt7 + "\n" + txt8 + "\n" + txt9 + "\n" + txt10 + "\n" + txt11 + "\n" + txt12 + "\n" + txt13 + "\n" + txt14);
}

module.exports = createText;

// (async function t(){
//   console.log(await createText());
// })();