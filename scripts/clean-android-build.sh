#!/bin/bash

echo "🧹 清理 Android 构建缓存和 Gradle 缓存..."

# 清理 Gradle transforms 缓存（这是导致 fbjni 错误的根本原因）
echo "清理 Gradle transforms 缓存..."
rm -rf ~/.gradle/caches/8.14.3/transforms/ 2>/dev/null || true
rm -rf ~/.gradle/caches/*/transforms/ 2>/dev/null || true

# 进入 Android 目录
cd android

# 清理本地构建目录
echo "清理本地构建目录..."
rm -rf app/build/
rm -rf app/.cxx/
rm -rf build/
rm -rf .gradle/

# 清理 CMake 生成的文件
echo "清理 CMake 生成的文件..."
find . -name "CMakeCache.txt" -delete 2>/dev/null || true
find . -name "CMakeFiles" -type d -exec rm -rf {} + 2>/dev/null || true

cd ..

# 清理 node_modules 中的构建文件
echo "清理 node_modules 中的构建文件..."
find node_modules -name ".cxx" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -path "*/build/generated/source/codegen/jni" -type d -exec rm -rf {} + 2>/dev/null || true
find node_modules -path "*/android/build" -type d -exec rm -rf {} + 2>/dev/null || true

# 清理 Gradle 构建（在清理缓存后）
echo "运行 Gradle clean..."
cd android
./gradlew clean --no-daemon 2>&1 | grep -v "CMake Error" || true
cd ..

echo "✅ Android 清理完成！"
echo ""
echo "现在请运行以下命令重新构建："
echo "  yarn android"
