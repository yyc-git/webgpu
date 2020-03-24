export let setMat3DataToBufferData = (offset, mat3, bufferData) => {
    bufferData[offset] = mat3[0];
    bufferData[offset + 1] = mat3[1];
    bufferData[offset + 2] = mat3[2];
    bufferData[offset + 3] = 0.0;
    bufferData[offset + 4] = mat3[3];
    bufferData[offset + 5] = mat3[4];
    bufferData[offset + 6] = mat3[5];
    bufferData[offset + 7] = 0.0;
    bufferData[offset + 8] = mat3[6];
    bufferData[offset + 9] = mat3[7];
    bufferData[offset + 10] = mat3[8];
    bufferData[offset + 11] = 0.0;

    return [bufferData, offset + 12];
};