package com.b1appbuilder

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * MainActivity - WebView wrapper based on WebToNative reference
 */
class MainActivity : AppCompatActivity() {
    
    private lateinit var webView: WebView
    
    // Configuration - URL is replaced by build script (sed command)
    private val websiteUrl = "https://example.com"
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        try {
            setContentView(R.layout.activity_main)
            webView = findViewById(R.id.webview)
            initializeWebView()
            loadWebsite()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    private fun initializeWebView() {
        webView.settings.apply {
            // Core settings (matching WebToNative)
            javaScriptEnabled = true
            domStorageEnabled = true
            allowContentAccess = true
            allowFileAccess = true
            
            // Cache settings
            cacheMode = WebSettings.LOAD_DEFAULT
            databaseEnabled = true
            
            // Zoom settings
            builtInZoomControls = true
            displayZoomControls = false
            setSupportZoom(true)
            
            // Viewport settings
            useWideViewPort = true
            loadWithOverviewMode = true
            
            // JavaScript window settings
            javaScriptCanOpenWindowsAutomatically = true
            setSupportMultipleWindows(true)
            
            // Mixed content (allow HTTP in HTTPS pages)
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            
            // Media settings
            mediaPlaybackRequiresUserGesture = false
        }
        
        // Cookie settings
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }
        
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                
                return when {
                    url.startsWith("http://") || url.startsWith("https://") -> {
                        false // Let WebView handle it
                    }
                    url.startsWith("tel:") -> {
                        try {
                            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                        true
                    }
                    url.startsWith("mailto:") -> {
                        try {
                            startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse(url)))
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                        true
                    }
                    url.startsWith("intent:") -> {
                        try {
                            val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                            startActivity(intent)
                        } catch (e: Exception) {
                            e.printStackTrace()
                        }
                        true
                    }
                    else -> false
                }
            }
            
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                super.onReceivedError(view, request, error)
                if (request.isForMainFrame) {
                    view.loadData(
                        "<html><body style='text-align:center;padding:50px;font-family:sans-serif;'>" +
                        "<h2>Unable to Load Page</h2>" +
                        "<p>Please check your internet connection and try again.</p>" +
                        "</body></html>",
                        "text/html",
                        "UTF-8"
                    )
                }
            }
        }
        
        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
            }
        }
    }
    
    private fun loadWebsite() {
        if (websiteUrl.isNotEmpty() && websiteUrl != "https://example.com") {
            webView.loadUrl(websiteUrl)
        } else {
            webView.loadData(
                "<html><body style='text-align:center;padding:50px;font-family:sans-serif;'>" +
                "<h2>B1 AppBuilder</h2>" +
                "<p>Website URL not configured.</p>" +
                "</body></html>",
                "text/html",
                "UTF-8"
            )
        }
    }
    
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }
    
    override fun onResume() {
        super.onResume()
        webView.onResume()
    }
    
    override fun onPause() {
        webView.onPause()
        super.onPause()
    }
    
    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
