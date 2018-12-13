import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { environment } from '../../environments/environment';
import { AES, enc } from 'crypto-ts';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {

	@Output() onSettingsLoaded = new EventEmitter<any>();
	@Output() onSettingsChanged = new EventEmitter<any>();
	@Input() sessionid: string = "";
  @Input() firstuse: boolean = false;
  theme: string = "light";
	username: string = "";
	password: string = "";
	deviceid: string = "";
	forceUsRegion: boolean = false;
  forceSetup: boolean = false;
	userIsPremium: boolean = false;
	disableBackgroundChecks: boolean = false;
	version: string = chrome.runtime.getManifest().version;
  production: boolean = true;
  saving: boolean = false;

  constructor(private ngZone: NgZone) { }

  ngOnInit() {
    this.production = environment.production;
		this.getSettings();
	}

  //Returns the saved encrypted settings and decrypts them. Also calls this.generateDeviceId(), if deviceid is empty
	getSettings(){
		var ang = this;
		chrome.storage.local.get(["username", "password", "deviceid", "sessionid", "forceUsRegion", "userIsPremium", "disableBackgroundChecks", "firstuse", "forceSetup", "theme"], function(result) {
			if(result.username !== undefined){
        ang.username = AES.decrypt(result.username, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
      }
			if(result.password !== undefined){
        ang.password = AES.decrypt(result.password, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
      }
			if(result.deviceid !== undefined){
        ang.deviceid = AES.decrypt(result.deviceid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
        if(ang.deviceid === ""){
          ang.deviceid = ang.generateDeviceId();
        }
      }else{
        ang.deviceid = ang.generateDeviceId();
      }
			if(result.sessionid !== undefined){
        ang.sessionid = AES.decrypt(result.sessionid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
      }
			if(result.forceUsRegion !== undefined){
				ang.forceUsRegion = (AES.decrypt(result.forceUsRegion, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === 'true');
			}
			if(result.userIsPremium !== undefined){
				ang.userIsPremium = (result.userIsPremium === 'true');
			}
			if(result.disableBackgroundChecks !== undefined){
				ang.disableBackgroundChecks = (result.disableBackgroundChecks === 'true');
			}
      if(result.theme !== undefined){
				ang.theme = result.theme;
        ang.setTheme(ang.theme);
			}
      if(result.forceSetup!== undefined){
        ang.forceSetup = (AES.decrypt(result.forceSetup, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "true");
      }
			if(result.firstuse !== undefined){
				ang.firstuse = (result.firstuse === 'true') || ang.forceSetup;
			}else{
				ang.firstuse = true;
			}
			ang.onSettingsLoaded.emit({"username": ang.username, "password": ang.password, "deviceid": ang.deviceid, "sessionid": ang.sessionid, "forceUsRegion": ang.forceUsRegion, "version": ang.version, "userIsPremium": ang.userIsPremium, "firstuse": ang.firstuse, "theme": ang.theme});
		});
	}

  //Saves the encrypted settings to chromes local storage (not synced!)
	saveSettings(){
    if(!this.saving){
  		var ang = this;
      this.saving = true;
      if((<HTMLInputElement>document.getElementById("themeLight")).checked){
        this.theme = "light";
      }else if((<HTMLInputElement>document.getElementById("themeDark")).checked){
        this.theme = "dark";
      }
      this.setTheme(this.theme);
  		chrome.storage.local.set({
  			"username": AES.encrypt((<HTMLInputElement>document.getElementById("username")).value, "5HR*98g5a699^9P#f7cz").toString(),
  			"password": AES.encrypt((<HTMLInputElement>document.getElementById("password")).value, "5HR*98g5a699^9P#f7cz").toString(),
  			"sessionid": AES.encrypt(this.sessionid, "5HR*98g5a699^9P#f7cz").toString(),
  			"deviceid": AES.encrypt(this.deviceid, "5HR*98g5a699^9P#f7cz").toString(),
  			"userIsPremium": (<HTMLInputElement>document.getElementById("userIsPremium")).checked.toString(),
  			"disableBackgroundChecks": (<HTMLInputElement>document.getElementById("disableBackgroundChecks")).checked.toString(),
        "theme": ang.theme},
  			function(){
          if(!ang.production){
            chrome.storage.local.set({
          		"forceUsRegion": AES.encrypt((<HTMLInputElement>document.getElementById("forceUsRegion")).checked.toString(), "5HR*98g5a699^9P#f7cz").toString(),
              "forceSetup": AES.encrypt((<HTMLInputElement>document.getElementById("forceSetup")).checked.toString(), "5HR*98g5a699^9P#f7cz").toString()
          	});
          }
          ang.ngZone.run(() => {
            setTimeout(function(){
              ang.saving = false;
            }, 2000);
      			ang.onSettingsChanged.emit({"username": ang.username, "password": ang.password, "deviceid": ang.deviceid, "sessionid": ang.sessionid, "forceUsRegion": ang.forceUsRegion, "version": ang.version, "userIsPremium": ang.userIsPremium, "firstuse": ang.firstuse, "theme": ang.theme});
          });
        });
    }
	}

  //Reloads the extension, content- and backgroundscript
	reloadExtension(){
		chrome.runtime.reload();
	}

  //Changes the css color values according to the provided theme
  setTheme(theme: string){
    var html = document.getElementsByTagName('html')[0];
    if(theme == "dark"){
      html.style.setProperty("--secondary-color", "#333333");
      html.style.setProperty("--darkened-secondary-color", "#262626");
      html.style.setProperty("--tertiary-color", "white");
      html.style.setProperty("--darkened-tertiary-color", "#F2F2F2");
    }else if(theme == "light"){
      html.style.setProperty("--secondary-color", "white");
   	  html.style.setProperty("--darkened-secondary-color", "#F2F2F2");
   	  html.style.setProperty("--tertiary-color", "#333333");
   	  html.style.setProperty("--darkened-tertiary-color", "#262626");
    }
  }

  //Opens the crunchyroll homepage in a new tab
	visitCrunchyroll(){
		window.open("http://www.crunchyroll.com/");
	}

  //Generates a random deviceid and saves it to chromes local storage
  generateDeviceId() {
    var char_set = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var id = "";
    for(var i = 0; i < 32; i++){
      id += char_set.charAt(Math.floor(Math.random() * char_set.length));
    }
    chrome.storage.local.set({"deviceid": AES.encrypt(id, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
    return id;
  }
}
