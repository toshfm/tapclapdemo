import { IGameSettings } from "../../interfaces/services/iGameSettings";
import { IUiUtils } from "../../interfaces/services/iUiUtils";
import { getSettings, getUI } from "../../ioc/init";

const { ccclass, property } = cc._decorator;

let _: SettingsScene;

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
        _ = this;
        _.ui = getUI();
        _.settings = getSettings();
        _.play = cc.find('Canvas/play');
        _.rows = cc.find('Canvas/boxes/rows');
        _.cols = cc.find('Canvas/boxes/cols');
        _.points = cc.find('Canvas/boxes/points');
        _.moves = cc.find('Canvas/boxes/moves');
        _.reshuffle = cc.find('Canvas/boxes/reshuffle');
        _.bomb = cc.find('Canvas/boxes/bomb')
    }

    start() {
        _.initSettings();
        _.ui.hoverButton(_.play);
        _.play.on(cc.Node.EventType.TOUCH_START, () => {
            if (!_.ui.uiIsLocked()) {
                _.scheduleOnce(function () {
                    _.updateSettings();
                    _.ui.nextScene("Main");
                }, 0.1);
            }
        });
    }

    initSettings() {
        _.cols.children[1].getComponent(cc.EditBox).string = _.settings.getCols().toString();
        _.rows.children[1].getComponent(cc.EditBox).string = _.settings.getRows().toString();
        _.points.children[1].getComponent(cc.EditBox).string = _.settings.getTargetPoints().toString();
        _.moves.children[1].getComponent(cc.EditBox).string = _.settings.getStartedMoves().toString();
        _.reshuffle.children[1].getComponent(cc.EditBox).string = _.settings.getStartedBoosterReshuffle().toString();
        _.bomb.children[1].getComponent(cc.EditBox).string = _.settings.getStartedBoosterBomb().toString();
    }

    updateSettings() {
        _.settings.setCols(Number(_.cols.children[1].getComponent(cc.EditBox).string));
        _.settings.setRows(Number(_.rows.children[1].getComponent(cc.EditBox).string));
        _.settings.setTargetPoints(Number(_.points.children[1].getComponent(cc.EditBox).string));
        _.settings.setStartedMoves(Number(_.moves.children[1].getComponent(cc.EditBox).string));
        _.settings.setStartedBoosterReshuffle(Number(_.reshuffle.children[1].getComponent(cc.EditBox).string));
        _.settings.setStartedBoosterBomb(Number(_.bomb.children[1].getComponent(cc.EditBox).string));
    }
}
