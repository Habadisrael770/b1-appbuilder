# APK Crash Analysis - MainActivity.kt

## Problem
APK opens and immediately crashes (closes) on Android device.

## Build Info
- App Name: Nadav Market
- Website URL: https://nadavmarket.online/
- Package: com.b1appbuilder.nadavmarket
- Build confirmed URL replacement: ✅

## MainActivity.kt Code Review

### Potential Crash Points:

#### 1. **loadWebsiteUrl() - Line 129-136**
```kotlin
private fun loadWebsiteUrl(): String {
    return try {
        val config = loadAppConfig()
        config["websiteUrl"] as? String ?: "https://example.com"  // ❌ PROBLEM: Always returns example.com
    } catch (e: Exception) {
        "https://example.com"  // ❌ Fallback also returns example.com
    }
}
```
**Issue:** This function ALWAYS returns `https://example.com` because `loadAppConfig()` returns hardcoded values!

#### 2. **loadAppConfig() - Line 138-150**
```kotlin
private fun loadAppConfig(): Map<String, Any> {
    return try {
        val json = assets.open("config.json").bufferedReader().use { it.readText() }
        // Parse JSON (using simple approach, can use Gson for production)
        mapOf(
            "websiteUrl" to "https://example.com",  // ❌ HARDCODED - ignores config.json!
            "appName" to "B1 App",
            "primaryColor" to "#007AFF"
        )
    } catch (e: IOException) {
        mapOf()
    }
}
```
**Issue:** Even though it reads `config.json`, it returns HARDCODED values instead of parsing the JSON!

#### 3. **WebSettings.ZoomDensity - Line 95**
```kotlin
defaultZoom = WebSettings.ZoomDensity.MEDIUM
```
**Issue:** `WebSettings.ZoomDensity` is DEPRECATED since API 19 and may cause crashes on newer Android versions.

#### 4. **FORCE_DARK - Line 111-113**
```kotlin
if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
    WebSettingsCompat.setForceDark(webView.settings, WebSettingsCompat.FORCE_DARK_AUTO)
}
```
**Issue:** `FORCE_DARK` is deprecated in newer WebView versions and may cause issues.

## Root Cause Analysis

**PRIMARY ISSUE:** The `loadWebsiteUrl()` function returns `https://example.com` instead of the actual URL because:
1. `loadAppConfig()` reads `config.json` but ignores its content
2. Returns hardcoded `mapOf()` with `https://example.com`

**SECONDARY ISSUE:** The `sed` replacement in GitHub Actions replaces URLs in `.kt` files, but:
- Line 132 and 134 have `https://example.com` hardcoded
- These may not be replaced if the sed pattern doesn't match

## Recommended Fixes

### Fix 1: Hardcode URL directly (simplest)
```kotlin
private val websiteUrl = "https://example.com"  // Will be replaced by sed
```

### Fix 2: Parse config.json properly
```kotlin
private fun loadAppConfig(): Map<String, Any> {
    return try {
        val json = assets.open("config.json").bufferedReader().use { it.readText() }
        val jsonObject = JSONObject(json)
        mapOf(
            "websiteUrl" to jsonObject.optString("websiteUrl", "https://example.com"),
            "appName" to jsonObject.optString("appName", "B1 App"),
            "primaryColor" to jsonObject.optString("primaryColor", "#007AFF")
        )
    } catch (e: Exception) {
        mapOf("websiteUrl" to "https://example.com")
    }
}
```

### Fix 3: Remove deprecated APIs
- Remove `defaultZoom = WebSettings.ZoomDensity.MEDIUM`
- Remove or update `FORCE_DARK` usage

## Files to Check
- `/build-templates/android/app/src/main/assets/config.json` - Does it exist?
- GitHub Actions sed replacement - Is it replacing ALL occurrences?
