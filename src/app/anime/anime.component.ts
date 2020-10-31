import { Component, Input } from '@angular/core';
import { Varstore } from '../varstore';

@Component({
  selector: 'app-anime',
  templateUrl: './anime.component.html',
  styleUrls: ['./anime.component.less'],
})

export class AnimeComponent{
	@Input() anime;
	@Input() userIsPremium;

  constructor(public varstore: Varstore) {}

  isNewEpisode(){
    if(this.anime['most_likely_media'] != undefined && this.anime['most_likely_media']['available_time'] != undefined){
      var releasedate = new Date(this.anime['most_likely_media']['available_time']).getTime();
      var currentdate = new Date().getTime();
      var weeks = Math.round((currentdate - releasedate) / 604800000);
      return weeks < 2;
    }else{
      return false;
    }
  }

  openEpisode(){
    window.open(this.anime.most_likely_media.url);
  }
}
