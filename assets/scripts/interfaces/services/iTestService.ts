/** Test Service
 *  for DI
 */
export interface ITestService { 
    someWork() : void;
    trueResult(): boolean;
    getVec(vec: cc.Vec2): number;
}

