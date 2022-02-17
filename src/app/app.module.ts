import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { VideoSourcesService } from './services/video-sources.service';

import { ListViewComponent } from './list-view/list-view.component';
import { ListsViewComponent } from './lists-view/lists-view.component';
import { SettingsViewComponent } from './settings-view/settings-view.component';
import { VideoSourcesSettingsComponent } from './video-sources-settings/video-sources-settings.component';

@NgModule({
  declarations: [
    AppComponent,
    ListsViewComponent,
    SettingsViewComponent,
    ListViewComponent,
    VideoSourcesSettingsComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [VideoSourcesService],
  bootstrap: [AppComponent]
})
export class AppModule { }
