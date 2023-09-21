# HOONkbox Vision control software

Custom visual control software built for [West Echo Three](https://westechothree.co.uk/)

## Midi Notes

- 1: All off (stops smoke and all videos)
- 2: Smoke (velocity = duration in deciseconds)
- 10: Video - play once (velocity X file suffix IE videoX.h264)
- 11: Video - play looped (velocity X file suffix IE videoX.h264)
- 12: Video - stop

## To encode video to correct format

ffmpeg -i input_file.avi -vcodec copy -an -bsf:v h264_mp4toannexb output_file.h264

Copy built index.js package.json to deploy folder then run npm install --no-optional --production
