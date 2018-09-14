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
	ignorecookie: boolean = false;
	animes: Array<any> = new Array();
	unseen: Array<any> = new Array();
	done: Array<any> = new Array();
	watching: Array<any> = new Array();
	selectedAnime: Array<any> = new Array();
	errorMessage: string = "";

	constructor(private dataService: DataService, private ngZone: NgZone) {}

	ngOnInit() {
		(<HTMLElement>document.getElementById("error")).hidden = true;
		(<HTMLElement>document.getElementById("refresh")).hidden = true;
		this.loading(true);
		this.getLocalSessionID();
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
		chrome.storage.local.get(["ignorecookie"], function(result) {
			ang.ignorecookie = result.ignorecookie;
		});
	}

	getLocalSessionID(){
		var self = this;
		this.getSettings();
		chrome.cookies.get({"url": "http://www.crunchyroll.com", "name": "sess_id"}, function(cookie){
			if(cookie != null && !self.ignorecookie){
				self.ngZone.run(() => {
					self.sessionid = cookie.value;
					self.getLocalQueue();
					self.refreshQueue();
				});
			}else{
				self.ngZone.run(() => {
					if(self.username != "" && self.password != ""){
						//self.refreshSessionID();
						self.error("This feature is disabled due to unintended behaviour! Please visit http://www.crunchyroll.com and choose the cookiemethod in the settingstab.");
					}else{
						self.error("No Cookie set! Please visit http://www.crunchyroll.com or save your credentials in the settingstab.");
					}
					self.loading(false);
				});
			}
		});
	}

	refreshSessionID(){
		this.dataService.getSessionID(this.deviceid).subscribe(res => {
			chrome.storage.local.set({"sessionid": res.sessionid}, function() {});
			this.sessionid = res.session_id;
			chrome.storage.local.set({"deviceid": res.device_id}, function() {});
			this.deviceid = res.device_id;
			this.dataService.login(this.sessionid, this.username, this.password).subscribe(res => {
				this.refreshQueue();
			}, err => this.error("Login failed! Please make sure your username and password is valid. Discription: " + err));
		}, err => this.error("Connection failed! Please try again later. Discription: " + err));
	}

	getLocalQueue(){
		var self = this;
		chrome.storage.local.get(["animes"], function(result) {
			self.ngZone.run(() => {
				self.animes = result.animes;
				for(var i in self.animes){
					var anime = self.animes[i];
					if(anime.most_likely_media.playhead >= anime.most_likely_media.duration){
						self.done.push(anime);
					}else{
						if(anime.most_likely_media.playhead > 0 || anime.most_likely_media.episode_number != 1){
							self.watching.push(anime);
						}else{
							self.unseen.push(anime);
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
				if(anime.most_likely_media.playhead >= anime.most_likely_media.duration){
					this.done.push(anime);
				}else{
					if(anime.most_likely_media.playhead > 0){
						this.watching.push(anime);
					}else{
						this.unseen.push(anime);
					}
				}
			}
			this.loading(false);
		}, err => this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + err));
	}

	clearSearch(){
		(<HTMLInputElement>document.getElementById("search")).value = "";
	}

	onSelect(anime: Array<any>){
		this.selectedAnime = anime;
		(<HTMLElement>document.getElementById("selectedAnime")).hidden = false;
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
