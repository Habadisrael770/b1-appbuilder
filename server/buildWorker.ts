/**
 * Build Worker - Generates real APK/IPA files
 * This worker runs build jobs asynchronously
 */

import { execSync, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { storagePut } from "./storage";

interface BuildJobConfig {
  jobId: string;
  appId: string;
  appName: string;
  websiteUrl: string;
  platform: "IOS" | "ANDROID" | "BOTH";
  primaryColor: string;
  secondaryColor?: string;
  iconUrl?: string;
  splashScreenUrl?: string;
}

interface BuildJobResult {
  jobId: string;
  status: "COMPLETED" | "FAILED";
  androidUrl?: string;
  iosUrl?: string;
  error?: string;
}

// Build job queue and status tracking
const buildJobs = new Map<
  string,
  {
    status: "PENDING" | "BUILDING" | "COMPLETED" | "FAILED";
    progress: number;
    result?: BuildJobResult;
    error?: string;
  }
>();

/**
 * Start a build job
 */
export async function startBuildJob(
  config: BuildJobConfig
): Promise<{ jobId: string }> {
  // Add to queue
  buildJobs.set(config.jobId, {
    status: "PENDING",
    progress: 0
  });

  // Start async build
  processBuildJob(config).catch((error) => {
    console.error(`Build job ${config.jobId} failed:`, error);
    buildJobs.set(config.jobId, {
      status: "FAILED",
      progress: 0,
      error: error.message
    });
  });

  return { jobId: config.jobId };
}

/**
 * Get build job status
 */
export function getBuildJobStatus(jobId: string) {
  const job = buildJobs.get(jobId);
  if (!job) {
    return {
      status: "NOT_FOUND",
      progress: 0
    };
  }

  return {
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error
  };
}

/**
 * Process build job (async)
 */
async function processBuildJob(config: BuildJobConfig): Promise<void> {
  const workDir = `/tmp/builds/${config.jobId}`;

  try {
    // Create work directory
    if (!fs.existsSync(workDir)) {
      fs.mkdirSync(workDir, { recursive: true });
    }

    updateJobStatus(config.jobId, "BUILDING", 10);

    // Step 1: Create React Native project
    console.log(`[${config.jobId}] Creating React Native project...`);
    await createReactNativeProject(workDir, config.appName);
    updateJobStatus(config.jobId, "BUILDING", 20);

    // Step 2: Add WebView wrapper
    console.log(`[${config.jobId}] Adding WebView wrapper...`);
    await addWebViewWrapper(workDir, config.websiteUrl);
    updateJobStatus(config.jobId, "BUILDING", 30);

    // Step 3: Download and set assets
    if (config.iconUrl) {
      console.log(`[${config.jobId}] Downloading app icon...`);
      await downloadAsset(config.iconUrl, path.join(workDir, "icon.png"));
      updateJobStatus(config.jobId, "BUILDING", 40);
    }

    if (config.splashScreenUrl) {
      console.log(`[${config.jobId}] Downloading splash screen...`);
      await downloadAsset(
        config.splashScreenUrl,
        path.join(workDir, "splash.png")
      );
      updateJobStatus(config.jobId, "BUILDING", 50);
    }

    // Step 4: Customize app
    console.log(`[${config.jobId}] Customizing app...`);
    await customizeApp(workDir, config);
    updateJobStatus(config.jobId, "BUILDING", 60);

    // Step 5: Build APK (Android)
    let androidUrl: string | undefined;
    if (config.platform === "ANDROID" || config.platform === "BOTH") {
      console.log(`[${config.jobId}] Building Android APK...`);
      androidUrl = await buildAndroid(workDir, config);
      updateJobStatus(config.jobId, "BUILDING", 75);
    }

    // Step 6: Build IPA (iOS)
    let iosUrl: string | undefined;
    if (config.platform === "IOS" || config.platform === "BOTH") {
      console.log(`[${config.jobId}] Building iOS IPA...`);
      iosUrl = await buildIOS(workDir, config);
      updateJobStatus(config.jobId, "BUILDING", 90);
    }

    // Step 7: Mark as completed
    updateJobStatus(config.jobId, "COMPLETED", 100, {
      jobId: config.jobId,
      status: "COMPLETED",
      androidUrl,
      iosUrl
    });

    console.log(`[${config.jobId}] Build completed successfully`);

    // Cleanup
    setTimeout(() => {
      fs.rmSync(workDir, { recursive: true, force: true });
    }, 60000); // Clean up after 1 minute
  } catch (error) {
    console.error(`[${config.jobId}] Build failed:`, error);
    updateJobStatus(
      config.jobId,
      "FAILED",
      0,
      undefined,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * Create React Native project
 */
async function createReactNativeProject(
  workDir: string,
  appName: string
): Promise<void> {
  // Initialize React Native project
  execSync(
    `npx react-native init ${appName.replace(/\s+/g, "")} --directory ${workDir}`,
    {
      stdio: "inherit",
      cwd: "/tmp"
    }
  );

  // Install additional dependencies
  execSync("npm install react-native-webview", {
    cwd: workDir,
    stdio: "inherit"
  });
}

/**
 * Add WebView wrapper to React Native app
 */
async function addWebViewWrapper(
  workDir: string,
  websiteUrl: string
): Promise<void> {
  const appJsContent = `
import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: '${websiteUrl}' }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
});
`;

  fs.writeFileSync(path.join(workDir, "App.js"), appJsContent);
}

/**
 * Download asset from URL
 */
async function downloadAsset(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(outputPath, () => {}); // Delete file on error
        reject(err);
      });
  });
}

