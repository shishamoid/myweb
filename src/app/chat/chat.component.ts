import {AfterViewInit, Component, ElementRef, ViewChild,OnInit} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import {Subject, Observable, Observer} from 'rxjs/Rx';
import {Injectable} from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

@Injectable({
  providedIn: 'root'
})


export class ChatService {

    serve(): WebSocketSubject<MessageEvent> {
      console.log("suzu")
      return webSocket({
        url: `ws://localhost:5000/chat`,
        deserializer: message => {
          console.log("this is a message")
          console.log(message.data)

          return message;
        }
      });
    }

  constructor() { }
}

@Injectable()
export class WebSocketService {
  private subject: Subject<MessageEvent>;   // -- ① WebSocket接続時に返す Subject

  connect(url: string): Subject<MessageEvent> {   // -- ②  このメソッドを呼び出して Subject を手に入れます
    if (!this.subject) {
      this.subject = this.create(url);
    }
    return this.subject;
  }

  private create(url: string): Subject<MessageEvent> {
    const ws = new WebSocket(url);　　// -- ③ WebSocket オブジェクトを生成します

    const observable = Observable.create((obs: Observer<MessageEvent>) => { // -- ④ Observable オブジェクトを生成します
      ws.onmessage = obs.next.bind(obs);
      ws.onerror = obs.error.bind(obs);
      ws.onclose = obs.complete.bind(obs);

      return ws.close.bind(ws);
    });

    const observer = {    // -- ⑤ Observer オブジェクトを生成します
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      },
    };
    return Subject.create(observer, observable);    // -- ⑥ Subject を生成してconnect
  }
}


@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  subject: WebSocketSubject<MessageEvent>

  constructor() {}
  @ViewChild("test") test: ElementRef
  ngOnInit(){
    console.log("initialized")
    let chat : ChatService = new ChatService
    this.subject = chat.serve();
    //console.log(this.subject)
    console.log("next")
    this.subject.subscribe(
      (message: MessageEvent) => {
        message = JSON.parse(message.data);
        console.log("pokemon")
      })
  }
  ngAfterViewInit() {
    var text  = this.test.nativeElement.innerHTML
    const fun1 = (pokemon: string) =>{
    }
    console.log("")
    this.test.nativeElement.onclick = fun1(text)
  }
}
