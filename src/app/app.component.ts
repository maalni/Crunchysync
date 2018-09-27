import { Component, OnInit, NgZone } from '@angular/core';
import { DataService } from './data.service';

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

	constructor(private dataService: DataService, private ngZone: NgZone) {}

	ngOnInit() {
		document.addEventListener("onAuthenticatedEvent", (e: Event) => {this.refreshQueue()}, false);
		this.getLocalQueue();
	}

	onSettingsLoadedEventHandler(settings: Array<any>){
		this.settings = settings;
		this.authenticate(settings['username'], settings['password'], settings['sessionid'], settings['deviceid']);
	}

	authenticate(username: string, password: string, sessionid: string, deviceid: string){
		var ang = this;
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			if(cookie != null){
				ang.ngZone.run(() => {
					sessionid = cookie.value;
					document.dispatchEvent(ang.onAuthenticatedEvent);
				});
			}else{
				ang.ngZone.run(() => {
					if(sessionid === "" || sessionid === undefined){
						if(username != "" && password != ""){
							ang.dataService.getSessionID(deviceid).subscribe(res => {
								if(!res.error){
									chrome.storage.local.set({"sessionid": res.data.session_id, "deviceid": res.data.device_id}, function() {});
									sessionid = res.data.session_id;
									deviceid = res.data.device_id;
									ang.dataService.login(res.data.session_id, username, password).subscribe(res => {
										if(!res.error){
											chrome.cookies.set({"url": "http://crunchyroll.com", "name": "sess_id", "value": sessionid, "domain": ".crunchyroll.com", "httpOnly": true}, function(){});
											chrome.cookies.set({"url": "http://crunchyroll.com", "name": "session_id", "value": deviceid, "domain": ".crunchyroll.com", "httpOnly": true}, function(){});
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
			chrome.storage.local.set({"animes": this.animes}, function() {});
			this.addToQueue(res);
			(<HTMLElement>document.getElementById("cachedwarning")).hidden = true;
			this.loading(false);
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
