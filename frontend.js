// app.js
new Vue({
    el: '#app',
    data: {
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
    },
    methods: {
      submitForm() {
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
          this.score = data.score;
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    }
  });
  