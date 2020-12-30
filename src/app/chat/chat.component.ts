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

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private subject: Subject<MessageEvent>;   // -- ① WebSocket接続時に返す Subject

  connect(url: string): Subject<MessageEvent> {   // -- ②  このメソッドを呼び出して Subject を手に入れます
    console.log("this is url")
    console.log(url)

    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  private create(url: string): Subject<MessageEvent> {
    const ws = new WebSocket(url); // -- ③ WebSocket オブジェクトを生成します
    const observable = Observable.create((obs: Observer<MessageEvent>) => { // -- ④ Observable オブジェクトを生成します
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);

      return ws.close.bind(ws);
    });

    const observer = {    // -- ⑤ Observer オブジェクトを生成します
      next: (data: Object) => {
        console.log("this is a data ")
        console.log(data)
        if (ws.readyState === WebSocket.OPEN) {
          console.log("繋がったから送る")
          console.log(data)
          ws.send(JSON.stringify(data));
        }
      },
    };
    console.log("this is url!!")
    console.log(url)
    return Subject.create(observer, observable);    // -- ⑥ Subject を生成してconnect
  }
}


export class ChatMessage {
 username: string;
 text: string;
 systemFlag: boolean;

 constructor(
   username: string,
   text: string,
   systemFlag: boolean
 ) {
   this.username = username;
   this.text = text;
   this.systemFlag = systemFlag;
 }
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: Subject<ChatMessage>;

  private chatUrl(roomnumber: string, username: string): string {
    console.log("this is url!!!")
    console.log(roomnumber,username)
    return `ws://localhost:5001/chat${username}&${roomnumber}`;   // -- ① WebSocket サーバーの接続先です
  }


  constructor(private ws: WebSocketService) {
    console.log("initialized")
  }
  connect(roomnumber: string, name: string): Subject<ChatMessage> { // -- ② チャットの接続。 WebSocketService の connect を呼び出し、 Subject を返します。
    console.log(roomnumber,name)
    return this.messages = <Subject<ChatMessage>>this.ws
      .connect(this.chatUrl(roomnumber, name))
      .map((response: MessageEvent): ChatMessage => {
        const data = JSON.parse(response.data) as ChatMessage;
        return data;
      });
  }

  send(name: string, message: string): void { // -- ③ メッセージの送信要求をがあったときは、WebSocketService の `next` メソッドを呼んでいるだけです
    console.log("this is send")
    console.log(this.messages)
    console.log("defined")
    this.messages.next(this.createMessage(name, message));
    console.log("sent")
  }

  private createMessage(name: string, message: string): ChatMessage {
    return new ChatMessage(name, message, false);
  }
}

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
  messages: ChatModel[] = new Array(); // -- ① htmlで利用するオブジェクトです\
  response : string;
  roomnumberform : FormGroup

  handleError<T>(operation = 'operation', result?: T) {
   return (error: any): Observable<T> => {
     console.error(error);
     console.log(`${operation} failed: ${error.message}`);
     return of(result as T);
   };
 }



 roomrequest(roomnumber:string,username:string){
   //websocket接続要求
   //var requestdata = JSON.stringify(`{username:${username},roomnumber:${roomnumber}}`)
   var requestdata = JSON.stringify({"username" : username,"roomnumber":roomnumber})
   console.log("requestdata",requestdata)
   return this.http.post("/chat",requestdata).pipe(catchError(this.handleError))
 }

  constructor(
    private http:HttpClient,
    private chatService: ChatService,
    private route: ActivatedRoute,
  ) {
    this.roomnumberform = new FormGroup({
    roomnumber: new FormControl(''),
    });
  }

  ngOnInit(){
    console.log("next")

    this.route.queryParamMap.subscribe((params: ParamMap) => {
    //this.roomnumber = params.get('roomnumber')||"";
    this.username = params.get("username") || "";

    });
  }

  startchat(data :any){

    this.roomnumber=data.roomnumber

    this.roomrequest(this.roomnumber,this.username).subscribe(response=>{
      console.log("this is response",response)
    })

    this.chatService.connect(this.roomnumber, this.username).subscribe(msg => {

      const isMe = msg.username === this.username;

      this.messages.push(new ChatModel(
        msg.username,
        msg.text,
        msg.systemFlag,
        {
          me: isMe,
          someone: !isMe
        },
        "blue"
      ));
    });
  }


  send(message: string): void {
    this.chatService.send(
      this.username, message
    );
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

class ChatModel {
  username: string;
  text: string;
  systemFlag: boolean;
  speaker: {};
  faceColor: string;

  constructor(username: string, text: string, systemFlag: boolean, speaker: {}, faceColor: string) {
    this.username = username;
    this.text = text;
    this.systemFlag = systemFlag;
    this.speaker = speaker;
    this.faceColor = faceColor;
  }
}
