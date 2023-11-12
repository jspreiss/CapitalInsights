// app.js
new Vue({
    el: '#app',
    data: {
      formData: '',
      responseMessage: '',
      apiResponse: null,
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
          this.apiResponse = data.apiResponse; // Set the API response data
        })
        .catch(error => {
          console.error('Error:', error);
        });
      }
    }
  });
  