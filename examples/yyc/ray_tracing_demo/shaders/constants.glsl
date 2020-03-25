uint getFrame(vec4 compressedData) { return uint(compressedData.x); }

uint getNBSamples(vec4 compressedData) { return uint(compressedData.y); }

uint getMaxDepth(vec4 compressedData) { return uint(compressedData.z); }