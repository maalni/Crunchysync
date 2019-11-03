import { Component, OnInit } from '@angular/core';
import { apiService } from './api.service';
import { Varstore } from './varstore';
import { AES } from 'crypto-ts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})

export class AppComponent {

	onAuthenticatedEvent: any = new Event('onAuthenticatedEvent');
	animes: Array<any> = new Array();
	retry: boolean = false;

	constructor(public varstore: Varstore, private apiService: apiService) {}

	ngOnInit() {
		document.addEventListener("onAuthenticatedEvent", (e: Event) => {this.refreshQueue()}, false);
		this.getLocalQueue();
		this.checkExtensionUpdate();
	}

	//Checks, if an update is available and notifies the user
	checkExtensionUpdate(){
		this.apiService.getGitlabVersion().subscribe(res => {
			var onlineVersion = parseInt(res.replace(/[v\.]/g, ""), 10);
			var extensionVersion = parseInt(this.varstore.version.replace(/[v\.]/g, ""), 10);
			if(onlineVersion > extensionVersion){
				this.varstore.notifications.push({message: "Update " + onlineVersion + " available.", type: "update", url: "https://gitlab.com/maalni/crunchysync/tags/"+onlineVersion});
			}
		});
	}

  /*Authenticates the user through several methods:
     1. Cached sessionid
     2. Username and password
    Variables:
    Boolean ignoreCache = Force cache to be ignored*/
	authenticate(ignoreCache: boolean){
    this.apiService.getCollections(this.varstore.settings['sessionid'], true, "254209").subscribe(res => {
      console.log(res);
    });
    this.apiService.getEpisodes(this.varstore.settings['sessionid'], true, "24557").subscribe(res => {
      console.log(res);
    });
    this.varstore.loading = true;
		if((this.varstore.settings['sessionid'] === "" || this.varstore.settings['sessionid'] === undefined) || ignoreCache){
      if(this.varstore.settings['username'] != "" && this.varstore.settings['password'] != ""){
        this.apiService.getSessionID(this.varstore.settings['deviceid'], this.varstore.settings['forceUsRegion']).subscribe(res => {
          if(!res.error){
            this.varstore.settings['sessionid'] = res.data.session_id;
            this.apiService.login(this.varstore.settings['sessionid'], this.varstore.settings['username'], this.varstore.settings['password']).subscribe(res => {
              if(!res.error){
                this.varstore.settings['userIsPremium'] = (res.data.user.premium === 'true');
                chrome.storage.local.set({"sessionid": AES.encrypt(this.varstore.settings['sessionid'], "5HR*98g5a699^9P#f7cz").toString()});
                chrome.storage.local.set({"userIsPremium": AES.encrypt(this.varstore.settings['userIsPremium'], "5HR*98g5a699^9P#f7cz").toString()});
                this.varstore.loading = false;
                document.dispatchEvent(this.onAuthenticatedEvent);
              }else{
                this.error("Login failed! Please make sure your username and password is valid. Discription: " + res.message);
              }
            }, err => this.error("Login failed! Please make sure your username and password is valid. Discription: " + err));
          }else{
            this.error("Connection failed! Please try again later. Discription: " + res.message);
          }
        }, err => this.error("Connection failed! Please try again later. Discription: " + err));
      }else{
        this.error("No Credentials set! Please save your credentials in the settingstab.");
      }
    }else{
      this.varstore.loading = false;
      document.dispatchEvent(this.onAuthenticatedEvent);
    }
	}

  /*Sorts animes to arrays
    Variables:
    Array<any> animes = List of animes, which should get sorted*/
	sortAnimes(animes: Array<any>){
		if(animes !== undefined){
      animes.sort((a,b) => {
        if(a['most_likely_media'] != undefined && b['most_likely_media'] != undefined && a['most_likely_media']['collection_name'] != undefined && b['most_likely_media']['collection_name'] != undefined){
          return a['most_likely_media']['collection_name'].localeCompare(b['most_likely_media']['collection_name']);
        }else{
          return 0;
        }
      });
      this.animes[0] = [];
      this.animes[1] = [];
      this.animes[2] = [];
			this.animes[3] = animes;
			for(var i in this.animes[3]){
				var anime = this.animes[3][i];
        if(anime.most_likely_media !== undefined){
          if(anime.most_likely_media.playhead === undefined){
      			anime.most_likely_media.playhead = 0;
      		}
  				if((anime.most_likely_media.playhead >= anime.most_likely_media.duration - 10) && (anime.most_likely_media.duration != 0)){
  					this.animes[2].push(anime);
  				}else{
  					if(anime.most_likely_media.playhead > 0 || anime.most_likely_media.episode_number != 1){
  						this.animes[0].push(anime);
  					}else{
  						this.animes[1].push(anime);
  					}
  				}
        }
			}
			if(this.animes[0].length > 0){
				chrome.browserAction.setBadgeBackgroundColor({ color: [247, 140, 37, 1] });
				chrome.browserAction.setBadgeText({text: this.animes[0].length+""});
			}else{
        chrome.browserAction.setBadgeText({text: ""});
      }
		}
	}

  //Loads cached queue from chromes local storage
	getLocalQueue(){
		var ang = this;
		this.varstore.loading = true;
		chrome.storage.local.get(["animes"], function(result) {
			ang.sortAnimes(result.animes);
			ang.varstore.loading = false;
		});
	}

  //Refreshes the cached animes
	refreshQueue(){
		this.varstore.loading = true;
		this.apiService.getQueue(this.varstore.settings['sessionid'], this.varstore.settings['forceUsRegion']).subscribe(res => {
			if(!res.error){
				chrome.storage.local.set({"animes": res.data});
				this.sortAnimes(res.data);
				this.varstore.cachedQueue = false;
        this.varstore.loading = false;
			}else{
				if((res.code === 'bad_session' || res.code === 'bad_request') && !this.retry){
					this.retry = true;
					this.authenticate(true);
				}else{
					this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + res.message);
          this.varstore.loading = false;
				}
			}
		}, err => this.error("Your queue couldnt be loaded! Please make sure your session is valid and try again. Discription: " + err));
	}

	//Authenticates the user, when the settings are changed
	onSettingsChangedEventHandler(){
    if(!this.varstore.settings['firstuse']){
			this.authenticate(false);
		}
	}

  /*Checks if Object is empty
    Variables:
    Object obj = Object to be checked*/
  IsObjectEmpty(obj: Object){
    return Object.keys(obj).length == 0;
  }

  /*Shows an error with the given message
    Variables:
    String message = Errormessage*/
	error(message: string){
		this.varstore.notifications.push({message: message, type: "error", url: ""});
	}
}
