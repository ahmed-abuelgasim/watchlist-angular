import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListViewComponent } from './list-view/list-view.component';
import { ListsViewComponent } from './lists-view/lists-view.component';
import { SettingsViewComponent } from './settings-view/settings-view.component';

const routes: Routes = [
  {
    component: SettingsViewComponent,
    path: 'settings',
  },
  {
    component: ListsViewComponent,
    path: 'lists',
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/lists',
  },
  {
    component: ListViewComponent,
    path: 'list/:id',
  },
  {
    path: '**',
    redirectTo: '/lists',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
