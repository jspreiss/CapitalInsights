app.component('nav-bar', {
    template:
    /*html*/
    `
    <div class = "navbar">
        <img v-bind:src="image" class="logo">
    <ul>
        <li><a href="home.html">Home</a></li>
        <li><a href="errand.html">Evaluator</a></li>
        <li><a href="about.html">About</a></li>
    </ul>
  </div>
  `,
  computed: {
    image() {
        return 'assets/logowhite.png'
        },
  }
})