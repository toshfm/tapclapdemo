import { Rum } from "../../Rum";
import { GameSettings } from "../mainScene/gameSettings";

const { ccclass, property } = cc._decorator;

let _: SettingsScene;

@ccclass
export default class SettingsScene extends cc.Component {
    play: cc.Node;
    rows: cc.Node;
    cols: cc.Node;
    points: cc.Node;
    moves: cc.Node;
    reshuffle: cc.Node;
    bomb: cc.Node;

    onLoad() {
        _ = this;
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
        Rum.hoverButton(_.play);
        _.play.on(cc.Node.EventType.TOUCH_START, () => {
            if (!Rum.isBlocked()) {
                _.scheduleOnce(function () {
                    _.updateSettings();
                    Rum.nextScene("Main");
                }, 0.1);
            }
        });
    }

    initSettings() {
        _.cols.children[1].getComponent(cc.EditBox).string = GameSettings.cols.toString();
        _.rows.children[1].getComponent(cc.EditBox).string = GameSettings.rows.toString();
        _.points.children[1].getComponent(cc.EditBox).string = GameSettings.targetPoints.toString();
        _.moves.children[1].getComponent(cc.EditBox).string = GameSettings.startedMoves.toString();
        _.reshuffle.children[1].getComponent(cc.EditBox).string = GameSettings.startedBoosterReshuffle.toString();
        _.bomb.children[1].getComponent(cc.EditBox).string = GameSettings.startedBoosterBomb.toString();
    }

    updateSettings() {
        GameSettings.cols = Number(_.cols.children[1].getComponent(cc.EditBox).string);
        GameSettings.rows = Number(_.rows.children[1].getComponent(cc.EditBox).string);
        GameSettings.targetPoints = Number(_.points.children[1].getComponent(cc.EditBox).string);
        GameSettings.startedMoves = Number(_.moves.children[1].getComponent(cc.EditBox).string);
        GameSettings.startedBoosterReshuffle = Number(_.reshuffle.children[1].getComponent(cc.EditBox).string);
        GameSettings.startedBoosterBomb = Number(_.bomb.children[1].getComponent(cc.EditBox).string);
    }
}
