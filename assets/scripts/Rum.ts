import { ZINDEXES } from "./enums/zIndexes";

const { ccclass, property } = cc._decorator;

let _: Rum;

@ccclass
export class Rum extends cc.Component {

    @property(cc.Prefab)
    simpleSprite: cc.Prefab = null;

    @property(cc.Prefab)
    sceneTransistor: cc.Prefab = null;

    _defaultEffectTime = 0.2;

    blocked: boolean[]  = [];

    onLoad(): void {
        cc.game.addPersistRootNode(this.node);
        _ = this;
    }

    static isBlocked(): boolean {
        return _.blocked.length > 0;
    }

    static addBlock() {
        _.blocked.push(true);
    }

    static removeBlock() {
        _.blocked.pop();
    }

    static nextScene(sceneName: string): void {
        if (!Rum.isBlocked()) {
            cc.log('start transition')
            Rum.addBlock();
            let tempTransistor = cc.instantiate(_.sceneTransistor)!;
            tempTransistor.opacity = 0;
            tempTransistor.zIndex = ZINDEXES.transistor
            _.node.addChild(tempTransistor)

            cc.tween(tempTransistor)
                .to(_._defaultEffectTime, { opacity: 255 })
                .call(() => {
                    cc.director.loadScene(sceneName, _.onSceneLaunched)
                })
                .start()
        }
    }

    onSceneLaunched() {
        cc.log('scene launched');
        let transistor = cc.find('Rum/Transistor')!;
        cc.tween(transistor)
            .to(_._defaultEffectTime, { opacity: 0 })
            .call(() => {
                Rum.removeBlock();
                _.node.removeChild(transistor)
            })
            .start()
    }

    static createNode<T extends cc.Prefab | cc.SpriteFrame>(item: T, pos?: { x: number, y: number }, parent?: cc.Node, zIndex?: number, spriteFrameForPrefab?: cc.SpriteFrame): cc.Node {
        let result: cc.Node;
        if (item instanceof cc.Prefab) {
            result = cc.instantiate(item);
            if (spriteFrameForPrefab) {
                result.getComponent(cc.Sprite).spriteFrame = spriteFrameForPrefab;
            }
        } else if (item instanceof cc.SpriteFrame) {
            result = cc.instantiate(_.simpleSprite);
            result.getComponent(cc.Sprite)!.spriteFrame = item;
        }
        if (parent) {
            parent.addChild(result);
        } else {
            let scene = cc.director.getScene()?.getChildByName('Canvas');
            scene?.addChild(result);
        }
        if (pos) {
            result.setPosition(pos.x, pos.y);
        }
        result.zIndex = zIndex ?? ZINDEXES.default;
        return result;
    }

    static async toPosition(node: cc.Node, nodePosition: cc.Node, time: number = _._defaultEffectTime): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            cc.tween(node)
                .to(time, { position: cc.v3(nodePosition?.getPosition()) }, { easing: 'fade' })
                .call(() => resolve())
                .start();
        })
    }

    static async toPositionXY(node: cc.Node, x: number, y: number, time: number = _._defaultEffectTime): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            cc.tween(node)
                .to(time, { position: cc.v3(x, y, 0) }, { easing: 'backOut' })
                .call(() => resolve())
                .start();
        })
    }

    static setText(node: cc.Node, text: string | number) {
        node.getComponent(cc.Label).string = text.toString();
    }

    static async blink(node: cc.Node) {
        node.color = cc.Color.YELLOW;
        await Rum.sleep(200);
        node.color = cc.Color.WHITE;
    }

    static getWorldCoord(node: cc.Node, canvas: cc.Node): cc.Vec3 | cc.Vec2 {
        //count canvas offset
        let result = node.parent.convertToWorldSpaceAR(node.getPosition());
        return result.subtract(canvas.parent.convertToWorldSpaceAR(canvas.getPosition()));
    }

    static async pulse(node: cc.Node) {
        await Rum.tweenScale(node, 1.1, 0.1);
        await Rum.tweenScale(node, 1, 0.1);
    }

    static tweenScale(node: cc.Node, num: number, duration: number = _._defaultEffectTime): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            cc.tween(node)
                .to(duration, { scale: num }, { easing: 'fade' })
                .call(() => resolve())
                .start();
        })
    }

    static sleep(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    static hoverButton(node: cc.Node) {
        node.on(cc.Node.EventType.MOUSE_ENTER, async () => {
            if (!Rum.isBlocked()) {
                cc.tween(node)
                    .to(0.15, { scale: 1.1 }, { easing: 'backOut' })
                    .start();
            }
        });

        node.on(cc.Node.EventType.MOUSE_LEAVE, async () => {
            if (!Rum.isBlocked()) {
                cc.tween(node)
                    .to(0.15, { scale: 1 }, { easing: 'backOut' })
                    .start();
            }
        });
    }

    /**Shadow screen */
    static shadow(node: cc.Node, isOn: boolean) {
        Rum.addBlock()
        if (isOn) {
            node.addComponent(cc.BlockInputEvents);
            cc.tween(node)
                .to(_._defaultEffectTime, { opacity: 200 }, { easing: 'fade' })
                .call(() => Rum.removeBlock())
                .start();

        } else {
            cc.tween(node)
                .to(_._defaultEffectTime, { opacity: 0 }, { easing: 'fade' })
                .call(() => {
                    Rum.removeBlock()
                    if (node.getComponent(cc.BlockInputEvents)) {
                        node.removeComponent(cc.BlockInputEvents)
                    }
                })
                .start();
        }
    }

    static playClip(prefab: cc.Prefab, pos?: {x: number, y: number}, parent?: cc.Node, zIndex?: number): cc.Node {
        let clip = Rum.createNode(prefab, pos, parent, zIndex); 
        clip.getComponent(cc.Animation).play();
        return clip;
    }

}
