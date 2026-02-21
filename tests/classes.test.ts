import { Queue } from "../assets/scripts/misc/Queue";

describe("Classes test", () => {
    test("queue count test", () => {
        let myQueue = new Queue<string>();
        expect(myQueue.count()).toBe(0);
        myQueue.enqueue("some");
        expect(myQueue.count()).toBe(1);
        myQueue.dequeue();
        expect(myQueue.count()).toBe(0);
    });

     test("queue order test", () => {
        let myQueue = new Queue<number>();
        myQueue.enqueue(1);
        myQueue.enqueue(2);
        let deq = myQueue.dequeue();
        expect(deq).toBe(1);
    }); 
});