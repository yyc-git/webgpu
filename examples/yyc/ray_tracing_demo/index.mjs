import WebGPU from "../../../index.js";
import { loadShaderFile } from "./inliner.mjs";
import R from "ramda";
import * as WebGPUUtils from "./webgpuUtils.mjs";
import * as Scene from "./scene.mjs";
import * as TypeArrayUtils from "./typearrayUtils.mjs";
import * as ManageAccelartionContainer from "./manageAccelerationContainer.mjs";
import glMatrix from "gl-matrix";
import * as BufferPaddingUtils from "./bufferPaddingUtils.mjs";
import { createShaderBindingTable } from "./manageShaderBindingTable.mjs";
import * as ArcballCameraControl from './arcballCameraControl.mjs';
import * as ManangeCameraMatrixUtils from "./manangeCameraMatrixUtils.mjs";
import * as AA from "./aa.mjs";


Object.assign(global, WebGPU);
Object.assign(global, glMatrix);



function buildConstantsBuffer(device) {
  let constantsDataCount = 4;
  let constantsBufferSize = constantsDataCount * Float32Array.BYTES_PER_ELEMENT;
  let constantsBuffer = device.createBuffer({
    size: constantsBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
  });

  let constantsData = TypeArrayUtils.newFloat32Array(
    constantsBufferSize / Float32Array.BYTES_PER_ELEMENT
  );
  constantsData[0] = AA.getFrame();
  constantsData[1] = AA.getNBSamples();
  constantsData[2] = AA.getMaxDepth();

  console.log("constantsData:", constantsData)

  return [constantsBufferSize, constantsData, constantsBuffer];
}


function buildCameraBuffer(device) {
  let cameraBufferSize = ManangeCameraMatrixUtils.getCameraBufferSize();
  let cameraData = new Float32Array(
    cameraBufferSize / Float32Array.BYTES_PER_ELEMENT
  );
  let cameraBuffer = device.createBuffer({
    size: cameraBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
  });

  return [cameraBufferSize, cameraData, cameraBuffer];
}


function buildSceneDescBuffer(device) {
  let instanceCount = Scene.getSceneInstanCount();

  let sceneDescDataCount = 4 + 12 + 16;
  let sceneDescBufferSize = instanceCount * sceneDescDataCount * Float32Array.BYTES_PER_ELEMENT;
  let sceneDescBuffer = device.createBuffer({
    size: sceneDescBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
  });



  let [sceneDescData, _] =
    Scene.getSceneGameObjectData()
      .reduce(([sceneDescData, offset], [compressedData, normalMatrix, modelMatrix], i) => {
        sceneDescData.set(compressedData, offset);

        var [sceneDescData, offset] = BufferPaddingUtils.setMat3DataToBufferData(offset + 4, normalMatrix, sceneDescData);

        sceneDescData.set(modelMatrix, offset);

        return [sceneDescData, offset + 16];
      }, [TypeArrayUtils.newFloat32Array(
        sceneDescBufferSize / Float32Array.BYTES_PER_ELEMENT
      ), 0]);

  console.log("sceneDescData:", sceneDescData)

  WebGPUUtils.setSubData(0, sceneDescData, sceneDescBuffer);

  return [sceneDescBufferSize, sceneDescBuffer];
}


function buildSceneGeometryOffsetDataBuffer(device) {
  let objCount = Scene.getSceneGeometryCount();

  let sceneGeometryOffsetDataCount = 2;
  let sceneGeometryOffsetBufferSize = objCount * sceneGeometryOffsetDataCount * Uint32Array.BYTES_PER_ELEMENT;
  let sceneGeometryOffsetBuffer = device.createBuffer({
    size: sceneGeometryOffsetBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
  });


  let [sceneGeometryOffsetData, _] =
    Scene.getSceneGeometryOffsetData()
      .reduce(([sceneGeometryOffsetData, offset], [vertexOffset, indexOffset], i) => {
        sceneGeometryOffsetData[offset] = vertexOffset;
        sceneGeometryOffsetData[offset + 1] = indexOffset;

        return [sceneGeometryOffsetData, offset + 2];
      }, [TypeArrayUtils.newUint32Array(
        sceneGeometryOffsetBufferSize / Uint32Array.BYTES_PER_ELEMENT
      ), 0]);

  console.log("sceneGeometryOffsetData:", sceneGeometryOffsetData)

  WebGPUUtils.setSubData(0, sceneGeometryOffsetData, sceneGeometryOffsetBuffer);

  return [sceneGeometryOffsetBufferSize, sceneGeometryOffsetBuffer];
}


