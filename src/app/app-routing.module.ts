import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatUsuarioComponent } from './chat-usuario/chat-usuario.component';

const routes: Routes = [
 {path: '',
component:ChatUsuarioComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
