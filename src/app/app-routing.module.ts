import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { MainComponent } from './main/main.component';
import { AppComponent } from './app.component';
import { LoginComponent} from "./login/login.component"


const myRoutes: Routes = [
  //{path:"",component: AppComponent},
  { path: 'main', component: MainComponent },
  { path: 'chat', component: ChatComponent},
  { path: 'login', component: LoginComponent}
];

@NgModule({
    //RouterModule.forRoot(myRoutes,{useHash:true})
  imports: [RouterModule.forRoot(myRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
