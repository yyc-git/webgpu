let _buildTriangleVertexData = () => {
    let vertices = [
        0.0, 1.0, 0.0,
        -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0
    ];
    let normals = [
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0
    ];
    let texCoords = [
        0.5, 1.0,
        0.0, 0.0,
        1.0, 0.0
    ];

    return [
        vertices, normals, texCoords
    ]
}

let _buildTriangleIndexData = () => {
    let indices = [
        0, 1, 2
    ];

    return indices;
}


export let getSceneVertexData = () => {
    return [
        _buildTriangleVertexData(),
        _buildTriangleVertexData()
    ]
};


export let getSceneIndexData = () => {
    return [
        _buildTriangleIndexData(),
        _buildTriangleIndexData()
    ]
};

let _buildTransformData = (translation, rotation, scale) => {
    return {
        translation: { x: translation[0], y: translation[1], z: translation[2] },
        rotation: { x: rotation[0], y: rotation[1], z: rotation[2] },
        scale: { x: scale[0], y: scale[1], z: scale[2] }
    }
};

export let getSceneTransformData = () => {
    return [
        _buildTransformData(
            [0, 0, 0],
            [0, 0, 0],
            [1, 1, 1],
        ),
        _buildTransformData(
            [3, 0, 0],
            [0, 0, 0],
            [1, 1, 1],
        )
    ]
};

export let getTrianglePrimtiveCount = () => {
    return 1;
}

export let getTriangleIndexCount = () => {
    return 3;
}

export let getSceneInstanceData = () => {
    return [
        [0, getTrianglePrimtiveCount(), getTriangleIndexCount()],
        [1, getTrianglePrimtiveCount(), getTriangleIndexCount()]
    ]
};

export let getSceneInstanCount = () => {
    return 2;
}