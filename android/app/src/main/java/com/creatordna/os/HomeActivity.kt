package com.creatordna.os

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView

class HomeActivity : AppCompatActivity() {

    companion object {
        const val WEB_URL   = "https://mechristjesus-code.github.io/mechristjesus-code/"
        const val LOCAL_URL = "http://localhost:3000"
        const val GITHUB    = "https://github.com/mechristjesus-code/mechristjesus-code"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        // Hero buttons
        findViewById<View>(R.id.btnOpenApp).setOnClickListener {
            openWebView(WEB_URL, "Creator DNA OS")
        }
        findViewById<View>(R.id.btnLocalApp).setOnClickListener {
            openWebView(LOCAL_URL, "Local Server")
        }

        // iOS-style app grid tiles
        setupTile(R.id.tileDashboard,  "Dashboard",  WEB_URL)
        setupTile(R.id.tileAI,         "AI Tools",   "$WEB_URL#ai")
        setupTile(R.id.tileProjects,   "Projects",   "$WEB_URL#projects")
        setupTile(R.id.tileDNA,        "DNA Profile","$WEB_URL#dna")
        setupTile(R.id.tileMedia,      "Media",      "$WEB_URL#media")
        setupTile(R.id.tileSettings,   "Settings",   "$WEB_URL#settings")

        // Bottom dock buttons
        findViewById<View>(R.id.dockHome).setOnClickListener {
            openWebView(WEB_URL, "Home")
        }
        findViewById<View>(R.id.dockInstall).setOnClickListener {
            openWebView("$WEB_URL/install", "Install")
        }
        findViewById<View>(R.id.dockGitHub).setOnClickListener {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(GITHUB)))
        }
    }

    private fun setupTile(id: Int, label: String, url: String) {
        findViewById<View>(id)?.setOnClickListener { openWebView(url, label) }
    }

    private fun openWebView(url: String, title: String) {
        val intent = Intent(this, WebViewActivity::class.java).apply {
            putExtra("url", url)
            putExtra("title", title)
        }
        startActivity(intent)
    }
}
