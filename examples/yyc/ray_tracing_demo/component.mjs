import R from "ramda";
import * as TypeArrayUtils from "./typearrayUtils.mjs";
import deepExtend from "deep-extend";

export let Transform = (function () {
    let _transformDataMap = [];

    let _buildTransformData = (translation, rotation, scale) => {
        return {
            translation: { x: translation[0], y: translation[1], z: translation[2] },
            rotation: { x: rotation[0], y: rotation[1], z: rotation[2] },
            scale: { x: scale[0], y: scale[1], z: scale[2] }
        }
    };

    let _copyTransformData = (transformData) => {
        return deepExtend(transformData);
    };

    let _init = () => {
        _transformDataMap = [
            _buildTransformData(
                [0, 0, 0],
                [0, 0, 0],
                [1, 1, 1],
            ),
            _buildTransformData(
                [3, 0, 0],
                [0, 0, 0],
                [1, 1, 1],
            ),
            _buildTransformData(
                [0, -10, 0],
                [0, 0, 0],
                [20, 20, 20],
            ),
            _buildTransformData(
                [1, 0, 3],
                [0, 0, 0],
                [1, 1, 1],
            ),
            _buildTransformData(
                [20, 0, 0],
                [0, 0, 90],
                [10, 10, 10],
            ),
            _buildTransformData(
                [-20, 0, 0],
                [0, 0, -90],
                [10, 10, 10],
            ),
        ];
    };


    let _getSceneTransformData = () => {
        return _transformDataMap;
    };

    return {
        init: _init,
        copyTransformData: _copyTransformData,
        getSceneTransformData: _getSceneTransformData,
    }
}());

export let Geometry = (function () {
    let _geometryVertexDataMap = [];
    let _geometryIndexDataMap = [];

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


    let _init = () => {
        _geometryVertexDataMap = [
            _buildTriangleVertexData(),
            _buildPlaneVertexData()
        ];

        _geometryIndexDataMap = [
            _buildTriangleIndexData(),
            _buildPlaneIndexData()
        ];
    };


    let _getSceneVertexData = () => _geometryVertexDataMap;

    let _getSceneIndexData = () => _geometryIndexDataMap;

    return {
        init: _init,
        getSceneVertexData: _getSceneVertexData,
        getSceneIndexData: _getSceneIndexData
    }
}());

export let PhongMaterial = (function () {
    let _materialDataMap = [];

    let _buildPhongMaterialData = (ambient, diffuse, specular, shininess, illum, dissolve) => {
        return [ambient, diffuse, specular, [shininess, illum, dissolve]];
    };

    let _init = () => {
        _materialDataMap = [
            _buildPhongMaterialData(
                [0.1, 0.1, 0.1],
                [1.0, 0.0, 0.0],
                [0.2, 0.0, 1.0],
                36.0,
                2,
                1
            ),
            _buildPhongMaterialData(
                [0.1, 0.1, 0.1],
                [0.0, 1.0, 0.0],
                [0.5, 0.0, 0.5],
                72.0,
                2,
                1
            ),
            _buildPhongMaterialData(
                [0.1, 0.1, 0.1],
                [0.0, 0.0, 1.0],
                [0.2, 0.0, 1.0],
                36.0,
                4,
                0.2
            ),
            _buildPhongMaterialData(
                [0.0, 0.0, 0.0],
                [0.0, 0.0, 0.0],
                [0.95, 0.95, 0.95],
                32.0,
                3,
                1
            )
        ]
    };

    let _getScenePhongMaterialData = () => _materialDataMap;

    let _computeScenePhongMaterialBufferDataLength = () => {
        return R.multiply(
            4 * 4,
            _getScenePhongMaterialData().length
        )
    };


    return {
        init: () => {
            return _init();
        },
        getScenePhongMaterialData: _getScenePhongMaterialData,
        computeScenePhongMaterialBufferDataLength: _computeScenePhongMaterialBufferDataLength
    }
}());

export let DirectionLight = (function () {
    let _lightData = null;

    let _init = () => {
        _lightData = TypeArrayUtils.newFloat32Array([
            1.0,
            0.0,
            0.0,
            0.0,

            0.0,
            1.0,
            1.0,
            0.0
        ])
    }

    let _getSceneDirectionLightData = () => {
        return _lightData;
    }

    return {
        init: _init,
        getSceneDirectionLightData: _getSceneDirectionLightData
    };
}())

export let Shader = (function () {
    var _shaderDataMap = [];

    let _buildShaderData = (hitGroupIndex) => {
        return hitGroupIndex;
    };

    let _init = () => {
        _shaderDataMap = [
            _buildShaderData(0),
            _buildShaderData(1),
            _buildShaderData(0),
            _buildShaderData(0)
        ]
    };

    let _getSceneShaderData = () => {
        return _shaderDataMap;
    };

    return {
        init: _init,
        getSceneShaderData: _getSceneShaderData
    }
}());
