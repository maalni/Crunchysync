var createdtab = undefined;
var animes = [];
var unavailable = [];
var available = [];

//Executes backgroundcheck when chrome starts and user enabled it
chrome.runtime.onStartup.addListener(function(){
	chrome.storage.local.get(["disableBackgroundChecks", "firstuse"], function(result) {
		if((result.disableBackgroundChecks !== undefined && result.disableBackgroundChecks === "false") && (result.firstuse !== undefined && result.firstuse === "false")){
			chrome.tabs.create({url: "index.html"}, function(tab){
				createdtab = tab;
			});
		}
	});
});

//Executes backgroundcheck when extension is reloaded or updated
chrome.runtime.onInstalled.addListener(function(details){
	chrome.storage.local.get(["disableBackgroundChecks"], function(result) {
		if((result.disableBackgroundChecks !== undefined && result.disableBackgroundChecks === "false") && (result.firstuse !== undefined && result.firstuse === "false")){
			chrome.tabs.create({url: "index.html"}, function(tab){
				createdtab = tab;
			});
		}
	});
});

//Schedules the backgroundcheck every 30min
chrome.alarms.onAlarm.addListener(function(alarm){
	if(alarm.name === "checkUnavailableAnimes"){
		checkUnavailableAnimes();
	}
});

//Return the requested session cookie and injects css to the contentscript
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if(request.data == "onAuthenticatedEvent"){
		chrome.tabs.query({url: "chrome-extension://*/index.html"}, function(result){
			if(createdtab !== undefined){
				checkUnavailableAnimes();
				for(var i in result){
					var tab = result[i];
					if(tab.id === createdtab.id){
						chrome.tabs.remove(createdtab.id);
						createdtab = undefined;
						break;
					}
				}
			}
		});
	}
	if(request.data == "getSessionId"){
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			sendResponse({sessionid: cookie});
		});
		return true;
	}
	if(request.data == "injectContentScriptCss"){
		chrome.tabs.query({url: "*://*.crunchyroll.com/home/queue*"}, function(result){
			chrome.tabs.insertCSS(result[0].id, {file: "queuescript.min.css"});
		});
	}
});

//Checks if there are changes between current queue and previous queue and notifys the user
function checkUnavailableAnimes(){
	chrome.storage.local.get(["unavailable"], function(result) {
		if(result.unavailable !== undefined){
			chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
				var apiurl = "https://api.crunchyroll.com/queue.0.json?"+
					"&fields=most_likely_media,series,series.name,series.media_count,series.series_id,media.description,media.media_id,media.free_available_time,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.fwide_url"+
					"&media_types=anime|drama"+
					"&locale=enUS"+
					"&session_id=" + cookie.value;
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.onreadystatechange = function() {
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
						if(!JSON.parse(xmlHttp.responseText).error){
							unavailable = result.unavailable;
							animes = JSON.parse(xmlHttp.responseText).data;
							animes.sort((co1, co2) => co1.series.name.localeCompare(co2.series.name));
							chrome.storage.local.set({"animes": animes});
							console.log(unavailable.length);
							for(a in unavailable){
								var unavailableAnime = unavailable[a];
								console.log(unavailableAnime);
								console.log("a");
								for(b in animes){
									var anime = animes[b];
									if(anime.series.series_id === unavailableAnime.series.series_id){
										console.log("same series");
										if(anime.most_likely_media.media_id === unavailableAnime.most_likely_media.media_id){
											console.log("same episode");
											if(!(anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10)){
												console.log("not watched");
												if(!anime.most_likely_media.premium_only && unavailableAnime.most_likely_media.premium_only){
													console.log("not premium");
													available.push(anime);
													unavailable.splice(a, 1);
													break;
												}
											}
										}else{
											available.push(anime);
											unavailable.splice(a, 1);
											break;
										}
									}
								}
							}
							for(i in available){
								var anime = available[i];
								chrome.notifications.create({type: "image", iconUrl: "assets/icons/premium.png", imageUrl: anime.most_likely_media.screenshot_image.fwide_url, title: "A new Episode of " + anime.series.name + " is available", message: anime.most_likely_media.name + "\nEpisode Nr." + anime.most_likely_media.episode_number});
							}
							chrome.storage.local.get(["userIsPremium"], function(result) {
								unavailable = animes.filter(anime => anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10);
								if(result.userIsPremium !== undefined && (result.userIsPremium === "false")){
									unavailable = unavailable.concat(animes.filter(anime => anime.most_likely_media.premium_only));
								}
								console.log(unavailable);
								chrome.storage.local.set({"unavailable": unavailable});
							});
							chrome.alarms.create("checkUnavailableAnimes", {delayInMinutes: 30});
						}else{
							chrome.notifications.create({type: "basic", iconUrl: "assets/icons/premium.png", title: "Crunchysync's backgroundsync encountered an error", message: JSON.parse(xmlHttp.responseText).code});
						}
					}
				}
				xmlHttp.open("GET", apiurl, true);
				xmlHttp.send(null);
			});
		}
	});
}