/**
 * Customize app with colors, icon, splash screen
 */
async function customizeApp(
  workDir: string,
  config: BuildJobConfig
): Promise<void> {
  // Update app.json with custom properties
  const appJsonPath = path.join(workDir, "app.json");
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

  appJson.name = config.appName;
  appJson.displayName = config.appName;
  appJson.expo = appJson.expo || {};
  appJson.expo.primaryColor = config.primaryColor;
  appJson.expo.secondaryColor = config.secondaryColor;

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

  // Copy icon if exists
  if (fs.existsSync(path.join(workDir, "icon.png"))) {
    const androidIconPath = path.join(
      workDir,
      "android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png"
    );
    fs.copyFileSync(path.join(workDir, "icon.png"), androidIconPath);
  }
}

/**
 * Build Android APK
 */
async function buildAndroid(
  workDir: string,
  config: BuildJobConfig
): Promise<string> {
  const androidDir = path.join(workDir, "android");

  // Build APK
  execSync("./gradlew assembleRelease", {
    cwd: androidDir,
    stdio: "inherit"
  });

  // Find APK file
  const apkPath = path.join(
    androidDir,
    "app/build/outputs/apk/release/app-release.apk"
  );

  if (!fs.existsSync(apkPath)) {
    throw new Error("APK build failed - file not found");
  }

  // Upload to S3
  const fileBuffer = fs.readFileSync(apkPath);
  const s3Key = `builds/${config.appId}/${config.appName}-android.apk`;
  const { url } = await storagePut(s3Key, fileBuffer, "application/vnd.android.package-archive");

  return url;
}

/**
 * Build iOS IPA
 */
async function buildIOS(
  workDir: string,
  config: BuildJobConfig
): Promise<string> {
  const iosDir = path.join(workDir, "ios");

  // Build IPA
  execSync(
    `xcodebuild -workspace ${config.appName}.xcworkspace -scheme ${config.appName} -configuration Release -derivedDataPath build`,
    {
      cwd: iosDir,
      stdio: "inherit"
    }
  );

  // Find IPA file
  const ipaPath = path.join(
    iosDir,
    `build/Build/Products/Release-iphoneos/${config.appName}.ipa`
  );

  if (!fs.existsSync(ipaPath)) {
    throw new Error("IPA build failed - file not found");
  }

  // Upload to S3
  const fileBuffer = fs.readFileSync(ipaPath);
  const s3Key = `builds/${config.appId}/${config.appName}-ios.ipa`;
  const { url } = await storagePut(s3Key, fileBuffer, "application/octet-stream");

  return url;
}

/**
 * Update job status
 */
function updateJobStatus(
  jobId: string,
  status: "PENDING" | "BUILDING" | "COMPLETED" | "FAILED",
  progress: number,
  result?: BuildJobResult,
  error?: string
): void {
  buildJobs.set(jobId, {
    status,
    progress,
    result,
    error
  });
}

/**
 * Cleanup old build jobs
 */
export function cleanupOldJobs(maxAgeMinutes: number = 60): void {
  const now = Date.now();
  const maxAge = maxAgeMinutes * 60 * 1000;

  // In production, you'd store timestamps with jobs
  // For now, just log cleanup
  console.log("Cleaning up old build jobs...");
}
