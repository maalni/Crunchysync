import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

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
			ang.username = result.username;
			ang.password = result.password;
			ang.deviceid = result.deviceid;
			ang.sessionid = result.sessionid;
			ang.onSettingsLoaded.emit({"username": result.username, "password": result.password, "deviceid": result.deviceid, "sessionid": result.sessionid});
		});
	}

	saveSettings(){
		chrome.storage.local.set({"username": (<HTMLInputElement>document.getElementById("username")).value}, function() {});
		chrome.storage.local.set({"password": (<HTMLInputElement>document.getElementById("password")).value}, function() {});
		chrome.storage.local.set({"sessionid": this.sessionid}, function() {});
		chrome.storage.local.set({"deviceid": this.deviceid}, function() {});
	}

	reloadExtension(){
		chrome.runtime.reload();
	}

	visitCrunchyroll(){
		window.open("http://www.crunchyroll.com/");
	}
}
