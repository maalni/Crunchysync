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
	ignorecookie: boolean = false;
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
		chrome.storage.local.get(["deviceid"], function(result) {
			ang.deviceid = result.deviceid;
		});
		chrome.storage.local.get(["ignorecookie"], function(result) {
			ang.ignorecookie = result.ignorecookie;
			(<HTMLInputElement>document.getElementById("ignorecookie")).checked = ang.ignorecookie;
		});
	}

	saveSettings(){
		chrome.storage.local.set({"username": (<HTMLInputElement>document.getElementById("username")).value}, function() {});
		chrome.storage.local.set({"password": (<HTMLInputElement>document.getElementById("password")).value}, function() {});
		chrome.storage.local.set({"deviceid": this.deviceid}, function() {});
		chrome.storage.local.set({"ignorecookie": (<HTMLInputElement>document.getElementById("ignorecookie")).checked}, function() {});
	}

	reloadExtension(){
		chrome.runtime.reload();
	}

	visitCrunchyroll(){
		window.open("http://www.crunchyroll.com/");
	}
}
