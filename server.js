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

// Find the latitude and longitude based on address
async function findLatLong(address) {

    console.log('starting findLatLong with address:', address);

    const geocodeAPIkey = "c61726c4e1c641249c8c39c657e51ea5";
    // address for testing: "150+Valencia+St,+San%20Francisco,+CA+94103"
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
    } else {
        let coords = json.results[0].geometry;
        //console.log('these are the coords:', coords);
        return coords;
    }

    return coords;
}

// Call the INRIX API using the form data
async function makeAnotherAPICall(coords) {

    console.log('Coords used for INRIX API call:', coords);
    
    // Hard-coded authentication token
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjJoejdlNHRpeTMiLCJ0b2tlbiI6eyJpdiI6IjQxYWI5MDBhMzlhYTQ0ODBlZDY5YWE0YTQ0YWYyYmYyIiwiY29udGVudCI6IjkwYjZmMDBkMjRlMzEwZDA5M2NiNjVmNWRhYjA5ODNjZDEwMTFiOGE4MjUxYmE1NDljMGEwNzMwYzU2MmYzNTQ2MWMyNmYwNDU0YmE1Yjc0Njg2YjEwMGFiZjlkMTNkOGEzZDkxNDFkYzQ1Y2U3NjkzOGY4ZWFkMDBjNWMxNWU5MGU4Y2MwZjYxNmQyNjc4N2RjYjUyZTQyYmVjN2MyMzk0YTlhNDI2YTRmYmQzMTc4ZjYyZjE1ZmY4NWQwNTk3NWJkMmNjZjliM2U3NDI3M2NkZDkwNzA0MzZjMGY1MTk0MzllMzM3NzNkYzcyYjM0YjYzNmIyNjk3ZDk3YjRmOTI1ZjcyMjJiNThkZjY3Zjg3OTJkYjZiNzQ5N2MwOGI3MmM5YmMxYWUxZTZjZTVjMDVlMTQyZTNhOWRmMzg3NjgxNDYxMzRkMDBkNjVkZGEzZTQxZDQ0MGM0MDAxN2UxMTYzMGUzZjNiYWM2ZmU5ZDU2NDRhYmY1YjAzNGUxNjIzZWM1YjIwMWZkY2E4YjQ1MGE0ZDZlYjRiNDhkMjFhNGY2YjU2MDc2ODE3NzQ5ZDEwODViNTRkNTZhYTEyMDI4YjI3MTFiNzNmOTA1MmQxM2U5ZjAyYzc1NzExMmIwNDE0ZjU4MGU3NDM4ZDQ3ZDVkMDcwY2M3YWY2ZGJmOWNhNjY3Mzc4ODY5N2U5ZWNhMDg4ZGUxY2E5NDMzZDE3YzMxNWE5OTU4N2I4ZmI2YTc5MjQ5YmIzMjE3ZTQwZWY1MTdjNTk3YjE2MTM4MmRiYjU1MjQ4YWY0NjcwYmYwN2NkM2YyY2VkYTYwMjEyYjgzMmJkNWY1YWRkODhkYjU2ZjYwYTcxMDE3OGFhZjNiYjFlNDNlODEzZDNhIn0sInNlY3VyaXR5VG9rZW4iOnsiaXYiOiI0MWFiOTAwYTM5YWE0NDgwZWQ2OWFhNGE0NGFmMmJmMiIsImNvbnRlbnQiOiJiMTk2Y2Y0ZjFmY2YxOWZjYThmMDFkOGJkZTg1OTg0N2VkMmEyNzk3OTk0Njg3MzdhOTNkMGIzNGExNjRlZDRlNTNmMzUwN2Y0MzllNWE3OTQ2N2I2ODM0In0sImp0aSI6IjRkYjBiNzNjLTdhNTItNGI0Ny05N2IzLWNmMmZiM2VjNDdmNCIsImlhdCI6MTY5OTc1NzI2MSwiZXhwIjoxNjk5NzYwODYxfQ._rKRaX7aiO8vHFVRQjNfLfgaZXzuB6zkCxqgqjqDQvE";
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    // Other parameters
    let radius = 100;
    // let coord1 = 37.781793;
    // let coord2 = -122.405189;
    let coord1 = coords.lat; //37.7705928
    let coord2 = coords.lng; //-122.40226318

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
      console.log('new string', formattedaddress);
  
      // Make the API call
      const coords = await findLatLong(formData);
      const apiResponse = await makeAnotherAPICall(coords);

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
