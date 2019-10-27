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
    var releasedate = new Date(this.anime['most_likely_media']['available_time']).getTime();
    var currentdate = new Date().getTime();
    var weeks = Math.round((currentdate - releasedate) / 604800000);
    return weeks < 2;
  }

  openEpisode(){
    window.open(this.anime.most_likely_media.url);
  }
}
