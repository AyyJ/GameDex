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
var db = firebase.database();


/*
 * Wrapper object.
 */
var foo = {};


/*
 * Function: Initializes web application when it is first loaded.
 */
foo.initLoginPage = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         window.location.replace('main.html');
      }
   });
   document.getElementById('login_submit').addEventListener('click', foo.handleLogin, false);
   document.getElementById('login_register').addEventListener('click', foo.handleRegisterButton);
   document.getElementById('googleLogin').addEventListener('click', foo.handleGoogleLogin, false);
};


/*
 * Function: Processes the GameDex login request.
 */
foo.handleLogin = function() {
   var email = document.getElementById('login_email').value;
   var password = document.getElementById('login_pass').value;

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
};


/*
 * Function: Loads the registration page.
 */
foo.handleRegisterButton = function() {
   window.location.replace('register.html');
};


/*
 * Function: Processes the Google login request.
 */
foo.handleGoogleLogin = function() {
    if (!firebase.auth().currentUser) {
      var provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/plus.login');
      firebase.auth().signInWithPopup(provider).then(function(result) {
         var user = result.user;
      }).catch(function(error) {
         var errorCode = error.code;
         var errorMessage = error.message;
         var email = error.email;
         var credential = error.credential;
         if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('You have already signed up with a different auth provider for that email.');
         } else {
            console.error(error);
         }
      });
   }
};


/*
 * Function: Initializes web application when it is first loaded.
 */
foo.initRegistrationPage = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         window.location.replace('main.html');
      } else {
         document.getElementById('register_submit').addEventListener('click', foo.handleRegistration, false);
         document.getElementById('register_cancel').addEventListener('click', foo.handleRegisterCancel, false);
      }
   });
}


/*
 * Function: Controls the registration of a new (non-Google) user.
 */
foo.handleRegistration = function() {
   foo.createFirebaseUser();
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         foo.createCustomUser();
         window.location.replace('main.html');
      }
   });
};


/*
 * Function: Adds the user account information to the Firebase database.
 */
foo.createFirebaseUser = function() {
   var email = document.getElementById('register_email').value;
   var password = document.getElementById('register_password').value;

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
};


/*
 * Function: Add the custom user information.
 */
foo.createCustomUser = function() {
   var displayName = document.getElementById('register_displayName').value;

   var userRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid);
   userRef.set({
      'display_name' : displayName
   });
};


/*
 * Function: Handles the registration cancel button.
 */
foo.handleRegisterCancel = function() {
   window.location.replace('index.html');
}

/*
 * Function: Initializes main page.
 */
foo.initMainPage = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         foo.loadDisplayName(user);
         document.getElementById('logout').addEventListener('click', foo.handleLogout, false);
         // Load games list.
      }
   });
}


/*
 * Function: Get the user's display name from the appropriate source.
 */
foo.loadDisplayName = function(user) {
   if (user) {
      if (user.displayName) {
          document.getElementById('displayName').innerHTML =  user.displayName;
      } else {
         var userFirebasePath = 'users/' + firebase.auth().currentUser.uid;
         var userRef = firebase.database().ref(userFirebasePath);
         userRef.once('value').then(function(snapshot) {
            document.getElementById('displayName').innerHTML = snapshot.child('display_name').val();;
         });
      }
   }
};


/*
 * Function: Handle user logout.
 */
foo.handleLogout = function() {
   if (firebase.auth().currentUser) {
      firebase.auth().signOut();
      window.location.replace('index.html');
   }
};
