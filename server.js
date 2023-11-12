// Create the backend server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { json } = require('body-parser');

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
    //console.log('timerate', timeRate);
    returnVal = returnVal / timeRate;
    //console.log('returnval:', returnVal);

    // Parse detailsText
    let shortdetails = detailsText.substring(0, detailsText.length - 9); // length of 'sq. ft.'
    function isNumeric(char) {
      return /^[0-9]$/.test(char);
    }
    let finalArea = shortdetails.substring(shortdetails.lastIndexOf(' ') + 1, shortdetails.length);
    if (!isNumeric(shortdetails.charAt(shortdetails.length - 1))) {finalArea = null;}
    //console.log('upper:', upperBound, 'lower:', lowerBound);

    // Parse store type
    // parse type
    let finalType = "Other";
    if (detailsText.indexOf("Retail") != -1) finalType = "Retail";
    if (detailsText.indexOf("Restaurant") != -1) finalType = "Restaurant";

    return {
        price: returnVal,
        lower: finalArea,
        upper: null,
        type: finalType
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

  async function getRefData() {
    let json = {

        list1: {
            lat: 37.79414,
            lng: -122.39858,
            rating: 9.85,
            url: 'https://www.crexi.com/lease/properties/599013/california-275-sacramento-former-walgreens'
        },
        list2: {
            lat: 37.79758,
            lng: -122.43343,
            rating: 9.12,
            url: 'https://www.crexi.com/lease/properties/674362/california-2072-union-st'
        },
        list3: {
            lat: 37.76457,
            lng: -122.43206,
            rating: 9.03,
            url: 'https://www.crexi.com/lease/properties/428720/california-2275-market-street'
        },
        list4: {
            lat: 37.71047,
            lng: -122.46747,
            rating: 8.61,
            url: 'https://www.crexi.com/lease/properties/702080/california-3931-alemany-blvd'
        },
        list5: {
            lat: 37.76683,
            lng: -122.43040,
            rating: 8.40,
            url: 'https://www.crexi.com/lease/properties/495076/california-225-7th-street'
        },
        list6: {
            lat: 37.79172,
            lng: -122.40593,
            rating: 7.91,
            url: 'https://www.crexi.com/lease/properties/642670/california-515-grant-avenue'
        },
        list7: {
            lat: 37.78096,
            lng: -122.45916,
            rating: 7.62,
            url: 'https://www.crexi.com/lease/properties/574775/california-inner-richmond-retail'
        },
        list8: {
            lat: 37.75192,
            lng: -122.42782,
            rating: 7.79,
            url: 'https://www.crexi.com/lease/properties/427906/california-retail-shop-for-lease-or-sale-in-noe-valley-san-francisco'
        }
    }
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
      const zPrice = (priceSq.price-3.41)/1.22;
      const zTrip = (tripcount.count-76.6)/38.75;
      let pcntPrice = 50;
      let pcntTrip = 50;

      switch (true) {
        case zPrice < -2.5:
          pnctPrice = 0.62;
          break;
        case zPrice < -2:
          pnctPrice = 2.27;
          break;
        case zPrice < -1.5:
          pnctPrice = 6.68;
          break;
        case zPrice < -1.25:
          pnctPrice = 9.68;
          break;
        case zPrice < -1:
          pnctPrice = 15.87;
          break;
        case zPrice < -0.75:
          pnctPrice = 21.19;
          break;
        case zPrice < -0.5:
          pnctPrice = 30.85;
          break;
        case zPrice < -0.25:
          pnctPrice = 38.21;
          break;
        case zPrice <= 0:
          pnctPrice = 50;
          break;
        case zPrice < 0.25:
          pnctPrice = 61.79;
          break;
        case zPrice < 0.5:
          pnctPrice = 69.15;
          break;
        case zPrice < 0.75:
          pnctPrice = 78.81;
          break;
        case zPrice < 1:
          pnctPrice = 84.13;
          break;
        case zPrice < 1.25:
          pnctPrice = 90.32;
          break;
        case zPrice < 1.5:
          pnctPrice = 93.32;
          break;
        case zPrice < 2:
          pnctPrice = 97.72;
          break;
        case zPrice < 2.5:
          pnctPrice = 99.38;
          break;
        default:
          pnctPrice = 99.87;
          break;
      }
      switch (true) {
        case zTrip < -2.5:
          pcntTrip = 0.62;
          break;
        case zTrip < -2:
          pcntTrip = 2.27;
          break;
        case zTrip < -1.5:
          pcntTrip = 6.68;
          break;
        case zTrip < -1.25:
          pcntTrip = 9.68;
          break;
        case zTrip < -1:
          pcntTrip = 15.87;
          break;
        case zTrip < -0.75:
          pcntTrip = 21.19;
          break;
        case zTrip < -0.5:
          pcntTrip = 30.85;
          break;
        case zTrip < -0.25:
          pcntTrip = 38.21;
          break;
        case zTrip <= 0:
          pcntTrip = 50;
          break;
        case zTrip < 0.25:
          pcntTrip = 61.79;
          break;
        case zTrip < 0.5:
          pcntTrip = 69.15;
          break;
        case zTrip < 0.75:
          pcntTrip = 78.81;
          break;
        case zTrip < 1:
          pcntTrip = 84.13;
          break;
        case zTrip < 1.25:
          pcntTrip = 90.32;
          break;
        case zTrip < 1.5:
          pcntTrip = 93.32;
          break;
        case zTrip < 2:
          pcntTrip = 97.72;
          break;
        case zTrip < 2.5:
          pcntTrip = 99.38;
          break;
        default:
          pcntTrip = 99.87;
          break;
      }

      let jsonlists = {

        list1: {
            lat: 37.79414,
            lng: -122.39858,
            rating: 9.85,
            url: 'https://www.crexi.com/lease/properties/599013/california-275-sacramento-former-walgreens'
        },
        list2: {
            lat: 37.79758,
            lng: -122.43343,
            rating: 9.12,
            url: 'https://www.crexi.com/lease/properties/674362/california-2072-union-st'
        }
    }

      //console.log('Continuing processing with API response:', apiResponse);
      //console.log('Number of trips that', formData.data, 'made:', apiResponse.count);

      const data = {
        address: formData.data,
        price: priceSq.price,
        upper: priceSq.upper,
        lower: priceSq.lower,
        type: priceSq.type,
        lat: coords.lat,
        lng: coords.lng,
        tripcount: tripcount.count,
        score: score,
        pcntPrice: 100-pnctPrice,
        pcntTrip: pcntTrip,
        url1: jsonlists.list1.url,
        rating1: jsonlists.list1.rating,
        url2: jsonlists.list2.url,
        rating2: jsonlists.list2.rating
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
            type: result.type,
            lat: result.lat,
            lng: result.lng,
            tripcount: result.tripcount,
            score: result.score,
            pcntPrice: result.pcntPrice,
            pcntTrip: result.pcntTrip
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
