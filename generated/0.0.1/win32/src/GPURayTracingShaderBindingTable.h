#ifndef __GPU_RAY_TRACING_SHADER_BINDING_TABLE_H__
#define __GPU_RAY_TRACING_SHADER_BINDING_TABLE_H__

#include "Base.h"

class GPURayTracingShaderBindingTable : public Napi::ObjectWrap<GPURayTracingShaderBindingTable> {

  public:

    static Napi::Object Initialize(Napi::Env env, Napi::Object exports);
    static Napi::FunctionReference constructor;

    GPURayTracingShaderBindingTable(const Napi::CallbackInfo &info);
    ~GPURayTracingShaderBindingTable();

    Napi::Value getOffset(const Napi::CallbackInfo &info);

    Napi::Value destroy(const Napi::CallbackInfo &info);

    Napi::ObjectReference device;

    WGPURayTracingShaderBindingTable instance;

  private:

};

#endif
