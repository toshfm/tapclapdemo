import { SERVICES } from "../enums/services";
import { ILogicService } from "../interfaces/services/iLogicService";
import { LogicService } from "../services/logicService";
import { container } from "./container";

export class ServicesInitializer {
    /**Register Services*/
    static initialize(): void {
        if (!container.initialized) {
            //register
            // container.register<ITestService, TestService>(SERVICES.Service, new TestService());
            //init
            container.register<ILogicService, LogicService>(SERVICES.LogicService, new LogicService());
            container.getServices().forEach(service => {
                service.init();
            });
        }
        container.initialized = true;
    }
}

// export function getService(): ITestService {
//     return container.resolve<ITestService>(SERVICES.Service);
// }

export function getLogic(): ILogicService {
    return container.resolve<ILogicService>(SERVICES.LogicService);
}
