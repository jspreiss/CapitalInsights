// Create the backend server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let formData = ""; // Variable to store the form data

async function findPriceSq(address) {

    //console.log('starting findPriceSq with addr:', address);

    let addr = address;
  let filter = "&excludeUndisclosedRate=true&types%5B%5D=Retail&types%5B%5D=Restaurant";
  let loc = "&placeIds%5B%5D=ChIJIQBpAG2ahYAR_6128GcTUEo";

  addr = addr.replaceAll(" ", "%20");

  const fs = require('fs');
  const puppeteer = require('puppeteer');

  //console.log(addr);

  async function run() {
    const browser = await puppeteer.launch({headless : 'new'});
    const page = await browser.newPage();
    await page.goto('https://www.crexi.com/lease/properties?sort=Relevance&term=' + addr + filter + loc);

    await page.waitForSelector('span.price');
    const spanText = await page.$eval('span.price', (span) => span.textContent);
    await page.waitForSelector('div.property-details.ng-star-inserted');
    const detailsText = await page.$eval('div.property-details.ng-star-inserted', (div) => div.textContent);

    console.log('Text within span:', spanText);
    console.log('Text within span:', detailsText);
    await browser.close();

    // Parse spanText
    let numStr = "";
    for (let char of spanText) {
        if (!isNaN(char) || (char === '-' && !numStr)) {  // Allow negative sign at the beginning
            numStr += char;
        } else if (numStr) {
            break;  // Stop when a non-digit is encountered after the number
        }
    }
    //console.log('number parsed:', numStr);
    let returnVal = 0;
    if (numStr) {
        returnVal = parseInt(numStr, 10);
    } else {
        returnVal = null;  // Return null if no integer is found
    }

    let timeRate = (spanText.charAt(spanText.length - 1) == 'R') ? 12 : 1;
    console.log('timerate', timeRate);
    returnVal = returnVal / timeRate;
    console.log('returnval:', returnVal);

    // Parse detailsText
    let inputString = detailsText;
    let lowerBound = 0;
    let upperBound = 0;
    // Define a regular expression to match numbers with commas and periods
    const regex = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?) sq\. ft\. - (\d{1,3}(?:,\d{3})*(?:\.\d+)?) sq\. ft\./;

    // Use the regular expression to extract matches from the input string
    const match = inputString.match(regex);

    if (match && match.length >= 3) {
        // The first captured group is the lower bound, and the second is the upper bound
        lowerBound = parseFloat(match[1].replace(/,/g, ''));
        upperBound = parseFloat(match[2].replace(/,/g, ''));
    } else {
        // Return null if no match is found
        lowerBound = null;
        upperBound = null;
    }
    console.log('upper:', upperBound, 'lower:', lowerBound);

    return {
        price: returnVal,
        lower: lowerBound,
        upper: upperBound
    };
  }
  let p = await run();
  return p;

}

async function getUpdatedToken() {
    //Set up URL to query
    let appId = "2hz7e4tiy3";
    let hashToken = "Mmh6N2U0dGl5M3xySm9XUVJ4S3pTMXVTYzA1T1duZUoxOW15SEVPMHpsWDVzSnh2RzZ2";
    let url = `https://api.iq.inrix.com/auth/v1/appToken?appId=${appId}&hashToken=${hashToken}`;

    //Set up query method
    var requestOptions = {
        method: 'GET'
    };

    //Query INRIX for token
    let responseToken = await fetch(url, requestOptions);
    let json = await responseToken.json();
    
    return json;
}

// Find the latitude and longitude based on address
async function findLatLong(address) {

    //console.log('starting findLatLong with address:', address);

    const geocodeAPIkey = "c61726c4e1c641249c8c39c657e51ea5";
    let url = `https://api.opencagedata.com/geocode/v1/json?key=${geocodeAPIkey}&q=${address.data}`;

    var requestOptions = {
        method: 'GET'
    };

    let latlong = await fetch(url, requestOptions);
    let json = await latlong.json();
    //console.log('this is the json:', json.results[0]);

    let numResults = json.total_results;
    if (numResults == 0) {
        console.log("nothing found :(");
        return {lat: 0, lng: 0};
    } else {
        let coords = json.results[0].geometry;
        //console.log('these are the coords:', coords);
        return coords;
    }
}

