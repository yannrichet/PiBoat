// Basic NodeJS app to control GPIO PWM on pins 22 and 27.

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    piblaster = require('pi-blaster.js'),
    ip = require("ip");


console.log('PiBoat web server listening, visit http://'+ip.address());

app.use(express.static(__dirname + '/'));
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
  res.end();
});
app.listen(80);





var pwm27_min=0.07;
var pwm27_max=0.18;
function speed2pwm(s) {
//s = Math.max(s,-5);
//s = Math.min(s, 5);
pwm = pwm27_min + (pwm27_max-pwm27_min)*(s+5)/10;
return pwm;
}

var speed=0;

app.post('/forward', function (req, res) {
    speed=Math.min(speed+1,5);
    piblaster.setPwm(27, speed2pwm(speed));
    console.log('forward: '+speed);
    res.end();
});

app.post('/backward', function (req, res) {
    speed=Math.max(speed-1,-5);
    piblaster.setPwm(27, speed2pwm(speed));
    console.log('backward: '+speed);
    res.end();
});







var pwm22_min=0.07;
var pwm22_max=0.18;
function angle2pwm(a) {
//a = Math.max(a,-45);
//a = Math.min(a, 45);
pwm = pwm22_min + (pwm22_max-pwm22_min)*(a+45)/90;
return pwm;
}

var angle=0;

app.post('/right', function (req, res) {
    angle=Math.min(angle+15,45);
    piblaster.setPwm(22, angle2pwm(angle));
    console.log('right: '+angle);
    res.end();
});

app.post('/left', function (req, res) {
    angle=Math.max(angle-15,-45);
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


