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
          var lastChar = user.displayName.slice(-1);
          if(lastChar != 's'){
            document.getElementById('displayName').innerHTML =  user.displayName + '\'s GameDex';
          } else{
            document.getElementById('displayName').innerHTML =  user.displayName + '\' GameDex';
          }
      } else {
         var userFirebasePath = 'users/' + firebase.auth().currentUser.uid;
         var userRef = firebase.database().ref(userFirebasePath);
         userRef.once('value').then(function(snapshot) {
            document.getElementById('displayName').innerHTML = snapshot.child('display_name').val() + '\'s GameDex';
            var lastChar = snapshot.child('display_name').val().slice(-1);
            if(lastChar != 's'){
              document.getElementById('displayName').innerHTML = snapshot.child('display_name').val() + '\'s GameDex';
            } else{
              document.getElementById('displayName').innerHTML = snapshot.child('display_name').val() + '\' GameDex';
            }
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
   var txtimage = document.getElementById('game_image').value;
   var txtGameTitle = document.getElementById('game_title').value;
   var txtGameDesc = document.getElementById('game_desc').value;
   var txtGameReldate = document.getElementById('game_reldate').value;
   var txtGamePrice = document.getElementById('game_price').value;
   var dropGameSystem = document.getElementById("game_system");
   var txtGameSystem = dropGameSystem.options[dropGameSystem.selectedIndex].text;
   var txtGameGenre = document.getElementById('game_genre').value;
   foo.writeGameData(txtimage, txtGameTitle, txtGameDesc, txtGameReldate, txtGamePrice, txtGameSystem, txtGameGenre);
   foo.closeForm();
}


/*
 * Function: Writes the game data to firebase.
 */
foo.writeGameData = function(txtimage, txtGameTitle, txtGameDesc, txtGameReldate, txtGamePrice, txtGameSystem, txtGameGenre) {
   var libraryRef = foo.getUserGameLibraryRef();
   var newGameEntryRef = libraryRef.push();

   newGameEntryRef.set({
      image: txtimage,
      title: txtGameTitle,
      desc: txtGameDesc,
      reldate: txtGameReldate,
      price: txtGamePrice,
      system: txtGameSystem,
      genre: txtGameGenre
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
         document.getElementById('game_image').value = dataSnapshot.child('image').val()
         document.getElementById('game_title').value = dataSnapshot.child('title').val();
         document.getElementById('game_desc').value = dataSnapshot.child('desc').val();
         document.getElementById('game_reldate').value = dataSnapshot.child('reldate').val();
         document.getElementById('game_price').value = dataSnapshot.child('price').val();
         var dropGameSystem = document.getElementById("game_system");
         dropGameSystem.options[dropGameSystem.selectedIndex].text = dataSnapshot.child('system').val();
         document.getElementById('game_genre').value = dataSnapshot.child('genre').val();
      });
}


/*
 * Function: Process the Add/Edit a game submission button.
 */
foo.handleEditGameSubmit = function() {
   var key = document.getElementById('game_key').value;
   var txtimage = document.getElementById('game_image').value;
   var txtGameTitle = document.getElementById('game_title').value;
   var txtGameDesc = document.getElementById('game_desc').value;
   var txtGameReldate = document.getElementById('game_reldate').value;
   var txtGamePrice = document.getElementById('game_price').value;
   var dropGameSystem = document.getElementById("game_system");
   var txtGameSystem = dropGameSystem.options[dropGameSystem.selectedIndex].text;
   var txtGameGenre = document.getElementById('game_genre').value;
   foo.editGameData(key, txtimage, txtGameTitle, txtGameDesc, txtGameReldate, txtGamePrice, txtGameSystem, txtGameGenre);
   foo.closeForm();
}


/*
 * Function: Edits a game in the user's library.
 */
foo.editGameData = function(key, image, title, desc, reldate, price, system, genre) {
   var libraryRef = foo.getUserGameLibraryRef();
   libraryRef.child(key).set({
      'image': image,
      'title': title,
      'desc': desc,
      'reldate': reldate,
      'price': price,
      'system': system,
      'genre': genre
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
   document.getElementById('game_image').value = '';
   document.getElementById('game_title').value = '';
   document.getElementById('game_desc').value = '';
   document.getElementById('game_desc').value = '';
   document.getElementById('game_reldate').value = '';
   document.getElementById('game_price').value = '';
   var dropGameSystem = document.getElementById("game_system");
   dropGameSystem.options[dropGameSystem.selectedIndex].value = 4;
   document.getElementById('game_genre').value = '';

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
   libraryRef.once('value', function(snapshot) {
          var exists = (snapshot.val() !== null);
          if(exists == false){
            var table = document.getElementById('game_library');
            table.style.display = 'none';
            var librarySection = document.getElementById('section_library');
            var newOne = document.createElement('div');
            newOne.innerHTML = '<br><br><h4>You don\'t have any games yet! Add your favorites by clicking "\Add a New Game\" above!</h4>';
            librarySection.append(newOne);
          }
        });

   libraryRef.on('child_added', function(data) {
      var key = data.key;
      var image = data.val().image;
      var title = data.val().title;
      var desc = data.val().desc;
      var reldate = data.val().reldate;
      var price = data.val().price;
      var system = data.val().system;
      var genre = data.val().genre;

      var child = document.createElement('tr');
      child.setAttribute('id', 'game_' + key);
      child.innerHTML = foo.createGameEntry(key, image, title, desc, reldate, price, system, genre);
      var gameElement = libraryElement.getElementsByClassName('game_entries')[0];
      gameElement.append(child);
   });

   libraryRef.on('child_changed', function(data) {
      var key = data.key;
      //var gameElement = libraryElement.getElementsByClassName('game_entries')[0];

      document.getElementById('game_image_view_game_' + key).innerText = data.val().image;
      document.getElementById('game_title_view_game_' + key).innerText = data.val().title;
      document.getElementById('game_desc_view_game_' + key).innerText = data.val().desc;
      document.getElementById('game_reldate_view_game_' + key).innerText = data.val().reldate;
      document.getElementById('game_price_view_game_' + key).innerText = data.val().price;
      document.getElementById('game_system_view_game_' + key).innerText = data.val().system;
      document.getElementById('game_genre_view_game_' + key).innerText = data.val().genre;

   });

   libraryRef.on('child_removed', function(data) {
      var key = data.key;
      var row = document.getElementById('game_' + key);
      row.parentNode.removeChild(row);
   });
}


/*
 * Function: Builds the game entry HTML for the user's game library.
 */
 foo.createGameEntry = function(key, image, title, desc, reldate, price, system, genre) {
   // HTML to build the game entry.
   var html =
   '<td id="game_image_view_game_' + key + '">' + image + '</td>' +
   '<td id="game_title_view_game_' + key + '">' + title + '</td>' +
   '<td id="game_desc_view_game_' + key + '">' + desc + '</td>' +
   '<td id="game_reldate_view_game_' + key + '">' + reldate + '</td>' +
   '<td id="game_price_view_game_' + key + '">' + price + '</td>' +
   '<td id="game_system_view_game_' + key + '">' + system + '</td>' +
   '<td id="game_genre_view_game_' + key + '">' + genre + '</td>' +
   '<td><button type="button" onclick="foo.handleEditGameButton(\''+ key +'\')">Edit</button></td>' +
   '<td><button type="button" onclick="foo.handleRemoveGameButton(\''+ key +'\')">Remove</button></td></tr></div>';
   return html;
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
