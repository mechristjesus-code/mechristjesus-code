package com.creatordna.os

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.*
import android.widget.ProgressBar
import android.widget.RelativeLayout
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar

    // Change this to your deployed URL or localhost for Termux
    private val APP_URL = "https://mechristjesus-code.github.io/mechristjesus-code/"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Build layout programmatically — no XML needed
        val root = RelativeLayout(this)

        progressBar = ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal).apply {
            id = android.R.id.progress
            max = 100
            layoutParams = RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT, 8
            ).apply { addRule(RelativeLayout.ALIGN_PARENT_TOP) }
        }

        webView = WebView(this).apply {
            layoutParams = RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.MATCH_PARENT
            )
        }

        root.addView(progressBar)
        root.addView(webView)
        setContentView(root)

        // WebView settings
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            cacheMode = WebSettings.LOAD_DEFAULT
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                progressBar.progress = newProgress
                progressBar.visibility = if (newProgress < 100) ProgressBar.VISIBLE else ProgressBar.GONE
            }
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedError(view: WebView?, req: WebResourceRequest?, err: WebResourceError?) {
                // On error, load offline page
                webView.loadData(offlineHtml(), "text/html", "UTF-8")
            }
        }

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(APP_URL)
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }

    private fun offlineHtml() = """
        <!DOCTYPE html>
        <html>
        <head><meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
          body{margin:0;background:#030712;color:#fff;font-family:sans-serif;
               display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
          h1{font-size:2rem;background:linear-gradient(135deg,#fff,#a78bfa);
             -webkit-background-clip:text;-webkit-text-fill-color:transparent}
          p{color:#9ca3af;margin-top:1rem}
          button{margin-top:1.5rem;padding:.75rem 2rem;background:#7c3aed;color:#fff;
                 border:none;border-radius:.75rem;font-size:1rem;cursor:pointer}
        </style>
        </head>
        <body>
          <div>
            <div style="font-size:3rem">🧬</div>
            <h1>Creator DNA OS</h1>
            <p>You appear to be offline.<br>Check your connection and try again.</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
        </html>
    """.trimIndent()
}
