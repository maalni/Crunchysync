var manifestData = chrome.runtime.getManifest();
var currentlySelected = 0;

console.log("----------Crunchysync Contentscript v" + manifestData.version + "----------");
console.log("Adding custom styling...");
document.getElementById("sidebar_elements").innerHTML = "";
document.getElementById("sortable").innerHTML =
	"<style>"+
		"#sortable div{"+
			"color: black;"+
		"}"+
		"#sortable div li{"+
			"position: relative;"+
			"width: 960px;"+
			"height: 150px;"+
			"margin-bottom: 10px;"+
			"border: none;"+
			"border-radius: 5px;"+
			"background-color: white;"+
			"overflow: hidden;"+
		"}"+
		"#sortable div li:hover{"+
			"background-color: rgba(255, 255, 255, 0.5);"+
		"}"+
		"#sortable div li .playbutton{"+
			"position: absolute;"+
			"top: 90px;"+
			"left: 207px;"+
			"width: 50px;"+
			"height: 50px;"+
			"border-radius: 25px;"+
			"visibility: hidden;"+
			"background-color: rgba(0,0,0,0.5);"+
		"}"+
		"#sortable div li:hover .playbutton{"+
			"visibility: visible;"+
		"}"+
		"#sortable div li a{"+
			"position: absolute;"+
			"top: 0;"+
			"left: 0;"+
			"width: 960px;"+
			"height: 150px;"+
		"}"+
		"#sortable div li img{"+
			"position: absolute;"+
			"top: 0;"+
			"left: 0;"+
			"width: auto;"+
			"height: 150px;"+
			"border: none;"+
		"}"+
		"#sortable div li .premiumIcon{"+
			"position: absolute;"+
			"top: 10px;"+
			"left: 10px;"+
			"width: 25px;"+
			"height: 25px;"+
		"}"+
		"#sortable div li .premiumDate{"+
			"position: absolute;"+
			"top: 10px;"+
			"left: 10px;"+
			"padding-left: 25px;"+
			"padding-right: 5px;"+
			"font-size: 10pt;"+
			"line-height: 25px;"+
			"text-align: center;"+
			"color: white;"+
			"background-color: rgba(0,0,0,0.5);"+
			"border-radius: 5px;"+
		"}"+
		"#sortable progress{"+
			"position: absolute;"+
			"-webkit-appearance: none;"+
			"background-color: rgba(0,0,0,0);"+
			"bottom: 0;"+
			"left: 0;"+
			"width: 960px;"+
			"height: 5px;"+
		"}"+
		"#sortable progress[value]::-webkit-progress-bar{"+
			"background-color: rgba(0,0,0,0);"+
		"}"+
		"#sortable progress[value]::-webkit-progress-value{"+
			"background-color: orange;"+
		"}"+
		"#sortable .animeTitle{"+
			"color: white;"+
			"position: absolute;"+
			"top: 5px;"+
			"left: 275px;"+
			"font-size: 11pt;"+
			"padding: 0 5px;"+
			"background-color: orange;"+
		"}"+
		"#sortable .episodeName{"+
			"color: white;"+
			"position: absolute;"+
			"top: 23px;"+
			"left: 275px;"+
			"font-size: 13pt;"+
			"padding: 0 5px;"+
			"background-color: orange;"+
			"font-weight: bold;"+
		"}"+
		"#sortable .episodeNumber{"+
			"color: white;"+
			"position: absolute;"+
			"top: 44px;"+
			"left: 275px;"+
			"font-size: 10pt;"+
			"padding: 0 5px;"+
			"background-color: orange;"+
		"}"+
		"#sortable .description{"+
			"position: absolute;"+
			"top: 65px;"+
			"left: 275px;"+
			"height: 80px;"+
			"overflow: hidden;"+
		"}"+
		"#sortable #cachedwarning{"+
			"color: white;"+
			"width: 960px;"+
			"height: 17px;"+
			"margin-top: -16px;"+
			"margin-bottom: 16px;"+
			"background-color: #f78c25;"+
			"text-align: center;"+
		"}"+
		"#refreshbtn{"+
			"position: fixed;"+
			"bottom: 10px;"+
			"right: 10px;"+
			"width: 115px;"+
			"height: 40px;"+
			"border: none;"+
			"border-radius: 25px;"+
			"color: white;"+
			"background-color: #f78c25;"+
		"}"+
		"#refreshbtn img{"+
			"position: absolute;"+
			"left: 10px;"+
			"top: 0px;"+
			"bottom: 0px;"+
			"margin: auto;"+
			"width: 30px;"+
			"height: 30px;"+
			"border: none;"+
		"}"+
		"#refreshbtn span{"+
			"position: absolute;"+
			"left: 40px;"+
			"top: 0px;"+
			"line-height: 40px;"+
			"font-size: 13pt;"+
		"}"+
	"</style><div id='cachedwarning'>Cached</div><div id='watching'></div><div id='unseen' hidden></div><div id='done' hidden></div><div id='all' hidden></div><button id='refreshbtn' hidden><img src="+chrome.runtime.getURL("assets/icons/refresh.svg")+"><span>Refresh</span></button>";
