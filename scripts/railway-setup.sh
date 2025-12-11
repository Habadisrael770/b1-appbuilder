#!/bin/bash

# Railway Build Server Setup Script
# This script sets up the build environment on Railway

set -e

echo "🚀 Starting Railway Build Server Setup..."

# Update system
echo "📦 Updating system packages..."
apt-get update
apt-get install -y \
    curl \
    wget \
    git \
    openjdk-11-jdk \
    gradle \
    nodejs \
    npm \
    python3 \
    python3-pip \
    build-essential \
    libssl-dev \
    libffi-dev

# Setup Android SDK
echo "🤖 Setting up Android SDK..."
mkdir -p /opt/android-sdk
cd /opt/android-sdk

# Download Android SDK Command Line Tools
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip -q commandlinetools-linux-11076708_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true
rm commandlinetools-linux-11076708_latest.zip

# Set environment variables
export ANDROID_SDK_ROOT=/opt/android-sdk
export ANDROID_HOME=/opt/android-sdk
export PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH

# Accept licenses
yes | sdkmanager --licenses

# Install Android components
echo "📥 Installing Android SDK components..."
sdkmanager --install \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "ndk;25.2.9519653"

# Setup Node.js build tools
echo "🔧 Installing Node.js build tools..."
npm install -g \
    @react-native-community/cli \
    react-native-cli \
    eas-cli \
    fastlane

# Setup Gradle
echo "⚙️ Configuring Gradle..."
mkdir -p /root/.gradle
cat > /root/.gradle/gradle.properties << EOF
org.gradle.jvmargs=-Xmx4096m -XX:+UseG1GC
org.gradle.parallel=true
org.gradle.workers.max=4
android.useAndroidX=true
android.enableJetifier=true
EOF

# Setup build cache
echo "💾 Setting up build cache..."
mkdir -p /root/.gradle/caches
chmod -R 777 /root/.gradle

# Verify installation
echo "✅ Verifying installation..."
java -version
gradle --version
sdkmanager --list_installed

echo "🎉 Railway Build Server Setup Complete!"
echo ""
echo "Environment Variables Set:"
echo "  ANDROID_SDK_ROOT=/opt/android-sdk"
echo "  ANDROID_HOME=/opt/android-sdk"
echo "  JAVA_HOME=/usr/lib/jvm/java-11-openjdk-amd64"
echo ""
echo "Ready to build APK/IPA files!"
