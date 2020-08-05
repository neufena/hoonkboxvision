const rtpmidi = require('rtpmidi');
const rpio = require('rpio');
const fkill = require('fkill');
const { spawn } = require('child_process');

const remote = '192.168.10.10';
const smokePin = 11;
const videoPath = '/home/pi/videos';
const playerPath = '/home/pi/bin/hello_video.bin';

rpio.open(smokePin, rpio.OUTPUT); //3rd arguement default....rpio.HIGH/LOW

const session = rtpmidi.manager.createSession({
  port: 5008,
});

session.connect({ address: remote, port: 5004 });

session.on('message', (deltaTime: number, message: Buffer) => {
  const commands: number[] = Array.prototype.slice.call(message, 0);
  if (commands[0] !== 144) {
    return;
  }

  const note: number = commands[1];
  const velocity: number = commands[2];

  if (note === 1) {
    allOff();
    return;
  }

  if (note === 2) {
    smoke(velocity * 100);
    return;
  }

  if (note === 10) {
    videoPlay(velocity, false);
    return;
  }

  if (note === 11) {
    videoPlay(velocity, true);
    return;
  }

  if (note === 12) {
    videoStop();
    return;
  }
});

function allOff() {
  smokeOff();
}

function smokeOn() {
  rpio.write(smokePin, rpio.HIGH);
  console.log('smoke on');
}

function smokeOff() {
  rpio.write(smokePin, rpio.LOW);
  console.log('smoke off');
}

function smoke(duration: number) {
  smokeOn();
  setTimeout(smokeOff, duration);
}

function videoPlay(file: number, loop: boolean) {
  const path = videoPath + '/video' + file + '.h264';
  console.log('video play ' + path + (loop ? 'looped' : 'once'));
  const command = playerPath + ' ' + (loop ? '--loop ' : '') + path;
  videoStop();
  spawn(command);
}

function videoStop() {
  console.log('video stop');
  fkill('hello_video.bin');
}
