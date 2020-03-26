import * as Scene from "./scene.mjs";

const MAX_FRAME = 10;

let _frame = 0;
let _nbsamples = 10;

// let _increaseFrame = (constantsData) => {
//     constantsData[0] += 1;

//     return constantsData;
// };

// let _resetFrame = (constantsData) => {
//     constantsData[0] = 0;

//     return constantsData;
// };

// export let updateFrame = (constantsData) => {
//     if (Scene.isCurrentScenePictureChange()) {
//         constantsData = _resetFrame(constantsData);
//     }
//     else {
//         constantsData = _increaseFrame(constantsData);
//     }

//     return constantsData;
// }

// export let isMaxFrame = ()

export let notReachMaxFrame = () => {
    return _frame < MAX_FRAME;
}

let _increaseFrame = () => {
    if (notReachMaxFrame()) {
        _frame++;
    }
    else {
    }
};

let _resetFrame = () => {
    _frame = 0;
};

export let getFrame = () => _frame;

export let updateFrame = () => {
    if (Scene.isCurrentScenePictureChange()) {
        _resetFrame();
    }
    else {
        _increaseFrame();
    }
}

export let getNBSamples = () => _nbsamples;