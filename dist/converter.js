"use strict";
/*
 *  MIT License
 *
 *  Copyright (c) 2020 Daniel Cañada García
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const fs_extra_1 = __importDefault(require("fs-extra"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const progress_1 = __importDefault(require("progress"));
const qualityOptions = {
    low: '-vcodec prores_ks -profile:v 0 -qscale:v 11 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -f mov -y -progress pipe:1',
    mid: '-vcodec prores_ks -profile:v 0 -qscale:v 9 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -f mov -y -progress pipe:1',
    high: '-vcodec prores_ks -profile:v 0 -qscale:v 5 -vendor ap10 -pix_fmt yuv422p10le -acodec pcm_s16le -f mov -y -progress pipe:1',
    extreme: '-vcodec prores_ks -profile:v 0 -pix_fmt yuv422p -acodec pcm_s16le -f mov -y -progress pipe:1'
};
const comAudio = '-acodec pcm_s16le -f wav -n -progress pipe:1';
class Converter {
    constructor(quality) {
        this.showProgress = false;
        this.showDebug = false;
        this.quality = '';
        this.totalFrames = 0;
        this.quality = quality;
    }
    _getDuration(source) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const com = child_process_1.spawn('ffprobe', ['-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', source]);
                let rawJson = '';
                com.stdout.on('data', (data) => {
                    rawJson += data.toString();
                });
                com.on('exit', (code) => {
                    if (code !== 0) {
                        reject(new Error('File format not recognized'));
                    }
                    else {
                        let json;
                        try {
                            json = JSON.parse(rawJson);
                        }
                        catch (e) {
                            reject(e);
                            return;
                        }
                        let audioFrames = 0;
                        for (const stream of json.streams) {
                            if (stream.codec_type === 'video') {
                                this.totalFrames = parseInt(stream.nb_frames, 10);
                            }
                            else if (stream.codec_type === 'audio') {
                                audioFrames = parseInt(stream.nb_frames, 10);
                            }
                        }
                        if (this.totalFrames === 0) {
                            this.totalFrames = audioFrames;
                        }
                        resolve();
                    }
                });
            });
        });
    }
    progress() {
        this.showProgress = true;
    }
    debug() {
        this.showDebug = true;
    }
    convert(sourceType, source, destination, fileNumber, total) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this._getDuration(source);
                }
                catch (e) {
                    reject(e);
                    return;
                }
                try {
                    const exists = fs_extra_1.default.existsSync(destination);
                    if (exists && process.env.OVERWRITE !== '1') {
                        console.log(`${fileNumber}/${total} File ${destination} already exists`);
                        resolve();
                        return;
                    }
                }
                catch (e) {
                    console.error(e);
                }
                yield fs_1.default.promises.mkdir(path_1.default.dirname(destination), { mode: '777', recursive: true });
                let command = [];
                const qualityCommand = qualityOptions[this.quality];
                if (sourceType === 'video') {
                    command = ['-i', source].concat(qualityCommand.split(' '));
                }
                else if (sourceType === 'audio') {
                    command = ['-i', source].concat(comAudio.split(' '));
                }
                else {
                    reject(new Error('Invalid source format'));
                    return;
                }
                command.push(destination);
                const cmd = child_process_1.spawn('ffmpeg', command);
                if (this.showDebug) {
                    cmd.stderr.on('data', (data) => {
                        console.log(data.toString());
                    });
                }
                if (this.showProgress && !this.showDebug) {
                    let truncatedName;
                    if (source.length >= 30) {
                        truncatedName = source.substr(0, 27) + '...';
                    }
                    else {
                        truncatedName = source + new Array(31 - source.length).join(' ');
                    }
                    const bar = new progress_1.default(`${fileNumber}/${total} - ${truncatedName} [:bar] :percent :etas`, {
                        complete: '=',
                        incomplete: ' ',
                        // width: 100,
                        total: this.totalFrames
                    });
                    let previousFrame = 0;
                    cmd.stdout.on('data', (data) => {
                        const tLines = data.toString().split('\n');
                        const progress = {};
                        for (let i = 0; i < tLines.length; i++) {
                            const key = tLines[i].split('=');
                            if (typeof key[0] !== 'undefined' && typeof key[1] !== 'undefined') {
                                progress[key[0]] = key[1];
                                if (key[0] === 'frame' && this.totalFrames > 0) {
                                    const frame = parseInt(key[1], 10);
                                    const increment = frame - previousFrame;
                                    bar.tick(increment);
                                    previousFrame = frame + 0;
                                }
                            }
                        }
                    });
                }
                cmd.on('error', (err) => {
                    console.error(err);
                });
                cmd.on('exit', (code) => {
                    if (code !== 0) {
                        reject(code);
                    }
                    else {
                        try {
                            fs_extra_1.default.chmodSync(destination, '777');
                        }
                        catch (e) {
                            console.error(e);
                        }
                        resolve();
                    }
                });
            }));
        });
    }
}
exports.default = Converter;
//# sourceMappingURL=converter.js.map