import * as Scene from "./scene.mjs";
import * as WebGPUUtils from "./webgpuUtils.mjs";
import * as TypeArray from "./typearrayUtils.mjs";
import R from "ramda";

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
            let geometryVertices = TypeArray.newFloat32Array(
                vertices
            );
            let geometryVertexBuffer = device.createBuffer({
                size: geometryVertices.byteLength,
                usage: GPUBufferUsage.COPY_DST
            });

            WebGPUUtils.setSubData(0, geometryVertices, geometryVertexBuffer);


            let geometryIndices = TypeArray.newUint32Array(
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

let _convertInstanceTransformDataToContainerTransformData = (
    { translation, rotation, scale }
) => {
    return {
        translation,
        rotation: {
            x: -rotation.x,
            y: -rotation.y,
            z: -rotation.z,
        },
        scale
    }
}

let _convertHitGroupIndexToInstanceOffset = hitGroupIndex => parseInt(hitGroupIndex, 16);

let _buildContainers = (device) => {
    let geometryContainers = _buildSceneGeometryContainers(device);
    let sceneShaderData = Scene.getSceneShaderData();

    return [
        geometryContainers, device.createRayTracingAccelerationContainer({
            level: "top",
            flags: GPURayTracingAccelerationContainerFlag.PREFER_FAST_TRACE,
            instances: Scene.getSceneTransformDataWithGeometryIndex()
                .reduce((instances, [geometryIndex, transformData], i) => {
                    return R.append({
                        flags: GPURayTracingAccelerationInstanceFlag.TRIANGLE_CULL_DISABLE,
                        mask: 0xFF,
                        instanceId: i,
                        // instanceOffset: 0x0,
                        instanceOffset: _convertHitGroupIndexToInstanceOffset(Scene.getHitGroupIndex(i, sceneShaderData)),
                        transform: _convertInstanceTransformDataToContainerTransformData(transformData),
                        geometryContainer: geometryContainers[geometryIndex]
                    }, instances);
                }, [])
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
