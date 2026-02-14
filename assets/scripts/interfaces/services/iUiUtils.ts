export interface IUiUtils {
    uiIsLocked(): boolean;
    addLock(): void;
    removeLock(): void;
    nextScene(sceneName: string): void;
    createNode<T extends cc.Prefab | cc.SpriteFrame>(item: T, pos?: { x: number, y: number }, parent?: cc.Node, zIndex?: number, spriteFrameForPrefab?: cc.SpriteFrame): cc.Node;
    toPosition(node: cc.Node, nodePosition: cc.Node, time: number): Promise<void>;
    toPositionXY(node: cc.Node, x: number, y: number, time: number): Promise<void>;
    setText(node: cc.Node, text: string | number): void;
    blink(node: cc.Node): void;
    getWorldCoord(node: cc.Node, canvas: cc.Node): cc.Vec3 | cc.Vec2;
    pulse(node: cc.Node): void;
    tweenScale(node: cc.Node, num: number, duration: number): Promise<void>;
    sleep(milliseconds: number): Promise<void>;
    hoverButton(node: cc.Node): void;
    shadow(node: cc.Node, isOn: boolean): void
    playClip(prefab: cc.Prefab, pos?: { x: number, y: number }, parent?: cc.Node, zIndex?: number): cc.Node
}