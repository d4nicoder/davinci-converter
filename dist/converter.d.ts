export default class Converter {
    private showProgress;
    private showDebug;
    private quality;
    private totalFrames;
    private _getDuration;
    constructor(quality: string);
    progress(): void;
    debug(): void;
    convert(sourceType: string, source: string, destination: string, fileNumber: number, total: number): Promise<unknown>;
}
//# sourceMappingURL=converter.d.ts.map