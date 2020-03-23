#version 460
#extension GL_NV_ray_tracing : require
#extension GL_EXT_nonuniform_qualifier : enable
#extension GL_EXT_scalar_block_layout : enable
#extension GL_GOOGLE_include_directive : enable
#pragma shader_stage(closest)

#include "wavefront.glsl"

layout(location = 0) rayPayloadInNV vec3 hitValue;

layout(scalar, set = 1, binding = 0) buffer SceneDesc { InstanceData i[]; } sceneDesc;
// TODO use array of blocks!how to upload data???
// TODO should use scalar, but it not work!!!use std 140 instead
layout(scalar, set = 1, binding = 1) buffer Vertices { Vertex v[]; } vertices;
layout(scalar, set = 1, binding = 2) buffer Indices { uint i[]; } indices;

hitAttributeNV vec3 attribs;


InstanceData getInstanceData(int instanceId){
  return sceneDesc.i[instanceId];
}

uint getObjId(InstanceData instanceData){
  return uint(instanceData.objId);
}

uint getPrimitiveCount(InstanceData instanceData){
  return uint(instanceData.primitiveCount);
}

uint getIndexCount(InstanceData instanceData){
  return uint(instanceData.indexCount);
}

ivec3 getTriangleIndices(uint objId, uint primitiveCount, uint primitiveId){
  return ivec3(indices.i[objId * 3 * primitiveCount + 3 * primitiveId + 0],   
                    indices.i[objId * 3 * primitiveCount + 3 * primitiveId + 1],   
                    indices.i[objId * 3 * primitiveCount + 3 * primitiveId + 2]);
}

Vertex getTriangleVertex(uint objId, uint indexCount, uint index){
  return vertices.v[objId * indexCount + index];
}

void main() {
  // // const vec3 bary = vec3(1.0 - attribs.x - attribs.y, attribs.x, attribs.y);

  // Object of this instance
  InstanceData instanceData = getInstanceData(gl_InstanceID);
  // InstanceData instanceData = getInstanceData(1);


  // InstanceData instanceData = getInstanceData(0);
  uint objId = getObjId(instanceData);
  uint primitiveCount = getPrimitiveCount(instanceData);
  uint indexCount = getIndexCount(instanceData);

  // Indices of the triangle
  // ivec3 ind = getTriangleIndices(objId, primitiveCount, 0);
  ivec3 ind = getTriangleIndices(objId, primitiveCount, gl_PrimitiveID);

  // Vertex of the triangle
  Vertex v0 = getTriangleVertex(objId, indexCount, ind.x);
  Vertex v1 = getTriangleVertex(objId, indexCount, ind.y);
  Vertex v2 = getTriangleVertex(objId, indexCount, ind.z);


// // float test = float(gl_InstanceID) + 0.5;
// float t = 0.0;
// if(indexCount <= 100){
// t = 0.2;
// }
// else{
//   // t = 1.0;
//   t = 1.0;
// }

  // hitValue = vec3(float(indexCount) / 100.0, 0.0, 0.0);
  // hitValue = vec3(t, 0.0, 0.0);
  // hitValue = vec3(test);
  // hitValue = vec3(float(ind.x) / 4., float(ind.y) / 4., float(ind.z) / 4.);
  // hitValue = vec3(float(ind.x) / 4., 0., 0.);
  // hitValue = vec3(0., float(ind.y) / 4., 0.);
  // hitValue = vec3(0., 0., float(ind.z) / 5.);
  // hitValue = vec3(v0.pos);
  // hitValue = vec3(v0.pos.y, 0.0,0.0);
  hitValue = vec3(v0.texCoord.x, 0.0,0.0);
  // hitValue = vec3(0.0,0.0,v0.pos.z);
  // hitValue = vec3(0.5);
}