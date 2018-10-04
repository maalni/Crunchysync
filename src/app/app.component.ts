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
	retry: boolean = false;

	constructor(private dataService: DataService, private ngZone: NgZone) {}

	ngOnInit() {
		document.addEventListener("onAuthenticatedEvent", (e: Event) => {this.refreshQueue()}, false);
		this.getLocalQueue();
	}

	onSettingsLoadedEventHandler(settings: Array<any>){
		this.settings = settings;
		this.authenticate(settings['username'], settings['password'], settings['sessionid'], settings['deviceid'], true);
	}

	authenticate(username: string, password: string, sessionid: string, deviceid: string, useCachedSessionID: boolean){
		var ang = this;
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			if(cookie != null){
				ang.ngZone.run(() => {
					chrome.storage.local.set({"sessionid": AES.encrypt(cookie.value, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
					ang.settings['sessionid'] = cookie.value;
					document.dispatchEvent(ang.onAuthenticatedEvent);
				});
			}else{
				ang.ngZone.run(() => {
					if((sessionid === "" || sessionid === undefined) && !useCachedSessionID){
						if(username != "" && password != ""){
							ang.dataService.getSessionID(deviceid).subscribe(res => {
								if(!res.error){
									sessionid = res.data.session_id;
									ang.dataService.login(sessionid, username, password).subscribe(res => {
										if(!res.error){
                      chrome.storage.local.set({"sessionid": AES.encrypt(sessionid, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
											chrome.cookies.set({"url": "http://crunchyroll.com", "name": "sess_id", "value": sessionid, "domain": ".crunchyroll.com", "httpOnly": true}, function(){});
											chrome.cookies.set({"url": "http://crunchyroll.com", "name": "session_id", "value": sessionid, "domain": ".crunchyroll.com", "httpOnly": true}, function(){});
											ang.settings['sessionid'] = sessionid;
											ang.settings['deviceid'] = deviceid;
											document.dispatchEvent(ang.onAuthenticatedEvent);
										}
									}, err => this.error("Login failed! Please make sure your username and password is valid. Discription: " + err));
								}
							}, err => this.error("Connection failed! Please try again later. Discription: " + err));
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

	addToQueue(animes: Array<any>){
		if(animes !== undefined){
			animes.sort((a,b) => a.series.name.localeCompare(b.series.name));
			this.animes = animes;
			this.done = [];
			this.watching = [];
			this.unseen = [];
			for(var i in this.animes){
				var anime = this.animes[i];
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

	getLocalQueue(){
		var ang = this;
		this.loading(true);
		chrome.storage.local.get(["animes"], function(result) {
			ang.ngZone.run(() => {
				ang.addToQueue(result.animes);
				ang.loading(false);
			});
		});
	}

	refreshQueue(){
		this.loading(true);
		this.dataService.getQueue(this.settings['sessionid']).subscribe(res => {
			if(!res.error){
				chrome.storage.local.set({"animes": res.data}, function() {});
				this.addToQueue(res.data);
				(<HTMLElement>document.getElementById("cachedwarning")).hidden = true;
        this.loading(false);
			}else{
				if(res.code === 'bad_session' && !this.retry){
					this.retry = true;
					this.authenticate(this.settings['username'], this.settings['password'], this.settings['sessionid'], this.settings['deviceid'], false);
				}else{
					this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + res.code);
          this.loading(false);
				}
			}
		}, err => this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + err));
	}

	onSelectEventHandler(anime: Array<any>){
		this.selectedAnime = anime;
		(<HTMLElement>document.getElementById("selectedAnime")).hidden = false;
	}

	loading(state: boolean){
		(<HTMLElement>document.getElementById("spinner")).hidden = !state;
		if((<HTMLElement>document.getElementById("content").children[4]).hidden){
			(<HTMLElement>document.getElementById("refreshbtn")).hidden = state;
		}
	}

	error(message: string){
		this.errorMessage = message;
		(<HTMLElement>document.getElementById("error")).hidden = false;
	}
}
