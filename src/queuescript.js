var currentlySelected = 0;
var premiumiconsrc = chrome.runtime.getURL("assets/icons/premium.png");
var playiconsrc = chrome.runtime.getURL("assets/icons/openSelectedEpisode.svg");

prepareDOM();
addEventListeners();
getLocalQueue();
refreshQueue();

//Removes sidebar_element and adds styles and containers to DOM
function prepareDOM(){
	document.getElementById("sidebar_elements").innerHTML = "";
	document.getElementById("sortable").innerHTML = "<div id='cachedwarning'>Cached</div><div id='watching'></div><div id='unseen' hidden></div><div id='done' hidden></div><div id='all' hidden></div><button id='refreshbtn' hidden><img src="+chrome.runtime.getURL("assets/icons/refresh.svg")+"><span>Refresh</span></button>";
	document.getElementsByClassName("main-tabs")[0].innerHTML = "<a id='watchingbtn' class='left selected'>Watching</a><a id='unseenbtn' class='left'>Unseen</a><a id='donebtn' class='left'>Done</a><a id='allbtn' class='left'>All</a>";
	chrome.runtime.sendMessage({data: "injectContentScriptCss"});
}

//Add eventlisteners to buttons to interact with the page
function addEventListeners(){
	document.getElementById("refreshbtn").addEventListener("click", function(){refreshQueue();});
	document.getElementById("watchingbtn").addEventListener("click", function(){changeTab(0);});
	document.getElementById("unseenbtn").addEventListener("click", function(){changeTab(1);});
	document.getElementById("donebtn").addEventListener("click", function(){changeTab(2);});
	document.getElementById("allbtn").addEventListener("click", function(){changeTab(3);});
}

/*Iterates the given list of animes, sorts them and adds them to the DOM
	Variables:
	Array<any> animes = List of animes, which should be added to DOM*/
function addAnimesToDom(animes){
	if(animes !== undefined){
		animes.sort((co1, co2) => co1['series']['name'].localeCompare(co2['series']['name']));
		var all = [], done = [], watching = [], unseen = [];
		for(var i in animes){
			var anime = animes[i];
			var element = "<li name="+anime.most_likely_media.name+"><a href="+anime.most_likely_media.url+"><img src="+anime.most_likely_media.screenshot_image.fwide_url+">";
			if(anime.most_likely_media.playhead === undefined){
				anime.most_likely_media.playhead = 0;
			}
			if(anime.most_likely_media.premium_only){
				element += "<span class='premiumDate'>"+new Date(anime.most_likely_media.free_available_time).toLocaleDateString(undefined, { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(new RegExp(",", 'g'), "")+"</span><img class='premiumIcon' src="+premiumiconsrc+">";
			}
			element += "<img class='playbutton' src="+playiconsrc+"><progress value="+anime.most_likely_media.playhead+" max="+anime.most_likely_media.duration+"></progress><div><span class='animeTitle'>"+anime.series.name+"</span><span class='episodeName'>"+anime.most_likely_media.name + "</span>"
			if(anime.most_likely_media.episode_number !== "" || anime.most_likely_media.episode_number !== undefined){
					element += "<span class='episodeNumber'> Episode Nr."+anime.most_likely_media.episode_number+"</span>";
			}
			element += "<span class='description'>"+anime.most_likely_media.description+"</span></div></a></li>";
			all.push(element);
			if(anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10){
				done.push(element);
			}else{
				if(anime.most_likely_media.playhead > 0 || anime.most_likely_media.episode_number != 1){
					watching.push(element);
				}else{
					unseen.push(element);
				}
			}
		}
		//Add animes finally to DOM
		document.getElementById("all").innerHTML = all.join("");
		document.getElementById("done").innerHTML = done.join("");
		document.getElementById("watching").innerHTML = watching.join("");
		document.getElementById("unseen").innerHTML = unseen.join("");
	}
}

/*Changes the visibility of the current and selected tabs
	Variables:
	Number selected = Number of the tab, which should get selected*/
function changeTab(selected){
	if(selected >= 0 && selected <=3){
		document.getElementsByClassName("main-tabs")[0].children[this.currentlySelected].classList.remove("selected");
		document.getElementById("sortable").children[this.currentlySelected + 1].hidden = true;
		document.getElementsByClassName("main-tabs")[0].children[selected].classList.add("selected");
		document.getElementById("sortable").children[selected + 1].hidden = false;
		this.currentlySelected = selected;
	}
}

//Get cached anime and add them to DOM
function getLocalQueue(){
	chrome.storage.local.get(["animes"], function(result) {
		addAnimesToDom(result.animes);
	});
}

//Refresh animes and add them to DOM
function refreshQueue(){
	document.getElementById("refreshbtn").hidden = true;
	chrome.runtime.sendMessage({data: "getSessionId"}, function(response){
		if(response.sessionid !== undefined){
			var apiurl = "https://api.crunchyroll.com/queue.0.json?"+
				"&fields=most_likely_media,series,series.name,series.media_count,media.description,media.media_id,media.free_available_time,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.fwide_url"+
				"&media_types=anime|drama"+
				"&locale=enUS"+
				"&session_id=" + response.sessionid.value;
			var xmlHttp = new XMLHttpRequest();
    	xmlHttp.onreadystatechange = function() {
      	if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
        	addAnimesToDom(JSON.parse(xmlHttp.responseText).data);
					document.getElementById("cachedwarning").hidden = true;
					document.getElementById("refreshbtn").hidden = false;
				}
	    }
	    xmlHttp.open("GET", apiurl, true);
	    xmlHttp.send(null);
		}
	});
}
