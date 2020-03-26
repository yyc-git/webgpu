import R from "ramda";
import glMatrix from "gl-matrix";
import * as Component from "./component.mjs";
import * as GameObject from "./gameObject.mjs";
import * as ArcballCameraControl from './arcballCameraControl.mjs';
import * as ManangeCameraMatrixUtils from "./manangeCameraMatrixUtils.mjs";
import * as ManageAccelartionContainer from "./manageAccelerationContainer.mjs";

export let getSceneVertexData = () => {
    return Component.Geometry.getSceneVertexData();
};

export let getSceneIndexData = () => {
    return Component.Geometry.getSceneIndexData();
};

export let getScenePhongMaterialData = () => {
    return Component.PhongMaterial.getScenePhongMaterialData();
};

export let computeScenePhongMaterialBufferDataLength = Component.PhongMaterial.computeScenePhongMaterialBufferDataLength;

export let getSceneTransformDataWithGeometryIndex = () => {
    return Component.Transform.getSceneTransformData()
        .map((transformData, gameObjectIndex) => {
            return [GameObject.getGeometryIndex(gameObjectIndex), transformData];
        })
};

export let getSceneDirectionLightData = () => {
    return Component.DirectionLight.getSceneDirectionLightData();
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


let _buildGameObjectData = (gameObjectIndex, sceneTransformDataWithGeometryIndex) => {
    let modelMatrix = R.pipe(
        _getTransformData,
        _buildModelMatrix
    )(
        gameObjectIndex,
        sceneTransformDataWithGeometryIndex
    );

    return [
        [
            GameObject.getGeometryIndex(gameObjectIndex),
            GameObject.getMaterialIndex(gameObjectIndex),
        ],
        _buildNormalMatrix(modelMatrix),
        modelMatrix
    ]
};

export let getSceneGameObjectData = () => {
    let sceneTransformDataWithGeometryIndex = getSceneTransformDataWithGeometryIndex();

    return [
        _buildGameObjectData(0, sceneTransformDataWithGeometryIndex),
        _buildGameObjectData(1, sceneTransformDataWithGeometryIndex),
        _buildGameObjectData(2, sceneTransformDataWithGeometryIndex),
        _buildGameObjectData(3, sceneTransformDataWithGeometryIndex),
        _buildGameObjectData(4, sceneTransformDataWithGeometryIndex),
        _buildGameObjectData(5, sceneTransformDataWithGeometryIndex),
    ];
};


let _buildGeometryOffsetData = (geometryIndex, sceneVertexData) => {
    return [
        _computeGameObjectVertexOffset(geometryIndex, sceneVertexData),
        _computeGameObjectIndexOffset(geometryIndex, sceneVertexData),
    ]

};


export let getSceneGeometryOffsetData = () => {
    let sceneVertexData = getSceneVertexData();

    return [
        _buildGeometryOffsetData(0, sceneVertexData),
        _buildGeometryOffsetData(1, sceneVertexData),
    ];
};

export let getSceneGameObjectCount = () => {
    return getSceneGameObjectData().length;
}



export let getSceneGeometryCount = () => {
    return getSceneGeometryOffsetData().length;
}

// TODO refactor: use event observer?
export let isCurrentScenePictureChange = () => {
    return ManangeCameraMatrixUtils.isChange() || Component.TransformAnimation.isAnimate();
}

export let getSceneShaderData = () => {
    return Component.Shader.getSceneShaderData();
};

export let getHitGroupIndex = (gameObjectIndex, sceneShaderData) => {
    return sceneShaderData[gameObjectIndex];
};

export let init = (window) => {
    ArcballCameraControl.init(window);
    ManangeCameraMatrixUtils.init();

    Component.Transform.init();
    Component.Geometry.init();
    Component.PhongMaterial.init();
    Component.DirectionLight.init();
    Component.Shader.init();
    Component.TransformAnimation.init();

    GameObject.init();
};

export let update = ([device, queue], time, [instanceBufferArrayBuffer, instanceBuffer, instanceContainer]) => {
    Component.TransformAnimation.updateAll(time);

    return ManageAccelartionContainer.updateInstanceContainer([device, queue], [instanceBufferArrayBuffer, instanceBuffer, instanceContainer]);
};