import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
	username: string = "";
	password: string = "";
	deviceid: string = "";
	forceUsRegion: boolean = false;
	userIsPremium: boolean = false;
	firstuse: boolean = false;
	disableBackgroundChecks: boolean = false;
	saving: boolean = false;
	version: string = chrome.runtime.getManifest().version;
  production: boolean = false;

  constructor() { }

  ngOnInit() {
    this.production = environment.production;
		this.getSettings();
	}

  //Returns the saved encrypted settings and decrypts them. Also calls this.generateDeviceId(), if deviceid is empty
	getSettings(){
		var ang = this;
		chrome.storage.local.get(["username", "password", "deviceid", "sessionid", "forceUsRegion", "userIsPremium", "disableBackgroundChecks", "firstuse"], function(result) {
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
			if(result.firstuse !== undefined){
				ang.firstuse = (result.firstuse === 'true');
			}else{
				ang.firstuse = true;
			}
			ang.onSettingsLoaded.emit({"username": ang.username, "password": ang.password, "deviceid": ang.deviceid, "sessionid": ang.sessionid, "forceUsRegion": ang.forceUsRegion, "version": ang.version, "userIsPremium": ang.userIsPremium, "firstuse": ang.firstuse});
		});
	}

  //Saves the encrypted settings to chromes local storage (not synced!)
	saveSettings(){
		var ang = this;
		document.getElementById("confirmSettingsDialog").hidden = true;
		this.saving = true;
		chrome.storage.local.set({
			"username": AES.encrypt((<HTMLInputElement>document.getElementById("username")).value, "5HR*98g5a699^9P#f7cz").toString(),
			"password": AES.encrypt((<HTMLInputElement>document.getElementById("password")).value, "5HR*98g5a699^9P#f7cz").toString(),
			"sessionid": AES.encrypt(this.sessionid, "5HR*98g5a699^9P#f7cz").toString(),
			"deviceid": AES.encrypt(this.deviceid, "5HR*98g5a699^9P#f7cz").toString(),
			"userIsPremium": (<HTMLInputElement>document.getElementById("userIsPremium")).checked.toString(),
			"disableBackgroundChecks": (<HTMLInputElement>document.getElementById("disableBackgroundChecks")).checked.toString()},
			function(){
        if(!this.production){
          chrome.storage.local.set({
        		"forceUsRegion": AES.encrypt((<HTMLInputElement>document.getElementById("setupForceUsRegion")).checked.toString(), "5HR*98g5a699^9P#f7cz").toString(),
        	}, function(){
            ang.saving = false;
    				ang.onSettingsChanged.emit({"username": ang.username, "password": ang.password, "deviceid": ang.deviceid, "sessionid": ang.sessionid, "forceUsRegion": ang.forceUsRegion, "version": ang.version, "userIsPremium": ang.userIsPremium, "firstuse": ang.firstuse});
          });
        }else{
          ang.saving = false;
  				ang.onSettingsChanged.emit({"username": ang.username, "password": ang.password, "deviceid": ang.deviceid, "sessionid": ang.sessionid, "forceUsRegion": ang.forceUsRegion, "version": ang.version, "userIsPremium": ang.userIsPremium, "firstuse": ang.firstuse});
        }
			});
	}

  //Opens confirmation dialog if user tries to save username or password
	confirmSettings(){
		if((<HTMLInputElement>document.getElementById("username")).value != "" || (<HTMLInputElement>document.getElementById("password")).value != ""){
			document.getElementById("confirmSettingsDialog").hidden = false;
		}else{
			this.saveSettings();
		}
	}

  //Reloads the extension, content- and backgroundscript
	reloadExtension(){
		chrome.runtime.reload();
	}

  //Opens the crunchyroll homepage in a new tab
	visitCrunchyroll(){
		window.open("http://www.crunchyroll.com/");
	}

  //Closes the confirmation dialog
	closeConfirmDialog(){
		document.getElementById("confirmSettingsDialog").hidden = true;
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
