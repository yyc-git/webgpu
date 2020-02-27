# This file is generated by gyp; do not edit.

TOOLSET := target
TARGET := addon-linux
DEFS_Debug := \
	'-DNODE_GYP_MODULE_NAME=addon-linux' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DDAWN_ENABLE_BACKEND_NULL' \
	'-DDAWN_ENABLE_BACKEND_VULKAN' \
	'-DDAWN_NATIVE_SHARED_LIBRARY' \
	'-DDAWN_WIRE_SHARED_LIBRARY' \
	'-DWGPU_SHARED_LIBRARY' \
	'-DNAPI_CPP_EXCEPTIONS' \
	'-DBUILDING_NODE_EXTENSION' \
	'-DDEBUG' \
	'-D_DEBUG' \
	'-DV8_ENABLE_CHECKS'

# Flags passed to all source files.
CFLAGS_Debug := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-m64 \
	-std=c++14 \
	-fexceptions \
	-Wno-switch \
	-Wno-unused \
	-Wno-uninitialized \
	-g \
	-O0

# Flags passed to only C files.
CFLAGS_C_Debug :=

# Flags passed to only C++ files.
CFLAGS_CC_Debug := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++1y \
	-std=c++14 \
	-fexceptions \
	-Wno-switch \
	-Wno-unused \
	-Wno-uninitialized

INCS_Debug := \
	-I/home/user/.cache/node-gyp/13.9.0/include/node \
	-I/home/user/.cache/node-gyp/13.9.0/src \
	-I/home/user/.cache/node-gyp/13.9.0/deps/openssl/config \
	-I/home/user/.cache/node-gyp/13.9.0/deps/openssl/openssl/include \
	-I/home/user/.cache/node-gyp/13.9.0/deps/uv/include \
	-I/home/user/.cache/node-gyp/13.9.0/deps/zlib \
	-I/home/user/.cache/node-gyp/13.9.0/deps/v8/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/node_modules/node-addon-api \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/vulkan-headers/include \
	-I$(srcdir)/../../../lib/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/src/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/out/Shared/gen/src/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/shaderc/libshaderc/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/shaderc/libshaderc/src/shaderc.cc \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/shaderc/libshaderc/src/shaderc_private.h

DEFS_Release := \
	'-DNODE_GYP_MODULE_NAME=addon-linux' \
	'-DUSING_UV_SHARED=1' \
	'-DUSING_V8_SHARED=1' \
	'-DV8_DEPRECATION_WARNINGS=1' \
	'-DV8_DEPRECATION_WARNINGS' \
	'-DV8_IMMINENT_DEPRECATION_WARNINGS' \
	'-D_LARGEFILE_SOURCE' \
	'-D_FILE_OFFSET_BITS=64' \
	'-D__STDC_FORMAT_MACROS' \
	'-DOPENSSL_NO_PINSHARED' \
	'-DOPENSSL_THREADS' \
	'-DDAWN_ENABLE_BACKEND_NULL' \
	'-DDAWN_ENABLE_BACKEND_VULKAN' \
	'-DDAWN_NATIVE_SHARED_LIBRARY' \
	'-DDAWN_WIRE_SHARED_LIBRARY' \
	'-DWGPU_SHARED_LIBRARY' \
	'-DNAPI_CPP_EXCEPTIONS' \
	'-DBUILDING_NODE_EXTENSION'

# Flags passed to all source files.
CFLAGS_Release := \
	-fPIC \
	-pthread \
	-Wall \
	-Wextra \
	-Wno-unused-parameter \
	-m64 \
	-std=c++14 \
	-fexceptions \
	-Wno-switch \
	-Wno-unused \
	-Wno-uninitialized \
	-O3 \
	-fno-omit-frame-pointer

# Flags passed to only C files.
CFLAGS_C_Release :=

# Flags passed to only C++ files.
CFLAGS_CC_Release := \
	-fno-rtti \
	-fno-exceptions \
	-std=gnu++1y \
	-std=c++14 \
	-fexceptions \
	-Wno-switch \
	-Wno-unused \
	-Wno-uninitialized

INCS_Release := \
	-I/home/user/.cache/node-gyp/13.9.0/include/node \
	-I/home/user/.cache/node-gyp/13.9.0/src \
	-I/home/user/.cache/node-gyp/13.9.0/deps/openssl/config \
	-I/home/user/.cache/node-gyp/13.9.0/deps/openssl/openssl/include \
	-I/home/user/.cache/node-gyp/13.9.0/deps/uv/include \
	-I/home/user/.cache/node-gyp/13.9.0/deps/zlib \
	-I/home/user/.cache/node-gyp/13.9.0/deps/v8/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/node_modules/node-addon-api \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/vulkan-headers/include \
	-I$(srcdir)/../../../lib/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/src/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/out/Shared/gen/src/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/shaderc/libshaderc/include \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/shaderc/libshaderc/src/shaderc.cc \
	-I/mnt/c/Users/maier/Desktop/LXSS_SHARED/dawn-ray-tracing/third_party/shaderc/libshaderc/src/shaderc_private.h

