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

uint getIndexOffset(InstanceData instanceData){
  return uint(instanceData.indexOffset);
}

uint getVertexOffset(InstanceData instanceData){
  return uint(instanceData.vertexOffset);
}


ivec3 getTriangleIndices(uint indexOffset, uint primitiveId){
  return ivec3(indices.i[indexOffset + 3 * primitiveId + 0],   
                    indices.i[indexOffset + 3 * primitiveId + 1],   
                    indices.i[indexOffset + 3 * primitiveId + 2]);
}

Vertex getTriangleVertex(uint vertexOffset, uint index){
  return vertices.v[vertexOffset + index];
}

void main() {
  // // const vec3 bary = vec3(1.0 - attribs.x - attribs.y, attribs.x, attribs.y);

  // Object of this instance
  InstanceData instanceData = getInstanceData(gl_InstanceID);
  // InstanceData instanceData = getInstanceData(1);


  // InstanceData instanceData = getInstanceData(0);
  uint indexOffset = getIndexOffset(instanceData);
  uint vertexOffset = getVertexOffset(instanceData);

  // Indices of the triangle
  // ivec3 ind = getTriangleIndices(objId, primitiveCount, 0);
  ivec3 ind = getTriangleIndices(indexOffset, gl_PrimitiveID);

  // Vertex of the triangle
  Vertex v0 = getTriangleVertex(vertexOffset, ind.x);
  Vertex v1 = getTriangleVertex(vertexOffset, ind.y);
  Vertex v2 = getTriangleVertex(vertexOffset, ind.z);


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



  // hitValue  =vec3(float(gl_PrimitiveID));
  // hitValue = vec3(float(ind.z) / 4., 0., 0.);
  // hitValue = vec3(float(indices.i[6]) / 4., 0., 0.);
  // hitValue = vec3(float(gl_InstanceID) / 3., 0., 0.);
  // hitValue = vec3(0., float(ind.y) / 4., 0.);
  // hitValue = vec3(0., 0., float(ind.z) / 5.);
  // hitValue = vec3(v0.pos);
  // hitValue = vec3(vertexOffset / 36, 0.0,0.0);
  hitValue = vec3(v0.texCoord.x, 0.0,0.0);
  // hitValue  =vec3(float(gl_InstanceID));
  // hitValue = vec3(0.0,0.0,v0.pos.z);
  // hitValue = vec3(0.5);
}