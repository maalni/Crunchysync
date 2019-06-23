import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

@Injectable()
export class Varstore {
  settings: Object = new Object();
  selectedAnime: Object = new Object();
  notifications: Array<any> = new Array();
  loading: boolean = false;
  saving: boolean = false;
  cachedQueue: boolean = true;
  production: boolean = environment.production;
  version: string = chrome.runtime.getManifest().version;
  selectedPage: number = 0;
  searchTerm: string = "";
}
