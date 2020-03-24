import R from "ramda";
import glMatrix from "gl-matrix";

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
            [10, 0, 0],
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

let _computeGameObjectCompressedData = (geometryIndex, sceneVertexData) => {
    return [
        _computeGameObjectVertexOffset(geometryIndex, sceneVertexData),
        _computeGameObjectIndexOffset(geometryIndex, sceneVertexData),
        0.0,
        0.0
    ]
};

let _convertToVec3 = ({ x, y, z }) => [x, y, z];

let _getTransformData = (gameObjectIndex, sceneTransformDataWithGeometryIndex) => {
    return sceneTransformDataWithGeometryIndex[gameObjectIndex][1];
};

let _buildModelMatrix = (transformData) => {
    return glMatrix.mat4.fromRotationTranslationScale(
        glMatrix.mat4.create(),
        glMatrix.quat.fromEuler(
            glMatrix.quat.create(),
            transformData.rotation.x,
            transformData.rotation.y,
            transformData.rotation.z,
        ),
        _convertToVec3(transformData.translation),
        _convertToVec3(transformData.scale)
    )
};

let _buildNormalMatrix = (modelMatrix) => {
    return glMatrix.mat3.normalFromMat4(
        glMatrix.mat3.create(),
        modelMatrix
    )
};

// let _buildNormalMatrix = (modelMatrix) => {
//     let outMat4 = glMatrix.mat4.create();

//     return R.pipe(
//         R.curry(glMatrix.mat4.invert)(outMat4),
//         R.curry(glMatrix.mat4.transpose)(outMat4),
//     )(modelMatrix);
// };


let _buildGameObjectData = (geometryIndex, gameObjectIndex, sceneVertexData, sceneTransformDataWithGeometryIndex) => {
    let modelMatrix = R.pipe(
        _getTransformData,
        _buildModelMatrix
    )(
        gameObjectIndex,
        sceneTransformDataWithGeometryIndex
    );

    // console.log("gI:",  gameObjectIndex);
    // console.log("comredd:", _computeGameObjectCompressedData(geometryIndex, sceneVertexData));
    // console.log("normalMatrix:",  _buildNormalMatrix(modelMatrix));
    // console.log("modelMatrix:", (modelMatrix));
    

    return [
        _computeGameObjectCompressedData(geometryIndex, sceneVertexData),
        _buildNormalMatrix(modelMatrix),
        modelMatrix
    ]

};

export let getSceneGameObjectData = () => {
    let sceneVertexData = getSceneVertexData();
    let sceneTransformDataWithGeometryIndex = getSceneTransformDataWithGeometryIndex();

    return [
        _buildGameObjectData(0, 0, sceneVertexData, sceneTransformDataWithGeometryIndex),
        _buildGameObjectData(0, 1, sceneVertexData, sceneTransformDataWithGeometryIndex),
        _buildGameObjectData(1, 2, sceneVertexData, sceneTransformDataWithGeometryIndex),
    ];
    // return [
    //     [
    //         [0.0,0.0,1.0,0.0],
    //         [0.0,0.0,1.0,0.0],
    //         [0.5,0.1,0.5,1.0],
    //     ],
    //     [
    //         [0.0,0.0,1.0,0.0],
    //         [0.0,0.0,1.0,0.0],
    //         [1.0,0.0,0.0,1.0],
    //     ],
    //     [
    //         [0.0,0.0,1.0,0.0],
    //         [0.0,0.0,1.0,0.0],
    //         [0.0,0.0,1.0,1.0],
    //     ],
    // ]
};

export let getSceneInstanCount = () => {
    return 3;
}