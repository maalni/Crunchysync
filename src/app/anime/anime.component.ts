import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-anime',
  templateUrl: './anime.component.html',
  styleUrls: ['./anime.component.css'],
})

export class AnimeComponent{
	@Input() anime;
	@Input() userIsPremium;
	@Output() onSelect = new EventEmitter<Array<any>>();

  openEpisode(){
    window.open(this.anime.most_likely_media.url);
  }
}
