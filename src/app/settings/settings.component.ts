import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AES, enc } from 'crypto-ts';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {

	@Input() sessionid: string = "";
	@Input() deviceid: string = "";
	@Input() username: string = "";
	@Input() password: string = "";
	@Output() onSettingsLoaded = new EventEmitter<any>();
	version: string = chrome.runtime.getManifest().version;

  constructor() { }

  ngOnInit() {
		this.getSettings();
	}

  //Returns the saved encrypted settings and decrypts them. Also calls this.generateDeviceId(), if deviceid is empty
	getSettings(){
		var ang = this;
		chrome.storage.local.get(["username", "password", "deviceid", "sessionid"], function(result) {
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
			ang.onSettingsLoaded.emit({"username": ang.username, "password": ang.password, "deviceid": ang.deviceid, "sessionid": ang.sessionid, "version": ang.version});
		});
	}

  //Saves the encrypted settings to chromes local storage (not synced!)
	saveSettings(){
		document.getElementById("confirmSettingsDialog").hidden = true;
		chrome.storage.local.set({"username": AES.encrypt((<HTMLInputElement>document.getElementById("username")).value, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
		chrome.storage.local.set({"password": AES.encrypt((<HTMLInputElement>document.getElementById("password")).value, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
		chrome.storage.local.set({"sessionid": AES.encrypt(this.sessionid, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
		chrome.storage.local.set({"deviceid": AES.encrypt(this.deviceid, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
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
