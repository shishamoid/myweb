import { AfterViewInit, Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject, Observable, Observer } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
//import {Md5} from 'ts-md5/dist/md5';
import { WebSocketSubject } from 'rxjs/webSocket';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LoginComponent } from '../login/login.component'
import { of } from 'rxjs';
import { catchError, map, tap, retry } from 'rxjs/operators';
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
  //@ViewChild("test") test: ElementRef
  response: string;
  roomnameform: FormGroup;
  chatform: FormGroup;
  createnewroom: FormGroup;
  createnumber: string;
  message: string;
  ws: WebSocket;
  chatarray :string[][]
  connectstatus : boolean;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
  ) {
    this.roomnameform = new FormGroup({
      roomname: new FormControl(''),
    });
    this.createnewroom = new FormGroup({
      createnumber: new FormControl(""),
    })
    this.chatform = new FormGroup({
      chatmessage: new FormControl("")
    })
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.username = params.get("username") || "";
    });
  }

  handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  createObservableSocket() {
    return new Observable(observer => {
      this.ws.onopen = e => console.log("繋がった")
      this.ws.onmessage = (e) => {
        console.log("responseがありました")
        console.log(e.data);
        var object = JSON.parse(e.data);
        console.log("this is response", object)
        observer.next(object);
      }
      this.ws.onerror = (event) => observer.error(event);
      this.ws.onclose = (event) => observer.complete();
    }
    );
  }


  sendmessage(data: any) {
    var date = new Date()
    var time = date.getFullYear()
      + '/' + ('0' + (date.getMonth() + 1)).slice(-2)
      + '/' + ('0' + date.getDate()).slice(-2)
      + ' ' + ('0' + date.getHours()).slice(-2)
      + ':' + ('0' + date.getMinutes()).slice(-2)
      + ':' + ('0' + date.getSeconds()).slice(-2)
    console.log(date.getTime())

    var last_index:number= this.chatarray.length
    this.chatarray[last_index]= []
    this.chatarray[last_index][0] = "mymessage"
    this.chatarray[last_index][1] = data.chatmessage
    this.chatarray[last_index][2] = date.getHours().toString() + ":" + date.getMinutes().toString()
    console.log(this.chatarray)

    if (this.ws.readyState === WebSocket.OPEN) {
      //roomunum調整する必要あり

      var moji = `{"user": "${this.username}","roomname": "${this.roomname}","message": "${data.chatmessage}","time": "${time}"}`
      this.message = JSON.stringify(JSON.parse(moji))
      return this.ws.send(this.message)
    }//https://bugsdb.com/_ja/debug/19204bfe6dfe10f00bd2c0ae346f666f
  }


  roomrequest(roomname: string, username: string, request_type: string) {
    //websocket接続要求
    console.log(roomname, username, request_type)
    var requestdata = JSON.stringify({ "request_type": request_type, "username": username, "roomname": roomname })
    console.log("this is request", requestdata)
    return this.http.post("/chat", requestdata, { responseType: 'text' }).pipe(catchError(this.handleError))
  }

  startchat(port:string) {
    this.ws = new WebSocket(`ws://localhost:${port}`);
    this.createObservableSocket().subscribe(msg => { console.log("message", msg) });
  }

  connectchat(data: any, request_type: string) {
    //request_type = create or connect
    switch(request_type){
      case "create":
        this.createnumber = data.createnumber
        this.roomrequest(data.createnumber, this.username, request_type).subscribe(response => {
          alert(response) //roomの作成に成功しました or roomの作成に失敗しました
        })
        break
      case "connect":
        if(this.roomname==data.roomname){
          alert("接続中です")
        }else{
          this.roomrequest(data.roomname, this.username, request_type).subscribe(response => {
          if (response == "roomを作成してください"){
            alert(response)
          }else{
            var port = JSON.parse(response).port
            var message :[] = JSON.parse(response).message
            console.log(message)
            //console.log(this.lender_chat(message))
            this.chatarray = this.lender_chat(message)
            this.roomname = data.roomname
            this.startchat(port)
            }
          })
        }
      }
    }
    parse_date(date:Date){
      console.log()

    }

  lender_chat(messages:[]) {
    //console.log("messages",messages)
    var result_array :string[][] = []

    for(var i in messages){
      var message_content:string = messages[i][1]
      var date = new Date(messages[i][2])
      var message_date = date.getDate().toString() + "日"
      var message_month = (date.getMonth()+1).toString() + "月"
      var message_time = date.getHours().toString() + ":" + date.getMinutes().toString()
      result_array[i] = []
      var flag= (this.username == messages[i][0])?"mymessage":"othermessage"

      result_array[i][0] = flag
      result_array[i][1] = message_content
      result_array[i][2] = message_time
        }
        return result_array
      }
  ngAfterViewInit() {

  }
}
