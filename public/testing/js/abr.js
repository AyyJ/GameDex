/*
 * Wrapper object. Named for Arthur, Brian, & Rabab.
 */
var abr = {};


/*
 * Function: Initializes the index page.
 */
abr.initIndexPage = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         window.location.replace("viewlist.html");
      }
   });
   document.getElementById('login').addEventListener('click', abr.handleLogin, false);
   document.getElementById('googleLogin').addEventListener('click', abr.handleGoogleLogin, false);
}


/*
 * Function: Processes the login request.
 */
abr.handleLogin = function() {
   var email = document.getElementById('email').value;
   var password = document.getElementById('password').value;

   firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      if (errorCode === 'auth/wrong-password') {
         alert('Wrong password.');
      } else {
         alert(errorMessage);
      }
      console.log(error);
   });
}


/*
 * Function: Processes the Google login request.
 */
 abr.handleGoogleLogin = function() {
    if (!firebase.auth().currentUser) {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/plus.login');
      firebase.auth().signInWithPopup(provider).then(function(result) {
         var user = result.user;

      }).catch(function(error) {
         // Handle Errors here.
         var errorCode = error.code;
         var errorMessage = error.message;
         // The email of the user's account used.
         var email = error.email;
         // The firebase.auth.AuthCredential type that was used.
         var credential = error.credential;
         if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('You have already signed up with a different auth provider for that email.');
            // If you are using multiple auth providers on your app you should handle linking
            // the user's accounts here.
         } else {
            console.error(error);
         }
      });
   }
}


/*
 * Function: Initializes the registration page.
 */
abr.initRegisterPage = function() {
   document.getElementById('register').addEventListener('click', abr.handleRegistration, false);
}


/*
 * Function: Register a new user.
 */
abr.handleRegistration = function() {
   abr.createFirebaseUser();
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         abr.createGamedexUser();
         window.location.replace('viewlist.html');
      }
   });
}


/*
 * Function: Adds the user account information to the Firebase database.
 */
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


/*
 * Function: Add the custom user information.
 */
abr.createGamedexUser = function() {
   var displayName = document.getElementById('displayName').value;

   var userListRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid);
   var userRef = userListRef.push();
   userRef.set({
      'display_name' : displayName
   });
}
