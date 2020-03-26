import * as Scene from "./scene.mjs";
import * as WebGPUUtils from "./webgpuUtils.mjs";
import * as TypeArrayUtils from "./typearrayUtils.mjs";
import R from "ramda";
import glMatrix from "gl-matrix";

let _buildSceneGeometryContainers = (device) => {
    return R.zipWith(
        (vertexData, indexData) => {
            return [
                vertexData[0],
                indexData
            ]
        },
        Scene.getSceneVertexData(),
        Scene.getSceneIndexData()
    )
        .reduce((geometryContainers, [vertices, indices]) => {
            let geometryVertices = TypeArrayUtils.newFloat32Array(
                vertices
            );
            let geometryVertexBuffer = device.createBuffer({
                size: geometryVertices.byteLength,
                usage: GPUBufferUsage.COPY_DST
            });

            WebGPUUtils.setSubData(0, geometryVertices, geometryVertexBuffer);


            let geometryIndices = TypeArrayUtils.newUint32Array(
                indices
            );
            let geometryIndexBuffer = device.createBuffer({
                size: geometryIndices.byteLength,
                usage: GPUBufferUsage.COPY_DST
            });

            WebGPUUtils.setSubData(0, geometryIndices, geometryIndexBuffer);

            return R.append(
                device.createRayTracingAccelerationContainer({
                    level: "bottom",
                    flags: GPURayTracingAccelerationContainerFlag.PREFER_FAST_TRACE,
                    geometries: [{
                        // flags: GPURayTracingAccelerationGeometryFlag.OPAQUE,
                        flags: GPURayTracingAccelerationGeometryFlag.ALLOW_ANY_HIT,
                        type: "geometrys",
                        vertex: {
                            buffer: geometryVertexBuffer,
                            format: "float3",
                            stride: 3 * Float32Array.BYTES_PER_ELEMENT,
                            count: geometryVertices.length
                        },
                        index: {
                            buffer: geometryIndexBuffer,
                            format: "uint32",
                            count: geometryIndices.length
                        }
                    }]
                }), geometryContainers);
        }, [])
};

// let _convertInstanceTransformDataToContainerTransformData = (
//     { translation, rotation, scale }
// ) => {
//     return {
//         translation,
//         rotation: {
//             x: -rotation.x,
//             y: -rotation.y,
//             z: -rotation.z,
//         },
//         scale
//     }
// }

let _convertMat4To34RowMajorMatrix = (mat4) => {
    return new Float32Array([
        mat4[0],
        mat4[4],
        mat4[8],
        mat4[12],

        mat4[1],
        mat4[5],
        mat4[9],
        mat4[13],

        mat4[2],
        mat4[6],
        mat4[10],
        mat4[14]
    ])
};

let _convertInstanceTransformDataToContainerTransformMatrix = (
    { translation, rotation, scale }
) => {
    return R.pipe(
        glMatrix.mat4.fromRotationTranslationScale,
        _convertMat4To34RowMajorMatrix
    )(
        glMatrix.mat4.create(),
        glMatrix.quat.fromEuler(
            glMatrix.quat.create(),
            rotation.x,
            rotation.y,
            rotation.z,
        ),
        [translation.x, translation.y, translation.z],
        [scale.x, scale.y, scale.z],
    )
}

let _convertHitGroupIndexToInstanceOffset = hitGroupIndex => parseInt(hitGroupIndex, 16);

