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
 * Function: Creates a cross-browser compatible XHR object.
 * Source: Ajax: The Complete Reference, Thomas A. Powell
 */
demo.createXHR = function() {
   try { return new XMLHttpRequest(); } catch(e) {}
   try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch (e) {}
   try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch (e) {}
   try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch (e) {}
   try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch (e) {}
   alert('XMLHttpRequest not supported');
   return null;
}


/*
 * Function:
 * Source: Ajax: The Complete Reference, Thomas A. Powell
 */
demo.sendRequest = function(target) {
   var xhr = demo.createXHR();
   if (xhr) {
      xhr.open('GET',target,true);
      xhr.onreadystatechange = function() {
         demo.handleResponse(xhr);
      };
      xhr.send(null);
   }
}


/*
 * Function:
 * Source: Ajax: The Complete Reference, Thomas A. Powell
 */
demo.handleResponse = function(xhr) {
   if (xhr.readyState == 4  && xhr.status == 200) {
      var responsePayload = xhr.response;
      var responseOutput = document.getElementById('spa-content');
      responseOutput.innerHTML = responsePayload;
   }
}


/*
 * Function: Initializes the SPA page when it is first loaded.
 */
demo.initApp = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         demo.loadDisplayName(user);
         demo.sendRequest('html/main.html');
      }
   });
   document.getElementById('googleLogin').addEventListener('click', demo.handleGoogleLogin, false);
}


/*
 * Function: Get the user's display name from the appropriate source.
 */
demo.loadDisplayName = function(user) {
   if (user) {
      var spaUserString = 'Guest';
      var logoutString = ' <button type="button" onclick="demo.logout()">Logout</button>';
      if (user.displayName) {
         spaUserString = user.displayName + logoutString;;
         document.getElementById('spa-user').innerHTML = spaUserString;
      } else {
         var userFirebasePath = 'users/' + firebase.auth().currentUser.uid;
         var userRef = firebase.database().ref(userFirebasePath);
         userRef.once('value').then(function(snapshot) {
            var displayName = snapshot.child('display_name').val();
            spaUserString = displayName + logoutString;
            document.getElementById('spa-user').innerHTML = spaUserString;
         });
      }
   }
}


/*
 * Function: Processes the login request.
 */
demo.handleLogin = function() {
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
}


/*
 * Function: Processes the Google login request.
 */
demo.handleGoogleLogin = function() {
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
 * Function: Add the custom user information.
 */
demo.logout = function() {
   if (firebase.auth().currentUser) {
      firebase.auth().signOut();
      window.location.replace('index.html');
   }
}


/*
 * Function: Loads the new user registration form into spa-content.
 */
demo.handleLoginRegisterButton = function() {
   demo.sendRequest('html/register.html');
}


/*
 * Function: Controls the registration of a new (non-Google) user.
 */
demo.handleRegistration = function() {
   demo.createFirebaseUser();
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         demo.createCustomUser();
         demo.sendRequest('html/main.html');
      }
   });
}


/*
 * Function: Adds the user account information to the Firebase database.
 */
demo.createFirebaseUser = function() {
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
demo.createCustomUser = function() {
   var displayName = document.getElementById('displayName').value;

   var userRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid);
   userRef.set({
      'display_name' : displayName
   });
}


/*
 * Function: Processes the add text button.
 */
demo.handleAddTextButton = function() {
   alert('Clicked!');
}
