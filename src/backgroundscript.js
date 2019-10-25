var AES = require("crypto-ts").AES;
var enc = require("crypto-ts").enc;
var retry = false;

//Executes backgroundcheck when chrome starts and user enabled it
chrome.runtime.onStartup.addListener(function(){
	startup();
});

//Executes backgroundcheck when extension is reloaded or updated
chrome.runtime.onInstalled.addListener(function(details){
	startup();
});

//Schedules the backgroundcheck every 30min
chrome.alarms.onAlarm.addListener(function(alarm){
	if(alarm.name === "checkUnavailableAnimes"){
		chrome.storage.local.get(["disableBackgroundChecks", "firstuse"], function(result) {
			if(result.disableBackgroundChecks !== undefined && result.firstuse !== undefined){
				var disableBackgroundChecks = (AES.decrypt(result.disableBackgroundChecks, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "true");
				var firstuse = (AES.decrypt(result.firstuse, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "true");
				if(!disableBackgroundChecks && !firstuse){
					checkUnavailableAnimes();
				}
				chrome.alarms.create("checkUnavailableAnimes", {delayInMinutes: 30});
			}
		});
	}
});

function startup(){
	chrome.contextMenus.create({title: "Open Crunchysync in a new tab", contexts: ["browser_action"], onclick: function(info){chrome.tabs.create({url: "index.html"});}});
	chrome.alarms.create("checkUnavailableAnimes", {delayInMinutes: 30});
	chrome.storage.local.get(["disableBackgroundChecks", "firstuse"], function(result) {
		if(result.firstuse !== undefined){
			if(result.disableBackgroundChecks !== undefined){
				var disableBackgroundChecks = (AES.decrypt(result.disableBackgroundChecks, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "true");
				var firstuse = (AES.decrypt(result.firstuse, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "true");
				if(!firstuse){
					if(!disableBackgroundChecks){
						checkUnavailableAnimes();
					}
				}else{
					chrome.tabs.create({url: "index.html"});
				}
			}
		}else{
			chrome.tabs.create({url: "index.html"});
		}
	});
}

function authenticate(){
	var sessionid = "";
	chrome.storage.local.get(["username", "password", "deviceid", "forceUsRegion"], function(result) {
		username = AES.decrypt(result.username, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
		password = AES.decrypt(result.password, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
		deviceid = AES.decrypt(result.deviceid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
		forceUsRegion = (AES.decrypt(result.forceUsRegion, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "true");
		if(username != "" && password != ""){
			var apiurl1 = "https://api.crunchyroll.com/start_session.0.json?"+
				"&device_type=com.crunchyroll.crunchyroid"+
				"&access_token=Scwg9PRRZ19iVwD"+
				"&device_id=" + deviceid;
			if(forceUsRegion){
				apiurl1 = "https://api1.cr-unblocker.com/getsession.php?"+
					"&version=1.1" +
					"&device_id=" + deviceid;
			}
			var xmlHttp1 = new XMLHttpRequest();
			xmlHttp1.onreadystatechange = function() {
				if (xmlHttp1.readyState == 4 && xmlHttp1.status == 200){
					if(!JSON.parse(xmlHttp1.responseText).error){
								sessionid = JSON.parse(xmlHttp1.responseText).data.session_id;
								var apiurl2 = "https://api.crunchyroll.com/login.0.json?"+
									"&session_id=" + sessionid +
									"&locale=enUS"+
									"&account=" + encodeURIComponent(username) +
									"&password=" + encodeURIComponent(password);
								var xmlHttp2 = new XMLHttpRequest();
								xmlHttp2.onreadystatechange = function() {
									if (xmlHttp2.readyState == 4 && xmlHttp2.status == 200){
										if(!JSON.parse(xmlHttp2.responseText).error){
											chrome.storage.local.set({"sessionid": AES.encrypt(sessionid, "5HR*98g5a699^9P#f7cz").toString()});
											chrome.storage.local.set({"userIsPremium": AES.encrypt(JSON.parse(xmlHttp2.responseText).data.user.premium.toString(), "5HR*98g5a699^9P#f7cz").toString()});
											checkUnavailableAnimes();
											console.log("authenticated");
										}else{
											error("Login failed! Please make sure your username and password is valid. Discription: " + JSON.parse(xmlHttp2.responseText).message);
										}
									}
								}
								xmlHttp2.open("GET", apiurl2, true);
								xmlHttp2.send(null);
					}else{
						error("Connection failed! Please try again later. Discription: " + JSON.parse(xmlHttp1.responseText).message);
					}
				}
			}
			xmlHttp1.open("GET", apiurl1, true);
			xmlHttp1.send(null);
		}else{
			error("No Credentials set! Please save your credentials in the settingstab.");
		}
	});
}

//Checks if there are changes between current queue and previous queue and notifys the user
function checkUnavailableAnimes(){
	var animes = [];
	var unavailable = [];
	var available = [];
	var watching = [];
	var userIsPremium = false;
	chrome.storage.local.get(["sessionid", "unavailable", "userIsPremium", "forceUsRegion"], function(result) {
		if(result.userIsPremium !== undefined){
			userIsPremium = (result.userIsPremium === "true");
		}
		var locale = "enUS";
		if(AES.decrypt(result.forceUsRegion, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) !== undefined){
			if(AES.decrypt(result.forceUsRegion, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "false"){
				locale = chrome.i18n.getUILanguage();
			}
		}
		var apiurl = "https://api.crunchyroll.com/queue.0.json?"+
			"&fields=most_likely_media,series,series.name,series.media_count,series.series_id,media.description,media.media_id,media.free_available_time,media.collection_name,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.fwide_url"+
			"&media_types=anime|drama"+
			"&locale=" + locale +
			"&session_id=" + AES.decrypt(result.sessionid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() {
			if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
				if(!JSON.parse(xmlHttp.responseText).error){
					if(result.unavailable !== undefined || result.unavailable !== {}){
						animes = JSON.parse(xmlHttp.responseText.replace(/(http:)/g, "https:")).data;
						animes = animes.filter(anime => anime.most_likely_media !== undefined);
						animes.sort((co1, co2) => co1.most_likely_media.collection_name.localeCompare(co2.most_likely_media.collection_name));
						watching = animes.filter(anime => (anime.most_likely_media.playhead < anime.most_likely_media.duration - 10 || anime.most_likely_media.duration == 0) && (anime.most_likely_media.playhead > 0 || anime.most_likely_media.episode_number != 1));
						console.log(animes);
						chrome.storage.local.set({"animes": animes});
						unavailable = animes.filter(anime => anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10);
						if(!userIsPremium){
							unavailable = unavailable.concat(animes.filter(anime => (anime.most_likely_media.playhead <= anime.most_likely_media.duration - 10) && anime.most_likely_media.premium_only));
						}
						chrome.storage.local.set({"unavailable": unavailable});
						unavailable = result.unavailable;
						for(a in unavailable){
							var unavailableAnime = unavailable[a];
							for(b in animes){
								var anime = animes[b];
								if(anime.most_likely_media !== undefined){
									if(anime.most_likely_media.playhead === undefined){
				      			anime.most_likely_media.playhead = 0;
				      		}
									if(anime.series.series_id === unavailableAnime.series.series_id){
										if(anime.most_likely_media.media_id === unavailableAnime.most_likely_media.media_id){
											if(!(anime.most_likely_media.playhead >= unavailableAnime.most_likely_media.duration - 10)){
												if((!anime.most_likely_media.premium_only && unavailableAnime.most_likely_media.premium_only) && !userIsPremium){
													available.push(anime);
												}
											}
											animes.splice(b, 1);
											break;
										}else{
											if(anime.most_likely_media.episode_number > unavailableAnime.most_likely_media.episode_number){
												if(!anime.most_likely_media.premium_only || userIsPremium){
													available.push(anime);
												}
											}
										}
										animes.splice(b, 1);
										break;
									}
								}
							}
						}
						for(i in available){
							var anime = available[i];
							chrome.notifications.create(anime.most_likely_media.url, {type: "image", iconUrl: "assets/images/crunchysync.png", imageUrl: anime.most_likely_media.screenshot_image.fwide_url, title: "A new Episode of " + anime['most_likely_media']['collection_name'] + " is available", message: anime.most_likely_media.name + "\nEpisode Nr." + anime.most_likely_media.episode_number});
						}
						chrome.notifications.onClicked.addListener(function(notificationId) {
							chrome.tabs.create({url: notificationId});
						});
						if(watching.length > 0){
							chrome.browserAction.setBadgeBackgroundColor({ color: [247, 140, 37, 1] });
							chrome.browserAction.setBadgeText({text: watching.length+""});
						}else{
							chrome.browserAction.setBadgeText({text: ""});
						}
					}
				}else{
					if(!retry){
						retry = true;
						authenticate();
					}else{
						error(JSON.parse(xmlHttp.responseText).message);
					}
				}
			}
		}
		xmlHttp.open("GET", apiurl, true);
		xmlHttp.send(null);
	});
}

function error(message){
	chrome.notifications.create({type: "basic", iconUrl: "assets/icons/crunchysync.png", title: "Crunchysync encountered an error", message: message});
}
