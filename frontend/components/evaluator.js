app.component('evaluator', {
    template:
    /*html*/
    `

    <div v-if="nsubmitted" class="entry">
        <h2 id="heading">Enter an Address Below to Get Started</h2>
        <form @submit.prevent="submitForm">
        <label for="inputData">Enter Address:    </label>
        <input type="text" placeholder="Bldg#, Street, City, State, ZIP" id="inputData" v-model="formData" required>
        <div class="subbutton">
          <button type="submit"><span></span><a>Submit</a></button>
        </div>
        </form>
    </div>

    <span v-if="spinner" class="loader"></span>

    <div class="response">
 
        <div  v-if="submitted" class="tabulate">
          <table class="blueTable">
          <tbody>
          <tr>
          <td>Estate Type: </td><td>{{ type }}</td></tr>
          <tr>
          <td>Square Feet: </td><td>{{ lowerSq }} square feet</td></tr>
          <tr>
          <td>Trip Count: </td><td>{{ tripcount }} Trips / 15 Days</td></tr>
          <tr>
          <td>Latitude: </td><td>{{ lat }}</td></tr>
          <tr>
          <td>Longitude: </td><td>{{ lng }}</td></tr>
          <tr>
          <td>Price: </td><td>&#36{{ price }} / SF / Month</td></tr>
          <tr>
          <td>Rating: </td><td>{{ score }} / 10</td></tr>
          </tbody>
          </table>

          <img class="filler" v-bind:src="image" />
          
        </div>
        <div class="descs">
        
          <p v-if="submitted">This property is less expensive than {{ percentPrice }}% of listings in the area in price</p>
          <p v-if="submitted">This property ranks higher than {{ percentTrip }}% of listings in the area in consumer volume</p>

        </div>

        <div v-if="submitted" class="alts">
          <h3>Looking for the Highest Quality Listings in Your Area?</h3>
          <p><a href="https://www.crexi.com/lease/properties/599013/california-275-sacramento-former-walgreens" target="_blank" class="listingURL">275 Sacramento Street</a> - Rated 9.8 / 10</p>
          <p><a href="https://www.crexi.com/lease/properties/674362/california-2072-union-st" target="_blank" class="listingURL">2072 Union Street</a> - Rated 9.2 / 10</p>
        </div>
          
    </div>
    

    `,
    data() {
        return {
            submitted: false,
            nsubmitted: true,
            spinner: false,
            formData: '',
            responseMessage: '',
            address: null,
            upperSq: null,
            lowerSq: null,
            lat: null,
            lng: null,
            price: null,
            tripcount: null,
            score: null,
            type: null,
            percentPrice: null,
            percentTrip: null,
            list1u: null,
            list1r: null,
            list2u: null,
            list2r: null
        }
    },
    methods: {
      submitForm() {
        this.spinner = true;
        // Send form data to the backend
        fetch('http://localhost:3000/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: this.formData }),
        })
        .then(response => response.json())
        .then(data => {
          this.responseMessage = data.message;
          this.address = data.address;
          this.upperSq = data.upper;
          this.lowerSq = data.lower;
          this.lat = data.lat;
          this.lng = data.lng;
          this.price = data.price;
          this.tripcount = data.tripcount;
          if(data.score) this.score = data.score.toFixed(1);
          else this.score = 0;
          this.type = data.type;
          this.percentPrice = data.pcntPrice;
          this.percentTrip = data.pcntTrip;
          this.lists = data.lists;
          this.submitted = true;
          this.spinner = false;
        })
        .catch(error => {
          console.error('Error:', error);
        });
        this.nsubmitted = false;

      }
    },
    computed: {
      image() {
        return "https://maps.googleapis.com/maps/api/staticmap?center=" + this.lat + "," + this.lng + 
        "&zoom=14&size=400x400&markers=" + this.lat + "," + this.lng + "&key=AIzaSyCE0SIqwuxf0Q6PiwhE83nPDJeVG4zQbmw"
      },
      shortest1() {
        return this.list1u;
      }
    } 

  });
  