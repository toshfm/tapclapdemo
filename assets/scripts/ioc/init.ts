import { SERVICES } from "../enums/services";
import { ILogicService } from "../interfaces/services/iLogicService";
import { LogicService } from "../services/logicService";
import { DI } from "./container";

export class ServicesInitializer {
    /**Register Services*/
    static initialize(): void {
        if (!DI.initialized) {
            DI.addSingleton<ILogicService, LogicService>(SERVICES.LogicService, () => new LogicService());
        }
        DI.initialized = true;
    }
}

export function getLogic(): ILogicService {
    return DI.resolve<ILogicService>(SERVICES.LogicService);
}
