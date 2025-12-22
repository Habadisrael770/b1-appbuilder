package com.b1appbuilder;

import android.app.Activity;
import android.content.Intent;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONObject;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * MainActivity - WebToNative-style WebView wrapper
 * Reads configuration from assets/appConfig.json
 */
public class MainActivity extends Activity {
    
    private WebView webView;
    private String websiteUrl = "https://example.com";
    private String appName = "B1 App";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Load config from appConfig.json
        loadConfigFromAssets();
        
        // Create WebView programmatically (like WebToNative)
        webView = new WebView(this);
        setContentView(webView);
        
        // Configure WebView settings (matching WebToNative exactly)
        configureWebView();
        
        // Check internet and load
        if (isNetworkAvailable()) {
            webView.loadUrl(websiteUrl);
        } else {
            showNoInternetPage();
        }
    }
    
    /**
     * Load configuration from appConfig.json (WebToNative style)
     */
    private void loadConfigFromAssets() {
        try {
            InputStream is = getAssets().open("appConfig.json");
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            
            String json = new String(buffer, StandardCharsets.UTF_8);
            JSONObject config = new JSONObject(json);
            
            // Read website URL (testLink has priority, like WebToNative)
            if (config.has("testLink") && !config.getString("testLink").isEmpty()) {
                websiteUrl = config.getString("testLink");
            } else if (config.has("websiteLink")) {
                websiteUrl = config.getString("websiteLink");
            }
            
            // Read app name
            if (config.has("appName")) {
                appName = config.getString("appName");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            // Fallback URL if config fails
            websiteUrl = "https://example.com";
        }
    }
    
    /**
     * Configure WebView with all settings (matching WebToNative)
     */
    private void configureWebView() {
        WebSettings settings = webView.getSettings();
        
        // JavaScript settings
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        
        // Viewport settings
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        
        // Zoom settings
        settings.setBuiltInZoomControls(true);
        settings.setDisplayZoomControls(false);
        settings.setSupportZoom(true);
        
        // File access
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        // Mixed content (HTTP in HTTPS)
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        
        // Cache
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // JavaScript windows
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setSupportMultipleWindows(true);
        
        // Media
        settings.setMediaPlaybackRequiresUserGesture(false);
        
        // Encoding
        settings.setDefaultTextEncodingName("utf-8");
        
        // Cookies (important!)
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        cookieManager.setAcceptThirdPartyCookies(webView, true);
        
        // WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                
                // Handle external links
                if (shouldOpenExternally(url)) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return true;
                }
                
                // Handle tel: and mailto:
                if (url.startsWith("tel:")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse(url)));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return true;
                }
                
                if (url.startsWith("mailto:")) {
                    try {
                        startActivity(new Intent(Intent.ACTION_SENDTO, Uri.parse(url)));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                    return true;
                }
                
                // Load in WebView
                return false;
            }
            
            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    showNoInternetPage();
                }
            }
        });
        
        // WebChromeClient
        webView.setWebChromeClient(new WebChromeClient());
    }
    
    /**
     * Check if URL should open in external app (like WebToNative)
     */
    private boolean shouldOpenExternally(String url) {
        String[] externalDomains = {
            "facebook.com", "fb.com",
            "instagram.com",
            "twitter.com", "x.com",
            "whatsapp.com", "wa.me",
            "linkedin.com",
            "youtube.com", "youtu.be",
            "maps.google.com", "goo.gl/maps",
            "play.google.com",
            "apps.apple.com"
        };
        
        String lowerUrl = url.toLowerCase();
        for (String domain : externalDomains) {
            if (lowerUrl.contains(domain)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check network availability
     */
    private boolean isNetworkAvailable() {
        try {
            ConnectivityManager cm = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            NetworkInfo activeNetwork = cm.getActiveNetworkInfo();
            return activeNetwork != null && activeNetwork.isConnected();
        } catch (Exception e) {
            return true; // Assume connected if check fails
        }
    }
    
    /**
     * Show no internet page (Hebrew, like WebToNative)
     */
    private void showNoInternetPage() {
        String html = "<!DOCTYPE html>" +
            "<html dir='rtl'>" +
            "<head>" +
            "<meta charset='utf-8'>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
            "<style>" +
            "body { font-family: Arial, sans-serif; text-align: center; padding: 50px 20px; background: #fff; margin: 0; }" +
            "h1 { color: #00A86B; font-size: 48px; margin-bottom: 10px; }" +
            "p { color: #363942; font-size: 18px; margin: 10px 0; }" +
            ".btn { background: #00A86B; color: white; border: none; padding: 15px 40px; " +
            "font-size: 18px; border-radius: 8px; margin-top: 30px; cursor: pointer; }" +
            ".btn:active { background: #008556; }" +
            "</style>" +
            "</head>" +
            "<body>" +
            "<h1>אופס!</h1>" +
            "<p>אין חיבור לאינטרנט</p>" +
            "<p>אנא בדוק את ההגדרות ונסה שוב</p>" +
            "<button class='btn' onclick='window.location.reload()'>נסה שוב</button>" +
            "</body>" +
            "</html>";
        
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }
    
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }
    
    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }
    
    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
