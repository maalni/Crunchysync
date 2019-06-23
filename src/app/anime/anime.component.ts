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

  openEpisode(){
    window.open(this.anime.most_likely_media.url);
  }
}
