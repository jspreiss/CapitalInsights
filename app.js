const express = require('express');
const fetch = require("node-fetch");
const { responseToken, responseTrips } = require('express');
const app = express();
const port = 8000;
app.set('json spaces', 2);

// to query, call: http://localhost:8000/gettoken

app.get('/gettoken', async function (req, res) {

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
    let output = json.result.token;

    //Return token
    res.json({
        token: output,
    });
})

//Starting server using listen function
app.listen(port, function () {
    console.log("Server has been started at " + port);
})

app.get('/counttrips', async function (req, res){
    
    const token = req.query.token;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    let radius = 100;
    let coord1 = 37.781793;
    let coord2 = -122.405189;

    let url = `https://api.iq.inrix.com/v1/trips-count?od=destination&geoFilterType=circle&radius=${radius}m&points=${coord1}%7C${coord2}&limit=1000&startDateTime=%3E%3D2023-06-01T02%3A31&endDateTime=%3C%3D2023-06-15T02%3A31`;

    let responseTrips = await fetch(url, requestOptions);
    let json = await responseTrips.json();
    
    res.json({
        count: json.count,
    })
    
})