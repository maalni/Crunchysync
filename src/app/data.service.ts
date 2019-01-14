import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class DataService {

	result: any;

	constructor(private _http: Http) { }

	//Sends GET request to gitlabs servers and returns the newest release number
	getGitlabVersion(): Observable<any> {
		return this._http.get("https://gitlab.com/api/v4/projects/maalni%2Fcrunchysync/repository/tags").pipe(map(result => this.result = result.json()[0]['name']), catchError((err: any) => { return throwError(err.statusText) }));
	}

	/*Sends GET request to crunchyroll servers and returns the users queued animes
		Variables:
		String sessionid = Users session id*/
	getQueue(sessionid: string, forceUsRegion: boolean): Observable<any> {
		var locale = "enUS";
		if(!forceUsRegion){
			locale = chrome.i18n.getUILanguage();
		}
		return this._http.get("https://api.crunchyroll.com/queue.0.json?"+
			"&fields=most_likely_media,series,series.name,series.media_count,series.series_id,media.description,media.media_id,media.free_available_time,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.fwide_url"+
			"&media_types=anime|drama"+
			"&locale=" + locale +
			"&session_id=" + sessionid).pipe(map(result => this.result = JSON.parse(result['_body'].replace(/(http:)/g, "https:"))), catchError((err: any) => { return throwError(err.statusText) }));
	}

	/*Sends POST request to crunchyroll or OneStay's servers and returns a valid session id
		Variables:
		String deviceid = Extensions device id
		Boolean forceUsRegion = Use OneStay's servers to force a US session*/
	getSessionID(deviceid: string, forceUsRegion: boolean): Observable<any> {
		if(!forceUsRegion){
			return this._http.post("https://api.crunchyroll.com/start_session.0.json?"+
				"&device_type=com.crunchyroll.crunchyroid"+
				"&access_token=Scwg9PRRZ19iVwD"+
				"&device_id=" + deviceid, {}).pipe(map(result => this.result = result.json()), catchError((err: any) => { return throwError(err.statusText) }));
		}else{
			return this._http.get("https://api1.cr-unblocker.com/getsession.php?"+
				"&version=1.1" +
				"&device_id=" + deviceid, {}).pipe(map(result => this.result = result.json()), catchError((err: any) => { return throwError(err.statusText) }));
		}
	}

	/*Sends a POST request to crunchyroll servers and connects a session id with an account
		Variables:
		String sessionid = Users session id
		String username = Users username
		String password = Users password*/
	login(sessionid, username, password: string){
		return this._http.post("https://api.crunchyroll.com/login.0.json?"+
			"&session_id=" + sessionid+
			"&locale=enUS"+
			"&account=" + encodeURIComponent(username) +
			"&password=" + encodeURIComponent(password), {}).pipe(map(result => this.result = result.json()), catchError((err: any) => { return throwError(err.statusText) }));
	}

	/*Sends a POST request to crunchyroll servers and completes an episode
		Variables:
		String mediaid = Episode id
		Number playhead = Episode lenght*/
	completeEpisode(mediaid: string, playhead: number): Observable<any>{
		return this._http.post("https://www.crunchyroll.com/xml/?" +
			"&req=RpcApiVideo_VideoView"+
			"&media_id=" + mediaid +
			"&cbcallcount= 1" +
			"&cbelapsed= 30" +
			"&playhead=" + playhead, {}).pipe(map(result => this.result = result));
	}
}