OBJS := \
	$(obj).target/$(TARGET)/src/index.o \
	$(obj).target/$(TARGET)/src/BackendBinding.o \
	$(obj).target/$(TARGET)/src/DescriptorDecoder.o \
	$(obj).target/$(TARGET)/src/GPU.o \
	$(obj).target/$(TARGET)/src/GPUAdapter.o \
	$(obj).target/$(TARGET)/src/GPUBindGroup.o \
	$(obj).target/$(TARGET)/src/GPUBindGroupLayout.o \
	$(obj).target/$(TARGET)/src/GPUBuffer.o \
	$(obj).target/$(TARGET)/src/GPUCanvasContext.o \
	$(obj).target/$(TARGET)/src/GPUCommandBuffer.o \
	$(obj).target/$(TARGET)/src/GPUCommandEncoder.o \
	$(obj).target/$(TARGET)/src/GPUComputePassEncoder.o \
	$(obj).target/$(TARGET)/src/GPUComputePipeline.o \
	$(obj).target/$(TARGET)/src/GPUDevice.o \
	$(obj).target/$(TARGET)/src/GPUFence.o \
	$(obj).target/$(TARGET)/src/GPUPipelineLayout.o \
	$(obj).target/$(TARGET)/src/GPUQueue.o \
	$(obj).target/$(TARGET)/src/GPURayTracingAccelerationContainer.o \
	$(obj).target/$(TARGET)/src/GPURayTracingPassEncoder.o \
	$(obj).target/$(TARGET)/src/GPURayTracingPipeline.o \
	$(obj).target/$(TARGET)/src/GPURayTracingShaderBindingTable.o \
	$(obj).target/$(TARGET)/src/GPURenderBundle.o \
	$(obj).target/$(TARGET)/src/GPURenderBundleEncoder.o \
	$(obj).target/$(TARGET)/src/GPURenderPassEncoder.o \
	$(obj).target/$(TARGET)/src/GPURenderPipeline.o \
	$(obj).target/$(TARGET)/src/GPUSampler.o \
	$(obj).target/$(TARGET)/src/GPUShaderModule.o \
	$(obj).target/$(TARGET)/src/GPUSwapChain.o \
	$(obj).target/$(TARGET)/src/GPUTexture.o \
	$(obj).target/$(TARGET)/src/GPUTextureView.o \
	$(obj).target/$(TARGET)/src/NullBinding.o \
	$(obj).target/$(TARGET)/src/VulkanBinding.o \
	$(obj).target/$(TARGET)/src/WebGPUWindow.o

# Add to the list of files we specially track dependencies for.
all_deps += $(OBJS)

# CFLAGS et al overrides must be target-local.
# See "Target-specific Variable Values" in the GNU Make manual.
$(OBJS): TOOLSET := $(TOOLSET)
$(OBJS): GYP_CFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_C_$(BUILDTYPE))
$(OBJS): GYP_CXXFLAGS := $(DEFS_$(BUILDTYPE)) $(INCS_$(BUILDTYPE))  $(CFLAGS_$(BUILDTYPE)) $(CFLAGS_CC_$(BUILDTYPE))

# Suffix rules, putting all outputs into $(obj).

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(srcdir)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# Try building from generated source, too.

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj).$(TOOLSET)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

$(obj).$(TOOLSET)/$(TARGET)/%.o: $(obj)/%.cpp FORCE_DO_CMD
	@$(call do_cmd,cxx,1)

# End of this set of suffix rules
### Rules for final target.
LDFLAGS_Debug := \
	-pthread \
	-rdynamic \
	-m64 \
	-L/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/generated/0.0.1/linux/build/Release \
	-L/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/generated/0.0.1/linux/../../../lib/linux/x64 \
	-L/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/generated/0.0.1/linux/../../../lib/linux/x64/GLFW

LDFLAGS_Release := \
	-pthread \
	-rdynamic \
	-m64 \
	-L/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/generated/0.0.1/linux/build/Release \
	-L/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/generated/0.0.1/linux/../../../lib/linux/x64 \
	-L/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/generated/0.0.1/linux/../../../lib/linux/x64/GLFW

LIBS := \
	-Wl,-rpath,/mnt/c/Users/maier/Desktop/LXSS_SHARED/webgpu/generated/0.0.1/linux/build/Release \
	-lglfw3 \
	-ldawn_native \
	-ldawn_proc \
	-ldawn_wire \
	-lshaderc_spvc \
	-lshaderc \
	-lXrandr \
	-lXi \
	-lX11 \
	-lXxf86vm \
	-lXinerama \
	-lXcursor \
	-ldl \
	-pthread

$(obj).target/addon-linux.node: GYP_LDFLAGS := $(LDFLAGS_$(BUILDTYPE))
$(obj).target/addon-linux.node: LIBS := $(LIBS)
$(obj).target/addon-linux.node: TOOLSET := $(TOOLSET)
$(obj).target/addon-linux.node: $(OBJS) FORCE_DO_CMD
	$(call do_cmd,solink_module)

all_deps += $(obj).target/addon-linux.node
# Add target alias
.PHONY: addon-linux
addon-linux: $(builddir)/addon-linux.node

# Copy this to the executable output path.
$(builddir)/addon-linux.node: TOOLSET := $(TOOLSET)
$(builddir)/addon-linux.node: $(obj).target/addon-linux.node FORCE_DO_CMD
	$(call do_cmd,copy)

all_deps += $(builddir)/addon-linux.node
# Short alias for building this executable.
.PHONY: addon-linux.node
addon-linux.node: $(obj).target/addon-linux.node $(builddir)/addon-linux.node

# Add executable to "all" target.
.PHONY: all
all: $(builddir)/addon-linux.node

