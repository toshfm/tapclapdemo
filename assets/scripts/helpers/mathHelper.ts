export class MathHelper {
    static secondsToTime(sec_num: number): string {
        sec_num = Math.floor(sec_num);
        let hours = 0;
        let minutes: number | string = Math.floor((sec_num - (hours * 3600)) / 60);
        let seconds: number | string = sec_num - (hours * 3600) - (minutes * 60);

        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return minutes + ':' + seconds;
    }

    static getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static getRandomFloat(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }

    static newUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    static shuffleArrayInPlace<T>(array: T[]): T[] {
        let currentIndex = array.length;
        let randomIndex: number;
        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    static clamp(val: number, min: number, max: number): number {
        return Math.max(min, Math.min(val, max));
    }

    static getRandomEnum<T>(enumeration: T): T[keyof T] {
        const values = Object.keys(enumeration)
            .map(k => Number(k))
            .filter(v => !isNaN(v));
        
        return values[Math.floor(Math.random() * values.length)] as any;
    }
}