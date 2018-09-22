import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { FilterPipe }from './filter.pipe';
import { AppComponent } from './app.component';
import { DataService } from './data.service';
import { AnimeComponent } from './anime/anime.component';
import { SelectedAnimeComponent } from './selected-anime/selected-anime.component';
import { SpinnerComponent } from './spinner/spinner.component';
import { TabnavComponent } from './tabnav/tabnav.component';
import { ErrorComponent } from './error/error.component';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    AppComponent,
    AnimeComponent,
		FilterPipe,
		SelectedAnimeComponent,
		SpinnerComponent,
		TabnavComponent,
		ErrorComponent,
		SettingsComponent
  ],
  imports: [
    BrowserModule,
		BrowserAnimationsModule,
		HttpModule,
		FormsModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }