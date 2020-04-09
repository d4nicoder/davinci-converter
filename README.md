# Davinci converter

This simple node app converts all files inside a folder and subfolder in a format to import into Davinci Resolve.
In case of video files it encodes to prores codec, and for audio files the destination codec is wav.

_(For docker instructions go to the end of this guide)_

## Quick reference

- __Repository:__ [Gitlab](https://gitlab.com/danitetus/davinci-converter.git)
- __Maintained by:__ [Daniel Cañada García](https://gitlab.com/danitetus)

## Dependencies

- FFmpeg
- FFprobe

## How to install

```bash
npm install -g davinci-converter
```

## How to use

```bash
davinci-converter [options] -i <source_folder> -o <destination_folder>

Options:
   --no-progress          Hide the progress bar for each conversion
   --debug                Show ffmpeg debug information (disables the progress bar)
   --overwrite            Overwrite destination files
   -q, --quality          Set the output quality. Values: low,mid,high,extreme
   -i, --input            Input folder to search for files
   -o, --output           Output folder to put the encoded files
```

## Docker

When executes as docker container, source files must be mapped to __/source__ and destination folder to __/destination__

```bash
docker run --rm \
  -v <source_folder>:/source:ro \
  -v <destination_folder>:/destination \
  -e OVERWRITE=1 \
  -e QUALITY=mid \
  danitetus/davinci-converter:latest
```

## Environment variables

_(Option parameters overwrite environment variables)_

### **`DEBUG`**

This is mandatory. When setted to 1 the ffmpeg output raw data is showed on stdout and the progress bar is hidden.

### **`PROGRESS`**

This is mandatory. When setted to 0, the progress bar is not showed. By default progress bar is printed.

### **`OVERWRITE`**

This is mandatory. If set to 1 and file exists on destination overwrites it.

### **`QUALITY`**

This is mandatory. Defines the output quality (low, mid, high, extreme). Default is low

### **`SOURCE`**

This is required. Defines source folder. In docker is mandatory and default is /source

### **`DESTINATION`**

This is required. Defines destination folder. In docker is mandatory and default is /destination


## License

View __LICENSE__ file for the software contained in this image.

As with all Docker images, these likely also contain other software which may be under other licenses (such as Bash, ffmpeg, node, etc from the base distribution, along with any direct or indirect dependencies of the primary software being contained).

As for any pre-built image usage, it is the image user's responsibility to ensure that any use of this image complies with any relevant licenses for all software contained within.
