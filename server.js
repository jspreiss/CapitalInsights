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

// Call the INRIX API using the form data
async function makeAnotherAPICall(formData) {

    //console.log('Form data within API call:', formData);
    
    // Hard-coded authentication token
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjJoejdlNHRpeTMiLCJ0b2tlbiI6eyJpdiI6IjVmNjhiNzhlNGRhNWZhY2JiYmE2NjUxYWZkNzFhZjgzIiwiY29udGVudCI6IjQxMWNmODlhNmYwM2MwMmFhZjliYjcxOWU3OTMwMDE3YzExOGY2YzcyYjljNzM4NzE3YzBmNzFhZDg2NDAzMTJlODg0ODczN2NhNjNjYzY0MzUyNTIzNWZmMzdhOWU5Nzk3ZmJiYjA0NDA0NzVlNDBiZTQ0NTc1M2VlOWZjMDBhZGU2MWZkMjk5M2E3MDA4OTM2M2RmMzY3ZGU3MDdjOTA1YThkNDcyOTM1ODFhOTlkZmE0OTA3MGQyZmY2MTMyODE1YzRmYzQ4ZDhjOTIzYmFjNjUxZWQ3OGZmZjY0ODM5ZmQ1NzZiNGJjYTYyYWY0ZDA5Y2ViMGVlZWJiZTk5MzI3NWEwYzhjNjZkZThiZjgyY2U1MmMxZWQ0N2MwYmVjOWEyMDBlMTlmNTk3NjRkZjkwODgzMTQ2ZTRkMTE1OWJhYzJhYTRiNTZmZDE0NzViZWU3MWQ1YWI5YWNjZTU5MDZjYzQwZWUwZGRmMjg0MmQ5YTY1ZTNlMDQ2NDVmOTMwNjU1NGYwNzBhMDQwMzExZDYxZjRmYjc2MzI2NjBhNmMzZjRjMTI5YjMwMjliMmE2YTA4ZWZkZmU2ZWI2NmZhOWZmM2RkODNjY2Q4NWRiNTI3Yzk1MzZlNjA1Y2U5OTMwNDg2ZTkxMTFiMjM3MDBhNjkzNGJkYTUwNzczMDlmMTdmMjhhY2Y2YzI0NjkzZWNlMzk5NmQ4NWEwYzNmZDk3YjE3MDg5Mzc4Y2Y5NTlkMGEzZjhhNWNhMTJhNDYzY2VlOTgxN2YwZWUzZjc5NmEwMWExOGJmYWEwZjgwNTc2N2JjM2NiMDNhYzFhYzQ2MmExZGQ4YmFlMWFhMjM1N2Q3MjY4YTRmOGVjYTc0NzBiODcyYzRhZjRlIn0sInNlY3VyaXR5VG9rZW4iOnsiaXYiOiI1ZjY4Yjc4ZTRkYTVmYWNiYmJhNjY1MWFmZDcxYWY4MyIsImNvbnRlbnQiOiI1NzRmODFjMjQ3M2NkYjI1YWI4MThkMDZkNjgzMGE1ZWU4NDhlY2U2MDc5YzEwZjUyN2I0Y2I2NmZhNDAwNjFmZDA4OGY0NDU5MjUyOGQ2MTI5N2UzZTYxIn0sImp0aSI6Ijg1MTBmZDgxLTk1YjgtNGI3My1iYWE5LTdhY2VmOTkwNDVhYiIsImlhdCI6MTY5OTc1MDAwNSwiZXhwIjoxNjk5NzUzNjA1fQ.vvWNYd-eGxPyn5z_1mxX78Duho-KrlN4prZyA-EHYzg";
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    // Other parameters
    let radius = 100;
    let coord1 = 37.781793;
    let coord2 = -122.405189;

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
  
      // Make the API call
      const apiResponse = await makeAnotherAPICall(formData);

      //console.log('Continuing processing with API response:', apiResponse);
      //console.log('Number of trips that', formData.data, 'made:', apiResponse.count);

      return apiResponse;
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

        // Send the API response back to the frontend
        res.json({ message: 'Form data received successfully!', apiResponse: result });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
