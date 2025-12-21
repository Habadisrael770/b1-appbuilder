package com.b1appbuilder

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.*
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

/**
 * MainActivity - Minimal WebView wrapper
 * 
 * SIMPLIFIED VERSION - Removed all non-essential features to prevent crashes
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
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
    
    @SuppressLint("SetJavaScriptEnabled")
    private fun initializeWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            builtInZoomControls = true
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            setSupportZoom(true)
        }
        
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                
                return when {
                    url.startsWith("http://") || url.startsWith("https://") -> {
                        false // Let WebView handle it
                    }
                    url.startsWith("tel:") -> {
                        startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                        true
                    }
                    url.startsWith("mailto:") -> {
                        startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse(url)))
                        true
                    }
                    else -> false
                }
            }
            
            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                super.onReceivedError(view, request, error)
                if (request.isForMainFrame) {
                    view.loadData(
                        "<html><body style='text-align:center;padding:50px;'>" +
                        "<h2>Error Loading Page</h2>" +
                        "<p>Please check your internet connection.</p>" +
                        "</body></html>",
                        "text/html",
                        "UTF-8"
                    )
                }
            }
        }
        
        webView.webChromeClient = WebChromeClient()
    }
    
    private fun loadWebsite() {
        if (websiteUrl.isNotEmpty()) {
            webView.loadUrl(websiteUrl)
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
}
