import { Component, EventEmitter, Output } from '@angular/core';
import { AES, enc } from 'crypto-ts';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.css']
})

export class SetupComponent{

	@Output() onSetupComplete = new EventEmitter<any>();
	username: string = "";
	password: string = "";
	forceUsRegion: boolean = false;
	userIsPremium: boolean = false;
	disableBackgroundChecks: boolean = false;
	page: number = 0;

	nextPage(){
		this.page += 1;
	}

	saveCredentials(){
    this.username = (<HTMLInputElement>document.getElementById("setupUsername")).value;
    this.password = (<HTMLInputElement>document.getElementById("setupPassword")).value;
		chrome.storage.local.set({
			"username": AES.encrypt((<HTMLInputElement>document.getElementById("setupUsername")).value, "5HR*98g5a699^9P#f7cz").toString(),
			"password": AES.encrypt((<HTMLInputElement>document.getElementById("setupPassword")).value, "5HR*98g5a699^9P#f7cz").toString()
		});
		this.nextPage();
	}

	saveOptions(){
    this.forceUsRegion = (<HTMLInputElement>document.getElementById("setupForceUsRegion")).checked;
    this.userIsPremium = (<HTMLInputElement>document.getElementById("setupDisableBackgroundChecks")).checked;
    this.disableBackgroundChecks = (<HTMLInputElement>document.getElementById("setupUserIsPremium")).checked;
		chrome.storage.local.set({
			"forceUsRegion": AES.encrypt((<HTMLInputElement>document.getElementById("setupForceUsRegion")).checked.toString(), "5HR*98g5a699^9P#f7cz").toString(),
			"userIsPremium": (<HTMLInputElement>document.getElementById("setupDisableBackgroundChecks")).checked.toString(),
			"disableBackgroundChecks": (<HTMLInputElement>document.getElementById("setupUserIsPremium")).checked.toString()
		});
		this.nextPage();
	}

	finishSetup(){
		chrome.storage.local.set({
			"firstuse": "false"
		});
		this.onSetupComplete.emit({"username": this.username, "password": this.password, "forceUsRegion": this.forceUsRegion, "userIsPremium": this.userIsPremium, "firstuse": false});
	}
}