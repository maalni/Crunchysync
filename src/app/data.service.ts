import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class DataService {

	result: any;

	constructor(private http: HttpClient) { }

	//Sends GET request to gitlabs servers and returns the newest release number
	getGitlabVersion(): Observable<any> {
		return this.http.get("https://gitlab.com/api/v4/projects/maalni%2Fcrunchysync/repository/tags").pipe(map(result => this.result = result[0]['name']), catchError((err: any) => { return throwError(err.statusText) }));
	}

	/*Sends GET request to crunchyroll servers and returns the users queued animes
		Variables:
		String sessionid = Users session id*/
	getQueue(sessionid: string, forceUsRegion: boolean): Observable<any> {
		var locale = "enUS";
		if(!forceUsRegion){
			locale = chrome.i18n.getUILanguage();
		}
		return this.http.get("https://api.crunchyroll.com/queue.0.json?"+
			"&fields=most_likely_media,series,series.name,series.media_count,series.series_id,media.description,media.media_id,media.free_available_time,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.fwide_url"+
			"&media_types=anime|drama"+
			"&locale=" + locale +
			"&session_id=" + sessionid).pipe(map(result => this.result = JSON.parse(JSON.stringify(result).replace(/(http:)/g, "https:"))), catchError((err: any) => { return throwError(err.statusText) }));
	}

	/*Sends POST request to crunchyroll or OneStay's servers and returns a valid session id
		Variables:
		String deviceid = Extensions device id
		Boolean forceUsRegion = Use OneStay's servers to force a US session*/
	getSessionID(deviceid: string, forceUsRegion: boolean): Observable<any> {
		if(!forceUsRegion){
			return this.http.post("https://api.crunchyroll.com/start_session.0.json?"+
				"&device_type=com.crunchyroll.crunchyroid"+
				"&access_token=Scwg9PRRZ19iVwD"+
				"&device_id=" + deviceid, {}).pipe(map(result => this.result = result), catchError((err: any) => { return throwError(err.statusText) }));
		}else{
			return this.http.get("https://api1.cr-unblocker.com/getsession.php?"+
				"&version=1.1" +
				"&device_id=" + deviceid, {}).pipe(map(result => this.result = result), catchError((err: any) => { return throwError(err.statusText) }));
		}
	}

	/*Sends a POST request to crunchyroll servers and connects a session id with an account
		Variables:
		String sessionid = Users session id
		String username = Users username
		String password = Users password*/
	login(sessionid, username, password: string): Observable<any> {
		return this.http.post("https://api.crunchyroll.com/login.0.json?" +
			"&session_id=" + sessionid+
			"&locale=enUS" +
			"&account=" + encodeURIComponent(username) +
			"&password=" + encodeURIComponent(password), {}).pipe(map(result => this.result = result), catchError((err: any) => { return throwError(err.statusText) }));
	}

	getEpisodes(sessionid: string, forceUsRegion: boolean, collection: string): Observable<any> {
		var locale = "enUS";
		if(!forceUsRegion){
			locale = chrome.i18n.getUILanguage();
		}
		return this.http.post("https://api.crunchyroll.com/list_media.0.json?" +
			"collection_id=" + collection +
			"&sort=asc" +
			"&offset=0" +
			"&limit=84" +
			"&include_clips=false" +
			"&fields=media.media_id%2Cmedia.name%2Cmedia.series_id%2Cmedia.series_name%2Cmedia.description%2Cmedia.premium_only%2Cmedia.screenshot_image%2Cmedia.available_time%2Cmedia.premium_available_time%2Cmedia.premium_available%2Cmedia.episode_number%2Cmedia.duration%2Cmedia.playhead" +
			"&session_id=" + sessionid +
			"&locale=" + locale, {}).pipe(map(result => this.result = result), catchError((err: any) => { return throwError(err.statusText) }));
	}

	/*Sends a POST request to crunchyroll servers and completes an episode
		Variables:
		String mediaid = Episode id
		Number playhead = Episode lenght*/
	completeEpisode(mediaid: string, playhead: number): Observable<any> {
		return this.http.post("https://www.crunchyroll.com/xml/?" +
			"&req=RpcApiVideo_VideoView"+
			"&media_id=" + mediaid +
			"&cbcallcount=1" +
			"&cbelapsed=30" +
			"&playhead=" + playhead, {}, {responseType: 'text'}).pipe(map(result => this.result = result), catchError((err: any) => { return throwError(err.statusText) }));
	}
}
