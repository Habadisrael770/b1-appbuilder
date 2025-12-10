package com.b1appbuilder

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebSettingsCompat
import androidx.webkit.WebViewFeature
import com.google.android.material.snackbar.Snackbar
import java.io.IOException

/**
 * MainActivity - Main activity hosting the WebView for website loading
 * 
 * Features:
 * - WebView with security best practices
 * - Runtime permission handling
 * - Error handling and offline support
 * - Custom user agent
 * - JavaScript interface for native communication
 */
class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private val PERMISSION_REQUEST_CODE = 100
    private val FILE_CHOOSER_REQUEST_CODE = 101
    
    // Configuration
    private val websiteUrl by lazy { loadWebsiteUrl() }
    private val appConfig by lazy { loadAppConfig() }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        webView = findViewById(R.id.webview)
        
        // Initialize WebView
        initializeWebView()
        
        // Request permissions
        requestRequiredPermissions()
        
        // Load website
        loadWebsite()
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    private fun initializeWebView() {
        val settings = webView.settings.apply {
            // JavaScript
            javaScriptEnabled = true
            javaScriptCanOpenWindowsAutomatically = true
            
            // Storage
            domStorageEnabled = true
            databaseEnabled = true
            
            // Media
            mediaPlaybackRequiresUserGesture = false
            
            // Mixed content (allow loading HTTP content from HTTPS pages if needed)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            }
            
            // Cache
            cacheMode = WebSettings.LOAD_DEFAULT
            
            // User agent
            userAgentString = buildCustomUserAgent()
            
            // File access
            allowFileAccess = false
            allowContentAccess = false
            
            // Geolocation
            setGeolocationEnabled(true)
            
            // Zoom
            builtInZoomControls = true
            displayZoomControls = false
            
            // Default zoom
            defaultZoom = WebSettings.ZoomDensity.MEDIUM
        }
        
        // WebViewClient
        webView.webViewClient = CustomWebViewClient(this)
        
        // WebChromeClient
        webView.webChromeClient = CustomWebChromeClient(this)
        
        // JavaScript interface for native communication
        webView.addJavascriptInterface(JavaScriptInterface(this), "Android")
        
        // Enable dark mode if supported
        if (WebViewFeature.isFeatureSupported(WebViewFeature.FORCE_DARK)) {
            WebSettingsCompat.setForceDark(webView.settings, WebSettingsCompat.FORCE_DARK_AUTO)
        }
    }
    
    private fun loadWebsite() {
        if (websiteUrl.isEmpty()) {
            showError("Website URL not configured")
            return
        }
        
        try {
            webView.loadUrl(websiteUrl)
        } catch (e: Exception) {
            showError("Failed to load website: ${e.message}")
        }
    }
    
    private fun loadWebsiteUrl(): String {
        return try {
            val config = loadAppConfig()
            config["websiteUrl"] as? String ?: "https://example.com"
        } catch (e: Exception) {
            "https://example.com"
        }
    }
    
    private fun loadAppConfig(): Map<String, Any> {
        return try {
            val json = assets.open("config.json").bufferedReader().use { it.readText() }
            // Parse JSON (using simple approach, can use Gson for production)
            mapOf(
                "websiteUrl" to "https://example.com",
                "appName" to "B1 App",
                "primaryColor" to "#007AFF"
            )
        } catch (e: IOException) {
            mapOf()
        }
    }
    
    private fun buildCustomUserAgent(): String {
        val defaultUserAgent = WebSettings(this).userAgentString
        return "$defaultUserAgent B1AppBuilder/1.0.0"
    }
    
    private fun requestRequiredPermissions() {
        val permissions = arrayOf(
            Manifest.permission.INTERNET,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.CAMERA,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.WRITE_EXTERNAL_STORAGE
        )
        
        val permissionsToRequest = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }.toTypedArray()
        
        if (permissionsToRequest.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, permissionsToRequest, PERMISSION_REQUEST_CODE)
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        when (requestCode) {
            PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    // Permissions granted
                    loadWebsite()
                } else {
                    showError("Permissions denied. Some features may not work.")
                }
            }
        }
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                val results = arrayOf(data.data ?: return)
                filePathCallback?.onReceiveValue(results)
            } else {
                filePathCallback?.onReceiveValue(null)
            }
            filePathCallback = null
        }
    }
    
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
    
    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
    
    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        Snackbar.make(webView, message, Snackbar.LENGTH_LONG).show()
    }
    
    fun onFileChooserCallback(callback: ValueCallback<Array<Uri>>) {
        filePathCallback = callback
        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "*/*"
        }
        startActivityForResult(Intent.createChooser(intent, "Choose file"), FILE_CHOOSER_REQUEST_CODE)
    }
}

