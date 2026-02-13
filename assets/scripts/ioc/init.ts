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
import { IBlockFactory } from "../interfaces/services/iBlockFactory";
import { BlockFactory } from "../services/blockFactory";

export class DIInitializer {
    /**Register Services*/
    static initialize(): void {
        if (!DI.initialized) {
            DI.addSingleton<ILogicService, LogicService>(SERVICE.LogicService, () => new LogicService(
                getSettings(), getState(), getBlockFactory()
            ));
            DI.addSingleton<IGameSettings, GameSettings>(SERVICE.GameSettings, () => new GameSettings());
            DI.addSingleton<IGameState, GameState>(SERVICE.GameState, () => new GameState());
            DI.addSingleton<IUiUtils, UiUtils>(SERVICE.UI, () => new UiUtils());
            DI.addSingleton<IBlockFactory, BlockFactory>(SERVICE.BlockFactory, () => new BlockFactory(
                getSettings()
            ))
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

export function getBlockFactory(): IBlockFactory {
    return DI.resolve<IBlockFactory>(SERVICE.BlockFactory);
}