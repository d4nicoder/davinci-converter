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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const find = (source) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        const stat = yield fs_1.default.promises.stat(source);
        let files = [];
        if (stat.isDirectory()) {
            const list = yield fs_1.default.promises.readdir(source);
            for (let i = 0; i < list.length; i++) {
                const scanedFiles = yield find(path_1.default.join(source, list[i]));
                files = files.concat(scanedFiles);
            }
        }
        else if (stat.isFile()) {
            // TODO: Check extensions
            if (/\.(mov|mp4|mpeg|avi|mkv)$/.test(source)) {
                files = files.concat([source]);
            }
        }
        resolve(files);
    }));
});
exports.default = find;
//# sourceMappingURL=find.js.map