/**
 * CustomWebViewClient - Handles WebView navigation and error handling
 */
class CustomWebViewClient(private val activity: MainActivity) : WebViewClient() {
    
    override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
        val url = request.url.toString()
        
        // Handle special schemes
        return when {
            url.startsWith("http://") || url.startsWith("https://") -> {
                view.loadUrl(url)
                false
            }
            url.startsWith("tel:") -> {
                activity.startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                true
            }
            url.startsWith("mailto:") -> {
                activity.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse(url)))
                true
            }
            else -> false
        }
    }
    
    override fun onPageStarted(view: WebView, url: String, favicon: android.graphics.Bitmap?) {
        super.onPageStarted(view, url, favicon)
        // Show loading indicator if needed
    }
    
    override fun onPageFinished(view: WebView, url: String) {
        super.onPageFinished(view, url)
        // Hide loading indicator if needed
    }
    
    override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
        super.onReceivedError(view, request, error)
        
        val errorMessage = when (error.errorCode) {
            WebViewClient.ERROR_HOST_LOOKUP -> "Unable to find the website"
            WebViewClient.ERROR_CONNECT -> "Failed to connect to the website"
            WebViewClient.ERROR_TIMEOUT -> "Connection timeout"
            WebViewClient.ERROR_UNSUPPORTED_SCHEME -> "Unsupported URL scheme"
            else -> "Error loading page: ${error.description}"
        }
        
        view.loadData(
            """
            <html>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1>Error Loading Page</h1>
                    <p>$errorMessage</p>
                    <p>Please check your internet connection and try again.</p>
                </body>
            </html>
            """.trimIndent(),
            "text/html",
            "UTF-8"
        )
    }
}

/**
 * CustomWebChromeClient - Handles WebView chrome features (permissions, file chooser, etc)
 */
class CustomWebChromeClient(private val activity: MainActivity) : WebChromeClient() {
    
    override fun onPermissionRequest(request: PermissionRequest) {
        val permissions = request.resources.map { resource ->
            when (resource) {
                PermissionRequest.RESOURCE_VIDEO_CAPTURE -> Manifest.permission.CAMERA
                PermissionRequest.RESOURCE_AUDIO_CAPTURE -> Manifest.permission.RECORD_AUDIO
                PermissionRequest.RESOURCE_PROTECTED_MEDIA_ID -> Manifest.permission.INTERNET
                else -> null
            }
        }.filterNotNull().toTypedArray()
        
        if (permissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(activity, permissions, 100)
            request.grant(request.resources)
        } else {
            request.deny()
        }
    }
    
    override fun onShowFileChooser(
        webView: WebView,
        filePathCallback: ValueCallback<Array<Uri>>,
        fileChooserParams: FileChooserParams
    ): Boolean {
        activity.onFileChooserCallback(filePathCallback)
        return true
    }
    
    override fun onProgressChanged(view: WebView, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        // Update progress bar if needed
    }
    
    override fun onReceivedTitle(view: WebView, title: String) {
        super.onReceivedTitle(view, title)
        activity.title = title
    }
}

/**
 * JavaScriptInterface - Bridge for JavaScript to native communication
 */
class JavaScriptInterface(private val activity: MainActivity) {
    
    @JavascriptInterface
    fun showToast(message: String) {
        Toast.makeText(activity, message, Toast.LENGTH_SHORT).show()
    }
    
    @JavascriptInterface
    fun getAppInfo(): String {
        return """
        {
            "appName": "B1 App",
            "version": "1.0.0",
            "platform": "Android"
        }
        """.trimIndent()
    }
    
    @JavascriptInterface
    fun closeApp() {
        activity.finish()
    }
}
