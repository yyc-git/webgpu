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

Object.assign(global, WebGPU);
Object.assign(global, glMatrix);

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
      .reduce(([sceneDescData, offset], [objIndex, normalMatrix, modelMatrix], i) => {
        sceneDescData[offset] = objIndex;

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


function buildSceneObjOffsetDataBuffer(device) {
  let instanceCount = Scene.getSceneInstanCount();

  let sceneObjOffsetDataCount = 2;
  let sceneObjOffsetBufferSize = instanceCount * sceneObjOffsetDataCount * Uint32Array.BYTES_PER_ELEMENT;
  let sceneObjOffsetBuffer = device.createBuffer({
    size: sceneObjOffsetBufferSize,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE
  });


  let [sceneObjOffsetData, _] =
    Scene.getSceneObjData()
      .reduce(([sceneObjOffsetData, offset], [vertexOffset, indexOffset], i) => {
        sceneObjOffsetData[offset] = vertexOffset;
        sceneObjOffsetData[offset + 1] = indexOffset;

        return [sceneObjOffsetData, offset + 2];
      }, [TypeArrayUtils.newUint32Array(
        sceneObjOffsetBufferSize / Uint32Array.BYTES_PER_ELEMENT
      ), 0]);

  console.log("sceneObjOffsetData:", sceneObjOffsetData)

  WebGPUUtils.setSubData(0, sceneObjOffsetData, sceneObjOffsetBuffer);

  return [sceneObjOffsetBufferSize, sceneObjOffsetBuffer];
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


function buildDirectionLightUniformBuffer(device) {
  let directionLightData = TypeArrayUtils.newFloat32Array([
    1.0,
    0.0,
    0.0,
    0.0,

    0.0,
    0.0,
    1.0,
    0.0
  ]);
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
    title: "WebGPU",
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

  let aspect = Math.abs(window.width / window.height);

  let mView = mat4.create();
  let mProjection = mat4.create();

  // mat4.perspective(mProjection, (2 * Math.PI) / 5, -aspect, 0.1, 4096.0);
  mat4.perspective(mProjection, (2 * Math.PI) / 5, aspect, 0.1, 4096.0);

  // mat4.translate(mView, mView, vec3.fromValues(0, 0, -2));

  // mat4.lookAt(mView, vec3.fromValues(0, 2, 2), vec3.fromValues(0, 2, 0), vec3.fromValues(0, 1, 0));
  mat4.lookAt(mView, vec3.fromValues(0, 0, 10), vec3.fromValues(0, 0, 0), vec3.fromValues(0, 1, 0));

  // invert
  mat4.invert(mView, mView);
  mat4.invert(mProjection, mProjection);
  // mProjection[5] *= -1.0;

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



  let rtGenBindGroupLayout = device.createBindGroupLayout({
    bindings: [
      {
        binding: 0,
        visibility: GPUShaderStage.RAY_GENERATION,
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
        visibility: GPUShaderStage.RAY_CLOSEST_HIT,
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
        visibility: GPUShaderStage.RAY_CLOSEST_HIT,
        type: "uniform-buffer"
      }
    ]
  });


  let cameraData = new Float32Array(
    // (mat4) view
    mView.byteLength +
    // (mat4) projection
    mProjection.byteLength
  );
  let cameraUniformBuffer = device.createBuffer({
    size: cameraData.byteLength,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
  });
  // fill in the data
  {
    let offset = 0x0;
    cameraData.set(mView, offset);
    offset += mView.length;
    cameraData.set(mProjection, offset);
    offset += mProjection.length;
  }
  cameraUniformBuffer.setSubData(0, cameraData);

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
        buffer: cameraUniformBuffer,
        offset: 0,
        size: cameraData.byteLength
      }
    ]
  });




  let [sceneDescBufferSize, sceneDescBuffer] = buildSceneDescBuffer(device);
  let [sceneObjOffsetDataBufferSize, sceneObjOffsetDataBuffer] = buildSceneObjOffsetDataBuffer(device);
  let [indexBufferSize, indexBuffer] = buildIndexBuffer(device);
  let [vertexBufferSize, vertexBuffer] = buildVertexBuffer(device);
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
        buffer: sceneObjOffsetDataBuffer,
        offset: 0,
        size: sceneObjOffsetDataBufferSize
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
        buffer: directionLightBuffer,
        offset: 0,
        size: directionLightBufferSize
      }
    ]
  });

  let rtPipeline = device.createRayTracingPipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [rtGenBindGroupLayout, rtCHitBindGroupLayout]
    }),
    rayTracingState: {
      shaderBindingTable,
      maxRecursionDepth: 1
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

  function onFrame() {
    if (!window.shouldClose()) setTimeout(onFrame, 1e3 / 60);

    let backBufferView = swapChain.getCurrentTextureView();

    // ray tracing pass
    {
      let commandEncoder = device.createCommandEncoder({});
      let passEncoder = commandEncoder.beginRayTracingPass({});
      passEncoder.setPipeline(rtPipeline);
      passEncoder.setBindGroup(0, rtGenBindGroup);
      passEncoder.setBindGroup(1, rtCHitBindGroup);
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
    window.pollEvents();
  };
  setTimeout(onFrame, 1e3 / 60);

})();
