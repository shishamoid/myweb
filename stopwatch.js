class stopwatch {

    constructor(){
      this.lendertime = document.getElementById("nowtime")
      this.lenderlaptime = document.getElementById("laptime")

      this.playtime = false
      this.starttime = Date.now()
      this.stoptime = 0.0
      this.laptime = 0.0
      this.Lapcounter = 0
    }

    //スタート
    startTime(){

      //console.log("-------")
      //console.log("playtime",this.playtime)
      //console.log("startTime",this.starttime)
      ///this.spritTime()
      console.log('stopwathc',stopwatch.laptime)
      if(this.playtime==false){
        this.starttime = Date.now()-this.stoptime
        this.playtime = true
        this.timer = setInterval(this.spritTime,100,this.starttime,this.playtime,this.lendertime)
      }
      else{
        ;
      }
      //console.log("*********")
    }

    //ストップ
    stopTime(){
      //console.log("playtime",this.playtime)
      if(this.playtime==true){
        this.stoptime = Date.now()-this.starttime
        console.log(this.stoptime)
        this.playtime = false
      }
      else{
        ;
      }
      clearInterval(this.timer)
      //this.spritTime(this.starttime,this.playtime,this.lendertime)
    }


    //リセット
    resetTime(){
      //console.log("reset")
      this.starttime = Date.now()
      this.stoptime = 0.0
      this.laptime = 0.0
      this.Lapcounter = 0
      //this.lenderlaptime.innerHTML = 0.0
      //console.log("start",this.starttime,"paly",this.playtime,"lender",this.lendertime)
      //this.spritTime(this.starttime,this.playtime,this.lendertime)
      clearInterval(this.timer)
      this.lendertime.innerHTML = Number.parseFloat(0.0).toFixed(1);
      this.lenderlaptime.innerHTML = Number.parseFloat(0.0).toFixed(1);
    }

    //スプリット
    spritTime(starttime,playtime,lendertime){
      if(playtime==true){
        stopwatch.laptime = Date.now()-starttime
        //console.log("this.laptime",stopwatch.laptime)
        lendertime.innerHTML = Number.parseFloat(stopwatch.laptime/1000).toFixed(1);
        //lendertime.innerHTML = Math.round((stopwatch.laptime/1000)*10)/10
      }
      else if(this.playtime==false){
        //console.log("this.laptime",laptime)
        lendertime.innerHTML = Number.parseFloat(stopwatch.laptime/1000).toFixed(1);
        //lendertime.innerHTML = Math.round((stopwatch.laptime/1000)*10)/10
      }
      //setInterval(this.spritTime(),100)
    }

    //ラップ関数
    Lap(){
      this.Lapcounter = this.Lapcounter+1
      console.log('laptime',stopwatch.laptime)
      this.lenderlaptime.innerHTML= Number.parseFloat(stopwatch.laptime/1000).toFixed(1);
      //this.lenderlaptime.innerHTML= Math.round((stopwatch.laptime/1000)*10)/10
    }
    main(){
      console.log("main playtime",this.playtime)
    }

  }

window.onload = function(){
  stopwatch = new stopwatch()
  //stopwatch.spritTime()
  stopwatch.main()
  console.log("window load")
  //setInterval(stopwatch.main(),1000)
}
