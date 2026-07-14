// Tiny className joiner (parity with @togglecorp/fujs _cs).
export default function cs(...parts: (string | false | null | undefined)[]): string {
    return parts.filter(Boolean).join(' ');
}
