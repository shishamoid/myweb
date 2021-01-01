import {AfterViewInit, Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {ActivatedRoute, ParamMap} from '@angular/router';
import {Subject, Observable, Observer} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
//import {Md5} from 'ts-md5/dist/md5';
import {WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {LoginComponent} from '../login/login.component'
import {of} from 'rxjs';
import { catchError, map, tap,retry } from 'rxjs/operators';
import { FormGroup, FormControl } from '@angular/forms';


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  roomname: string;
  username: string;
  subject: WebSocketSubject<MessageEvent>

  //message: Subject<unknown>
  //@ViewChild("test") test: ElementRef
  //messages: ChatModel[] = new Array(); // -- ① htmlで利用するオブジェクトです\
  response : string;
  roomnameform : FormGroup;
  chatform :FormGroup;
  createnewroom :FormGroup;
  createnumber : string;
  //websocket = new Subject<MessageEvent>();
  //message : string;
  message :string;
  ws: WebSocket;
  chatarray = [];

  constructor(
    private http:HttpClient,
    private route: ActivatedRoute,
  ) {
    this.roomnameform = new FormGroup({
    roomname: new FormControl(''),
    });
    this.createnewroom = new FormGroup({
      createnumber: new FormControl(""),
    })
    this.chatform = new FormGroup({
      chatmessage : new FormControl
    })
  }


  ngOnInit(){
    console.log("next")

    this.route.queryParamMap.subscribe((params: ParamMap) => {
    //this.roomname = params.get('roomname')||"";
    this.username = params.get("username") || "";
    });
    //this.message = subscribe(this.sendmessage)

  }
  handleError<T>(operation = 'operation', result?: T) {
   return (error: any): Observable<T> => {
     console.error(error);
     console.log(`${operation} failed: ${error.message}`);
     return of(result as T);
   };
 }


 createObservableSocket(){
    return new Observable(observer => {
        this.ws.onopen = e =>console.log("繋がった")
        this.ws.onmessage = (e) => {
          console.log("responseがありました")
            console.log(e.data);
            var object = JSON.parse(e.data);
            observer.next(object);
        }
        this.ws.onerror = (event) => observer.error(event);
        this.ws.onclose = (event) => observer.complete();
    }
    );
}

connection(){
  return new Observable(observer => {this.ws.onopen = a=>observer.next()})
}

 sendmessage(data:any){
   console.log("push message",data.chatmessage)
   console.log(this.ws.readyState)
  if(this.ws.readyState === WebSocket.OPEN){
    console.log("送った")
    //roomunum調整する必要あり
    this.message = JSON.stringify({"user":this.username,"roomname":this.roomname,"message":data.chatmessage})
    return this.ws.send(this.message)
  }//https://bugsdb.com/_ja/debug/19204bfe6dfe10f00bd2c0ae346f666f
 }


 roomrequest(roomname:string,username:string,type:string){
   //websocket接続要求
   console.log(roomname,username,type)
   var requestdata = JSON.stringify({"type": type,"username" : username,"roomname":roomname})
   console.log("this is request",requestdata)
   return this.http.post("/chat",requestdata,{responseType: 'text'}).pipe(catchError(this.handleError))
   }

  startchat(){
    console.log("response")
    this.createObservableSocket().subscribe(msg=>{console.log("message",msg)});
  }

  connectchat(data :any,type :string){
    //type = create or connect
    console.log("type",type)

    if (type=="create"){
      this.createnumber = data.createnumber
      this.roomrequest(data.createnumber,this.username,type).subscribe(response=>{
        console.log(response)
        if(response == "roomの作成に成功しました"){
          alert(response)
        }else{
          alert(response)
        }
      })
    }else if(type=="connect"){
      this.roomrequest(data.roomname,this.username,type).subscribe(response=>{
        console.log("response!",response)
        if(response == "roomを作成してください"){
          alert(response)
        }else{
          console.log("roomあった")
          console.log("チャット開始")
          var port = JSON.parse(response).port
          var message = JSON.parse(response).message
          this.ws = new WebSocket(`ws://localhost:${port}`);
          console.log("socket instanse",this.ws)
          this.connection().subscribe(k=>{console.log(k)})
          this.startchat()
          console.log("レスポンス")
        }
      })
    }else{
      alert("invalid request")
    }
  }

  lender_chat(){
    this.chatarray.push
  }

  //constructor() {}
  ngAfterViewInit() {
    //var text  = this.test.nativeElement.innerHTML
    const fun1 = (pokemon: string) =>{
    }
    var date = new Date()
    console.log("this is today")
    console.log(date)
    console.log(date.getTime)
    console.log("")
    //this.test.nativeElement.onclick = fun1(text)
  }
}

class chatmodel {
  username :string;
  message:string;
  time: string;
}
import { webSocket} from 'rxjs/webSocket';
