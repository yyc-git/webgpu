struct InstanceData
{
  //TODO some field(e.g. vertexOffset) should be int, but treat as float because can't upload DataView!!!
  float vertexOffset;
  float indexOffset;
};

struct Vertex
{
  // TODO should use vec3 pos, but it don't work now!!! so I use vec4 instead(vec2 is allowed with std140/430 but not allowed with scalar!!!)
  // vec3 pos;
  vec4 pos;
  vec4 normal;
  vec4 texCoord;
};