import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { AES, enc } from 'crypto-ts';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})

export class SetupComponent implements OnInit {

	@Output() onSetupComplete = new EventEmitter<any>();
	@Input() username: string = "";
	@Input() password: string = "";
	@Input() forceUsRegion: boolean = false;
	@Input() userIsPremium: boolean = false;
	@Input() disableBackgroundChecks: boolean = false;
  @Input() theme: string = "light";
	page: number = 0;
  production: boolean = false;

  ngOnInit() {
    this.production = environment.production;
	}

	nextPage(){
		this.page += 1;
	}

	saveCredentials(){
    var ang = this;
    this.username = (<HTMLInputElement>document.getElementById("setupUsername")).value;
    this.password = (<HTMLInputElement>document.getElementById("setupPassword")).value;
		chrome.storage.local.set({
			"username": AES.encrypt(ang.username, "5HR*98g5a699^9P#f7cz").toString(),
			"password": AES.encrypt(ang.password, "5HR*98g5a699^9P#f7cz").toString()
		});
		this.nextPage();
	}

	saveOptions(){
    var ang = this;
    this.userIsPremium = (<HTMLInputElement>document.getElementById("setupDisableBackgroundChecks")).checked;
    this.disableBackgroundChecks = (<HTMLInputElement>document.getElementById("setupUserIsPremium")).checked;
		chrome.storage.local.set({
			"userIsPremium": ang.userIsPremium,
			"disableBackgroundChecks": ang.disableBackgroundChecks
		});
    if(!this.production){
      this.forceUsRegion = (<HTMLInputElement>document.getElementById("setupForceUsRegion")).checked;
      chrome.storage.local.set({
  			"forceUsRegion": AES.encrypt(ang.forceUsRegion.toString(), "5HR*98g5a699^9P#f7cz").toString(),
  		});
    }
		this.nextPage();
	}

  saveTheme(){
    var ang = this;
    if((<HTMLInputElement>document.getElementById("setupThemeLight")).checked){
      this.theme = "light";
    }else if((<HTMLInputElement>document.getElementById("setupThemeDark")).checked){
      this.theme = "dark";
    }
		chrome.storage.local.set({
			"theme": ang.theme
		});
		this.nextPage();
	}

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

	finishSetup(){
		chrome.storage.local.set({
			"firstuse": "false"
		});
    this.setTheme(this.theme);
    this.onSetupComplete.emit({"username": this.username, "password": this.password, "forceUsRegion": this.forceUsRegion, "userIsPremium": this.userIsPremium, "theme": this.theme, "firstuse": false});
	}
}
