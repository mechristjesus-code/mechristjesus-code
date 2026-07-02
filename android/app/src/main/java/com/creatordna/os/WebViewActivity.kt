package com.creatordna.os

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.View
import android.webkit.*
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class WebViewActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var titleBar: TextView
    private lateinit var btnBack: View
    private lateinit var btnRefresh: View

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_webview)

        val url   = intent.getStringExtra("url")   ?: HomeActivity.WEB_URL
        val title = intent.getStringExtra("title") ?: "Creator DNA OS"

        webView     = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        titleBar    = findViewById(R.id.titleBar)
        btnBack     = findViewById(R.id.btnBack)
        btnRefresh  = findViewById(R.id.btnRefresh)

        titleBar.text = title

        btnBack.setOnClickListener {
            if (webView.canGoBack()) webView.goBack() else finish()
        }
        btnRefresh.setOnClickListener { webView.reload() }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            allowFileAccess = true
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                progressBar.visibility = if (newProgress < 100) View.VISIBLE else View.GONE
            }
            override fun onReceivedTitle(view: WebView?, t: String?) {
                if (!t.isNullOrBlank() && t != "about:blank") titleBar.text = t
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(v: WebView?, req: WebResourceRequest?, err: WebResourceError?) {
                webView.loadData(offlinePage(), "text/html", "UTF-8")
            }
        }

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(url)
        }
    }

    override fun onSaveInstanceState(out: Bundle) {
        super.onSaveInstanceState(out)
        webView.saveState(out)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    private fun offlinePage() = """<!DOCTYPE html><html><head>
<meta name='viewport' content='width=device-width,initial-scale=1'>
<style>body{margin:0;background:#1c1c1e;color:#fff;font-family:-apple-system,sans-serif;
display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;flex-direction:column;gap:1rem;padding:2rem}
h2{font-size:1.4rem;font-weight:700;margin:0}p{color:#8e8e93;margin:0;font-size:.9rem}
button{margin-top:1rem;padding:.7rem 2rem;background:#5e5ce6;color:#fff;border:none;
border-radius:14px;font-size:1rem;font-weight:600;cursor:pointer}</style></head>
<body><div style='font-size:3rem'>📡</div><h2>No Connection</h2>
<p>Check your Wi-Fi or mobile data<br>and try again.</p>
<button onclick='location.reload()'>Retry</button></body></html>"""
}