document.getElementsByClassName("main-tabs")[0].innerHTML = "<a id='watchingbtn' class='left selected'>Watching</a><a id='unseenbtn' class='left'>Unseen</a><a id='donebtn' class='left'>Done</a><a id='allbtn' class='left'>All</a>";
console.log("Adding Eventlisteners...");
document.getElementById("refreshbtn").addEventListener("click", function(){refreshQueue();});
document.getElementById("watchingbtn").addEventListener("click", function(){changeTab(0);});
document.getElementById("unseenbtn").addEventListener("click", function(){changeTab(1);});
document.getElementById("donebtn").addEventListener("click", function(){changeTab(2);});
document.getElementById("allbtn").addEventListener("click", function(){changeTab(3);});
chrome.storage.local.get(["animes"], function(result) {
	addAnimesToDom(result.animes);
	refreshQueue();
	console.log("----------Crunchysync Contentscript v" + manifestData.version + "----------");
});

function addAnimesToDom(animes){
	console.log("Loading Queue...");
	var t0 = performance.now();
	var premiumiconsrc = chrome.runtime.getURL("assets/icons/premium.png");
	var playiconsrc = chrome.runtime.getURL("assets/icons/openSelectedEpisode.svg");
	var all = [];
	var done = [];
	var watching = [];
	var unseen = [];
	for(var i in animes){
		var anime = animes[i];
		var date = new Date(anime.most_likely_media.free_available_time);
		var options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
		var formattedDate = date.toLocaleDateString(undefined, options);
		if(anime.most_likely_media.playhead === undefined){
			anime.most_likely_media.playhead = 0;
		}
		if(anime.most_likely_media.episode_number === "" || anime.most_likely_media.episode_number === undefined){
			anime.most_likely_media.episode_number = "N/A";
		}
		var element = "<li name="+anime.most_likely_media.name+"><a href="+anime.most_likely_media.url+"><img src="+anime.most_likely_media.screenshot_image.fwide_url+">";
		if(anime.most_likely_media.premium_only){
			element += "<span class='premiumDate'>"+formattedDate.replace(new RegExp(",", 'g'), "")+"</span><img class='premiumIcon' src="+premiumiconsrc+">";
		}
		element += "<img class='playbutton' src="+playiconsrc+"><progress value="+anime.most_likely_media.playhead+" max="+anime.most_likely_media.duration+"></progress><div><span class='animeTitle'>"+anime.series.name+"</span><span class='episodeName'>"+anime.most_likely_media.name + "</span><span class='episodeNumber'> Episode Nr."+anime.most_likely_media.episode_number+"</span><span class='description'>"+anime.most_likely_media.description+"</span></div></a></li>";
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
	document.getElementById("all").innerHTML = all.join("");
	document.getElementById("done").innerHTML = done.join("");
	document.getElementById("watching").innerHTML = watching.join("");
	document.getElementById("unseen").innerHTML = unseen.join("");
	var t1 = performance.now();
	console.log("Queue loaded! ("+animes.length+" items, "+(t1-t0)+"ms)");
}

function changeTab(selected){
	document.getElementsByClassName("main-tabs")[0].children[this.currentlySelected].classList.remove("selected");
	document.getElementById("sortable").children[this.currentlySelected + 2].hidden = true;
	document.getElementsByClassName("main-tabs")[0].children[selected].classList.add("selected");
	document.getElementById("sortable").children[selected + 2].hidden = false;
	this.currentlySelected = selected;
}

function refreshQueue(){
	console.log("Refreshing queue...");
	document.getElementById("refreshbtn").hidden = true;
	chrome.runtime.sendMessage({data: "getCrunchyrollSessionCookie"}, function(response){
		if(response.sessionid != null){
			var apiurl = "https://api.crunchyroll.com/queue.0.json?"+
				"&fields=most_likely_media,series,series.name,series.description,series.media_count,media.description,media.media_id,media.unavailable_time,media.premium_unavailable_time,media.premium_available_time,media.premium_available,media.free_unavailable_time,media.free_available_time,media.free_available,media.available_time,media.available,media.availability_notes,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.wide_url,image.fwide_url,image.fwidestar_url,image.widestar_url"+
				"&media_types=anime|drama"+
				"&locale=enUS"+
				"&session_id=" + response.sessionid.value;
			var xmlHttp = new XMLHttpRequest();
    	xmlHttp.onreadystatechange = function() {
      	if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
        	addAnimesToDom(JSON.parse(xmlHttp.responseText).data);
					document.getElementById("cachedwarning").hidden = true;
					document.getElementById("refreshbtn").hidden = false;
					console.log("Queue refreshed!");
				}
	    }
	    xmlHttp.open("GET", apiurl, true);
	    xmlHttp.send(null);
		}
	});
}
