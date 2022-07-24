// Type definitions for opencc-js 1.0
// Project: https://github.com/nk2028/opencc-js
// Definitions by: Pig Fang <https://github.com/g-plane>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare type Locale = 'cn' | 'tw' | 'twp' | 'hk' | 'jp' | 't';

declare interface ConverterOptions {
    from?: Locale;
    to?: Locale;
}

declare type ConvertText = (text: string) => string;

declare function Converter(options: ConverterOptions): ConvertText;

declare function CustomConverter(dictionary: ReadonlyArray<[string, string]>): ConvertText;
