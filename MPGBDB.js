// Your web app's Firebase configuration
var firebaseConfig = 
{
  apiKey: "AIzaSyA1KfpGDybi3Y5hzsmXjHgR1eeSZ-sFMak",
  authDomain: "mpgb-db085.firebaseapp.com",
  databaseURL: "https://mpgb-db085.firebaseio.com",
  projectId: "mpgb-db085",
  storageBucket: "mpgb-db085.appspot.com",
  messagingSenderId: "742708862336",
  appId: "1:742708862336:web:f6cafeb96083e250e03565",
  measurementId: "G-XXS2ZTEW2W"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

async function getGames()
{
  var result = [];
  var snapshot = await db.collection('Games').get();
  for (var x=0; x<snapshot.docs.length; x++)
  {
    var doc = snapshot.docs[x];
    result.push
    ({
      'ID': doc.id,
      'name': doc.data().Title
    }); 
  }
  
  return result;
}

async function getGroups()
{
  var result = [];
  var user = auth.currentUser;
  var snapshot = await db.collection('Groups').get();
  for (var x=0; x<snapshot.docs.length; x++)
  {
    var doc = snapshot.docs[x];

    if (doc.data().isPrivate && !(doc.data().Users.includes(auth.currentUser.email))) continue;

    result.push
      ({
        'ID': doc.id,
        'name': doc.data().Name,
        'description': doc.data().Description,
        'users': doc.data().Users,
        'isPrivate': doc.data().isPrivate || false
      });
  }
  
  return result;
}

async function getChat(game)
{
  var result = [];
  var snapshot = await db.collection('Games').doc(game.ID).collection('Chats').orderBy('Timestamp','asc').get();
  for (var x=0; x<snapshot.docs.length; x++)
  {
    var doc = snapshot.docs[x];
    var name = doc.data().Name;
    var displayname = name.substring(0,name.length-9);

    result.push
    ({
      'Message': displayname + ': ' + doc.data().Message
    });
  }

  return result;
}

async function getGroupChat(group)
{
  var result = [];
  var snapshot = await db.collection('Groups').doc(group.ID).collection('Chats').orderBy('Timestamp','asc').get();
  for (var x=0; x<snapshot.docs.length; x++)
  {
    var doc = snapshot.docs[x];
    var name = doc.data().Name;
    var displayname = name.substring(0,name.length-9);

    result.push
    ({
      'Message': displayname + ': ' + doc.data().Message
    });
  }

  return result;
}

async function sendMessage(gameID, message)
{
  var user = auth.currentUser.email;

  var snapshot = await db.collection('Games').doc(gameID).collection('Chats').add(
    {
      'Message': message,
      'Name': user,
      'Timestamp': firebase.firestore.FieldValue.serverTimestamp()
    }
  )
}

async function sendGroupMessage(groupID, message)
{
  var user = auth.currentUser.email;

  var snapshot = await db.collection('Groups').doc(groupID).collection('Chats').add(
    {
      'Message': message,
      'Name': user,
      'Timestamp': firebase.firestore.FieldValue.serverTimestamp()
    }
  )
}

async function createGroup(name, description, isPrivate)
{
  //console.log(auth.currentUser.email);
  var users = [];
  users.push(auth.currentUser.email);

  var snapshot = await db.collection('Groups').add(
    {
      'Name': name,
      'Description': description,
      'Users': users,
      'isPrivate': isPrivate
    }
  )
}

async function createGame(names)
{
    var list = names.split(", ");
    for (let i = 0; i < list.length; i++) {
 	 var snapshot = await db.collection('Games').add(
    	{
      	'Title': list[i],
      	'Year': 2000
    	})
    }
    console.log("done");
}

async function joinGroup(groupID)
{
  var user = auth.currentUser.email;
  var snapshot = await db.collection('Groups').doc(groupID).update(
  {
    Users: firebase.firestore.FieldValue.arrayUnion(user)
  })
}

async function leaveGroup(groupID)
{
  var user = auth.currentUser.email;
  var snapshot = await db.collection('Groups').doc(groupID).update(
  {
    Users: firebase.firestore.FieldValue.arrayRemove(user)
  })
}

async function purge()
{
  var snapshot = await db.collection('Games').get();
  for (var x=0; x<snapshot.docs.length; x++)
  {
    var doc = snapshot.docs[x];
    var snapshotCeption = await db.collection('Games').doc(doc.id).collection('Chats').get();

    //console.log(doc.id , snapshotCeption.docs.length);
    for (var i=0; i<snapshotCeption.docs.length; i++)
    {
      var chat = snapshotCeption.docs[i];
      //console.log(chat);
      chat.ref.delete();
    }
  }
}

async function createUser(username, password)
{
    var response = await auth.createUserWithEmailAndPassword(username + '@MPGB.org', password)
      .then(function(result)
      {
        //console.log('Then', result);
        return 'success';
      })
      .catch(function(result)
      {
        //console.log('Catch', result);
        return result.message;
      })
    //console.log(response);
    return response;
}

async function login(username, password)
{
  var response = await auth.signInWithEmailAndPassword(username + '@MPGB.org', password)
      .then(function(result)
      {
        //console.log('Then', result);
        return 'success';
      })
      .catch(function(result)
      {
        //console.log('Catch', result);
        return result.code;
      })
    //console.log(response);
    return response;
}

async function getUsers(groupID)
{
  var result = [];
  var snapshot = await db.collection('Groups').doc(groupID).get();
  users = snapshot.data().Users
  for(var i=0; i<users.length; i++)
  {
    result.push(users[i].substring(0,users[i].length-9));
  }
  return result;
}

async function getUsersGroups()
{
  var result = [];
  user = auth.currentUser.email;
  var snapshot = await db.collection('Groups').where('Users','array-contains',user).get();
  for (var x=0; x<snapshot.docs.length; x++)
  {
    var doc = snapshot.docs[x];
    result.push
    ({
      'ID': doc.id,
      'name': doc.data().Name,
      'description': doc.data().Description,
      'users': doc.data().Users
    }); 
  }
  return result;
}

async function createNotification(user, group)
{
  updateUser = user + '@mpgb.org';
  var sender = auth.currentUser.email;
  var displaySender = sender.substring(0,sender.length-9)

  var snapshot = await db.collection('Notifications').add(
    {
      'Name': group.name,
      'GroupID': group.ID,
      'Read': false,
      'Disabled': false,
      'Message': displaySender + ' has sent you a request to join ' + group.name,
      'Receiver': updateUser
    }
  )
}

async function manualCreateNotification(user, groupID, groupName)
 {
   updateUser = user + '@mpgb.org';
   var sender = auth.currentUser.email;
   var displaySender = sender.substring(0,sender.length-9)

   var snapshot = await db.collection('Notifications').add(
     {
       'Name': groupName,
       'GroupID': groupID,
       'Read': false,
       'Disabled': false,
       'Message': displaySender + ' has sent you a request to join ' + groupName,
       'Receiver': updateUser
     }
   )
 }

async function getNotifications()
{
  var result = [];
  user = auth.currentUser.email;
  var snapshot = await db.collection('Notifications').where('Disabled','==',false).where('Receiver','==',user).get();
  for (var x=0; x<snapshot.docs.length; x++)
  {
    var doc = snapshot.docs[x];
    result.push
    ({
      'ID': doc.id,
      'GroupID': doc.data().GroupID,
      'Read': doc.data().Read,
      'Disabled': doc.data().Disabled,
      'Name': doc.data().Name,
      'Message': doc.data().Message
    });
  }
  
  return result;
}

async function readNotification(notification)
{
  await db.collection('Notifications').doc(notification.ID).set({Read: true},{merge: true});
}

async function closeNotification(notification)
{
  await db.collection('Notifications').doc(notification.ID).set({Disabled: true},{merge: true});
}

async function acceptNotification(notification)
{
  joinGroup(notification.GroupID);
  await db.collection('Notifications').doc(notification.ID).set({Disabled: true},{merge: true});
}

function getCurrentUser()
{
  return auth.currentUser;
}