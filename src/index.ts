const rtpmidi = require('rtpmidi'); // eslint-disable-line @typescript-eslint/no-var-requires
const rpio = require('rpio'); // eslint-disable-line @typescript-eslint/no-var-requires
import { spawn, spawnSync, execSync} from 'child_process';

const smokePin = 7;
const videoPath = '/home/pi/videos';
const playerPath = '/home/pi/bin/hello_video.bin';
const verbose = process.env.VERBOSE || false;
const selftest = process.env.SELFTEST || false;
const remote = process.env.REMOTE_IP || '192.168.10.10';

const rgbOnePins = {
    "red": 10,
    "green": 11,
    "blue": 12,
};
const rgbTwoPins = {
    "red": 21,
    "green": 22,
    "blue": 23,
};

rpio.open(smokePin, rpio.OUTPUT, rpio.HIGH);

rpio.open(rgbOnePins.red, rpio.OUTPUT, rpio.HIGH);
rpio.open(rgbOnePins.green, rpio.OUTPUT, rpio.HIGH)
rpio.open(rgbOnePins.blue, rpio.OUTPUT, rpio.HIGH)

rpio.open(rgbTwoPins.red, rpio.OUTPUT, rpio.HIGH)
rpio.open(rgbTwoPins.green, rpio.OUTPUT, rpio.HIGH)
rpio.open(rgbTwoPins.blue, rpio.OUTPUT, rpio.HIGH)

rtpmidi.logger.transports[0].level = 'error';

const session = rtpmidi.manager.createSession({
    name: 'HOONkbox Vision',
    port: 5004,
});

log('Connecting to ' + remote);
session.connect({ address: remote, port: 5004 });
videoPlay(99, true);

session.on('message', (deltaTime: number, message: Buffer) => {
    const commands: number[] = Array.prototype.slice.call(message, 0);
    if (commands[0] === 144) {
        handleNote(commands[1], commands[2])
        return;
    }

    if (commands[0] === 176) {
        handleControlChange(commands[1], commands[2])
        return;
    }
});

if (selftest) {
    runSelfTest();
}

function allOff() {
    smokeOff();
    videoStop();
    rgbOff();
}

function smokeOn() {
    rpio.write(smokePin, rpio.LOW);
}

function smokeOff() {
    log('Smoke off');
    rpio.write(smokePin, rpio.HIGH);
}

function smoke(duration: number) {
    log('Smoke on for ' + duration + ' seconds');
    smokeOn();
    setTimeout(smokeOff, duration * 1000);
}

function videoPlay(file: number, loop: boolean) {
    const path = videoPath + '/video' + file + '.h264';
    const loopArg = '--loop' + (loop ? '' : '=1');
    videoStop();
    log('Play video' + path + '.h264 ' + (loop ? 'looped' : 'once'));
    const playback = spawn(playerPath, [loopArg, path]);
    playback.on('error', function (err) {
        log(err.message);
    });
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

function handleNote(note: number, velocity: number) {
    if (note === 1) {
        allOff();
        return;
    }

    if (note === 2) {
        smoke(velocity / 10);
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
}

function handleControlChange(control: number, value: number) {
    const status = (value >= 64);
    if (control === 1) {
        log('Red One ' + ( status ? 'On' : 'Off'));
        rpio.write(rgbOnePins.red, (status ? rpio.LOW : rpio.HIGH));
    }

    if (control === 2) {
        log('Green One ' + ( status ? 'On' : 'Off'));
        rpio.write(rgbOnePins.green, (status ? rpio.LOW : rpio.HIGH));
    }

    if (control === 3) {
        log('Blue One ' + ( status ? 'On' : 'Off'));
        rpio.write(rgbOnePins.blue, (status ? rpio.LOW : rpio.HIGH));
    }

    if (control === 4) {
        log('Red Two ' + ( status ? 'On' : 'Off'));
        rpio.write(rgbTwoPins.red, (status ? rpio.LOW : rpio.HIGH));
    }

    if (control === 5) {
        log('Green Two ' + ( status ? 'On' : 'Off'));
        rpio.write(rgbTwoPins.green, (status ? rpio.LOW : rpio.HIGH));
    }

    if (control === 6) {
        log('Blue Two ' + ( status ? 'On' : 'Off'));
        rpio.write(rgbTwoPins.blue, (status ? rpio.LOW : rpio.HIGH));
    }
}

function rgbOff() {
    log('All RGB Off');
    rpio.write(rgbOnePins.red, rpio.HIGH);
    rpio.write(rgbOnePins.green, rpio.HIGH);
    rpio.write(rgbOnePins.blue, rpio.HIGH);
    rpio.write(rgbTwoPins.red, rpio.HIGH);
    rpio.write(rgbTwoPins.green, rpio.HIGH);
    rpio.write(rgbTwoPins.blue, rpio.HIGH);

}

async function runSelfTest() {
    log('Running RGB Selftest');

    log('Cycle RGB One');
    handleControlChange(1, 127);
    execSync('sleep 3');
    handleControlChange(1, 0);
    handleControlChange(2, 127);
    execSync('sleep 3');
    handleControlChange(2, 0);
    handleControlChange(3, 127);
    execSync('sleep 3');
    handleControlChange(3, 0);
    log('Cycle RGB Two');
    handleControlChange(4, 127);
    execSync('sleep 3');
    handleControlChange(4, 0);
    handleControlChange(5, 127);
    execSync('sleep 3');
    handleControlChange(5, 0);
    handleControlChange(6, 127);
    execSync('sleep 3');
    handleControlChange(6, 0);
    log('Test All RGB On');
    handleControlChange(1, 127);
    handleControlChange(2, 127);
    handleControlChange(3, 127);
    handleControlChange(4, 127);
    handleControlChange(5, 127);
    handleControlChange(6, 127);
    execSync('sleep 3');
    log('Test All Off');
    handleNote(1, 0);
    log('Self Test Complete');
    process.exit()

}
