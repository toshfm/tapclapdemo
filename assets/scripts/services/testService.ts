import { IService } from "../interfaces/services/iService";
import { ITestService } from "../interfaces/services/iTestService";

export class TestService implements ITestService, IService {
    init() {}
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