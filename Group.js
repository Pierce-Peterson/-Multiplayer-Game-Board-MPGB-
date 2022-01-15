(function() {
    "use strict";

    window.addEventListener("load", initialize);

    /**
    * loads the program and makes it ready to use
    */
    function initialize() {
        
        //$("squads").addEventListener("click", squads);
        //$("join").addEventListener("click", join);
        $("create").addEventListener("click", create);
        //$("leave").addEventListener("click", leave);

        
    }
    
    function squads() {
        window.location.href = "MPGB.html";
        return;
    }
    
    function goToSquad(squad) {
        $("game-list").classList.add("hidden");
        $("game").innerText = squad;
        if(inSquad(squad)) {
            goToChat();
            $("leave").classList.remove("hidden");
        } else {
            $("chatbox").classList.add("hidden");
            $("join").classList.remove("hidden");
        }
    }
    
    function join() {
        let group = $("game").innerText;
        // a function that adds user to group from database
        goToSquad($("game").innerText);
    }
    
    function leave() {
        let group = $("game").innerText;
        // a function that removes users from group from database
        goToSquad($("game").innerText);
    }
    
    async function create() {
        var groupName = $("group-name").value;
        var description = $("group-description").value;
        var isPrivate = document.getElementById("radioPrivate").checked;

        await createGroup(groupName, description, isPrivate);
        squads();
        
    }

    function testAlert(){
        alert("This button called the script");
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


