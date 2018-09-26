import { Component, OnInit, NgZone } from '@angular/core';
import { DataService } from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent {
	sessionid: string = "";
	deviceid: string = "";
	username: string = "";
	password: string = "";
	expires: Date = new Date();
	auth: string = "";
	animes: Array<any> = new Array();
	unseen: Array<any> = new Array();
	done: Array<any> = new Array();
	watching: Array<any> = new Array();
	selectedAnime: Array<any> = new Array();
	errorMessage: string = "";
	searchTerm: string = "";

	constructor(private dataService: DataService, private ngZone: NgZone) {}

	ngOnInit() {
		this.getSettings();
		this.loading(true);
		this.getLocalQueue();
		this.authenticate();
	}

	getSettings(){
		var ang = this;
		chrome.storage.local.get(["username"], function(result) {
			ang.username = result.username;
		});
		chrome.storage.local.get(["password"], function(result) {
			ang.password = result.password;
		});
		chrome.storage.local.get(["deviceid"], function(result) {
			ang.deviceid = result.deviceid;
		});
		chrome.storage.local.get(["auth"], function(result) {
			ang.auth = result.auth;
		});
		chrome.storage.local.get(["expires"], function(result) {
			ang.expires = result.expires;
		});
	}

	authenticate(){
		var ang = this;
		chrome.cookies.get({"url": "http://crunchyroll.com", "name": "sess_id"}, function(cookie){
			if(cookie != null){
				ang.ngZone.run(() => {
					ang.sessionid = cookie.value;
					ang.refreshQueue();
				});
			}else{
				ang.ngZone.run(() => {
					if(ang.username != "" && ang.password != ""){
						ang.createSessionID();
					}else{
						ang.error("No Cookie set! Please visit http://www.crunchyroll.com or save your credentials in the settingstab.");
					}
					ang.loading(false);
				});
			}
		});
	}

	createSessionID(){
		this.dataService.getSessionID(this.deviceid).subscribe(res => {
			if(!res.error){
				chrome.storage.local.set({"sessionid": res.data.session_id}, function() {});
				this.sessionid = res.data.session_id;
				chrome.storage.local.set({"deviceid": res.data.device_id}, function() {});
				this.deviceid = res.data.device_id;
				this.authenticateSessionID(res.data.session_id);
			}
		}, err => this.error("Connection failed! Please try again later. Discription: " + err));
	}

	authenticateSessionID(sessionid: string){
		this.dataService.login(this.sessionid, this.username, this.password).subscribe(res => {
			if(!res.error){
				chrome.cookies.set({"url": "http://crunchyroll.com", "name": "sess_id", "value": sessionid}, function(){});
				chrome.cookies.set({"url": "http://crunchyroll.com", "name": "session_id", "value": sessionid}, function(){});
				chrome.storage.local.set({"expires": res.data.expires}, function() {});
				this.expires = new Date(res.data.expires);
				chrome.storage.local.set({"auth": res.data.auth}, function() {});
				this.auth = res.data.auth;
				this.refreshQueue();
			}
		}, err => this.error("Login failed! Please make sure your username and password is valid. Discription: " + err));
	}

	getLocalQueue(){
		var ang = this;
		chrome.storage.local.get(["animes"], function(result) {
			ang.ngZone.run(() => {
				ang.animes = result.animes;
				for(var i in ang.animes){
					var anime = ang.animes[i];
					if(anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10){
						ang.done.push(anime);
					}else{
						if(anime.most_likely_media.playhead > 0 || anime.most_likely_media.episode_number != 1){
							ang.watching.push(anime);
						}else{
							ang.unseen.push(anime);
						}
					}
				}
			});
		});
	}

	refreshQueue(){
		this.loading(true);
		this.dataService.getQueue(this.sessionid).subscribe(res => {
			this.animes = res;
			this.done = [];
			this.watching = [];
			this.unseen = [];
			chrome.storage.local.set({"animes": this.animes}, function() {});
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
			this.loading(false);
			(<HTMLElement>document.getElementById("cachedwarning")).hidden = true;
		}, err => this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + err));
	}

	clearSearch(){
		this.searchTerm = "";
	}

	onSelect(anime: Array<any>){
		this.selectedAnime = anime;
		(<HTMLElement>document.getElementById("selectedAnime")).hidden = false;
	}

	completeSelectedAnimeEpisode(anime: Array<any>){
		this.dataService.completeEpisode(anime['most_likely_media']['media_id'], anime['most_likely_media']['duration']).subscribe(res => {
			this.refreshQueue();
		});
	}

	loading(state: boolean){
		(<HTMLElement>document.getElementById("spinner")).hidden = !state;
		if((<HTMLElement>document.getElementById("content").children[4]).hidden){
			(<HTMLElement>document.getElementById("refresh")).hidden = state;
		}
	}

	error(message: string){
		this.errorMessage = message;
		(<HTMLElement>document.getElementById("error")).hidden = false;
	}
}
