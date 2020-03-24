struct InstanceData {
  // TODO some field(e.g. objId) should be int, but treat as float
  // because can't upload DataView!!!
  // float vertexOffset;

  // TODO perf: remove compressedData by pack objId to normalMatrix

  /*
   because scalar not work(not support float objId; mat4 modelMatrix;),
   so all aligned to vec4
   */

  // include objIndex
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
  // uint materialIndex;
};

struct PhongMaterial {
  vec4 ambient;
  vec4 diffuse;
  vec4 specular;
  // vec3  transmittance;
  // vec3  emission;

  // include shininess,illum
  // illumination model (http://www.fileformat.info/format/material/)
  vec4 compressedData;

  // float ior;       // index of refraction
  // float dissolve;  // 1 == opaque; 0 == fully transparent
  // int illum;
  //  int   textureId;
};

vec3 _getMaterialAmbient(PhongMaterial mat) { return vec3(mat.ambient); }

vec3 _getMaterialDiffuse(PhongMaterial mat) { return vec3(mat.diffuse); }

vec3 _getMaterialSpecular(PhongMaterial mat) { return vec3(mat.specular); }

float _getMaterialShiniess(PhongMaterial mat) { return mat.compressedData.x; }

uint _getMaterialIllum(PhongMaterial mat) { return uint(mat.compressedData.y); }

vec3 computeDiffuse(PhongMaterial mat, vec3 lightDir, vec3 normal) {
  // Lambertian
  float dotNL = max(dot(normal, lightDir), 0.0);
  vec3 c = _getMaterialDiffuse(mat) * dotNL;
  if (_getMaterialIllum(mat) >= 1)
    return c + _getMaterialAmbient(mat);
}

vec3 computeSpecular(PhongMaterial mat, vec3 viewDir, vec3 lightDir,
                     vec3 normal) {
  if (_getMaterialIllum(mat) < 2)
    return vec3(0);

  // Compute specular only if not in shadow
  const float kPi = 3.14159265;
  const float kShininess = max(_getMaterialShiniess(mat), 4.0);

  // Specular
  const float kEnergyConservation = (2.0 + kShininess) / (2.0 * kPi);
  vec3 V = normalize(-viewDir);
  vec3 R = reflect(-lightDir, normal);
  float specular = kEnergyConservation * pow(max(dot(V, R), 0.0), kShininess);

  return vec3(_getMaterialSpecular(mat) * specular);
}
