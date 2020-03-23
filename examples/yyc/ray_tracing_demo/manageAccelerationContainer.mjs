import * as Scene from "./scene.mjs";
import * as WebGPUUtils from "./webgpuUtils.mjs";
import * as TypeArray from "./typearrayUtils.mjs";
import R from "ramda";
import { log, stringify } from "./debugUtils.mjs";


let _buildGeometries = (device) => {
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
        .reduce((geometries, [vertices, indices]) => {
            let triangleVertices = TypeArray.newFloat32Array(
                vertices
            );
            let triangleVertexBuffer = device.createBuffer({
                size: triangleVertices.byteLength,
                usage: GPUBufferUsage.COPY_DST
            });

            WebGPUUtils.setSubData(0, triangleVertices, triangleVertexBuffer);


            let triangleIndices = TypeArray.newUint32Array(
                indices
            );
            let triangleIndexBuffer = device.createBuffer({
                size: triangleIndices.byteLength,
                usage: GPUBufferUsage.COPY_DST
            });

            WebGPUUtils.setSubData(0, triangleIndices, triangleIndexBuffer);


            return R.append({
                flags: GPURayTracingAccelerationGeometryFlag.OPAQUE,
                type: "triangles",
                vertex: {
                    buffer: triangleVertexBuffer,
                    format: "float3",
                    stride: 3 * Float32Array.BYTES_PER_ELEMENT,
                    count: triangleVertices.length
                },
                index: {
                    buffer: triangleIndexBuffer,
                    format: "uint32",
                    count: triangleIndices.length
                }
            }, geometries);
        }, [])
};

let _buildInstances = (geometryContainer) => {
    return Scene.getSceneTransformData()
        .reduce((instances, transformData, i) => {
            return R.append({
                flags: GPURayTracingAccelerationInstanceFlag.TRIANGLE_CULL_DISABLE,
                mask: 0xFF,
                instanceId: i,
                instanceOffset: 0x0,
                transform: transformData,
                geometryContainer: geometryContainer
            }, instances);
        }, [])

};

export let buildContainers = (device, queue) => {
    log(_buildGeometries(device));

    // create a geometry container
    // which holds references to our geometry buffers
    let geometryContainer = device.createRayTracingAccelerationContainer({
        level: "bottom",
        flags: GPURayTracingAccelerationContainerFlag.PREFER_FAST_TRACE,
        geometries: _buildGeometries(device)
    });

    stringify(_buildInstances(geometryContainer));
    // create an instance container
    // which contains object instances with transforms
    // and links to a geometry container to be used
    let instanceContainer = device.createRayTracingAccelerationContainer({
        level: "top",
        flags: GPURayTracingAccelerationContainerFlag.PREFER_FAST_TRACE,
        instances: _buildInstances(geometryContainer)
    });


    // build the containers (the order is important)
    // geometry containers have to be built before
    // an instance container, if it has a geometry reference into it
    {
        let commandEncoder = device.createCommandEncoder({});
        commandEncoder.buildRayTracingAccelerationContainer(geometryContainer);
        commandEncoder.buildRayTracingAccelerationContainer(instanceContainer);
        queue.submit([commandEncoder.finish()]);
    }

    return instanceContainer;
};
