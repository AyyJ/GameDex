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

   var userRef = firebase.database().ref('users/' + firebase.auth().currentUser.uid);
   userRef.set({
      'display_name' : displayName
   });
}


/*
 * Function: Initializes the games view list page.
 */
 abr.initViewPage = function() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         abr.loadDisplayName(user);
         document.getElementById('signout').addEventListener('click', abr.logout, false);
         document.getElementById('addGame').addEventListener('click', abr.handleAddGameButton, false);
      } else {
         window.location.replace('index.html');
      }
   });
}


/*
 * Function: Get the user's display name from the appropriate source.
 */
abr.loadDisplayName = function(user) {
   if (user) {
      if (user.displayName) {
         document.getElementById('personal').textContent = user.displayName + '\'s Games';
      } else {
         var userFirebasePath = 'users/' + firebase.auth().currentUser.uid;
         var userRef = firebase.database().ref(userFirebasePath);
         userRef.once('value').then(function(snapshot) {
            var displayName = snapshot.child('display_name').val();
            document.getElementById('personal').textContent = displayName + '\'s Games';
         });
      }
   }
}


/*
 * Function: Add the custom user information.
 */
 abr.logout = function() {
    if (firebase.auth().currentUser) {
      firebase.auth().signOut();
      document.getElementById('personal').textContent = 'Signed Out';
   }
}


/*
 * Function: Handles the add game button click.
 */
abr.handleAddGameButton = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         window.location.replace('editgame.html');
      } else {
         window.location.replace('index.html');
      }
   });
}


/*
 * Function: Initializes the Add/Edit game page.
 */
abr.initEditGamePage = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         document.getElementById('signout').addEventListener('click', abr.logout, false);
         document.getElementById('submit').addEventListener('click', abr.handleEditGameSubmitButton, false);
         document.getElementById('cancel').addEventListener('click', abr.handleCancelButton, false);
      } else {
         window.location.replace('index.html');
      }
   });
}


/*
 * Function: When the submit button on the edit game page is clicked this
 *           function processes the request.
 */
abr.handleEditGameSubmitButton = function() {
   var title = document.getElementById('game_title').value;
   var desc = document.getElementById('game_desc').value;
   var reldate = document.getElementById('game_reldate').value;
   var price = document.getElementById('game_price').value;
   var genre = document.getElementById('game_genre').value;

   abr.writeGameData(title, desc, reldate, price, genre);

   window.location.replace('viewlist.html');
}


/*
 * Function: Writes the game data to the database.
 */
abr.writeGameData = function(g_title, g_desc, g_reldate, g_price, g_genre) {
   var gameListRef = firebase.database().ref('games');
   var newGameRef = gameListRef.push();
   newGameRef.set({
      title: g_title,
      desc: g_desc,
      reldate: g_reldate,
      price: g_price,
      genre: g_genre
   });
}


/*
 * Function: Handles the edit game cancel button click.
 */
abr.handleCancelButton = function() {
   firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
         window.location.replace('viewlist.html');
      } else {
         window.location.replace('index.html');
      }
   });
}
