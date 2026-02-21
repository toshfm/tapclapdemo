import { Service } from "../enums/Service";
import { IGameSettings } from "../interfaces/services/IGameSettings";
import { IGameState } from "../interfaces/services/IGameState";
import { ILogicService } from "../interfaces/services/ILogicService";
import { GameState } from "../services/GameState";
import { GameSettings } from "../services/GameSettings";
import { LogicService } from "../services/LogicService";
import { DI } from "./Container";
import { UiUtils } from "../services/UiUtilsService";
import { IUiUtils } from "../interfaces/services/IUiUtils";
import { IBlockGenerator } from "../interfaces/services/IBlockGenerator";
import { BlockFactory } from "../services/BlockGenerator";
import { IBlockInteractor } from "../interfaces/services/IBlockInteractor";
import { BlockInteractor } from "../services/BlockInteractor";
import { IEventEmitter } from "../interfaces/services/IEventEmitter";
import { EventEmitter } from "../services/EventEmitter";
import { IGridPointsService } from "../interfaces/services/IGridPointsService";
import { GridPointsService } from "../services/GridPointsService";

export class DIInitializer {
    /**Register Services*/
    static initialize(): void {
        if (!DI.initialized) {
            DI.addSingleton<ILogicService, LogicService>(Service.LogicService, () => new LogicService(
                getSettings(), getState(), getBlockGenerator(), getBlockInteractor(), getEvents(), getGridPoints()
            ));
            DI.addSingleton<IGameSettings, GameSettings>(Service.GameSettings, () => new GameSettings());
            DI.addSingleton<IGameState, GameState>(Service.GameState, () => new GameState(
                getSettings(), getEvents()
            ));
            DI.addSingleton<IUiUtils, UiUtils>(Service.UI, () => new UiUtils());
            DI.addSingleton<IBlockGenerator, BlockFactory>(Service.BlockGenerator, () => new BlockFactory(
                getSettings()
            ));
            DI.addSingleton<IBlockInteractor, BlockInteractor>(Service.BlockInteractor, () => new BlockInteractor());
            DI.addSingleton<IEventEmitter, EventEmitter>(Service.Events, () => new EventEmitter())
            DI.addSingleton<IGridPointsService, GridPointsService>(Service.GridView, () => new GridPointsService(
                getSettings()
            ))
        }
        DI.initialized = true;
    }
}

export function getLogic(): ILogicService {
    return DI.resolve<ILogicService>(Service.LogicService);
}

export function getUI(): IUiUtils {
    return DI.resolve<IUiUtils>(Service.UI);
}

export function getSettings(): IGameSettings {
        return DI.resolve<IGameSettings>(Service.GameSettings);
}

export function getState(): IGameState {
    return DI.resolve<IGameState>(Service.GameState);
}

export function getBlockGenerator(): IBlockGenerator {
    return DI.resolve<IBlockGenerator>(Service.BlockGenerator);
}

export function getBlockInteractor(): IBlockInteractor {
    return DI.resolve<IBlockInteractor>(Service.BlockInteractor);
}

export function getEvents(): IEventEmitter {
    return DI.resolve<IEventEmitter>(Service.Events);
}

export function getGridPoints(): IGridPointsService {
    return DI.resolve<IGridPointsService>(Service.GridView);
}