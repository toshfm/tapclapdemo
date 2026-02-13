import { IUiUtils } from "../../interfaces/services/iUiUtils";
import { DIInitializer, getUI } from "../../ioc/init";


const { ccclass, property } = cc._decorator;

let _: LogoScene

@ccclass   
export default class LogoScene extends cc.Component {
    ui: IUiUtils;

    onLoad() {
        DIInitializer.initialize();
        _ = this;
        _.ui = getUI()
    }

    start() {
        _.scheduleOnce(function () {
            _.ui.nextScene("Main")
        }, 2);
    }
}
