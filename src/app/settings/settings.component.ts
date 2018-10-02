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

	getSettings(){
		var ang = this;
		chrome.storage.local.get(["username", "password", "deviceid", "sessionid"], function(result) {
			ang.username = AES.decrypt(result.username, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
			ang.password = AES.decrypt(result.password, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
			ang.deviceid = AES.decrypt(result.deviceid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
			ang.sessionid = AES.decrypt(result.sessionid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
			ang.onSettingsLoaded.emit({"username": ang.username, "password": ang.password, "deviceid": ang.deviceid, "sessionid": ang.sessionid});
		});
	}

	saveSettings(){
		document.getElementById("confirmSettingsDialog").hidden = true;
		chrome.storage.local.set({"username": AES.encrypt((<HTMLInputElement>document.getElementById("username")).value, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
		chrome.storage.local.set({"password": AES.encrypt((<HTMLInputElement>document.getElementById("password")).value, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
		chrome.storage.local.set({"sessionid": AES.encrypt(this.sessionid, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
		chrome.storage.local.set({"deviceid": AES.encrypt(this.deviceid, "5HR*98g5a699^9P#f7cz").toString()}, function() {});
	}

	confirmSettings(){
		if((<HTMLInputElement>document.getElementById("username")).value != "" || (<HTMLInputElement>document.getElementById("password")).value != ""){
			document.getElementById("confirmSettingsDialog").hidden = false;
		}else{
			this.saveSettings();
		}
	}

	reloadExtension(){
		chrome.runtime.reload();
	}

	visitCrunchyroll(){
		window.open("http://www.crunchyroll.com/");
	}

	closeConfirmDialog(){
		document.getElementById("confirmSettingsDialog").hidden = true;
	}
}
