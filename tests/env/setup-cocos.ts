var canvas = document.createElement("canvas");
var option = {
    id: canvas,
    debugMode: 1,
    showFPS: false,
    frameRate: 60,
    groupList: ["default"],
    collisionMatrix: [[true]],
};

cc.game.run(option, () => {});