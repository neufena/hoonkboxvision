const rtpmidi = require('rtpmidi');

const remote: string = '127.0.0.1';

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
  console.log(note);
});