function buildIndexBuffer(device) {
  let instanceCount = Scene.getSceneInstanCount();

  let indexDataCount = 3;
  let indexBufferSize = instanceCount * indexDataCount * Uint32Array.BYTES_PER_ELEMENT;
  let indexBuffer = device.createBuffer({
    size: indexBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
  });



  let [indexData, _] =
    Scene.getSceneIndexData()
      .reduce(([indexData, offset], indices, i) => {
        indexData.set(indices, i * indexDataCount)

        return [indexData, offset + 3];
      },
        [TypeArrayUtils.newUint32Array(
          indexBufferSize / Uint32Array.BYTES_PER_ELEMENT
        ), 0]);



  console.log("indexData:", indexData);

  WebGPUUtils.setSubData(0, indexData, indexBuffer);

  return [indexBufferSize, indexBuffer];
}


function buildVertexBuffer(device) {
  let vertexBufferLength = Scene.computeSceneVertexBufferDataLength();
  let vertexBufferSize = vertexBufferLength * Float32Array.BYTES_PER_ELEMENT;
  let vertexBuffer = device.createBuffer({
    size: vertexBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
  });


  let [vertexData, _] =
    Scene.getSceneVertexData()
      .reduce(([vertexData, offset], [vertices, normals, texCoords]) => {
        let vertexCount = vertices.length / 3;
        let [newVertexData, newOffset] = R.range(0, vertexCount).reduce(([vertexData, offset], index) => {
          vertexData.set(vertices.slice(index * 3, (index + 1) * 3), offset);
          vertexData.set(normals.slice(index * 3, (index + 1) * 3), offset + 4);
          vertexData.set(texCoords.slice(index * 2, (index + 1) * 2), offset + 4 * 2);

          return [vertexData, offset + 4 * 3];
        }, [vertexData, offset]);

        return [newVertexData, newOffset];
      },
        [
          TypeArrayUtils.newFloat32Array(
            vertexBufferLength
          ),
          0
        ]);



  console.log("vertexData:", vertexData);

  WebGPUUtils.setSubData(0, vertexData, vertexBuffer);

  return [vertexBufferSize, vertexBuffer];
}


function buildPhongMaterialBuffer(device) {
  let phongMaterialBufferLength = Scene.computeScenePhongMaterialBufferDataLength();
  let phongMaterialBufferSize = phongMaterialBufferLength * Float32Array.BYTES_PER_ELEMENT;
  let phongMaterialBuffer = device.createBuffer({
    size: phongMaterialBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
  });

  let [phongMaterialData, _] =
    Scene.getScenePhongMaterialData()
      .reduce(([phongMaterialData, offset], [ambient, diffuse, specular, compressedData]) => {
        phongMaterialData.set(ambient, offset);
        phongMaterialData.set(diffuse, offset + 4);
        phongMaterialData.set(specular, offset + 8);
        phongMaterialData.set(compressedData, offset + 12);

        return [phongMaterialData, offset + 16];
      },
        [
          TypeArrayUtils.newFloat32Array(
            phongMaterialBufferLength
          ),
          0
        ]);



  console.log("phongMaterialData:", phongMaterialData);

  WebGPUUtils.setSubData(0, phongMaterialData, phongMaterialBuffer);

  return [phongMaterialBufferSize, phongMaterialBuffer];
}


