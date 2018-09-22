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

	getDate(){
		var date = new Date(this.selectedAnime.most_likely_media.free_available_time);
		var options = { weekday: 'long', year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
		var formattedDate = date.toLocaleDateString(undefined, options);
		return formattedDate.replace(new RegExp(",", 'g'), "");
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
