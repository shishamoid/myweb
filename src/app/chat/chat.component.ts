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
import { Router } from '@angular/router';

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
  message: string;
  ws: WebSocket;
  chatarray :string[][] =[]
  connectstatus : boolean = false;
  requesttype:string ="connect";
  room_password : string;
  how_to_use:boolean =false;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router:Router
  ) {
    this.router = router,
    this.roomnameform = new FormGroup({
      roomname: new FormControl(''),
      password: new FormControl(""),
    });
    this.chatform = new FormGroup({
      chatmessage: new FormControl("")
    })
  }

  ngOnInit(){
    this.route.queryParams.subscribe(query => {
      console.log("クエリ",query)
      this.username = query['username'];
    })
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
      this.ws.onmessage = (e) => {
        var object:[] = JSON.parse(e.data)
        observer.next(object)
      }
      this.ws.onerror = (event) => observer.error(event)
      this.ws.onclose = () => observer.complete()
    }
    );
  }

  split_message(message:string){
    //var message_list:[] = message
    var result = ""
    for(var i=0; i<message.length;i++){
      result += message.charAt(i);
      if(i%25==0 && i!=0){
        result+='\n'
      }
    }
    return result
  }

  lender_time(time:Date){
    return time.getHours().toString() + ":" + (0 + time.getMinutes().toString()).slice(-2)
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
    this.chatarray[last_index][2] = this.lender_time(date)

    console.log(this.chatarray)

    if (this.ws.readyState === WebSocket.OPEN) {
      //roomunum調整する必要あり
      var moji = `{"username": "${this.username}","roomname": "${this.roomname}","message": "${data.chatmessage}","time": "${time}"}`
      this.message = JSON.stringify(JSON.parse(moji))
      console.log("send",this.message)
      return this.ws.send(this.message)
    }//https://bugsdb.com/_ja/debug/19204bfe6dfe10f00bd2c0ae346f666f
  }

  roomrequest(roomname: string, password: string, request_type: string) {
    //websocket接続要求
    console.log(roomname, password, request_type,this.username)
    var requestdata = JSON.stringify({ "request_type": request_type, "password": password, "roomname": roomname ,"username": this.username})
    console.log("this is request", requestdata)
    return this.http.post("/chat", requestdata, { responseType: 'text' }).pipe(catchError(this.handleError))
  }

  startchat(port:string,roomname:string) {
    this.ws = new WebSocket(`ws://localhost:${port}`);//this.chatarray.push([msg.message,msg.time,msg.username])
    this.createObservableSocket().subscribe((message :any) => this.receive_message(message))
    this.roomname = roomname
  }

  receive_message(message:any){
    if(message.username!=this.username){
      var date = new Date(message.time)
      var time = this.lender_time(date)
      this.chatarray.push([message.username,message.message,time])
    }
  }

  connectchat(data: any, request_type: string) {
    //request_type = create or connect
    console.log("clicked",data.password,data.roomname)
    var formstatus = this.formcheck(data.roomname,data.password,request_type)

    if(formstatus=="OK"){
      switch(request_type){
        case "create":
          this.roomrequest(data.roomname, data.password, request_type).subscribe(response => {
            alert(response) //roomの作成に成功しました or roomの作成に失敗しました
          })
          break

        case "connect":
            this.roomrequest(data.roomname, data.password, request_type).subscribe(response => {
            if (response == "roomを作成してください"){
              alert(response)
            }else{
              this.connectstatus = true
              console.log("response",response)
              console.log("userid",this.username)
              this.init_chat(data.roomname,response)
              }
            })
        }
      }
    else{
      alert(formstatus)
    }
    }

    formcheck(roomname:string,password:string,request_type:string){
      if(this.roomname==roomname){
        return "接続中です"
      }
      else if(roomname==""){
        return "グループ名を入力してください"
      }
      else if(password==""){
        return "パスワードを入力してください"
      }
      else if(roomname.length>=20){
        return "グループ名は20文字未満です"
      }
      else if(password.length>=20){
        return "パスワードは20文字未満です"
      }
      else if(password.length<=6 && password!=""){
        return "パスワードは6文字以上です"
      }
      else if(password.match(/[/^\W+$]/)){ //半角英数+全角英数+アンダーバー
        return "英数字とアンダーバーのみ使用可能です"
      }
      else{
        return "OK"
      }
    }

  init_chat(roomname:string,response:string){
    var port = JSON.parse(response).port
    var message :[] = JSON.parse(response).message
    this.username = JSON.parse(response).username
    console.log("username",this.username)
    console.log(message)
    //console.log(this.lender_chat(message))
    this.chatarray = this.lender_chat(message)
    this.startchat(port,roomname)
  }

  lender_chat(messages:[]) {
    //console.log("messages",messages)
    var result_array :string[][] =[]
    for(var i = 0;i<messages.length;i++){
      var message_content:string = this.split_message(messages[i][1])
      var date = new Date(messages[i][2])
      var flag:string = (this.username == messages[i][0])?"mymessage":messages[i][0]
      var message_time = this.lender_time(date)
      var unit = [flag,message_content,message_time]

      //日が違ったら処理
      var date_unit = ['_',"date",(date.getMonth()+1).toString()+ "月" + date.getDate().toString() + "日"]
      if (i==0){
        result_array.push(date_unit)
      }
      else{
        var date_recent = new Date(messages[i-1][2])
        if((date.getDate()!=date_recent.getDate()) || (date.getMonth() !=date_recent.getMonth())){
          result_array.push(date_unit)
            }
          }

      result_array.push(unit)

        }

    return result_array
  }

  ngAfterViewInit(){
  }
}
