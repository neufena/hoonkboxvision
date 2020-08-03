const rtpmidi = require('rtpmidi');
const rpio = require('rpio');

const remote: string = '127.0.0.1';
const smokePin = 11;

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
    videoPlay(1, velocity, true);
    return;
  }

  if (note === 11) {
    videoPlay(1, velocity, true);
    return;
  }

  if (note === 11) {
    videoStop(1);
    return;
  }

  if (note === 20) {
    videoPlay(2, velocity, false);
    return;
  }

  if (note === 21) {
    videoStop(2);
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

function videoPlay(layer: number, file: number, loop: boolean) {}

function videoStop(layer: number) {}
