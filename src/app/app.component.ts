import { Component, OnInit, NgZone } from '@angular/core';
import { DataService } from './data.service';
import { AES } from 'crypto-ts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {

	onAuthenticatedEvent: any = new Event('onAuthenticatedEvent');
	settings: Array<any> = new Array();
	animes: Array<any> = new Array();
	unseen: Array<any> = new Array();
	done: Array<any> = new Array();
	watching: Array<any> = new Array();
	selectedAnime: Array<any> = new Array();
	errorMessage: string = "";
	updateVersion: number = 0;
	retry: boolean = false;
	cachedQueue: boolean = true;

	constructor(private dataService: DataService, private ngZone: NgZone) {}

	ngOnInit() {
		document.addEventListener("onAuthenticatedEvent", (e: Event) => {this.refreshQueue()}, false);
		this.getLocalQueue();

		this.checkExtensionUpdate();
	}

	//Checks, if an update is available and notifys the user
	checkExtensionUpdate(){
		this.dataService.getGitlabVersion().subscribe(res => {
			var onlineVersion = parseInt(res.replace(/[v\.]/g, ""), 10);
			var extensionVersion = parseInt(this.settings['version'].replace(/[v\.]/g, ""), 10);
			if(onlineVersion > extensionVersion){
				this.updateVersion = res;
			}
		});
	}

  /*Authenticates the user through several methods:
     1. Cookies
     2. Cached sessionid
     3. Username and password
    Variables:
    String username = Users provided username
    String password = Users provided password
    String sessionid = Cached sessionid
    String deviceid = Extensions deviceid
		Boolean forceUsRegion = Use OneStay's servers to force a US session
    Boolean ignoreCache = Force cache to be ignored*/
	authenticate(username, password, sessionid, deviceid: string, forceUsRegion, ignoreCache: boolean){
		var ang = this;
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			if(cookie != null && !ignoreCache){
				ang.ngZone.run(() => {
					chrome.storage.local.set({"sessionid": AES.encrypt(cookie.value, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
					ang.settings['sessionid'] = cookie.value;
					document.dispatchEvent(ang.onAuthenticatedEvent);
				});
			}else{
				ang.ngZone.run(() => {
					if((sessionid === "" || sessionid === undefined) || ignoreCache){
						if(username != "" && password != ""){
							ang.dataService.getSessionID(deviceid, forceUsRegion).subscribe(res => {
								if(!res.error){
									sessionid = res.data.session_id;
									ang.dataService.login(sessionid, username, password).subscribe(res => {
										if(!res.error){
                      chrome.storage.local.set({"sessionid": AES.encrypt(sessionid, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
											chrome.cookies.set({"url": "http://crunchyroll.com", "name": "sess_id", "value": sessionid, "domain": ".crunchyroll.com", "httpOnly": true}, function(){});
											chrome.cookies.set({"url": "http://crunchyroll.com", "name": "session_id", "value": sessionid, "domain": ".crunchyroll.com", "httpOnly": true}, function(){});
											ang.settings['sessionid'] = sessionid;
											document.dispatchEvent(ang.onAuthenticatedEvent);
										}else{
											ang.error("Login failed! Please make sure your username and password is valid. Discription: " + res.code);
										}
									}, err => ang.error("Login failed! Please make sure your username and password is valid. Discription: " + err));
								}else{
									ang.error("Connection failed! Please try again later. Discription: " + res.code)
								}
							}, err => ang.error("Connection failed! Please try again later. Discription: " + err));
						}else{
							ang.error("No Cookie set! Please visit http://www.crunchyroll.com or save your credentials in the settingstab.");
						}
					}else{
						document.dispatchEvent(ang.onAuthenticatedEvent);
					}
					ang.loading(false);
				});
			}
		});
	}

  /*Sorts animes to arrays
    Variables:
    Array<any> animes = List of animes, which should get sorted*/
	sortAnimes(animes: Array<any>){
		if(animes !== undefined){
			animes.sort((a,b) => a.series.name.localeCompare(b.series.name));
			this.animes = animes;
			this.done = [];
			this.watching = [];
			this.unseen = [];
			for(var i in this.animes){
				var anime = this.animes[i];
        if(anime.most_likely_media.playhead === undefined){
    			anime.most_likely_media.playhead = 0;
    		}
				if(anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10){
					this.done.push(anime);
				}else{
					if(anime.most_likely_media.playhead > 0 || anime.most_likely_media.episode_number != 1){
						this.watching.push(anime);
					}else{
						this.unseen.push(anime);
					}
				}
			}
			if(this.watching.length > 0){
				chrome.browserAction.setBadgeBackgroundColor({ color: [247, 140, 37, 1] });
				chrome.browserAction.setBadgeText({text: this.watching.length+""});
			}
		}
	}

  //Loads cached queue from chromes local storage
	getLocalQueue(){
		var ang = this;
		this.loading(true);
		chrome.storage.local.get(["animes"], function(result) {
			ang.ngZone.run(() => {
				ang.sortAnimes(result.animes);
				ang.loading(false);
			});
		});
	}

  //Refreshes the cached animes
	refreshQueue(){
		this.loading(true);
		this.dataService.getQueue(this.settings['sessionid']).subscribe(res => {
			if(!res.error){
				chrome.storage.local.set({"animes": res.data}, function() {});
				this.sortAnimes(res.data);
				this.cachedQueue = false;
        this.loading(false);
			}else{
				if((res.code === 'bad_session' || res.code === 'bad_request')&& !this.retry){
					this.retry = true;
					this.authenticate(this.settings['username'], this.settings['password'], this.settings['sessionid'], this.settings['deviceid'], this.settings['forceUsRegion'], true);
				}else{
					this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + res.code);
          this.loading(false);
				}
			}
		}, err => this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + err));
	}

  /*Syncs the selected anime between <app-category> and <app-selected-anime>
    Variables:
    Array<any> anime = selected anime from <app-category>*/
	onSelectEventHandler(anime: Array<any>){
		this.selectedAnime = anime;
		(<HTMLElement>document.getElementById("selectedAnime")).hidden = false;
	}

	/*Authenticates the user, once the settings are loaded
    Variables:
    Array<any> settings = loaded settings from chrome local storage*/
	onSettingsLoadedEventHandler(settings: Array<any>){
		this.settings = settings;
		this.authenticate(settings['username'], settings['password'], settings['sessionid'], settings['deviceid'], settings['forceUsRegion'], false);
	}

	/*Triggered when settings are changed
    Variables:
    Array<any> settings = loaded settings from chrome local storage*/
	onSettingsChangedEventHandler(settings: Array<any>){
		this.settings = settings;
	}

  /*Shows or hides the loading animation
    Variables:
    Boolean state = */
	loading(state: boolean){
		(<HTMLElement>document.getElementById("spinner")).hidden = !state;
		if((<HTMLElement>document.getElementById("content").children[4]).hidden){
			(<HTMLElement>document.getElementById("refreshbtn")).hidden = state;
		}
	}

  /*Shows an error with the given message
    Variables:
    String message = Errormessage*/
	error(message: string){
		this.errorMessage = message;
	}

	openUpdate(){
		window.open("https://gitlab.com/maalni/crunchysync/tags/"+this.updateVersion);
	}
}
