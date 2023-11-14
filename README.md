#INRIX Hack 2023 - Capital Insights

## Functionality
Capital Insights revolutionizes location analysis. By inputting a retail property address, users gain access to key metrics such as relative property price, foot traffic data, probabilistic parking data, and a comprehensive property-rating algorithm. This information is crucial for both investors seeking profitable ventures and businesses planning strategic expansions.

## APIs
Capital Insights employs 2 INRIX APIs: Trade Area Trips & On-Street Parking to get traffic and popularity data for specific coordinates. We also implemented a Proxy API for automated token authentication. Other APIs used are OpenCage's Geocoder API to obtain coordinates and Google's Map Static API to return google image of property listing location.

## Webscraping
Using Puppeteer JS library in a Node.js environment, we webscraped price, listing type, and area of property from crexi.com (commerical listing site) to feed into our custom statistical algorithm.

