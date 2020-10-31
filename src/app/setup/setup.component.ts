import { Component, EventEmitter, Output } from '@angular/core';
import { Varstore } from '../varstore';
import { apiService } from '../api.service';
import { AES, enc } from 'crypto-ts';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.less']
})

export class SetupComponent {

	@Output() onSetupComplete = new EventEmitter<any>();
  settings: Object = new Object;
	page: number = 0;
  errorMessage: string = "";
  saving: boolean = false;

  constructor(public varstore: Varstore, private apiService: apiService) {}

	nextPage(){
		this.page += 1;
	}

  previousPage(){
    this.page -= 1;
  }

	saveCredentials(){
    var ang = this;
    this.saving = true;
    this.settings['username'] = (<HTMLInputElement>document.getElementById("setupUsername")).value;
    this.settings['password'] = (<HTMLInputElement>document.getElementById("setupPassword")).value;
    if(this.settings['username'] != "" && this.settings['password'] != ""){
  		chrome.storage.local.set({
  			"username": AES.encrypt(ang.settings['username'], "5HR*98g5a699^9P#f7cz").toString(),
  			"password": AES.encrypt(ang.settings['password'], "5HR*98g5a699^9P#f7cz").toString()
  	  });
      this.apiService.getSessionID(this.varstore.settings['deviceid'], this.settings['forceUsRegion']).subscribe(res => {
        if(!res.error){
          this.settings['sessionid'] = res.data.session_id;
          this.apiService.login(this.settings['sessionid'], this.settings['username'], this.settings['password'], this.varstore.settings['forceUsRegion']).subscribe(res => {
            if(!res.error){
              this.settings['userIsPremium'] = (res.data.user.premium === 'true');
              chrome.storage.local.set({"sessionid": AES.encrypt(this.settings['sessionid'], "5HR*98g5a699^9P#f7cz").toString()});
              chrome.storage.local.set({"userIsPremium": AES.encrypt(this.settings['userIsPremium'], "5HR*98g5a699^9P#f7cz").toString()});
              this.errorMessage = "";
              this.nextPage();
            }else{
              this.error("Login failed! Please make sure your username and password is valid. Discription: " + res.message);
            }
          }, err => this.error("Login failed! Please make sure your username and password is valid. Discription: " + err));
        }else{
          this.error("Connection failed! Please try again later. Discription: " + res.message);
        }
      }, err => this.error("Connection failed! Please try again later. Discription: " + err));
    } else {
      this.error("Username or password is empty!");
    }
    this.saving = false;
	}

	saveOptions(){
    var ang = this;
    this.settings['disableBackgroundChecks'] = (<HTMLInputElement>document.getElementById("setupDisableBackgroundChecks")).checked;
		chrome.storage.local.set({
			"disableBackgroundChecks": AES.encrypt(ang.settings['disableBackgroundChecks'], "5HR*98g5a699^9P#f7cz").toString()
		});
    if(!this.varstore.production){
      this.settings['forceUsRegion'] = (<HTMLInputElement>document.getElementById("setupForceUsRegion")).checked;
      chrome.storage.local.set({
  			"forceUsRegion": AES.encrypt(ang.settings['forceUsRegion'].toString(), "5HR*98g5a699^9P#f7cz").toString(),
  		});
    }
		this.nextPage();
	}

  saveTheme(){
    var ang = this;
    if((<HTMLInputElement>document.getElementById("setupThemeLight")).checked){
      this.settings['theme'] = "light";
    }else if((<HTMLInputElement>document.getElementById("setupThemeDark")).checked){
      this.settings['theme'] = "dark";
    }
		chrome.storage.local.set({
			"theme": ang.settings['theme']
		});
		this.nextPage();
	}

  setTheme(theme: string){
    var html = document.getElementsByTagName('html')[0];
    html.classList.remove("light");
    html.classList.remove("dark");
    html.classList.add(theme);
  }

	finishSetup(){
    this.setTheme(this.settings['theme']);
    this.settings['firstuse'] = false;
		chrome.storage.local.set({
			"firstuse": AES.encrypt(this.settings['firstuse'].toString(), "5HR*98g5a699^9P#f7cz").toString()
		});
    this.varstore.settings = this.settings;
    this.onSetupComplete.emit();
	}

  error(message: string){
    this.saving = false;
    this.errorMessage = message;
  }
}
