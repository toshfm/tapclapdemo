const {ccclass, property} = cc._decorator;

@ccclass
export default class BigBoom extends cc.Component {
    endAnimation() {
       this.node.destroy();
    }
}
