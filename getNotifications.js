function getNotificationsList (){
	//get list of notificaions
	let notList = getNotifications();
	
	
	//create notifications divs
	for (let i = 0; i<notList.length; i++){
		let div = document.createElement("div");
		let name = document.createElement("p");
		name.setAttribute("a", notList[i].id);
		name.innerText = notList[i].id;
		div.appendChild(name);
		div.addEventListener("click",acceptNotification(notList[i]));
	}	
}