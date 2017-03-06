/*
 * Firebase connection configuration.
 */
var config = {
   apiKey: "AIzaSyCf9mEv6fjrsEk9ZryrfGZv-ygiBhpVt1Y",
   authDomain: "gamedex-2d485.firebaseapp.com",
   databaseURL: "https://gamedex-2d485.firebaseio.com",
   storageBucket: "gamedex-2d485.appspot.com",
   messagingSenderId: "1057082821990"
};
var app = firebase.initializeApp(config);
var db = firebase.database()


/*
 * Wrapper object.
 */
var demo = {};


/*
 * Function: Initializes the SPA page.
 */
demo.initApp = function() {
   
}


/*
 * Function: Processes the add text button.
 */
demo.handleAddTextButton = function() {
   alert('Clicked!');
}
