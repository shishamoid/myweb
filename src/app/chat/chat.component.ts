import {AfterViewInit, Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
//import { Observable } from 'rxjs/Observable';
//var util  = require('util');
//var spawn = require('child_process').spawn;
//var php   = spawn('php', ['callme.php']);
class send_query {
  public send_1(params: string){
    console.log(params)
  }
}

let sss = new send_query
sss.send_1("k")

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})


export class ChatComponent implements OnInit {

  constructor() {}
  @ViewChild("test") test: ElementRef
  @ViewChild("bird") bird: ElementRef
  ngOnInit(){
  }
  ngAfterViewInit() {
    console.log(this.test.nativeElement.innerHTML)
    //this.test.nativeElement.innerHTML = "こんばんは"
    console.log(this.bird.nativeElement)
  }
}





//console.log(this.test.nativeElement.innerHTML);
