import { Property } from "./decorator";

export function convertStringToTaregt(source: string, options: Property): any | never {
    switch(options.type) {
    case "array":
    case "object":
        return JSON.parse(source);
    case "string":
        return source;
    case "number":
        return Number(source);
    default:
        throw new Error("传入的类型字符串格式错误")
    }
}

export function convertTargetToString(source: any, options: Property): string {
    switch(options.type) {
    case "array":
    case "object":
        return JSON.stringify(source);
    case "number":
        return String(source);
    case "string":
        return source;
    default:
        return "";
    }
}