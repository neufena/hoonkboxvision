const rtpmidi = require('rtpmidi');
const rpio = require('rpio');

const remote: string = '127.0.0.1';
const smokePin = 11;

rpio.open(smokePin, rpio.OUTPUT); //3rd arguement rpio.HIGH/LOW

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
    videoLoad(1, velocity, true);
    return;
  }

  if (note === 11) {
    videoLoad(1, velocity, true);
    videoPlay(1);
    return;
  }

  if (note === 12) {
    videoPlay(1);
    return;
  }

  if (note === 13) {
    videoPause(1);
    return;
  }

  if (note === 14) {
    videoStop(1);
    return;
  }

  if (note === 20) {
    videoLoad(1, velocity, false);
    return;
  }

  if (note === 21) {
    videoLoad(1, velocity, false);
    videoPlay(1);
    return;
  }

  if (note === 22) {
    videoPlay(1);
    return;
  }

  if (note === 23) {
    videoPause(1);
    return;
  }

  if (note === 24) {
    videoStop(1);
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

function videoLoad(layer: number, file: number, loop: boolean) {}

function videoPlay(layer: number) {}

function videoPause(layer: number) {}

function videoStop(layer: number) {}
