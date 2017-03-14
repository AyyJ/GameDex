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
         document.getElementById('add_game').addEventListener('click', foo.handleAddGameButton, false);
         document.getElementById('game_cancel').addEventListener('click', foo.handleGameCancelButton, false);
         // Load games list.
         foo.startFirebaseQuery();
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


/*
 * Function: Opens the Add a new Game page.
 */
foo.handleAddGameButton = function() {
   //window.location.replace('edit.html');
   foo.openForm();
   document.getElementById('game_submit').addEventListener('click', foo.handleNewGameSubmit, false);
   document.getElementById('form_type_label').innerText = 'Add a new game.';
}


/*
 * Function: Process the Add/Edit a game submission button.
 */
foo.handleNewGameSubmit = function() {
   var txtGameTitle = document.getElementById('game_title').value;
   var txtGameDesc = document.getElementById('game_desc').value;
   foo.writeGameData(txtGameTitle, txtGameDesc);
   foo.closeForm();
}


/*
 * Function: Writes the game data to firebase.
 */
foo.writeGameData = function(txtGameTitle, txtGameDesc) {
   var libraryRef = foo.getUserGameLibraryRef();
   var newGameEntryRef = libraryRef.push();

   newGameEntryRef.set({
      title: txtGameTitle,
      desc: txtGameDesc
   });
}

/*
 * Function: Handles the edit game button.
 */
foo.handleEditGameButton = function(key) {
   foo.openForm();
   document.getElementById('game_submit').addEventListener('click', foo.handleEditGameSubmit, false);
   document.getElementById('form_type_label').innerText = 'Edit this game.';

   var libraryRef = foo.getUserGameLibraryRef();
   libraryRef.child(key).once('value')
      .then(function(dataSnapshot) {
         document.getElementById('game_key').value = key;
         document.getElementById('game_title').value = dataSnapshot.child('title').val();
         document.getElementById('game_desc').value = dataSnapshot.child('desc').val();
      });
}


/*
 * Function: Process the Add/Edit a game submission button.
 */
foo.handleEditGameSubmit = function() {
   var key = document.getElementById('game_key').value;
   var txtGameTitle = document.getElementById('game_title').value;
   var txtGameDesc = document.getElementById('game_desc').value;
   foo.editGameData(key,txtGameTitle, txtGameDesc);
   foo.closeForm();
}


/*
 * Function: Edits a game in the user's library.
 */
foo.editGameData = function(key,title,desc) {
   var libraryRef = foo.getUserGameLibraryRef();
   libraryRef.child(key).set({
      'title': title,
      'desc': desc
   });
}

/*
 * Function: Hides the library and displays the edit form.
 */
foo.openForm = function() {
   var formSection = document.getElementById('section_form');
   var librarySection = document.getElementById('section_library');

   formSection.style.display = 'inline';
   librarySection.style.display = 'none';
}


/*
 * Function: Hides the form and displays the library.
 */
foo.closeForm = function() {
   // Remove event listeners on the Submit button.
   document.getElementById('game_submit').removeEventListener('click', foo.handleEditGameSubmit, false);
   document.getElementById('game_submit').removeEventListener('click', foo.handleNewGameSubmit, false);

   // Return all fields to default.
   document.getElementById('game_key').value = '';
   document.getElementById('game_title').value = '';
   document.getElementById('game_desc').value = '';

   // Switch between sections.
   var formSection = document.getElementById('section_form');
   var librarySection = document.getElementById('section_library');

   formSection.style.display = 'none';
   librarySection.style.display = 'inline';
}


/*
 * Function: Cancels new game/edit a game interface.
 */
foo.handleGameCancelButton = function() {
   foo.closeForm();
}


/*
 * Function: Prepares to fetch the user's game library.
 */
foo.startFirebaseQuery = function() {
   var libraryRef = foo.getUserGameLibraryRef();
   var libraryElement = document.getElementById('game_library');

   foo.fetchUserGameLibrary(libraryRef, libraryElement);
}


/*
 * Function: Starts listening for new games and populates the game list.
 */
foo.fetchUserGameLibrary = function(libraryRef, libraryElement) {

   libraryRef.on('child_added', function(data) {
      var key = data.key;
      var title = data.val().title;
      var desc = data.val().desc;
      var gameElement = libraryElement.getElementsByClassName('game_entries')[0];

      gameElement.insertBefore(
         foo.createGameEntry(key, title, desc),
         gameElement.firstChild
      );
   });

   libraryRef.on('child_changed', function(data) {
      var key = data.key;
      //var gameElement = libraryElement.getElementsByClassName('game_entries')[0];
      var gameEntry = document.getElementById('game_'+key);
      gameEntry.getElementsByClassName('game_title')[0].innerText = data.val().title;
      gameEntry.getElementsByClassName('game_desc')[0].innerText = data.val().desc;
   });

   libraryRef.on('child_removed', function(data) {
      var key = data.key;
      var gameElement = document.getElementById('game_' + key);
      gameElement.parentElement.removeChild(gameElement);
   });
}


/*
 * Function: Builds the game entry HTML for the user's game library.
 */
foo.createGameEntry = function(key, title, desc) {
   // HTML to build the game entry.
   var html =
      '<div id="game_' + key + '" class="game_entries">' +
         '<span class="game_title"></span>' +
         '<span class="game_desc"></span>' +
         '<button type="button" onclick="foo.handleEditGameButton(\''+ key +'\')">Edit</button>' +
         '<button type="button" onclick="foo.handleRemoveGameButton(\''+ key +'\')">Remove</button>' +
      '</div>';

   // Create the DOM element from the HTML.
   var div = document.createElement('div');
   div.innerHTML = html;
   var gameElement = div.firstChild;

   // Set values.
   gameElement.getElementsByClassName('game_title')[0].innerText = title;
   gameElement.getElementsByClassName('game_desc')[0].innerText = desc;

   return gameElement;
}


/*
 * Function: Handles the remove game button.
 */
foo.handleRemoveGameButton = function(key) {
   if(confirm('Remove game?')){
      foo.removeGameData(key);
   }
}

/*
 * Function: Remove a game from the user's library.
 */
foo.removeGameData = function(key) {
   var libraryRef = foo.getUserGameLibraryRef();
   libraryRef.child(key).remove();
}


/*
 * Function: Gets a Firebase reference to the user's game library.
 */
foo.getUserGameLibraryRef = function() {
   var currentUserId = firebase.auth().currentUser.uid;
   var userGameLibraryPath = 'users/' + currentUserId + '/games';
   return firebase.database().ref(userGameLibraryPath);
}
