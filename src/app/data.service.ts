import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class DataService {

	result: any;

	constructor(private _http: Http) { }

	getQueue(session: string): Observable<any> {
		return this._http.get("https://api.crunchyroll.com/queue.0.json?fields=most_likely_media,series,series.name,series.description,series.media_count,media.description,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.wide_url,image.fwide_url,image.fwidestar_url,image.widestar_url&media_types=anime|drama&locale=enUS&session_id=" + session).map(result => this.result = result.json().data).catch((err: any) => { return Observable.throw(err.statusText) });
	}

	getInfo(session: string): Observable<any> {
		return this._http.get("https://api.crunchyroll.com/info.0.json?&session_id=" + session).map(result => this.result = result.json().data).catch((err: any) => { return Observable.throw(err.statusText) });
	}

	getSessionID(deviceid: string): Observable<any> {
		if(deviceid === "" || deviceid === undefined){
			deviceid = this.generateDeviceId();
		}
		return this._http.post("https://api.crunchyroll.com/start_session.0.json?&device_type=com.crunchyroll.crunchyroid&access_token=Scwg9PRRZ19iVwD&version=444&locale=enUS&device_id=" + deviceid, {}).map(result => this.result = result.json().data).catch((err: any) => { return Observable.throw(err.statusText) });
	}

	login(sessionid, account, password: string){
		return this._http.post("https://api.crunchyroll.com/login.0.json?&locale=enUS&account=" + account + "&password=" + password + "&session_id=" + sessionid, {}).map(result => this.result = result.json()).catch((err: any) => { return Observable.throw(err.statusText) });
	}

	generateDeviceId() {
		let id = 'ffffffff';
		const possible = 'abcdef123456789';
		for (var i = 0; i < 28; i++) {
			if(i == 0 || i == 5 || i == 10 || i == 15){
				id += "-";
			}else{
				id += possible.charAt(Math.floor(Math.random() * possible.length));
			}
		}
		console.log("new deviceID: " + id);
		return id;
	}
}
