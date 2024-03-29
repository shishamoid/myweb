import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stopwatch',
  templateUrl: './stopwatch.component.html',
  styleUrls: ['./stopwatch.component.css']
})
export class StopwatchComponent implements OnInit {
  nowtime : HTMLElement
  nowtimebyid:HTMLElement
  laptimebyid :HTMLElement

  playtime:Boolean
  starttime:number
  stoptime:number
  timer:number

  constructor() {
    this.playtime = false
    this.starttime = Date.now()
    this.stoptime = 0.0
   }

   //スタート
   startTime(){
     if(this.playtime==false){
       this.starttime = Date.now()-<number>this.stoptime
       this.playtime = true
       this.timer = setInterval(this.lenderTime,10,this.starttime,this.playtime)

     }
     else{
       ;
     }
   }

   //ストップ
   stopTime(){
     if(this.playtime==true){
       this.stoptime = Date.now()-this.starttime
       this.playtime = false
     }
     else{
       ;
     }
     clearInterval(this.timer)
   }

   //リセット
   resetTime(){
     this.starttime = Date.now()
     this.stoptime = 0.0
     clearInterval(this.timer)
     this.playtime = false
     this.nowtimebyid.innerHTML=0.0.toFixed(2);
     this.laptimebyid.innerHTML=0.0.toFixed(2);
   }

   //レンダリング
   lenderTime(starttime :number){
      var lendertime = ((Date.now()-starttime)/1000);
      var lendertime_s = lendertime.toFixed(2);
      if(lendertime>=99999){
          this.resetTime() 
      }
      this.nowtime.innerHTML= lendertime_s;
   }

   //ラップ関数
   Lap(){
     if(this.playtime){
       this.laptimebyid.innerHTML = ((Date.now()-this.starttime)/1000).toFixed(2)
     }
     else{
       this.laptimebyid.innerHTML = this.nowtimebyid.innerText
     }
   }


  ngOnInit(): void {
    this.nowtimebyid = <HTMLElement>document.getElementById("nowtime")
    this.laptimebyid = <HTMLElement>document.getElementById("laptime")
    //console.log("laptimebyid",this.laptimebyid)
  }
  ngOnDestroy(){
    this.stopTime()
  }

}
