import { ZIndex } from "../enums/ZIndex";
import { IUiUtils } from "../interfaces/services/IUiUtils";
import PersistData from "../PersistData";

export class UiUtils implements IUiUtils {
    private _uilocked: boolean[] = [];
    private _sceneTransistor: cc.Prefab;
    private _simpleSprite: cc.Prefab;
    private _persistNode: cc.Node;
    private _defaultEffectTime: number = 0.2;

    constructor() {
        this._persistNode = cc.find('PersistNode');
        cc.game.addPersistRootNode(this._persistNode);
        let persistData = (this._persistNode.getComponent('PersistData') as PersistData);
        this._sceneTransistor = persistData.sceneTransistor;
        this._simpleSprite = persistData.simpleSprite;
    }

    uiIsLocked(): boolean {
        return this._uilocked.length > 0;
    }

    addLock() {
        this._uilocked.push(true);
    }

    removeLock() {
        this._uilocked.pop();
    }

    nextScene(sceneName: string): void {
        if (!this.uiIsLocked()) {
            cc.log('start transition')
            this.addLock();
            let tempTransistor = cc.instantiate(this._sceneTransistor)!;
            tempTransistor.opacity = 0;
            tempTransistor.zIndex = ZIndex.transistor
            this._persistNode.addChild(tempTransistor)

            cc.tween(tempTransistor)
                .to(this._defaultEffectTime, { opacity: 255 })
                .call(() => {
                    cc.director.loadScene(sceneName, () => this.onSceneLaunched())
                })
                .start()
        }
    }

    private onSceneLaunched() {
        cc.log('scene launched');
        let transistor = cc.find('PersistNode/Transistor')!;
        cc.tween(transistor)
            .to(this._defaultEffectTime, { opacity: 0 })
            .call(() => {
                this.removeLock();
                this._persistNode.removeChild(transistor)
            })
            .start()
    }

    createNode<T extends cc.Prefab | cc.SpriteFrame>(item: T, pos?: { x: number, y: number }, parent?: cc.Node, zIndex?: number, spriteFrameForPrefab?: cc.SpriteFrame): cc.Node {
        let result: cc.Node;
        if (item instanceof cc.Prefab) {
            result = cc.instantiate(item);
            if (spriteFrameForPrefab) {
                result.getComponent(cc.Sprite).spriteFrame = spriteFrameForPrefab;
            }
        } else if (item instanceof cc.SpriteFrame) {
            result = cc.instantiate(this._simpleSprite);
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
        result.zIndex = zIndex ?? ZIndex.default;
        return result;
    }

    async toPosition(node: cc.Node, nodePosition: cc.Node, time: number = this._defaultEffectTime): Promise<void> {
        return new Promise<void>((resolve) => {
            cc.tween(node)
                .to(time, { position: cc.v3(nodePosition?.getPosition()) }, { easing: 'fade' })
                .call(() => resolve())
                .start();
        })
    }

    async toPositionXY(node: cc.Node, x: number, y: number, time: number = this._defaultEffectTime): Promise<void> {
        return new Promise<void>((resolve) => {
            cc.tween(node)
                .to(time, { position: cc.v3(x, y, 0) }, { easing: 'backOut' })
                .call(() => resolve())
                .start();
        })
    }

    setText(node: cc.Node, text: string | number) {
        node.getComponent(cc.Label).string = text.toString();
    }

    async blink(node: cc.Node) {
        node.color = cc.Color.YELLOW;
        await this.sleep(200);
        node.color = cc.Color.WHITE;
    }

    getWorldCoord(node: cc.Node, canvas: cc.Node): cc.Vec3 | cc.Vec2 {
        //count canvas offset
        let result = node.parent.convertToWorldSpaceAR(node.getPosition());
        return result.subtract(canvas.parent.convertToWorldSpaceAR(canvas.getPosition()));
    }

    async pulse(node: cc.Node) {
        await this.tweenScale(node, 1.1, 0.1);
        await this.tweenScale(node, 1, 0.1);
    }

    tweenScale(node: cc.Node, num: number, duration: number = this._defaultEffectTime): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            cc.tween(node)
                .to(duration, { scale: num }, { easing: 'fade' })
                .call(() => resolve())
                .start();
        })
    }

    sleep(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    hoverButton(node: cc.Node) {
        node.on(cc.Node.EventType.MOUSE_ENTER, async () => {
            if (!this.uiIsLocked()) {
                cc.tween(node)
                    .to(0.15, { scale: 1.1 }, { easing: 'backOut' })
                    .start();
            }
        });

        node.on(cc.Node.EventType.MOUSE_LEAVE, async () => {
            if (!this.uiIsLocked()) {
                cc.tween(node)
                    .to(0.15, { scale: 1 }, { easing: 'backOut' })
                    .start();
            }
        });
    }

    /**Shadow screen */
    shadow(node: cc.Node, isOn: boolean) {
        this.addLock()
        if (isOn) {
            node.addComponent(cc.BlockInputEvents);
            cc.tween(node)
                .to(this._defaultEffectTime, { opacity: 200 }, { easing: 'fade' })
                .call(() => this.removeLock())
                .start();

        } else {
            cc.tween(node)
                .to(this._defaultEffectTime, { opacity: 0 }, { easing: 'fade' })
                .call(() => {
                    this.removeLock()
                    if (node.getComponent(cc.BlockInputEvents)) {
                        node.removeComponent(cc.BlockInputEvents)
                    }
                })
                .start();
        }
    }

    playClip(prefab: cc.Prefab, pos?: { x: number, y: number }, parent?: cc.Node, zIndex?: number): cc.Node {
        let clip = this.createNode(prefab, pos, parent, zIndex);
        clip.getComponent(cc.Animation).play();
        return clip;
    }

}