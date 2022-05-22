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
      console.log('stopwathc',stopwatch.laptime)
      if(this.playtime==false){
        this.starttime = Date.now()-this.stoptime
        this.playtime = true
        this.timer = setInterval(this.spritTime,100,this.starttime,this.playtime,this.lendertime)
      }
      else{
        ;
      }
    }

    //ストップ
    stopTime(){
      if(this.playtime==true){
        this.stoptime = Date.now()-this.starttime
        console.log(this.stoptime)
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
      this.laptime = 0.0
      this.Lapcounter = 0
      clearInterval(this.timer)
      this.lendertime.innerHTML = Number.parseFloat(0.0).toFixed(1);
      this.lenderlaptime.innerHTML = Number.parseFloat(0.0).toFixed(1);
    }

    //スプリット
    spritTime(starttime,playtime,lendertime){
      if(playtime==true){
        stopwatch.laptime = Date.now()-starttime
        lendertime.innerHTML = Number.parseFloat(stopwatch.laptime/1000).toFixed(1);
        }
      else if(this.playtime==false){
        lendertime.innerHTML = Number.parseFloat(stopwatch.laptime/1000).toFixed(1);
      }
    }

    //ラップ
    Lap(){
      this.Lapcounter = this.Lapcounter+1
      console.log('laptime',stopwatch.laptime)
      this.lenderlaptime.innerHTML= Number.parseFloat(stopwatch.laptime/1000).toFixed(1);
    }
    main(){
      console.log("main playtime",this.playtime)
    }

  }

window.onload = function(){
  stopwatch = new stopwatch()
  stopwatch.main()
  console.log("window load")
}
