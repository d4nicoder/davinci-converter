"use strict";
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
const path_1 = __importDefault(require("path"));
const audioCodec = 'pcm_s16le';
// const videoCodec = 'prores_ks'
const videoCodec = 'prores_ks';
const com = '-vcodec dnxhd -acodec pcm_s16le -r 30000/1001 -b:v 36M -pix_fmt yuv422p -f mov';
class Converter {
    constructor() {
        this.showProgress = false;
    }
    construct() {
    }
    progress() {
        this.showProgress = true;
    }
    convert(source, destination) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                yield fs_extra_1.default.ensureDir(path_1.default.dirname(destination));
                const command = ['-i', source].concat(com.split(' '));
                command.push(destination);
                console.log(destination);
                const cmd = child_process_1.spawn('ffmpeg', command);
                if (this.showProgress) {
                    cmd.stderr.on('data', (data) => {
                        console.log(data.toString());
                    });
                }
                cmd.stdout.on('data', (message) => {
                    console.log(message);
                });
                cmd.on('error', (err) => {
                    console.error(err);
                });
                cmd.on('exit', (code) => {
                    console.log(`Salida con código ${code}`);
                    if (code !== 0) {
                        reject(code);
                    }
                    else {
                        resolve();
                    }
                });
            }));
        });
    }
}
exports.default = Converter;
//# sourceMappingURL=converter.js.map