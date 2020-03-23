import R from "ramda";

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



let _buildPlaneVertexData = () => {
    let vertices = [
        1.0, 0.0, -1.0,
        1.0, 0.0, 1.0,
        -1.0, 0.0, 1.0,
        -1.0, 0.0, -1.0
    ];
    let normals = [
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0
    ];
    let texCoords = [
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];

    return [
        vertices, normals, texCoords
    ]
}

let _buildPlaneIndexData = () => {
    let indices = [
        2, 1, 0,
        0, 3, 2
    ];

    return indices;
}


export let getSceneVertexData = () => {
    return [
        _buildTriangleVertexData(),
        _buildPlaneVertexData()
    ]
};


export let getSceneIndexData = () => {
    return [
        _buildTriangleIndexData(),
        _buildPlaneIndexData()
    ]
};

let _buildTransformData = (translation, rotation, scale) => {
    return {
        translation: { x: translation[0], y: translation[1], z: translation[2] },
        rotation: { x: rotation[0], y: rotation[1], z: rotation[2] },
        scale: { x: scale[0], y: scale[1], z: scale[2] }
    }
};

export let getSceneTransformDataWithGeometryIndex = () => {
    return [
        [0, _buildTransformData(
            [0, 0, 0],
            [0, 0, 0],
            [1, 1, 1],
        )],
        [0, _buildTransformData(
            [3, 0, 0],
            [0, 0, 0],
            [1, 1, 1],
        )],
        [1, _buildTransformData(
            [-3, 0, 0],
            [-10, 0, 0],
            [1, 1, 1],
        )]
    ]
};


let _computePrimtiveCount = (indexData) => {
    return indexData.length / 3;
}



let _computeIndexCount = (indexData) => {
    return indexData.length;
}

export let getTrianglePrimtiveCount = () => {
    return _computePrimtiveCount(
        _buildTriangleIndexData()
    );
}

export let getTriangleIndexCount = () => {
    return _computeIndexCount(
        _buildTriangleIndexData()
    );
}


export let getPlanePrimtiveCount = () => {
    return _computePrimtiveCount(
        _buildPlaneIndexData()
    );
}

export let getPlaneIndexCount = () => {
    return _computeIndexCount(
        _buildPlaneIndexData()
    );
}



let _computeVerticesCount = (vertices) => vertices.length / 3;

let _computeNormalsCount = (normals) => normals.length / 3;

let _computeTexCoordsCount = (texCoords) => texCoords.length / 2;

let _computeVertexDataTotalCount = ([vertices, normals, texCoords]) => {
    return _computeVerticesCount(vertices) + _computeNormalsCount(normals) + _computeTexCoordsCount(texCoords);
};


let _computeVertexDataCount = ([vertices, _normals, _texCoords]) => {
    return _computeVerticesCount(vertices);
};

export let computeSceneVertexBufferDataLength = () => {
    return R.multiply(
        getSceneVertexData()
            .reduce((length, vertexData) => {
                return length + _computeVertexDataTotalCount(vertexData);
            }, 0),
        4
    )
};


let _computeGameObjectIndexOffset = (geometryIndex, sceneVertexData) => {
    return sceneVertexData
        .slice(0, geometryIndex)
        .reduce((totalIndexCount, indices) => {
            return totalIndexCount + _computeIndexCount(indices);
        }, 0);
}


let _computeGameObjectVertexOffset = (geometryIndex, sceneVertexData) => {
    return sceneVertexData
        .slice(0, geometryIndex)
        .reduce((offset, vertexData) => {
            return offset + _computeVertexDataCount(vertexData);
        }, 0);
}

export let getSceneInstanceData = () => {
    let sceneVertexData = getSceneVertexData();

    return [
        [_computeGameObjectVertexOffset(0, sceneVertexData), _computeGameObjectIndexOffset(0, sceneVertexData)],
        [_computeGameObjectVertexOffset(0, sceneVertexData), _computeGameObjectIndexOffset(0, sceneVertexData)],
        [_computeGameObjectVertexOffset(1, sceneVertexData), _computeGameObjectIndexOffset(1, sceneVertexData)]
    ];
};

export let getSceneInstanCount = () => {
    return 3;
}