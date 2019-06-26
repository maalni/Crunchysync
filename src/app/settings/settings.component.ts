import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Varstore } from '../varstore';
import { AES, enc } from 'crypto-ts';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.less']
})

export class SettingsComponent implements OnInit {

	@Output() onSettingsChanged = new EventEmitter<any>();
  settings: Object = new Object();

  constructor(public varstore: Varstore) {}

  ngOnInit() {
    var ang = this;
    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
        if(request.theme !== undefined){
      		ang.setTheme(request.theme);
      	}else{
      		ang.setTheme("light");
      	}
        sendResponse();
      }
    );
		this.getSettings();
	}

  //Returns the saved encrypted settings and decrypts them. Also calls this.generateDeviceId(), if deviceid is empty
	getSettings(){
		var ang = this;
		chrome.storage.local.get(["username", "password", "deviceid", "sessionid", "forceUsRegion", "userIsPremium", "disableBackgroundChecks", "firstuse", "forceSetup", "theme"], function(result) {
			if(result.username !== undefined){
        ang.settings['username'] = AES.decrypt(result.username, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
      }
			if(result.password !== undefined){
        ang.settings['password'] = AES.decrypt(result.password, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
      }
			if(result.deviceid !== undefined){
        ang.settings['deviceid'] = AES.decrypt(result.deviceid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
        if(ang.settings['deviceid'] === ""){
          ang.settings['deviceid'] = ang.generateDeviceId();
        }
      }else{
        ang.settings['deviceid'] = ang.generateDeviceId();
      }
			if(result.sessionid !== undefined){
        ang.settings['sessionid'] = AES.decrypt(result.sessionid, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8);
      }
			if(result.forceUsRegion !== undefined){
				ang.settings['forceUsRegion'] = (AES.decrypt(result.forceUsRegion, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === 'true');
			}
			if(result.userIsPremium !== undefined){
				ang.settings['userIsPremium'] = (AES.decrypt(result.userIsPremium, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === 'true');
			}
			if(result.disableBackgroundChecks !== undefined){
				ang.settings['disableBackgroundChecks'] = (AES.decrypt(result.disableBackgroundChecks, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === 'true');
			}
      if(theme == null || theme == undefined || theme == ""){
        result.theme = "light";
      }
			ang.settings['theme'] = result.theme;
      ang.setTheme(ang.settings['theme']);
      if(result.forceSetup!== undefined){
        ang.settings['forceSetup'] = (AES.decrypt(result.forceSetup, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === "true");
      }
			if(result.firstuse !== undefined){
				ang.settings['firstuse'] = (AES.decrypt(result.firstuse, '5HR*98g5a699^9P#f7cz').toString(enc.Utf8) === 'true') || ang.settings['forceSetup'];
			}else{
				ang.settings['firstuse'] = true;
			}
      ang.varstore.settings = ang.settings;
			ang.onSettingsChanged.emit();
		});
	}

  //Saves the encrypted settings to chromes local storage (not synced!)
	saveSettings(){
    if(!this.varstore.saving){
  		var ang = this;
      ang.varstore.saving = true;
      ang.settings['username'] = (<HTMLInputElement>document.getElementById("username")).value;
      ang.settings['password'] = (<HTMLInputElement>document.getElementById("password")).value;
      ang.settings['disableBackgroundChecks'] = (<HTMLInputElement>document.getElementById("disableBackgroundChecks")).checked;
      if((<HTMLInputElement>document.getElementById("themeLight")).checked){
        ang.settings['theme'] = "light";
      }else if((<HTMLInputElement>document.getElementById("themeDark")).checked){
        ang.settings['theme'] = "dark";
      }
      ang.setTheme(ang.settings['theme']);
      chrome.tabs.query({url: "*://*.crunchyroll.com/*"}, function(tabs) {
        for(var tab in tabs){
          chrome.tabs.sendMessage(tabs[tab].id, {theme: ang.settings['theme']}, function(){});
        }
      });
  		chrome.storage.local.set({
  			"username": AES.encrypt(ang.settings['username'], "5HR*98g5a699^9P#f7cz").toString(),
  			"password": AES.encrypt(ang.settings['password'], "5HR*98g5a699^9P#f7cz").toString(),
  			"sessionid": AES.encrypt(ang.settings['sessionid'], "5HR*98g5a699^9P#f7cz").toString(),
  			"deviceid": AES.encrypt(ang.settings['deviceid'], "5HR*98g5a699^9P#f7cz").toString(),
  			"userIsPremium": AES.encrypt(ang.settings['userIsPremium'], "5HR*98g5a699^9P#f7cz").toString(),
  			"disableBackgroundChecks": AES.encrypt(ang.settings['disableBackgroundChecks'], "5HR*98g5a699^9P#f7cz").toString(),
        "theme": ang.settings['theme']
      }, function(){
        if(!ang.varstore.production){
          ang.settings['forceUsRegion'] = (<HTMLInputElement>document.getElementById("forceUsRegion")).checked;
          ang.settings['forceSetup'] = (<HTMLInputElement>document.getElementById("forceSetup")).checked;
          chrome.storage.local.set({
          	"forceUsRegion": AES.encrypt(ang.settings['forceUsRegion'].toString(), "5HR*98g5a699^9P#f7cz").toString(),
            "forceSetup": AES.encrypt(ang.settings['forceSetup'].toString(), "5HR*98g5a699^9P#f7cz").toString()
          });
        }
        ang.varstore.settings = ang.settings;
        setTimeout(function(){
          ang.varstore.saving = false;
        }, 2000);
      	ang.onSettingsChanged.emit();
      });
    }
	}

  //Reloads the extension, content- and backgroundscript
	reloadExtension(){
		chrome.runtime.reload();
	}

  //Changes the css color values according to the provided theme
  setTheme(theme: string){
    if(theme == null || theme == undefined || theme == ""){
      theme = "light";
    }
    var html = document.getElementsByTagName('html')[0];
    html.classList.remove("light");
    html.classList.remove("dark");
    html.classList.add(theme);
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
