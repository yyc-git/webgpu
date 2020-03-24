import { loadShaderFile } from "./inliner.mjs";

let _createRtShaderModule = (baseShaderPath, device) => {
    // ray-tracing shaders
    let rayGenShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-generation.rgen`)
    });
    let rayCHitShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-closest-hit.rchit`)
    });
    let rayMissShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-miss.rmiss`)
    });
    let rayShadowMissShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-shadow-miss.rmiss`)
    });

    return [rayGenShaderModule, rayCHitShaderModule, [rayMissShaderModule, rayShadowMissShaderModule]];
};


export let createShaderBindingTable = (baseShaderPath, device) => {
    let [rayGenShaderModule, rayCHitShaderModule, [rayMissShaderModule, rayShadowMissShaderModule]] = _createRtShaderModule(baseShaderPath, device);

    // collection of shader modules which get dynamically
    // invoked, for example when calling traceNV
    return device.createRayTracingShaderBindingTable({
        // stages are a collection of shaders
        // which get indexed in groups
        stages: [
            {
                module: rayGenShaderModule,
                stage: GPUShaderStage.RAY_GENERATION
            },
            {
                module: rayCHitShaderModule,
                stage: GPUShaderStage.RAY_CLOSEST_HIT
            },
            {
                module: rayMissShaderModule,
                stage: GPUShaderStage.RAY_MISS
            },
            {
                module: rayShadowMissShaderModule,
                stage: GPUShaderStage.RAY_MISS
            }
        ],
        // groups can index the shaders in stages
        // generalIndex: ray generation or ray miss stage index
        // anyHitIndex: ray any-hit stage index
        // closestHitIndex: ray closest-hit stage index
        // intersectionIndex: ray intersection stage index
        groups: [
            // generation group
            {
                type: "general",
                generalIndex: 0, // ray generation shader index
                anyHitIndex: -1,
                closestHitIndex: -1,
                intersectionIndex: -1
            },
            // hit group
            {
                type: "triangle-hit-group",
                generalIndex: -1,
                anyHitIndex: -1,
                closestHitIndex: 1, // ray closest-hit shader index
                intersectionIndex: -1
            },
            // miss group
            {
                type: "general",
                generalIndex: 2, // ray miss shader index
                anyHitIndex: -1,
                closestHitIndex: -1,
                intersectionIndex: -1
            },
            // miss group
            {
                type: "general",
                generalIndex: 3, // ray miss shader index
                anyHitIndex: -1,
                closestHitIndex: -1,
                intersectionIndex: -1
            }
        ]
    });
};