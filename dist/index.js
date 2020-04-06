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
const converter_1 = __importDefault(require("./converter"));
const find_1 = __importDefault(require("./find"));
const path_1 = __importDefault(require("path"));
const init = (source, destination) => __awaiter(void 0, void 0, void 0, function* () {
    // Search for all files inside source folder
    const files = yield find_1.default(source);
    destination = path_1.default.resolve(destination);
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const dest = path_1.default.join(destination, `${file}.mov`);
        console.log(`Converting ${file}`);
        const conv = new converter_1.default();
        conv.progress();
        yield conv.convert(file, dest);
    }
});
if (process.argv.length < 4) {
    console.error('Missing arguments');
    process.exit(1);
}
const source = process.argv[2];
const destination = process.argv[3];
init(source, destination)
    .then(() => {
    console.log('Finish');
    process.exit(0);
})
    .catch((e) => {
    console.error(e);
    process.exit(2);
});
//# sourceMappingURL=index.js.map