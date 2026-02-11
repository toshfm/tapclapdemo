import { ITestService } from "../interfaces/services/iTestService";

export class TestService implements ITestService {
    someWork(): void {
        console.log("some work");
    }
    trueResult(): boolean {
        return true;
    }
    getVec(vec: cc.Vec2): number {
        return vec.x;
    }

}