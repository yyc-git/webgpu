struct InstanceData {
  // TODO some field(e.g. objId) should be int, but treat as float
  // because can't upload DataView!!!
  // float vertexOffset;

  // TODO perf: remove compressedData by pack objId to normalMatrix

  /*
   because scalar not work(not support float objId; mat4 modelMatrix;),
   so all aligned to vec4
   */

  vec4 compressedData;
  mat3 normalMatrix;
  mat4 modelMatrix;
};

struct Vertex {
  // TODO perf: pack texCoord to position,normal
  // TODO should use vec3 pos, but it don't work now!!! so I use vec4
  // instead(vec2 is allowed with std140/430 but not allowed with scalar!!!)
  // vec3 pos;
  vec4 position;
  vec4 normal;
  vec4 texCoord;
};


/*
extract this to avoid duplicate instead of move this into InstanceData.
*/
struct ObjOffsetData {
  uint vertexOffset;
  uint indexOffset;
  // int materialIndex;
};