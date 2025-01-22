# HOONkbox Vision control software

Custom visual control software built for [West Echo Three](https://westechothree.co.uk/)

Target is Node 14

## Midi Notes

- 1: All off (stops smoke and all videos)
- 2: Smoke (velocity = duration in deciseconds)
- 10: Video - play once (velocity X file suffix IE videoX.h264)
- 11: Video - play looped (velocity X file suffix IE videoX.h264)
- 12: Video - stop

## Midi CCs

For all CCs over 64 turns on, under turns off

- 1: Blue one
- 2: Green one
- 3: Red one
- 4: Blue two
- 5: Green two
- 6: Red two

## To encode video to correct format

ffmpeg -i input_file.avi -vcodec copy -an -bsf:v h264_mp4toannexb output_file.h264

## Build

npm run build

## Deploy

Copy built index.js package.json to deploy folder then run npm install --no-optional --production

## Environment Variables

- VERBOSE: Run in verbose output mode. Default `false`
- SELFTEST: Run a self test of the RGB then exit Default `false`
- REMOTE_IP: Remote IP for rtpMIDI. Default `192.168.10.10`
