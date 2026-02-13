const {ccclass, property} = cc._decorator;

@ccclass
export default class PersistData extends cc.Component {
   
    @property(cc.Prefab)
    simpleSprite: cc.Prefab = null;

    @property(cc.Prefab)
    sceneTransistor: cc.Prefab = null;

    onLoad(): void {
        cc.game.addPersistRootNode(this.node);
    }
}
