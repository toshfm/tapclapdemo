import { getLogic, ServicesInitializer } from "../assets/scripts/ioc/init";
import { GameState } from "../assets/scripts/scenes/mainScene/gameState";

describe("Test suite", () => {
    test("func test", () => {
        ServicesInitializer.initialize();
        let s = getLogic();
        s.prepareGrid();
        expect(GameState.gridBlocks.length).toBeGreaterThan(0);
    });
});

describe("Test suite", () => {
    test("scene test", () => {
        let scene = new cc.Scene();
        cc.director.runSceneImmediate(scene);

        let node = new cc.Node();
        scene.addChild(node);

        node.active = true;

        expect(scene.childrenCount).toBeGreaterThan(0);
    });
});