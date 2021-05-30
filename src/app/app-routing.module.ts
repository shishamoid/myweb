import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { MainComponent } from './main/main.component';
import { LoginComponent} from "./login/login.component";
import { StopwatchComponent} from "./stopwatch/stopwatch.component";
import { OthersComponent } from './others/others.component';

const myRoutes: Routes = [
  //{path:"",component: AppComponent},
  { path: '', component: MainComponent },
  { path: 'chat', component: ChatComponent},
  { path: 'login', component: LoginComponent},
  { path: 'stopwatch', component: StopwatchComponent},
  { path: 'others', component: OthersComponent}
];

@NgModule({
    //RouterModule.forRoot(myRoutes,{useHash:true})
  imports: [RouterModule.forRoot(myRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
