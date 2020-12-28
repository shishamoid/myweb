import {AfterViewInit, Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {ActivatedRoute, Params} from '@angular/router';
import {Subject, Observable, Observer} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
//import {Md5} from 'ts-md5/dist/md5';
import {WebSocketSubject } from 'rxjs/webSocket';

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
 userName: string;
 text: string;
 systemFlag: boolean;

 constructor(
   userName: string,
   text: string,
   systemFlag: boolean
 ) {
   this.userName = userName;
   this.text = text;
   this.systemFlag = systemFlag;
 }
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messages: Subject<ChatMessage>;

  private chatUrl(roomNumber: string, name: string): string {
    console.log("this is url!!!")
    console.log(roomNumber,name)
    return `ws://localhost:5001/chat`;   // -- ① WebSocket サーバーの接続先です
  }

  constructor(private ws: WebSocketService) {
    console.log("initialized")
  }
  connect(roomNumber: string, name: string): Subject<ChatMessage> { // -- ② チャットの接続。 WebSocketService の connect を呼び出し、 Subject を返します。
    console.log(roomNumber,name)
    return this.messages = <Subject<ChatMessage>>this.ws
      .connect(this.chatUrl(roomNumber, name))
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
  roomNumber: string;
  name: string;
  subject: WebSocketSubject<MessageEvent>
  //message: Subject<unknown>
  //@ViewChild("test") test: ElementRef

  messages: ChatModel[] = new Array(); // -- ① htmlで利用するオブジェクトです

  constructor(
    private chatService: ChatService,
    private route: ActivatedRoute
  ) {
  }
  ngOnInit(){
    console.log("next")
    this.route.params.forEach((params: Params) => {
      this.roomNumber = params['roomNumber'];
      console.log("this is roolnum")
      this.roomNumber = "123"

      console.log(this.roomNumber)
    });

    this.route.queryParams.forEach((params: Params) => {
      this.name = params['name'];
      this.name = "456"
      console.log("this is username")
      console.log(this.name)
    });

    this.chatService.connect(this.roomNumber, this.name).subscribe(msg => {

      const isMe = msg.userName === this.name;

      this.messages.push(new ChatModel(
        msg.userName,
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
      this.name, message
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
  userName: string;
  text: string;
  systemFlag: boolean;
  speaker: {};
  faceColor: string;

  constructor(userName: string, text: string, systemFlag: boolean, speaker: {}, faceColor: string) {
    this.userName = userName;
    this.text = text;
    this.systemFlag = systemFlag;
    this.speaker = speaker;
    this.faceColor = faceColor;
  }
}
