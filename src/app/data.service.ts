import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class DataService {

	result: any;
	apiUrl: string = "https://api.crunchyroll.com/";
	sessionApiUrl: string = "https://api-manga.crunchyroll.com/";
	rpcApiUrl: string = "https://www.crunchyroll.com/xml/";

	constructor(private _http: Http) { }

	getQueue(session: string): Observable<any> {
		return this._http.get(this.apiUrl +"queue.0.json?"+
			"&fields=most_likely_media,series,series.name,series.description,series.media_count,media.description,media.media_id,media.unavailable_time,media.premium_unavailable_time,media.premium_available_time,media.premium_available,media.free_unavailable_time,media.free_available_time,media.free_available,media.available_time,media.available,media.availability_notes,media.name,media.url,media.episode_number,series.url,media.screenshot_image,media.duration,media.playhead,media.premium_only,image.wide_url,image.fwide_url,image.fwidestar_url,image.widestar_url"+
			"&media_types=anime|drama"+
			"&locale=enUS"+
			"&session_id=" + session).pipe(map(result => this.result = result.json()), catchError((err: any) => { return throwError(err.statusText) }));
	}

	getSessionID(deviceid: string): Observable<any> {
		return this._http.post(
			this.sessionApiUrl + "cr_start_session?"+
			"&api_ver=1.0"+
			"&device_type=com.crunchyroll.manga.android"+
			"&access_token=FLpcfZH4CbW4muO"+
			"&device_id=" + deviceid, {}).pipe(map(result => this.result = result.json()), catchError((err: any) => { return throwError(err.statusText) }));
	}

	login(sessionid, account, password: string){
		return this._http.post(this.apiUrl + "login.0.json?"+
			"&session_id=" + sessionid+
			"&locale=enUS"+
			"&account=" + encodeURIComponent(account) +
			"&password=" + encodeURIComponent(password), {}).pipe(map(result => this.result = result.json()), catchError((err: any) => { return throwError(err.statusText) }));
	}

	completeEpisode(mediaid: string, playhead: number): Observable<any>{
		return this._http.post(this.rpcApiUrl + "?" +
			"&req=RpcApiVideo_VideoView"+
			"&media_id=" + mediaid +
			"&cbcallcount= 1" +
			"&cbelapsed= 30" +
			"&playhead=" + playhead, {}).pipe(map(result => this.result = result));
	}
}
