struct InstanceData
{
  //TODO some field(e.g. objId) should be int, but treat as float because can't upload DataView!!!
  float objId;
  float primitiveCount;
  float indexCount;
};

struct Vertex
{
  // TODO should use vec3 pos, but it don't work now!!! so I use vec4 instead(vec2 is allowed with std140/430 but not allowed with scalar!!!)
  // vec3 pos;
  vec4 pos;
  vec4 normal;
  vec4 texCoord;
};