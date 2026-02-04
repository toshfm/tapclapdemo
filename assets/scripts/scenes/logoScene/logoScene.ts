import { Rum } from "../../Rum";
const { ccclass, property } = cc._decorator;

let _: LogoScene

@ccclass
export default class LogoScene extends cc.Component {
    onLoad() {
        _ = this;
    }

    start() {
        _.scheduleOnce(function () {
            Rum.nextScene("Main")
        }, 2);
    }
}
