import glMatrix from "gl-matrix";

let _viewMatrixInverse = null;
let _lastViewMatrixInverse = null;
let _projectionMatrixInverse = null;

export let init = () => {
    _viewMatrixInverse = glMatrix.mat4.create();
    _lastViewMatrixInverse = glMatrix.mat4.create();
    _projectionMatrixInverse = glMatrix.mat4.create();
}

export let getCameraBufferSize = () => {
    return _viewMatrixInverse.byteLength + _projectionMatrixInverse.byteLength;
};

export let isChange = () => {
    return !glMatrix.mat4.equals(_lastViewMatrixInverse, _viewMatrixInverse);
};

export let updateViewMatrixInverse = ([lookFrom, lookAt, up], [aspect, fovy, near, far]) => {
    _lastViewMatrixInverse = glMatrix.mat4.copy(_lastViewMatrixInverse, _viewMatrixInverse);

    glMatrix.mat4.perspective(_projectionMatrixInverse, fovy, aspect, near, far);
    glMatrix.mat4.lookAt(_viewMatrixInverse, lookFrom, lookAt, up);
    glMatrix.mat4.invert(_viewMatrixInverse, _viewMatrixInverse);
    glMatrix.mat4.invert(_projectionMatrixInverse, _projectionMatrixInverse);

    return [_viewMatrixInverse, _projectionMatrixInverse];
}