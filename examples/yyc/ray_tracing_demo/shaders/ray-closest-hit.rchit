#version 460
#extension GL_NV_ray_tracing : require
#extension GL_EXT_nonuniform_qualifier : enable
#extension GL_EXT_scalar_block_layout : enable
#extension GL_GOOGLE_include_directive : enable
#pragma shader_stage(closest)

#include "raycommon.glsl"
#include "wavefront.glsl"

layout(location = 0) rayPayloadInNV hitPayload prd;
layout(location = 1) rayPayloadNV bool isShadowed;

layout(set = 1, binding = 0) uniform accelerationStructureNV topLevelAS;

layout(std140, set = 2, binding = 0) buffer SceneDesc { InstanceData i[]; }
sceneDesc;

/* scalar work with only uint fields! */
layout(scalar, set = 2, binding = 1) buffer SceneGeometryOffsetData {
  GeometryOffsetData o[];
}
sceneGeometryOffsetData;

// TODO use array of blocks!how to upload data???
layout(scalar, set = 2, binding = 2) buffer Vertices { Vertex v[]; }
vertices;
layout(scalar, set = 2, binding = 3) buffer Indices { uint i[]; }
indices;

layout(std140, set = 2, binding = 4) buffer MatColorBufferObject {
  PhongMaterial m[];
}
materials;

layout(std140, set = 2, binding = 5) uniform DirectionLight {
  vec4 compressedData;
  vec4 position;
}
uDirectionLight;

hitAttributeNV vec3 attribs;

InstanceData getInstanceData(int instanceIndex) {
  return sceneDesc.i[instanceIndex];
}

GeometryOffsetData getGeometryOffsetData(uint geometryIndex) {
  return sceneGeometryOffsetData.o[geometryIndex];
}

PhongMaterial getMaterial(uint materialIndex) {
  return materials.m[materialIndex];
}

float getDirectionLightIntensity() { return uDirectionLight.compressedData.x; }

ivec3 getTriangleIndices(uint indexOffset, uint primitiveIndex) {
  return ivec3(indices.i[indexOffset + 3 * primitiveIndex + 0],
               indices.i[indexOffset + 3 * primitiveIndex + 1],
               indices.i[indexOffset + 3 * primitiveIndex + 2]);
}

Vertex getTriangleVertex(uint vertexOffset, uint index) {
  return vertices.v[vertexOffset + index];
}

void main() {
  InstanceData instanceData = getInstanceData(gl_InstanceID);

  vec4 instanceDataCompressedData = getInstanceDataCompressedData(instanceData);
  uint geometryIndex = getGeometryIndex(instanceDataCompressedData);
  uint materialIndex = getMaterialIndex(instanceDataCompressedData);
  GeometryOffsetData geometryOffsetData = getGeometryOffsetData(geometryIndex);
  uint vertexOffset = getVertexOffset(geometryOffsetData);
  uint indexOffset = getIndexOffset(geometryOffsetData);

  // Indices of the triangle
  ivec3 ind = getTriangleIndices(indexOffset, gl_PrimitiveID);

  // Vertex of the triangle
  Vertex v0 = getTriangleVertex(vertexOffset, ind.x);
  Vertex v1 = getTriangleVertex(vertexOffset, ind.y);
  Vertex v2 = getTriangleVertex(vertexOffset, ind.z);

  const vec3 barycentrics =
      vec3(1.0 - attribs.x - attribs.y, attribs.x, attribs.y);

  // Computing the normal at hit position
  vec3 normal = vec3(v0.normal) * barycentrics.x +
                vec3(v1.normal) * barycentrics.y +
                vec3(v2.normal) * barycentrics.z;
  // Transforming the normal to world space
  normal = normalize(getNormalMatrix(instanceData) * normal);

  // Computing the coordinates of the hit position
  vec3 localPos = vec3(v0.position) * barycentrics.x +
                  vec3(v1.position) * barycentrics.y +
                  vec3(v2.position) * barycentrics.z;

  // Transforming the position to world space
  vec3 worldPos = vec3(getModelMatrix(instanceData) * vec4(localPos, 1.0));

  // Vector toward the light
  vec3 lightDir;
  float lightIntensity = getDirectionLightIntensity();
  float lightDistance = 100000.0;

  lightDir = normalize(vec3(uDirectionLight.position) - vec3(0.0));

  // float dotNL = max(dot(normal, lightDir), 0.2);
  PhongMaterial mat = getMaterial(materialIndex);

  // Diffuse
  vec3 diffuse = computeDiffuse(mat, lightDir, normal);

  vec3 specular = vec3(0.0);
  float attenuation = 1.0;

  // Tracing shadow ray only if the light is visible from the surface
  if (dot(normal, lightDir) > 0) {
    float tMin = 0.001;
    float tMax = lightDistance;
    // vec3 origin = gl_WorldRayOriginNV + gl_WorldRayDirectionNV * gl_HitTNV;
    vec3 origin = worldPos;
    vec3 rayDir = lightDir;
    // uint flags = gl_RayFlagsTerminateOnFirstHitNV | gl_RayFlagsOpaqueNV |
    //              gl_RayFlagsSkipClosestHitShaderNV;
    uint flags = gl_RayFlagsSkipClosestHitShaderNV;
    isShadowed = true;
    traceNV(topLevelAS, // acceleration structure
            flags,      // rayFlags
            0xFF,       // cullMask
            0,          // sbtRecordOffset
            0,          // sbtRecordStride
            1,          // missIndex
            origin,     // ray origin
            tMin,       // ray min range
            rayDir,     // ray direction
            tMax,       // ray max range
            1           // payload (location = 1)
    );

    if (isShadowed) {
      attenuation = 0.3;
    } else {
      // Specular
      specular = computeSpecular(mat, gl_WorldRayDirectionNV, lightDir, normal);
    }
  }

  uint illum = getMaterialIllum(mat);
  vec3 materialSpecular = getMaterialSpecular(mat);

  // Reflection
  if (illum == 3) {
    vec3 origin = worldPos;
    vec3 rayDir = reflect(gl_WorldRayDirectionNV, normal);
    prd.attenuation *= materialSpecular;
    prd.done = 0;
    prd.rayOrigin = origin;
    prd.rayDir = rayDir;
  }

  prd.hitValue = vec3(lightIntensity * attenuation * (diffuse + specular));

  // prd.hitValue = vec3(normal);

  // hitValue = vec3(dotNL);

  // hitValue = vec3(float(indexCount) / 100.0, 0.0, 0.0);
  // hitValue = vec3(t, 0.0, 0.0);
  // hitValue = vec3(test);
  // hitValue = vec3(float(ind.x) / 4., float(ind.y) / 4., float(ind.z) / 4.);

  // hitValue  =vec3(float(gl_PrimitiveID));
  // hitValue = vec3(float(ind.z) / 4., 0., 0.);
  // hitValue = vec3(float(indices.i[6]) / 4., 0., 0.);
  // hitValue = vec3(float(gl_InstanceID) / 3., 0., 0.);
  // hitValue = vec3(0., float(ind.y) / 4., 0.);
  // hitValue = vec3(0., 0., float(ind.z) / 5.);
  // hitValue = vec3(v0.position);
  // hitValue = vec3(vertexOffset / 36, 0.0,0.0);
  // hitValue = vec3(v0.texCoord.x, 0.0,0.0);
  // hitValue  =vec3(float(gl_InstanceID));
  // hitValue = vec3(0.0,0.0,v0.position.z);
  // hitValue = vec3(0.5);
}