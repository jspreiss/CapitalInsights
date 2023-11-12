app.component('evaluator', {
    template:
    /*html*/
    `

    <div v-if="nsubmitted" class="entry">
        <h2 id="heading">Enter an Address Below to Get Started</h2>
        <form @submit.prevent="submitForm">
        <label for="inputData">Enter Address:    </label>
        <input type="text" id="inputData" v-model="formData" required>
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
          <td>Trip Count: </td><td>{{ tripcount }}</td></tr>
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
          <p v-if="submitted">This property ranks higher than {{ percentTrip }}% of listings in the area in traffic</p>
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
          this.score = data.score.toFixed(1);
          this.type = data.type;
          this.percentPrice = data.pcntPrice;
          this.percentTrip = data.pcntTrip;
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
      }
    }

  });
  