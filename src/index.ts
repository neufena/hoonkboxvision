const rtpmidi = require('rtpmidi'); // eslint-disable-line @typescript-eslint/no-var-requires
const rpio = require('rpio'); // eslint-disable-line @typescript-eslint/no-var-requires
import { spawn, spawnSync } from 'child_process';

const remote = '192.168.10.10';
const smokePin = 11;
const videoPath = '/home/pi/videos';
const playerPath = '/home/pi/bin/hello_video.bin';
const verbose = false;

rpio.open(smokePin, rpio.OUTPUT, rpio.HIGH);
rtpmidi.logger.transports[0].level = 'error';

const session = rtpmidi.manager.createSession({
    name: 'HOONkbox Vision',
    port: 5004,
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
    videoStop();
}

function smokeOn() {
    rpio.write(smokePin, rpio.LOW);
}

function smokeOff() {
    log('Smoke off');
    rpio.write(smokePin, rpio.HIGH);
}

function smoke(duration: number) {
    log('Smoke on for' + duration / 10 + ' seconds');
    smokeOn();
    setTimeout(smokeOff, duration);
}

function videoPlay(file: number, loop: boolean) {
    const path = videoPath + '/video' + file + '.h264';
    const loopArg = '--loop' + (loop ? '' : '=1');
    videoStop();
    log('Play video' + path + '.h264 ' + (loop ? 'looped' : 'once'));
    spawn(playerPath, [loopArg, path]);
}

function videoStop() {
    log('Stop videos');
    spawnSync('killall', ['hello_video.bin']);
}

function log(message: string) {
    if (verbose) {
        console.log(message);
    }
}
