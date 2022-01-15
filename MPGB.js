/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
(function() {
  "use strict";

  window.addEventListener("load", initialize);
  var currentGame = null;
  var currentGroup = null;
  var gamesList = null;
  var groupsList = null;
  var notificationsList = null;
  var currentList = null;
  var type = "";

  /**
   * loads the program and makes it ready to use
   */
  function initialize() {
    $("game-list").classList.add("hidden");
    $("chatbox").classList.add("hidden");
    $("search").addEventListener("click", search);
    $("next").addEventListener("click", nextGames);
    $("prev").addEventListener("click", prevGames);
    $("squads").addEventListener("click", squads);
    $("join").addEventListener("click", join);
    $("leave").addEventListener("click", leave);
    $("invite").addEventListener("click", invite);
    $("logOut").addEventListener("click", logOut);
    $("mySquads").addEventListener("click", mySquads);
    $("post").addEventListener("click", postMessage);
    $("notificationIcon").addEventListener("click", startNotifications);
    getGames().then(fillGames);
    getGroups().then(fillGroups);
    setTimeout(() => {getNotifications().then(fillNotList);}, 1000);
  }


  function fillNotList(list) {
    notificationsList = list;
    var count = 0;
console.log(list);
    for (let i = 0; i < list.length; i++){
      if (!list[i].Read) {
        count++;
      }
    }
    if(count > 0) {
      $("count").innerText = "+" + count;
      $("count").classList.remove("hidden");
    } else {
      $("count").classList.add("hidden");
    }
  }

  function fillGames(list) {
    gamesList = list;
  }

  function fillGroups(list) {
    groupsList = list;
  }

  function fillNotifications(list) {
    showMyNotifications(list);
  }


  // searches for a game using whats in the search bar
  // returns a JSON array and then calls showList
  // needs a different fetch call something that uses game
  function search() {
    let game = $("game").value;
    $("game-list").classList.remove("hidden");
    $("page").innerText = 1;
    type = "games";
    showList(gamesList);
    return;
  }

  //grab all notifications and appeand them to the notificationDropdownList
  function startNotifications() {
    getNotifications().then(fillNotifications);
  }

  function showMyNotifications(notificationsList){
    $("notificationDropdownList").innerHTML = "";
    $("count").classList.add("hidden");
    for (let i = 0; i < notificationsList.length; i++) {

      if (!(notificationsList[i].Read)) {
	  readNotification(notificationsList[i]);
      }

      //create text for notification
      var newNotification = document.createElement('p');
      newNotification.setAttribute("Id","not"+i);
      newNotification.setAttribute("class","notif-info");
      newNotification.innerHTML = notificationsList[i].Message;

      //create attributes for delete button
      var newCloseButton = document.createElement('span');
      //newCloseButton.setAttribute("id",notificationsList[i].ID);
      newCloseButton.addEventListener("click", function() {
		$("not"+i).style.display='none';
		closeNotification(notificationsList[i]);
	});
      newCloseButton.setAttribute("class","close-btn");
      newCloseButton.innerHTML = "&Chi;"

      var newJoinButton = document.createElement('span');
      //newCloseButton.setAttribute("id",notificationsList[i].ID);
      newJoinButton.addEventListener("click", function() {
		$("not"+i).style.display='none';
		acceptNotification(notificationsList[i]);
	});
      newJoinButton.setAttribute("class","close-btn");
      newJoinButton.innerHTML = "&Chi;"

      //attach close and open to notification
      newJoinButton.innerHTML = "&check;"
      newNotification.appendChild(newCloseButton);
      newNotification.appendChild(newJoinButton);

      //add to notifications list
      $("notificationDropdownList").appendChild(newNotification);
    }
  }

  // shows a list of 15 games that can be clicked on to enter chat.
  // Use this for the prev and next button.
  function showList(list) {
    $("users-list").classList.add("hidden");
    $("chatbox").classList.add("hidden");
    $("games").innerHTML = "";
    if ($("gameSearch").value !== "") {
      list = sortList(list, $("gameSearch").value);
    }
    currentList = list;
    let gpp = 10
    let page = $("page").innerText;
    for (let i = gpp * (page - 1); i < list.length && i < gpp * page; i++) {
      let div = document.createElement("div");
      let name = document.createElement("p");
      name.setAttribute("a", list[i].name);
      name.innerText = list[i].name;
      div.appendChild(name);
      $("games").appendChild(div);
      if (type === "games") {
        div.addEventListener("click", function() {
          goToChat(list[i]);
          currentGame = list[i];
        });
      } else if (type === "squads") {
        div.addEventListener("click", function() {
          goToSquad(list[i]);
          currentGroup = list[i];
        });
      } else if (type === "notifications") {
        div.addEventListener("click", function() {
          acceptNotification(list[i]);
          currentNotificaion = list[i];
        });
      }
    }

    if (page <= 1) {
      $("prev").classList.add("hidden");
    } else if ($("prev").classList.contains("hidden")) {
      $("prev").classList.remove("hidden");
    }

    if (page > list.length / gpp || (page == list.length / gpp && list.length % gpp == 0)) {
      $("next").classList.add("hidden");
    } else if ($("next").classList.contains("hidden")) {
      $("next").classList.remove("hidden");
    }
  }

  function sortList(list, key) {
    var newList = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i].name.toLowerCase().includes(key.toLowerCase())) {
        newList.push(list[i]);
      }
    }
    return newList;
  }

  // leaves the list of games and opens the chat for the game you want to talk about
  async function goToChat(game) {
    $("chatbox").classList.remove("hidden");
    $("content").innerHTML = "";
    $("game").innerText = game.name;
    var list = await getChat(game);
    for (let i = 0; i < list.length; i++) {
      let div = document.createElement("div");
      let name = document.createElement("p");
      name.setAttribute("a", list[i].Message);
      name.innerText = list[i].Message;
      div.appendChild(name);
      $("content").appendChild(div);
    }
  }

  function nextGames() {
    $("page").innerText++;
    showList(currentList);
  }

  function prevGames() {
    $("page").innerText--;
    showList(currentList);
  }

  // prints all of the messages
  function show(response) {
    $("content").innerText = response;
  }

  function logOut() {
    auth.signOut();
    window.location.href = "login.html";
  }

  function squads() {
    $("game-list").classList.remove("hidden");
    $("chatbox").classList.add("hidden");
    $("page").innerText = 1;
    type = "squads";
    showList(groupsList);
    return;
  }

  function mySquads() {
    $("game-list").classList.remove("hidden");
    $("chatbox").classList.add("hidden");
    $("page").innerText = 1;
    type = "squads";
    getUsersGroups().then(showList);
  }

  async function goToSquad(group) {
    $("game-list").classList.add("hidden");
    $("content").innerHTML = "";
    $("users").innerHTML = "";
    $("game").innerText = group.name;

    var list = await getGroupChat(group);

    for (let i = 0; i < list.length; i++) {
      let div = document.createElement("div");
      let name = document.createElement("p");
      name.setAttribute("a", list[i].Message);
      name.innerText = list[i].Message;
      div.appendChild(name);
      $("content").appendChild(div);
    }

    //needs to add a sizing helper
    var list = await getUsers(currentGroup.ID);
    for (let i = 0; i < list.length; i++) {
      let div = document.createElement("div");
      let name = document.createElement("p");
      name.setAttribute("a", list[i]);
      name.innerText = list[i];
      div.appendChild(name);
      $("users").appendChild(div);
    }

    var user = await getCurrentUser();

    if (inSquad(user.email, list)) {
      $("leave").classList.remove("hidden");
      $("join").classList.add("hidden");
      $("invite").classList.remove("hidden");
      $("users").classList.remove("hidden");
      $("chatbox").classList.remove("hidden");
    } else {
      $("leave").classList.add("hidden");
      $("users").classList.add("hidden");
      $("chatbox").classList.add("hidden");
      $("join").classList.remove("hidden");
      $("invite").classList.add("hidden");
    }
    $("users-list").classList.remove("hidden");
  }

  //add message to database
  function postMessage() {
    if (type === "games") {
      sendMessage(currentGame.ID, $('chatMessage').value);
      $('chatMessage').value = '';
      goToChat(currentGame);
    } else if (type === "squads") {
      sendGroupMessage(currentGroup.ID, $('chatMessage').value);
      $('chatMessage').value = '';
      goToSquad(currentGroup);
    }

  }

  function getUser(user) {
    return user;
  }

  function inSquad(name, squad) {
    for (let i = 0; i < squad.length; i++) {
      if (name.substring(0, name.length - 9) == squad[i]) {
        return true;
      }
    }
    return false;
  }

  function join() {
    if (auth.currentUser == null) return 0;
    joinGroup(currentGroup.ID);
    goToSquad(currentGroup);
  }

  function leave() {
    if (auth.currentUser == null) return 0;
    leaveGroup(currentGroup.ID);
    goToSquad(currentGroup);
  }

  function invite()
  {
    if (auth.currentUser == null) return 0;

    var username = prompt("Who would you like to invite?", "Username");
    createNotification(username, currentGroup);
  }

  // ---------------------------------------------------------------------------
  //HELPER FUCTIONS

  // Helper function to return the response's result text if successful, otherwise
  // returns the rejected Promise result with an error status and corresponding text
  function checkStatus(response) {
    const OK = 200;
    const ERROR = 300;
    let responseText = response.text();
    if (response.status >= OK && response.status < ERROR || response.status === 0) {
      return responseText;
    } else {
      return responseText.then(Promise.reject.bind(Promise));
    }
  }


  // returns an html item with the given id
  function $(id) {
    return document.getElementById(id);
  }

})();
