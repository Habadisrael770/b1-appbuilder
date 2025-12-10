import UIKit
import WebKit
import AVFoundation

/**
 ViewController - Main view controller hosting the WKWebView
 
 Features:
 - WKWebView with security best practices
 - Runtime permission handling
 - Error handling and offline support
 - Custom user agent
 - JavaScript interface for native communication
 - Progress tracking
 - Gesture handling
 */
class ViewController: UIViewController, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    
    // MARK: - Properties
    private var webView: WKWebView!
    private var progressView: UIProgressView!
    private var activityIndicator: UIActivityIndicatorView!
    
    private let appConfig = AppConfig.shared
    private var webViewObservation: NSKeyValueObservation?
    
    // MARK: - Lifecycle
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setupUI()
        setupWebView()
        requestPermissions()
        loadWebsite()
    }
    
    deinit {
        webViewObservation?.invalidate()
    }
    
    // MARK: - Setup Methods
    private func setupUI() {
        // Navigation bar
        navigationItem.title = appConfig.appName
        navigationController?.navigationBar.tintColor = appConfig.primaryColor
        
        // Progress view
        progressView = UIProgressView(progressViewStyle: .bar)
        progressView.tintColor = appConfig.primaryColor
        progressView.trackTintColor = .systemGray5
        view.addSubview(progressView)
        progressView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            progressView.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor),
            progressView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            progressView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            progressView.heightAnchor.constraint(equalToConstant: 2)
        ])
        
        // Activity indicator
        activityIndicator = UIActivityIndicatorView(style: .medium)
        activityIndicator.color = appConfig.primaryColor
        navigationItem.rightBarButtonItem = UIBarButtonItem(customView: activityIndicator)
    }
    
    private func setupWebView() {
        // WebView configuration
        let config = WKWebViewConfiguration()
        
        // User content controller
        let userContentController = WKUserContentController()
        
        // Add JavaScript interface
        userContentController.add(self, name: "iOS")
        
        // Inject CSS for better mobile experience
        let cssScript = """
        var style = document.createElement('style');
        style.textContent = `
            body { margin: 0; padding: 0; }
            * { -webkit-user-select: text; -webkit-touch-callout: default; }
            input, textarea, select { font-size: 16px; }
        `;
        document.head.appendChild(style);
        """
        let scriptMessage = WKUserScript(source: cssScript, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        userContentController.addUserScript(scriptMessage)
        
        config.userContentController = userContentController
        
        // Preferences
        let preferences = WKPreferences()
        preferences.javaScriptEnabled = true
        preferences.javaScriptCanOpenWindowsAutomatically = true
        if #available(iOS 14.0, *) {
            preferences.isElementFullscreenEnabled = true
        }
        config.preferences = preferences
        
        // Media playback
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []
        
        // Create WebView
        webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        webView.scrollView.bounces = true
        webView.scrollView.alwaysBounceVertical = true
        
        // Custom user agent
        webView.customUserAgent = buildCustomUserAgent()
        
        // Add to view
        view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: progressView.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor)
        ])
        
        // Observe progress
        webViewObservation = webView.observe(\.estimatedProgress) { [weak self] _, _ in
            self?.progressView.progress = Float(self?.webView.estimatedProgress ?? 0)
        }
        
        // Add gesture recognizers
        let backGesture = UISwipeGestureRecognizer(target: self, action: #selector(handleBackSwipe))
        backGesture.direction = .right
        webView.addGestureRecognizer(backGesture)
    }
    
    private func loadWebsite() {
        guard let url = URL(string: appConfig.websiteUrl) else {
            showError("Invalid website URL")
            return
        }
        
        let request = URLRequest(url: url)
        webView.load(request)
    }
    
    private func buildCustomUserAgent() -> String {
        let defaultUserAgent = webView.value(forKey: "userAgent") as? String ?? ""
        return "\(defaultUserAgent) B1AppBuilder/1.0.0"
    }
    
    private func requestPermissions() {
        // Camera
        AVCaptureDevice.requestAccess(for: .video) { _ in }
        
        // Microphone
        AVCaptureDevice.requestAccess(for: .audio) { _ in }
        
        // Location (if needed)
        // CLLocationManager().requestWhenInUseAuthorization()
    }
    
    // MARK: - Actions
    @objc private func handleBackSwipe() {
        if webView.canGoBack {
            webView.goBack()
        }
    }
    
    // MARK: - WKNavigationDelegate
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        progressView.isHidden = false
        activityIndicator.startAnimating()
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        progressView.isHidden = true
        activityIndicator.stopAnimating()
        navigationItem.title = webView.title
    }
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        progressView.isHidden = true
        activityIndicator.stopAnimating()
        showError("Failed to load page: \(error.localizedDescription)")
    }
    
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        progressView.isHidden = true
        activityIndicator.stopAnimating()
        
        let errorCode = (error as NSError).code
        let message: String
        
        switch errorCode {
        case NSURLErrorNotConnectedToInternet:
            message = "No internet connection"
        case NSURLErrorTimedOut:
            message = "Connection timeout"
        case NSURLErrorCannotFindHost:
            message = "Unable to find the website"
        default:
            message = error.localizedDescription
        }
        
        showError(message)
    }
    
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let url = navigationAction.request.url else {
            decisionHandler(.allow)
            return
        }
        
        // Handle special schemes
        switch url.scheme {
        case "tel":
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
        case "mailto":
            UIApplication.shared.open(url)
            decisionHandler(.cancel)
        case "http", "https":
            decisionHandler(.allow)
        default:
            decisionHandler(.cancel)
        }
    }
    
    // MARK: - WKUIDelegate
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        if navigationAction.targetFrame == nil {
            webView.load(navigationAction.request)
        }
        return nil
    }
    
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler()
        })
        present(alert, animated: true)
    }
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Cancel", style: .cancel) { _ in
            completionHandler(false)
        })
        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
            completionHandler(true)
        })
        present(alert, animated: true)
    }
    
    // MARK: - WKScriptMessageHandler
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "iOS" else { return }
        
        if let body = message.body as? [String: Any] {
            if let action = body["action"] as? String {
                handleJavaScriptAction(action, data: body)
            }
        }
    }
    
    // MARK: - JavaScript Communication
    private func handleJavaScriptAction(_ action: String, data: [String: Any]) {
        switch action {
        case "showToast":
            if let message = data["message"] as? String {
                showToast(message)
            }
        case "closeApp":
            exit(0)
        default:
            break
        }
    }
    
    // MARK: - Helper Methods
    private func showError(_ message: String) {
        let alert = UIAlertController(title: "Error", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "OK", style: .default))
        present(alert, animated: true)
    }
    
    private func showToast(_ message: String) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        present(alert, animated: true)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            alert.dismiss(animated: true)
        }
    }
    
    // MARK: - Navigation
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        navigationController?.setNavigationBarHidden(false, animated: animated)
    }
}
