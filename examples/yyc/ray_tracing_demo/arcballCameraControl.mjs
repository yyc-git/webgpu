let _phi = Math.PI / 2;
let _theta = Math.PI / 2;
let _target = [0.0, 0.0, 0.0];
let _rotateSpeed = 1;
let _wheelSpeed = 1;
let _distance = 20;

let _isDrag = false;


function _getWheel(e) {
    return e.deltaY;
}

function _changeDistance(e) {
    _distance -= _getWheel(e) * _wheelSpeed;
}


function _getMovementDelta(e) {
    return [-e.movementX, -e.movementY];
}

function _changeOrbit(e) {
    var [x, y] = _getMovementDelta(e);

    _phi += x / (100 / _rotateSpeed);
    _theta -= y / (100 / _rotateSpeed);
}

function _bindDragStartEvent(window) {
    window.onmousedown = (e) => {
        _isDrag = true;
    };
}

function _bindDragOverEvent(window) {
    window.onmousemove = (e) => {
        if (!_isDrag) {
            return;
        }

        _changeOrbit(e);
    };
}

function _bindDragDropEvent(window) {
    window.onmouseup = (e) => {
        _isDrag = false;
    };
}

function _bindMouseWheelEvent(window) {
    window.onmousewheel = (e) => {
        _changeDistance(e);
    };
}

export function init(window) {
    _bindDragStartEvent(window);
    _bindDragOverEvent(window);
    _bindDragDropEvent(window);
    _bindMouseWheelEvent(window);
};

export function getLookFrom() {
    return [
        _distance * Math.cos(_phi) * Math.sin(_theta) + _target[0],
        _distance * Math.cos(_theta) + _target[1],
        _distance * Math.sin(_phi) * Math.sin(_theta) + _target[2],
    ]
};

export function getTarget() {
    return _target
};