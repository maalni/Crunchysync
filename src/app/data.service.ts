import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class DataService {

	result: any;

	constructor(private _http: Http) { }

	getQueue(session: string): Observable<any> {
		return this._http.get("https://api.crunchyroll.com/queue.0.json?fields=most_likely_media,series,series.name,series.description,series.media_count,media.description,media.unavailable_time,media.premium_unavailable_time,media.premium_available_time,media.premium_available,media.free_unavailable_time,media.free_available_time,media.free_available,media.available_time,media.available,media.availability_notes,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.wide_url,image.fwide_url,image.fwidestar_url,image.widestar_url&media_types=anime|drama&locale=enUS&session_id=" + session).pipe(map(result => this.result = result.json().data), catchError((err: any) => { return Observable.throw(err.statusText) }));
	}

	getInfo(session: string): Observable<any> {
		return this._http.get("https://api.crunchyroll.com/info.0.json?&session_id=" + session).pipe(map(result => this.result = result.json().data), catchError((err: any) => { return Observable.throw(err.statusText) }));
	}

	getSessionID(deviceid: string): Observable<any> {
		if(deviceid === "" || deviceid === undefined){
			deviceid = this.generateDeviceId();
		}
		return this._http.post("https://api.crunchyroll.com/start_session.0.json?&device_type=com.crunchyroll.crunchyroid&access_token=Scwg9PRRZ19iVwD&version=444&locale=enUS&device_id=" + deviceid, {}).pipe(map(result => this.result = result.json().data), catchError((err: any) => { return Observable.throw(err.statusText) }));
	}

	login(sessionid, account, password: string){
		return this._http.post("https://api.crunchyroll.com/login.0.json?&locale=enUS&account=" + account + "&password=" + password + "&session_id=" + sessionid, {}).pipe(map(result => this.result = result.json()), catchError((err: any) => { return Observable.throw(err.statusText) }));
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
