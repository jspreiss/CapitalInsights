const express = require('express');
const fetch = require("node-fetch");
const { response } = require('express');
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
    let response = await fetch(url, requestOptions);
    let json = await response.json();
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