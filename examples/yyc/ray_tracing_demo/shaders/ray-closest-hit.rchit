#version 460
#extension GL_NV_ray_tracing : require
#extension GL_EXT_nonuniform_qualifier : enable
#extension GL_EXT_scalar_block_layout : enable
#extension GL_GOOGLE_include_directive : enable
#pragma shader_stage(closest)

#include "wavefront.glsl"

layout(location = 0) rayPayloadInNV vec3 hitValue;

// layout(scalar, set = 1, binding = 0) buffer SceneDesc { InstanceData i[]; }
// sceneDesc;
layout(std140, set = 1, binding = 0) buffer SceneDesc { InstanceData i[]; }
sceneDesc;
// TODO use array of blocks!how to upload data???
// TODO should use scalar, but it not work!!!use std 140 instead
layout(scalar, set = 1, binding = 1) buffer Vertices { Vertex v[]; }
vertices;
layout(scalar, set = 1, binding = 2) buffer Indices { uint i[]; }
indices;

layout(std140, set = 1, binding = 3) uniform DirectionLight {
  vec4 compressedData;
  vec4 position;
}
uDirectionLight;

hitAttributeNV vec3 attribs;

InstanceData getInstanceData(int instanceId) { return sceneDesc.i[instanceId]; }

vec4 getCompressedData(InstanceData instanceData) {
  return instanceData.compressedData;
}

uint getVertexOffset(vec4 compressedData) { return uint(compressedData.x); }

uint getIndexOffset(vec4 compressedData) { return uint(compressedData.y); }

mat3 getNormalMatrix(InstanceData instanceData) {
  return instanceData.normalMatrix;
}

mat4 getModelMatrix(InstanceData instanceData) {
  return instanceData.modelMatrix;
}

ivec3 getTriangleIndices(uint indexOffset, uint primitiveId) {
  return ivec3(indices.i[indexOffset + 3 * primitiveId + 0],
               indices.i[indexOffset + 3 * primitiveId + 1],
               indices.i[indexOffset + 3 * primitiveId + 2]);
}

Vertex getTriangleVertex(uint vertexOffset, uint index) {
  return vertices.v[vertexOffset + index];
}

void main() {
  // Object of this instance
  InstanceData instanceData = getInstanceData(gl_InstanceID);

  vec4 compressedData = getCompressedData(instanceData);
  uint vertexOffset = getVertexOffset(compressedData);
  uint indexOffset = getIndexOffset(compressedData);

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
  // normal = normalize(vec3(getNormalMatrix(instanceData) * vec4(normal,
  normal = normalize(getNormalMatrix(instanceData) * normal);

  // Computing the coordinates of the hit position
  vec3 localPos = vec3(v0.position) * barycentrics.x +
                  vec3(v1.position) * barycentrics.y +
                  vec3(v2.position) * barycentrics.z;

  // Transforming the position to world space
  vec3 worldPos = vec3(getModelMatrix(instanceData) * vec4(localPos, 1.0));


  // Vector toward the light
  vec3 lightDir;
  // float lightIntensity = uDirectionLight.intensity;
  // float lightDistance  = 100000.0;

  lightDir = normalize(vec3(uDirectionLight.position) - vec3(0.0));

  float dotNL = max(dot(normal, lightDir), 0.2);

  hitValue = vec3(dotNL);

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