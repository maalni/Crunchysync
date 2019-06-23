import { Component, Input } from '@angular/core';
import { Varstore } from '../varstore';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.less']
})

export class CategoryComponent  {

  constructor(public varstore: Varstore){}

	@Input() animes;

  openCrunchyroll(){
    window.open("https://www.crunchyroll.com/videos/anime");
  }
}
