import { IUiUtils } from "../../interfaces/services/IUiUtils";
import { DIInitializer, getUI } from "../../ioc/Init";


const { ccclass, property } = cc._decorator;

@ccclass   
export default class LogoScene extends cc.Component {
    ui: IUiUtils;

    onLoad() {
        DIInitializer.initialize();
        this.ui = getUI()
    }

    start() {
        this.scheduleOnce(() => {
            this.ui.nextScene("Main")
        }, 2);
    }
}