function buildDirectionLightUniformBuffer(device) {
  let directionLightData = Scene.getSceneDirectionLightData();
  let directionLightUniformBuffer = device.createBuffer({
    size: directionLightData.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
  });

  directionLightUniformBuffer.setSubData(0, directionLightData);

  return [directionLightData.byteLength, directionLightUniformBuffer];
}





(async function main() {
  let window = new WebGPUWindow({
    width: 640,
    height: 480,
    title: "WebGPU+RTX",
    resizable: false
  });

  let adapter = await GPU.requestAdapter({
    window,
    preferredBackend: "Vulkan"
  });

  let device = await adapter.requestDevice();

  let queue = device.getQueue();

  let context = window.getContext("webgpu");

  let swapChainFormat = await context.getSwapChainPreferredFormat(device);

  let swapChain = context.configureSwapChain({
    device: device,
    format: swapChainFormat
  });







  ArcballCameraControl.init(window);


  ManangeCameraMatrixUtils.init();



  let baseShaderPath = `examples/yyc/ray_tracing_demo/shaders`;


  // rasterization shaders
  let vertexShaderModule = device.createShaderModule({
    code: loadShaderFile(`${baseShaderPath}/screen.vert`)
  });
  let fragmentShaderModule = device.createShaderModule({
    code: loadShaderFile(`${baseShaderPath}/screen.frag`)
  });


  let shaderBindingTable = createShaderBindingTable(baseShaderPath, device);


  // this storage buffer is used as a pixel buffer
  // the result of the ray tracing pass gets written into it
  // and it gets copied to the screen in the rasterization pass
  let pixelBufferSize = window.width * window.height * 4 * Float32Array.BYTES_PER_ELEMENT;
  let pixelBuffer = device.createBuffer({
    size: pixelBufferSize,
    usage: GPUBufferUsage.STORAGE
  });





  let instanceContainer = ManageAccelartionContainer.buildContainers(device, queue);



  let rtConstantsBindGroupLayout = device.createBindGroupLayout({
    bindings: [
      {
        binding: 0,
        visibility: GPUShaderStage.RAY_GENERATION,
        type: "uniform-buffer"
      }
    ]
  });

  let rtGenBindGroupLayout = device.createBindGroupLayout({
    bindings: [
      {
        binding: 0,
        visibility: GPUShaderStage.RAY_GENERATION | GPUShaderStage.RAY_CLOSEST_HIT,
        type: "acceleration-container"
      },
      {
        binding: 1,
        visibility: GPUShaderStage.RAY_GENERATION,
        type: "storage-buffer"
      },
      {
        binding: 2,
        visibility: GPUShaderStage.RAY_GENERATION,
        type: "uniform-buffer"
      }
    ]
  });

  let rtCHitBindGroupLayout = device.createBindGroupLayout({
    bindings: [
      {
        binding: 0,
        visibility: GPUShaderStage.RAY_CLOSEST_HIT | GPUShaderStage.RAY_ANY_HIT,
        type: "readonly-storage-buffer"
      },
      {
        binding: 1,
        visibility: GPUShaderStage.RAY_CLOSEST_HIT,
        type: "readonly-storage-buffer"
      },
      {
        binding: 2,
        visibility: GPUShaderStage.RAY_CLOSEST_HIT,
        type: "readonly-storage-buffer"
      },
      {
        binding: 3,
        visibility: GPUShaderStage.RAY_CLOSEST_HIT,
        type: "readonly-storage-buffer"
      },
      {
        binding: 4,
        visibility: GPUShaderStage.RAY_CLOSEST_HIT | GPUShaderStage.RAY_ANY_HIT,
        type: "readonly-storage-buffer"
      },
      {
        binding: 5,
        visibility: GPUShaderStage.RAY_CLOSEST_HIT,
        type: "uniform-buffer"
      }
    ]
  });




  let [constantsBufferSize, constantsData, constantsBuffer] = buildConstantsBuffer(device);


  let rtConstantsBindGroup = device.createBindGroup({
    layout: rtConstantsBindGroupLayout,
    bindings: [
      {
        binding: 0,
        buffer: constantsBuffer,
        offset: 0,
        size: constantsBufferSize
      }
    ]
  });




  let [cameraBufferSize, cameraData, cameraBuffer] = buildCameraBuffer(device);


  let rtGenBindGroup = device.createBindGroup({
    layout: rtGenBindGroupLayout,
    bindings: [
      {
        binding: 0,
        accelerationContainer: instanceContainer,
        offset: 0,
        size: 0
      },
      {
        binding: 1,
        buffer: pixelBuffer,
        offset: 0,
        size: pixelBufferSize
      },
      {
        binding: 2,
        buffer: cameraBuffer,
        offset: 0,
        size: cameraBufferSize
      }
    ]
  });




  let [sceneDescBufferSize, sceneDescBuffer] = buildSceneDescBuffer(device);
  let [sceneGeometryOffsetDataBufferSize, sceneGeometryOffsetDataBuffer] = buildSceneGeometryOffsetDataBuffer(device);
  let [indexBufferSize, indexBuffer] = buildIndexBuffer(device);
  let [vertexBufferSize, vertexBuffer] = buildVertexBuffer(device);
  let [phongMaterialBufferSize, phongMaterialBuffer] = buildPhongMaterialBuffer(device);
  let [directionLightBufferSize, directionLightBuffer] = buildDirectionLightUniformBuffer(device);


  let rtCHitBindGroup = device.createBindGroup({
    layout: rtCHitBindGroupLayout,
    bindings: [
      {
        binding: 0,
        buffer: sceneDescBuffer,
        offset: 0,
        size: sceneDescBufferSize
      },
      {
        binding: 1,
        buffer: sceneGeometryOffsetDataBuffer,
        offset: 0,
        size: sceneGeometryOffsetDataBufferSize
      },
      {
        binding: 2,
        buffer: vertexBuffer,
        offset: 0,
        size: vertexBufferSize
      },
      {
        binding: 3,
        buffer: indexBuffer,
        offset: 0,
        size: indexBufferSize
      },
      {
        binding: 4,
        buffer: phongMaterialBuffer,
        offset: 0,
        size: phongMaterialBufferSize
      },
      {
        binding: 5,
        buffer: directionLightBuffer,
        offset: 0,
        size: directionLightBufferSize
      }
    ]
  });

  let rtPipeline = device.createRayTracingPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [rtConstantsBindGroupLayout, rtGenBindGroupLayout, rtCHitBindGroupLayout]
    }),
    rayTracingState: {
      shaderBindingTable,
      maxRecursionDepth: 2
    }
  });

  let resolutionData = new Float32Array([
    window.width, window.height
  ]);
  let resolutionUniformBuffer = device.createBuffer({
    size: resolutionData.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
  });
  resolutionUniformBuffer.setSubData(0, resolutionData);

  let renderBindGroupLayout = device.createBindGroupLayout({
    bindings: [
      {
        binding: 0,
        visibility: GPUShaderStage.FRAGMENT,
        type: "storage-buffer"
      },
      {
        binding: 1,
        visibility: GPUShaderStage.FRAGMENT,
        type: "uniform-buffer"
      }
    ]
  });

  let renderBindGroup = device.createBindGroup({
    layout: renderBindGroupLayout,
    bindings: [
      {
        binding: 0,
        buffer: pixelBuffer,
        offset: 0,
        size: pixelBufferSize
      },
      {
        binding: 1,
        buffer: resolutionUniformBuffer,
        offset: 0,
        size: resolutionData.byteLength
      }
    ]
  });

  let renderPipeline = device.createRenderPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [renderBindGroupLayout]
    }),
    sampleCount: 1,
    vertexStage: {
      module: vertexShaderModule,
      entryPoint: "main"
    },
    fragmentStage: {
      module: fragmentShaderModule,
      entryPoint: "main"
    },
    primitiveTopology: "triangle-list",
    vertexState: {
      indexFormat: "uint32",
      vertexBuffers: []
    },
    rasterizationState: {
      frontFace: "CCW",
      cullMode: "none"
    },
    colorStates: [{
      format: swapChainFormat,
      alphaBlend: {},
      colorBlend: {}
    }]
  });

  function _updateViewMatrixInverse([aspect, fovy, near, far], [cameraData, cameraBuffer]) {
    let lookFrom = ArcballCameraControl.getLookFrom();
    let lookAt = ArcballCameraControl.getTarget();
    let up = vec3.fromValues(0, 1, 0);

    let [viewMatrixInverse, projectionMatrixInverse] = ManangeCameraMatrixUtils.updateViewMatrixInverse([lookFrom, lookAt, up], [aspect, fovy, near, far])

    {
      let offset = 0x0;
      cameraData.set(viewMatrixInverse, offset);
      offset += viewMatrixInverse.length;
      cameraData.set(projectionMatrixInverse, offset);
      offset += projectionMatrixInverse.length;
    }
    cameraBuffer.setSubData(0, cameraData);
  }

  function _updateCameraUniformBuffer([aspect, fovy, near, far], [cameraData, cameraBuffer]) {
    _updateViewMatrixInverse([aspect, fovy, near, far], [cameraData, cameraBuffer]);
  }

  function _updateFrame(frame, [constantsData, constantsBuffer]) {
    constantsData[0] = frame;
    constantsBuffer.setSubData(0, constantsData);
  }

  function _updateConstantsUniformBuffer(frame, [constantsData, constantsBuffer]) {
    _updateFrame(frame, [constantsData, constantsBuffer]);
  }

  function _updateUniformBuffers([cameraData, cameraBuffer], [constantsData, constantsBuffer]) {
    _updateCameraUniformBuffer([Math.abs(window.width / window.height), (2 * Math.PI) / 5, 0.1, 4096.0], [cameraData, cameraBuffer]);
    _updateConstantsUniformBuffer(AA.getFrame(), [constantsData, constantsBuffer])
  }

  function onFrame() {
    if (!window.shouldClose()) setTimeout(onFrame, 1e3 / 60);

    _updateUniformBuffers([cameraData, cameraBuffer], [constantsData, constantsBuffer]);

    let backBufferView = swapChain.getCurrentTextureView();

    // ray tracing pass
    if (AA.notReachMaxFrame()) {
      let commandEncoder = device.createCommandEncoder({});
      let passEncoder = commandEncoder.beginRayTracingPass({});
      passEncoder.setPipeline(rtPipeline);
      passEncoder.setBindGroup(0, rtConstantsBindGroup);
      passEncoder.setBindGroup(1, rtGenBindGroup);
      passEncoder.setBindGroup(2, rtCHitBindGroup);
      passEncoder.traceRays(
        0, // sbt ray-generation offset
        1, // sbt ray-hit offset
        2, // sbt ray-miss offset
        window.width,  // query width dimension
        window.height, // query height dimension
        1              // query depth dimension
      );
      passEncoder.endPass();
      queue.submit([commandEncoder.finish()]);

    }
    // rasterization pass
    // the rasterization's pass only use right now,
    // is to bring the pixel buffer we write into from the
    // ray tracing pass, to the screen
    {
      let commandEncoder = device.createCommandEncoder({});
      let passEncoder = commandEncoder.beginRenderPass({
        colorAttachments: [{
          clearColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
          loadOp: "clear",
          storeOp: "store",
          attachment: backBufferView
        }]
      });
      passEncoder.setPipeline(renderPipeline);
      passEncoder.setBindGroup(0, renderBindGroup);
      passEncoder.draw(3, 1, 0, 0);
      passEncoder.endPass();
      queue.submit([commandEncoder.finish()]);
    }

    swapChain.present();

    AA.updateFrame();

    window.pollEvents();
  };
  setTimeout(onFrame, 1e3 / 60);

})();
