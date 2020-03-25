import { loadShaderFile } from "./inliner.mjs";

let _createRtShaderModule = (baseShaderPath, device) => {
    let rayGenShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-generation.rgen`)
    });
    let rayChitShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-closest-hit.rchit`)
    });
    let rayAhitShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-any-hit.rahit`)
    });
    let rayMissShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-miss.rmiss`)
    });
    let rayShadowMissShaderModule = device.createShaderModule({
        code: loadShaderFile(`${baseShaderPath}/ray-shadow-miss.rmiss`)
    });

    return [rayGenShaderModule, rayChitShaderModule, rayAhitShaderModule, [rayMissShaderModule, rayShadowMissShaderModule]];
};

export let createShaderBindingTable = (baseShaderPath, device) => {
    let [rayGenShaderModule, rayChitShaderModule, rayAhitShaderModule, [rayMissShaderModule, rayShadowMissShaderModule]] = _createRtShaderModule(baseShaderPath, device);

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
                module: rayChitShaderModule,
                stage: GPUShaderStage.RAY_CLOSEST_HIT
            },
            {
                module: rayAhitShaderModule,
                stage: GPUShaderStage.RAY_ANY_HIT
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
                anyHitIndex: 2,
                closestHitIndex: 1, 
                intersectionIndex: -1
            },
            // miss group
            {
                type: "general",
                generalIndex: 3, // ray miss shader index
                anyHitIndex: -1,
                closestHitIndex: -1,
                intersectionIndex: -1
            },
            // miss group
            {
                type: "general",
                generalIndex: 4, // ray miss shader index
                anyHitIndex: -1,
                closestHitIndex: -1,
                intersectionIndex: -1
            }
        ]
    });
};