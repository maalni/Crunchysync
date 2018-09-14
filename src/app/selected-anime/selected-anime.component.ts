import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-selected-anime',
  templateUrl: './selected-anime.component.html',
  styleUrls: ['./selected-anime.component.css']
})
export class SelectedAnimeComponent {

	@Input() selectedAnime: any;

	ngOnInit() {
		this.closeSelectedAnime();
  }

	openSelectedEpisode(){
		window.open(this.selectedAnime.most_likely_media.url);
	}

	openSelectedAnime(){
		window.open(this.selectedAnime.series.url);
	}

	closeSelectedAnime(){
		(<HTMLElement>document.getElementById("selectedAnime")).hidden = true;
	}
}
