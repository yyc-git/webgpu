let _geometryMap = [];
let _materialMap = [];

export let getTransformIndex = (gameObjectIndex) => {
    return gameObjectIndex;
};

export let getGeometryIndex = (gameObjectIndex) => {
    return _geometryMap[gameObjectIndex];
}

export let getMaterialIndex = (gameObjectIndex) => {
    return _materialMap[gameObjectIndex];
};

export let init = () => {
    _geometryMap = [0, 0, 1, 0, 1, 1];
    _materialMap = [0, 0, 1, 2, 3, 3];
};