struct InstanceData {
  // TODO some field(e.g. vertexOffset) should be int, but treat as float
  // because can't upload DataView!!!
  // float vertexOffset;

  /*
   because scalar not work(not support float vertexOffset; mat4 modelMatrix;),
   so all aligned to vec4
   */

  vec4 compressedData;
  mat3 normalMatrix;
  mat4 modelMatrix;
};

struct Vertex {
  // TODO perf: compress texCoord to position,normal
  // TODO should use vec3 pos, but it don't work now!!! so I use vec4
  // instead(vec2 is allowed with std140/430 but not allowed with scalar!!!)
  // vec3 pos;
  vec4 position;
  vec4 normal;
  vec4 texCoord;
};