/*
 * Wrapper object. Named for Arthur, Brian, & Rabab.
 */
var abr = {};


/*
 * Function: Initializes the registration page.
 */
abr.initRegisterPage = function() {
   document.getElementById('register').addEventListener('click', abr.registerNewUser, false);
}


/*
 * Function: Register a new user.
 */
abr.registerNewUser = function() {
   abr.createFirebaseUser();
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         abr.createGamedexUser();
         window.location.replace('viewlist.html');
      }
   });
}


/* Function: Creates the Firebase user. */
abr.createFirebaseUser = function() {
   var email = document.getElementById('email').value;
   var password = document.getElementById('password').value;

   firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode == 'auth/weak-password') {
         alert('The password is too weak.');
      } else {
         alert(errorMessage);
      }
      console.log(error);
   });
}


/* Function: Add the custom user information. */
abr.createGamedexUser = function() {

}