// Call the INRIX API using the form data
async function pullINRIXData(coords) {

    //console.log('Coords used for INRIX API call:', coords);
    
    // Hard-coded authentication token
    //const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjJoejdlNHRpeTMiLCJ0b2tlbiI6eyJpdiI6IjQxYWI5MDBhMzlhYTQ0ODBlZDY5YWE0YTQ0YWYyYmYyIiwiY29udGVudCI6IjkwYjZmMDBkMjRlMzEwZDA5M2NiNjVmNWRhYjA5ODNjZDEwMTFiOGE4MjUxYmE1NDljMGEwNzMwYzU2MmYzNTQ2MWMyNmYwNDU0YmE1Yjc0Njg2YjEwMGFiZjlkMTNkOGEzZDkxNDFkYzQ1Y2U3NjkzOGY4ZWFkMDBjNWMxNWU5MGU4Y2MwZjYxNmQyNjc4N2RjYjUyZTQyYmVjN2MyMzk0YTlhNDI2YTRmYmQzMTc4ZjYyZjE1ZmY4NWQwNTk3NWJkMmNjZjliM2U3NDI3M2NkZDkwNzA0MzZjMGY1MTk0MzllMzM3NzNkYzcyYjM0YjYzNmIyNjk3ZDk3YjRmOTI1ZjcyMjJiNThkZjY3Zjg3OTJkYjZiNzQ5N2MwOGI3MmM5YmMxYWUxZTZjZTVjMDVlMTQyZTNhOWRmMzg3NjgxNDYxMzRkMDBkNjVkZGEzZTQxZDQ0MGM0MDAxN2UxMTYzMGUzZjNiYWM2ZmU5ZDU2NDRhYmY1YjAzNGUxNjIzZWM1YjIwMWZkY2E4YjQ1MGE0ZDZlYjRiNDhkMjFhNGY2YjU2MDc2ODE3NzQ5ZDEwODViNTRkNTZhYTEyMDI4YjI3MTFiNzNmOTA1MmQxM2U5ZjAyYzc1NzExMmIwNDE0ZjU4MGU3NDM4ZDQ3ZDVkMDcwY2M3YWY2ZGJmOWNhNjY3Mzc4ODY5N2U5ZWNhMDg4ZGUxY2E5NDMzZDE3YzMxNWE5OTU4N2I4ZmI2YTc5MjQ5YmIzMjE3ZTQwZWY1MTdjNTk3YjE2MTM4MmRiYjU1MjQ4YWY0NjcwYmYwN2NkM2YyY2VkYTYwMjEyYjgzMmJkNWY1YWRkODhkYjU2ZjYwYTcxMDE3OGFhZjNiYjFlNDNlODEzZDNhIn0sInNlY3VyaXR5VG9rZW4iOnsiaXYiOiI0MWFiOTAwYTM5YWE0NDgwZWQ2OWFhNGE0NGFmMmJmMiIsImNvbnRlbnQiOiJiMTk2Y2Y0ZjFmY2YxOWZjYThmMDFkOGJkZTg1OTg0N2VkMmEyNzk3OTk0Njg3MzdhOTNkMGIzNGExNjRlZDRlNTNmMzUwN2Y0MzllNWE3OTQ2N2I2ODM0In0sImp0aSI6IjRkYjBiNzNjLTdhNTItNGI0Ny05N2IzLWNmMmZiM2VjNDdmNCIsImlhdCI6MTY5OTc1NzI2MSwiZXhwIjoxNjk5NzYwODYxfQ._rKRaX7aiO8vHFVRQjNfLfgaZXzuB6zkCxqgqjqDQvE";
    const token = (await getUpdatedToken()).result.token;
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    // Other parameters
    let radius = 100;
    let coord1 = coords.lat;
    let coord2 = coords.lng;

    // if invalid input
    if (coord1 == 0) {
        return {count: "n/a"}
    }

    // Call the API with the url and fetch the data
    let url = `https://api.iq.inrix.com/v1/trips-count?od=destination&geoFilterType=circle&radius=${radius}m&points=${coord1}%7C${coord2}&limit=1000&startDateTime=%3E%3D2023-06-01T02%3A31&endDateTime=%3C%3D2023-06-15T02%3A31`;
    let responseTrips = await fetch(url, requestOptions);
    let json = await responseTrips.json();

    return json;
  }
  
  // Function to process form data
  async function processFormData(formData) {
    try {

      //console.log('Processing form data:', formData);

      // Modify the input: replace all spaces with plus signs
      let formattedaddress = formData.data.replace(/\s/g, '+');
      //console.log('new string', formattedaddress);

      // Find the price per square ft
      const priceSq = await findPriceSq(formData.data);
  
      // Make the API calls
      const coords = await findLatLong(formData);
      const tripcount = await pullINRIXData(coords);

      // Evaluate the property based on traffic data and price
      const score = (-(priceSq.price-3.41)/1.22+1.5*(tripcount.count-76.6)/38.75)*1.35+5;

      //console.log('Continuing processing with API response:', apiResponse);
      //console.log('Number of trips that', formData.data, 'made:', apiResponse.count);

      const data = {
        address: formData.data,
        price: priceSq.price,
        upper: priceSq.upper,
        lower: priceSq.lower,
        lat: coords.lat,
        lng: coords.lng,
        tripcount: tripcount.count,
        score: score
      }

      return data;
    }
    catch (error) {
      console.error('Error during form data processing:', error);
      throw error;
    }
  }

// CALLED WHEN FORM IS SUBMITTED
app.post('/submit-form', async (req, res) => {

    // Get the form data
    formData = req.body;
    //console.log('Received form data:', formData);
    
    try {

        // Call the processFormData function and wait for its completion
        const result = await processFormData(formData);
        //console.log('finished processing form data');

        console.log('result:', result);
        // Send the API response back to the frontend
        res.json({
            message: 'Form data received successfully!',
            address: result.address,
            upper: result.upper,
            lower: result.lower,
            price: result.price,
            lat: result.lat,
            lng: result.lng,
            tripcount: result.tripcount,
            score: result.score
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
