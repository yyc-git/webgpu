#version 460
#extension GL_NV_ray_tracing : require
#extension GL_EXT_nonuniform_qualifier : enable
#extension GL_EXT_scalar_block_layout : enable
#extension GL_GOOGLE_include_directive : enable
#pragma shader_stage(closest)

#include "raycommon.glsl"

layout(location = 0) rayPayloadInNV hitPayload prd;

void main() { prd.hitValue = vec3(0.0, 1.0, 0.0); }