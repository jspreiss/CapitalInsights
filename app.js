const express = require('express');
const fetch = require("node-fetch");
const { responseToken, responseTrips } = require('express');
const app = express();
const port = 8900;
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
    
    //const token = req.query.token;
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhcHBJZCI6IjJoejdlNHRpeTMiLCJ0b2tlbiI6eyJpdiI6IjVmNjhiNzhlNGRhNWZhY2JiYmE2NjUxYWZkNzFhZjgzIiwiY29udGVudCI6IjQxMWNmODlhNmYwM2MwMmFhZjliYjcxOWU3OTMwMDE3YzExOGY2YzcyYjljNzM4NzE3YzBmNzFhZDg2NDAzMTJlODg0ODczN2NhNjNjYzY0MzUyNTIzNWZmMzdhOWU5Nzk3ZmJiYjA0NDA0NzVlNDBiZTQ0NTc1M2VlOWZjMDBhZGU2MWZkMjk5M2E3MDA4OTM2M2RmMzY3ZGU3MDdjOTA1YThkNDcyOTM1ODFhOTlkZmE0OTA3MGQyZmY2MTMyODE1YzRmYzQ4ZDhjOTIzYmFjNjUxZWQ3OGZmZjY0ODM5ZmQ1NzZiNGJjYTYyYWY0ZDA5Y2ViMGVlZWJiZTk5MzI3NWEwYzhjNjZkZThiZjgyY2U1MmMxZWQ0N2MwYmVjOWEyMDBlMTlmNTk3NjRkZjkwODgzMTQ2ZTRkMTE1OWJhYzJhYTRiNTZmZDE0NzViZWU3MWQ1YWI5YWNjZTU5MDZjYzQwZWUwZGRmMjg0MmQ5YTY1ZTNlMDQ2NDVmOTMwNjU1NGYwNzBhMDQwMzExZDYxZjRmYjc2MzI2NjBhNmMzZjRjMTI5YjMwMjliMmE2YTA4ZWZkZmU2ZWI2NmZhOWZmM2RkODNjY2Q4NWRiNTI3Yzk1MzZlNjA1Y2U5OTMwNDg2ZTkxMTFiMjM3MDBhNjkzNGJkYTUwNzczMDlmMTdmMjhhY2Y2YzI0NjkzZWNlMzk5NmQ4NWEwYzNmZDk3YjE3MDg5Mzc4Y2Y5NTlkMGEzZjhhNWNhMTJhNDYzY2VlOTgxN2YwZWUzZjc5NmEwMWExOGJmYWEwZjgwNTc2N2JjM2NiMDNhYzFhYzQ2MmExZGQ4YmFlMWFhMjM1N2Q3MjY4YTRmOGVjYTc0NzBiODcyYzRhZjRlIn0sInNlY3VyaXR5VG9rZW4iOnsiaXYiOiI1ZjY4Yjc4ZTRkYTVmYWNiYmJhNjY1MWFmZDcxYWY4MyIsImNvbnRlbnQiOiI1NzRmODFjMjQ3M2NkYjI1YWI4MThkMDZkNjgzMGE1ZWU4NDhlY2U2MDc5YzEwZjUyN2I0Y2I2NmZhNDAwNjFmZDA4OGY0NDU5MjUyOGQ2MTI5N2UzZTYxIn0sImp0aSI6Ijg1MTBmZDgxLTk1YjgtNGI3My1iYWE5LTdhY2VmOTkwNDVhYiIsImlhdCI6MTY5OTc1MDAwNSwiZXhwIjoxNjk5NzUzNjA1fQ.vvWNYd-eGxPyn5z_1mxX78Duho-KrlN4prZyA-EHYzg";

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
