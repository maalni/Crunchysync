var createdtab = undefined;
var animes = [];
var unavailable = [];
var available = [];
var userIsPremium = false;

//Executes backgroundcheck when chrome starts and user enabled it
chrome.runtime.onStartup.addListener(function(){
	chrome.storage.local.get(["disableBackgroundChecks", "firstuse"], function(result) {
		if((result.disableBackgroundChecks !== undefined && result.disableBackgroundChecks === "false") && (result.firstuse !== undefined && result.firstuse === "false")){
			chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
				if(cookie == null){
					chrome.tabs.create({url: "index.html"}, function(tab){
						createdtab = tab;
					});
				}else{
					checkUnavailableAnimes();
				}
			});
		}
	});
});

//Executes backgroundcheck when extension is reloaded or updated
chrome.runtime.onInstalled.addListener(function(details){
	chrome.storage.local.get(["disableBackgroundChecks", "firstuse"], function(result) {
		if((result.disableBackgroundChecks !== undefined && result.disableBackgroundChecks === "false") && (result.firstuse !== undefined && result.firstuse === "false")){
			chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
				if(cookie == null){
					chrome.tabs.create({url: "index.html"}, function(tab){
						createdtab = tab;
					});
				}else{
					checkUnavailableAnimes();
				}
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
});

//Checks if there are changes between current queue and previous queue and notifys the user
function checkUnavailableAnimes(){
	chrome.storage.local.get(["unavailable","userIsPremium"], function(result) {
		if(result.userIsPremium !== undefined){
			userIsPremium = (result.userIsPremium === "true");
		}
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			if(cookie != null){
				var locale = "en";
				var apiurl = "https://api.crunchyroll.com/queue.0.json?"+
					"&fields=most_likely_media,series,series.name,series.media_count,series.series_id,media.description,media.media_id,media.free_available_time,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.fwide_url"+
					"&media_types=anime|drama"+
					"&locale=" + locale +
					"&session_id=" + cookie.value;
				var xmlHttp = new XMLHttpRequest();
				xmlHttp.onreadystatechange = function() {
					if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
						if(!JSON.parse(xmlHttp.responseText).error){
							chrome.alarms.create("checkUnavailableAnimes", {delayInMinutes: 30});
							if(result.unavailable !== undefined || result.unavailable !== {}){
								unavailable = result.unavailable;
								animes = JSON.parse(xmlHttp.responseText).data;
								animes.sort((co1, co2) => co1.series.name.localeCompare(co2.series.name));
								chrome.storage.local.set({"animes": animes});
								for(a in unavailable){
									var unavailableAnime = unavailable[a];
									for(b in animes){
										var anime = animes[b];
										if(anime.most_likely_media !== undefined){
											if(anime.series.series_id === unavailableAnime.series.series_id){
												if(anime.most_likely_media.media_id === unavailableAnime.most_likely_media.media_id){
													if(!(anime.most_likely_media.playhead >= unavailableAnime.most_likely_media.duration - 10)){
														if(!anime.most_likely_media.premium_only && unavailableAnime.most_likely_media.premium_only){
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
								}
								for(i in available){
									var anime = available[i];
									chrome.notifications.create(anime.most_likely_media.url, {type: "image", iconUrl: "assets/icons/crunchysync.png", imageUrl: anime.most_likely_media.screenshot_image.fwide_url, title: "A new Episode of " + anime.series.name + " is available", message: anime.most_likely_media.name + "\nEpisode Nr." + anime.most_likely_media.episode_number});
								}
								chrome.notifications.onClicked.addListener(function(notificationId) {
								  chrome.tabs.create({url: notificationId});
								});
							}
							animes = animes.filter(anime => anime.most_likely_media !== undefined);
							unavailable = animes.filter(anime =>anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10);
							if(userIsPremium == false){
								unavailable = unavailable.concat(animes.filter(anime => anime.most_likely_media.premium_only));
							}
							chrome.storage.local.set({"unavailable": unavailable});
						}else{
							chrome.notifications.create({type: "basic", iconUrl: "assets/icons/crunchysync.png", title: "Crunchysync's backgroundsync encountered an error", message: JSON.parse(xmlHttp.responseText).code});
						}
					}
				}
				xmlHttp.open("GET", apiurl, true);
				xmlHttp.send(null);
			}
		});
	});
}