let InstanceBuffer = (function () {
    let _getInstanceBufferStride = () => 64;

    let _computeGameObjectOffset = (gameObjectIndex) => {
        return gameObjectIndex * _getInstanceBufferStride();
    };

    let _createInstanceBuffer = (gameObjectCount, device) => {
        let byteLength = gameObjectCount * _getInstanceBufferStride();

        return [
            TypeArrayUtils.newArrayBuffer(byteLength),
            device.createBuffer({
                size: byteLength,
                usage: GPUBufferUsage.COPY_DST
            })
        ];
    };

    let _setInstanceData = (gameObjectIndex, [transformMatrix, instanceId, mask, instanceOffset, flags, blasHandle], instanceBufferArrayBuffer) => {
        let dataView = new DataView(instanceBufferArrayBuffer);
        let offset = _computeGameObjectOffset(gameObjectIndex);

        offset = R.range(0, 12)
            .reduce((offset, i) => {
                dataView.setFloat32(offset, transformMatrix[i], true);

                return offset + 4;
            }, offset);


        dataView.setUint32(
            offset, mask << 24 | instanceId, true
        );
        dataView.setUint32(
            offset + 4, flags << 24 | instanceOffset, true
        );
        dataView.setBigInt64(
            offset + 8, blasHandle, true
        );

        return instanceBufferArrayBuffer;
    };

    let _setInstanceBufferData = (instanceBufferArrayBuffer, instanceBuffer) => {
        WebGPUUtils.setSubData(0, TypeArrayUtils.newUint8Array(
            instanceBufferArrayBuffer
        ), instanceBuffer);

        return instanceBuffer;
    };

    return {
        createInstanceBuffer: _createInstanceBuffer,
        setInstanceData: _setInstanceData,
        setInstanceBufferData: _setInstanceBufferData
    };
}());


let _buildContainers = (device) => {
    let geometryContainers = _buildSceneGeometryContainers(device);
    let sceneShaderData = Scene.getSceneShaderData();
    let [instanceBufferArrayBuffer, instanceBuffer] = InstanceBuffer.createInstanceBuffer(
        Scene.getSceneGameObjectCount(),
        device
    );

    instanceBufferArrayBuffer =
        Scene.getSceneTransformDataWithGeometryIndex()
            .reduce((instanceBufferArrayBuffer, [geometryIndex, transformData], i) => {
                return InstanceBuffer.setInstanceData(i, [
                    _convertInstanceTransformDataToContainerTransformMatrix(transformData), i, 0xFF, _convertHitGroupIndexToInstanceOffset(Scene.getHitGroupIndex(i, sceneShaderData)), GPURayTracingAccelerationInstanceFlag.TRIANGLE_CULL_DISABLE, geometryContainers[geometryIndex].getHandle()
                ], instanceBufferArrayBuffer);
            }, instanceBufferArrayBuffer)

    instanceBuffer = InstanceBuffer.setInstanceBufferData(
        instanceBufferArrayBuffer, instanceBuffer
    );

    return [
        geometryContainers, device.createRayTracingAccelerationContainer({
            level: "top",
            // flags: GPURayTracingAccelerationContainerFlag.PREFER_FAST_TRACE | GPURayTracingAccelerationContainerFlag.ALLOW_UPDATE,
            flags: GPURayTracingAccelerationContainerFlag.PREFER_FAST_TRACE,
            // instances: Scene.getSceneTransformDataWithGeometryIndex()
            //     .reduce((instances, [geometryIndex, transformData], i) => {
            //         return R.append({
            //             flags: GPURayTracingAccelerationInstanceFlag.TRIANGLE_CULL_DISABLE,
            //             mask: 0xFF,
            //             instanceId: i,
            //             // instanceOffset: 0x0,
            //             instanceOffset: _convertHitGroupIndexToInstanceOffset(Scene.getHitGroupIndex(i, sceneShaderData)),
            //             transform: _convertInstanceTransformDataToContainerTransformData(transformData),
            //             geometryContainer: geometryContainers[geometryIndex]
            //         }, instances);
            //     }, [])
            instanceBuffer
        })
    ];
};

export let buildContainers = (device, queue) => {
    let [geometryContainers, instanceContainer] = _buildContainers(device);

    // build the containers (the order is important)
    // geometry containers have to be built before
    // an instance container, if it has a geometry reference into it
    {
        let commandEncoder = device.createCommandEncoder({});
        geometryContainers.forEach((geometryContainer) => {
            commandEncoder.buildRayTracingAccelerationContainer(geometryContainer)
        });
        commandEncoder.buildRayTracingAccelerationContainer(instanceContainer);
        queue.submit([commandEncoder.finish()]);
    }

    return instanceContainer;
};
