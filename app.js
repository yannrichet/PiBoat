// Basic NodeJS app to control GPIO PWM on pins 22 and 27.

var express = require('express'),
    app = express(),
    server = require('http').Server(app),
    piblaster = require('pi-blaster.js'),
    ip = require("ip");//,    gamepad = require("gamepad");


app.use(express.static(__dirname + '/'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(req, res) {
  res.render(__dirname + '/index.html',{localip:ip.address()});
  //es.end();
});
app.listen(80);

console.log('PiBoat web server listening, visit http://'+ip.address());


// Main POST control

var pwm27_min=0.115;
var pwm27_max=0.145;
function speed2pwm(s) {
//s = Math.max(s,-5);
//s = Math.min(s, 5);
pwm = pwm27_min + (pwm27_max-pwm27_min)*(s+5)/10;
return pwm;
}

var speed=0;

app.post('/backward', function (req, res) {
    speed=speed+1;
    speed=Math.min(speed,5);
    speed=Math.max(speed,-5);
    piblaster.setPwm(27, speed2pwm(speed));
    console.log('forward: '+speed);
    res.end();
});

app.post('/forward', function (req, res) {
    speed=speed-1;
    speed=Math.min(speed,5);
    speed=Math.max(speed,-5);
    piblaster.setPwm(27, speed2pwm(speed));
    console.log('backward: '+speed);
    res.end();
});



var pwm22_min=0.10;
var pwm22_max=0.20;
function angle2pwm(a) {
//a = Math.max(a,-45);
//a = Math.min(a, 45);
pwm = pwm22_min + (pwm22_max-pwm22_min)*(a+45)/90;
return pwm;
}

var angle=0;

app.post('/right', function (req, res) {
    angle=angle+15;
    angle=Math.min(angle,45);
    angle=Math.max(angle,-45);
    piblaster.setPwm(22, angle2pwm(angle));
    console.log('right: '+angle);
    res.end();
});

app.post('/left', function (req, res) {
    angle=angle-15;
    angle=Math.min(angle,45);
    angle=Math.max(angle,-45);
    piblaster.setPwm(22, angle2pwm(angle));
    console.log('left: '+angle);
    res.end();
});



app.post('/stop', function (req, res) {
    console.log('stop');
    speed=0;
    piblaster.setPwm(27, speed2pwm(speed));
    angle=0;
    piblaster.setPwm(22, angle2pwm(angle));
    res.end();
});






//If we lose comms set the servos to neutral
//
function emergencyStop()
{
    speed=0;
    piblaster.setPwm(27, speed2pwm(speed));
    angle=0;
    piblaster.setPwm(22, angle2pwm(angle));
    console.log('###EMERGENCY STOP - signal lost or shutting down');
}//END emergencyStop


//user hits ctrl+c
//
process.on('SIGINT', function() 
{
  emergencyStop();
  console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
 
  return process.exit();
});//END process.on 


// Websocket control

var userId;
var wss = require("ws").Server({server: server, port:3000});
    wss.on("connection", function (ws) {

    console.log("websocket connection open");

    var timestamp = new Date().getTime();
    userId = timestamp;

    ws.send(JSON.stringify({msgType:"onOpenConnection", msg:{connectionId:timestamp}}));


    ws.on("message", function (data, flags) {
        var clientMsg = data.toString()+"";
        console.log("websocket received a message: "+clientMsg+" ("+typeof(clientMsg)+")");

        if (!(clientMsg === 'undefined')) {
            if (clientMsg.indexOf("angle:")==0){
                var angle_str = clientMsg.split(":")[1].trim();
                console.log("angle: "+angle_str);
                angle = parseFloat(angle_str)*45;
                piblaster.setPwm(22, angle2pwm(angle));
            }
            if (clientMsg.indexOf("speed:")==0){
                var speed_str = clientMsg.split(":")[1].trim();
                console.log("speed: "+speed_str);
                speed = parseFloat(speed_str)*5;
                piblaster.setPwm(27, speed2pwm(speed));
            }
        }

        ws.send(JSON.stringify({msg:{connectionId:userId}}));
    });

    ws.on("close", function () {
        console.log("websocket connection close");
        emergencyStop();
    });
});
console.log("PiBoat websocket server created");

