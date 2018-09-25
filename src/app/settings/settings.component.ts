import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {

	@Input() sessionid: string = "";
	@Input() deviceid: string = "";
	username: string = "";
	password: string = "";
	expires: Date = new Date();
	auth: string = "";
	version: string = chrome.runtime.getManifest().version;

  constructor() { }

  ngOnInit() {
		this.getSettings();
	}

	getSettings(){
		var ang = this;
		chrome.storage.local.get(["username"], function(result) {
			ang.username = result.username;
		});
		chrome.storage.local.get(["password"], function(result) {
			ang.password = result.password;
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
