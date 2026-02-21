import { IGameSettings } from "../../interfaces/services/IGameSettings";
import { IUiUtils } from "../../interfaces/services/IUiUtils";
import { getSettings, getUI } from "../../ioc/Init";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingsScene extends cc.Component {
    ui: IUiUtils;
    settings: IGameSettings;

    play: cc.Node;
    rows: cc.Node;
    cols: cc.Node;
    points: cc.Node;
    moves: cc.Node;
    reshuffle: cc.Node;
    bomb: cc.Node;

    onLoad() {
        this.ui = getUI();
        this.settings = getSettings();
        this.play = cc.find('Canvas/play');
        this.rows = cc.find('Canvas/boxes/rows');
        this.cols = cc.find('Canvas/boxes/cols');
        this.points = cc.find('Canvas/boxes/points');
        this.moves = cc.find('Canvas/boxes/moves');
        this.reshuffle = cc.find('Canvas/boxes/reshuffle');
        this.bomb = cc.find('Canvas/boxes/bomb')
    }

    start() {
        this.initSettings();
        this.ui.hoverButton(this.play);
        this.play.on(cc.Node.EventType.TOUCH_START, () => {
            if (!this.ui.uiIsLocked()) {
                this.scheduleOnce(() => {
                    this.updateSettings();
                    this.ui.nextScene("Main");
                }, 0.1);
            }
        });
    }

    initSettings() {
        this.cols.children[1].getComponent(cc.EditBox).string = this.settings.cols.toString();
        this.rows.children[1].getComponent(cc.EditBox).string = this.settings.rows.toString();
        this.points.children[1].getComponent(cc.EditBox).string = this.settings.targetPoints.toString();
        this.moves.children[1].getComponent(cc.EditBox).string = this.settings.startedMoves.toString();
        this.reshuffle.children[1].getComponent(cc.EditBox).string = this.settings.startedBoosterReshuffle.toString();
        this.bomb.children[1].getComponent(cc.EditBox).string = this.settings.startedBoosterBomb.toString();
    }

    updateSettings() {
        this.settings.cols = (Number(this.cols.children[1].getComponent(cc.EditBox).string));
        this.settings.rows = (Number(this.rows.children[1].getComponent(cc.EditBox).string));
        this.settings.targetPoints = (Number(this.points.children[1].getComponent(cc.EditBox).string));
        this.settings.startedMoves = (Number(this.moves.children[1].getComponent(cc.EditBox).string));
        this.settings.startedBoosterReshuffle = (Number(this.reshuffle.children[1].getComponent(cc.EditBox).string));
        this.settings.startedBoosterBomb = (Number(this.bomb.children[1].getComponent(cc.EditBox).string));
    }
}
