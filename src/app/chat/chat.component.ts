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
  roomnumber: string;
  username: string;
  subject: WebSocketSubject<MessageEvent>

  //message: Subject<unknown>
  //@ViewChild("test") test: ElementRef
  //messages: ChatModel[] = new Array(); // -- ① htmlで利用するオブジェクトです\
  response : string;
  roomnumberform : FormGroup;
  chatform :FormGroup;
  createnewroom :FormGroup;
  createnumber : string;
  websocket = new Subject<MessageEvent>();
  //message : string;
  message2 = this.websocket.asObservable();
  ws: WebSocket;

  constructor(
    private http:HttpClient,
    private route: ActivatedRoute,
  ) {
    this.roomnumberform = new FormGroup({
    roomnumber: new FormControl(''),
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
    //this.roomnumber = params.get('roomnumber')||"";
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

 createObservableSocket(url:string){
    this.ws = new WebSocket(url);
    return new Observable(observer => {
        this.ws.onmessage = (e) => {
            console.log(e.data);
            var object = JSON.parse(e.data);
            observer.next(object);
        }
        this.ws.onerror = (event) => observer.error(event);
        this.ws.onclose = (event) => observer.complete();
    }
    );
}


 sendmessage(data:any){
   console.log("push message",data.chatmessage)

  if(this.ws.readyState === WebSocket.OPEN){
    console.log("送った")
    return this.ws.send(data.chatmessage)
  }//https://bugsdb.com/_ja/debug/19204bfe6dfe10f00bd2c0ae346f666f
 }


 roomrequest(roomnumber:string,username:string,type:string){
   //websocket接続要求
   console.log(roomnumber,username,type)
   var requestdata = JSON.stringify({"type": type,"username" : username,"roomnumber":roomnumber})
   console.log("this is request",requestdata)
   return this.http.post("/chat",requestdata,{responseType: 'text'}).pipe(catchError(this.handleError))
   }

  startchat(){
    console.log("response")
    this.createObservableSocket(`ws://localhost:${this.roomnumber}`).subscribe(msg=>{console.log("message",msg)});
  }

  connectchat(data :any,type :string){
    //type = create or connect
    console.log("type",type)
    this.roomnumber=data.roomnumber
    this.createnumber = data.createnumber


    if (type=="create"){
      this.roomrequest(this.roomnumber||this.createnumber,this.username,type).subscribe(response=>{
        console.log(response)
        if(response == "roomの作成に成功しました"){
          alert(response)
        }else{
          alert(response)

        }
      })
    }else if(type=="connect"){
      this.roomrequest(this.roomnumber||this.createnumber,this.username,type).subscribe(response=>{
        console.log("response!",response)

        if(response == "roomを作成してください"){
          alert(response)
        }else{
          //alert(response)
          console.log("チャット開始")
          this.startchat()
          console.log("レスポンス")
        }
      })
    }else{
      alert("invalid request")
    }
  }


  //constructor() {}
  ngAfterViewInit() {
    //var text  = this.test.nativeElement.innerHTML
    const fun1 = (pokemon: string) =>{
    }
    console.log("")
    //this.test.nativeElement.onclick = fun1(text)
  }
}

import { webSocket} from 'rxjs/webSocket';
