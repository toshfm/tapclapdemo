import { SERVICE } from "../enums/service";
import { IGameSettings } from "../interfaces/services/iGameSettings";
import { IGameState } from "../interfaces/services/iGameState";
import { ILogicService } from "../interfaces/services/iLogicService";
import { GameState } from "../services/gameState";
import { GameSettings } from "../services/gameSettings";
import { LogicService } from "../services/logicService";
import { DI } from "./container";
import { UiUtils } from "../services/uiUtilsService";
import { IUiUtils } from "../interfaces/services/iUiUtils";
import { IBlockGenerator } from "../interfaces/services/iBlockGenerator";
import { BlockFactory } from "../services/blockGenerator";
import { IBlockInteractor } from "../interfaces/services/iBlockInteractor";
import { BlockInteractor } from "../services/blockInteractor";

export class DIInitializer {
    /**Register Services*/
    static initialize(): void {
        if (!DI.initialized) {
            DI.addSingleton<ILogicService, LogicService>(SERVICE.LogicService, () => new LogicService(
                getSettings(), getState(), getBlockGenerator(), getBlockInteractor()
            ));
            DI.addSingleton<IGameSettings, GameSettings>(SERVICE.GameSettings, () => new GameSettings());
            DI.addSingleton<IGameState, GameState>(SERVICE.GameState, () => new GameState());
            DI.addSingleton<IUiUtils, UiUtils>(SERVICE.UI, () => new UiUtils());
            DI.addSingleton<IBlockGenerator, BlockFactory>(SERVICE.BlockGenerator, () => new BlockFactory(
                getSettings()
            ));
            DI.addSingleton<IBlockInteractor, BlockInteractor>(SERVICE.BlockInteractor, () => new BlockInteractor());
        }
        DI.initialized = true;
    }
}

export function getLogic(): ILogicService {
    return DI.resolve<ILogicService>(SERVICE.LogicService);
}

export function getUI(): IUiUtils {
    return DI.resolve<IUiUtils>(SERVICE.UI);
}

export function getSettings(): IGameSettings {
        return DI.resolve<IGameSettings>(SERVICE.GameSettings);
}

export function getState(): IGameState {
    return DI.resolve<IGameState>(SERVICE.GameState);
}

export function getBlockGenerator(): IBlockGenerator {
    return DI.resolve<IBlockGenerator>(SERVICE.BlockGenerator);
}

export function getBlockInteractor(): IBlockInteractor {
    return DI.resolve<IBlockInteractor>(SERVICE.BlockInteractor);
}