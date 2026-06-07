package com.rumusmusic.app

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.startapp.sdk.adsbase.StartAppAd

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var startAppAd: StartAppAd? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)

        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.settings.loadsImagesAutomatically = true
        webView.settings.allowFileAccess = true

        webView.webViewClient = WebViewClient()
        webView.webChromeClient = WebChromeClient()

        webView.loadUrl(
            "https://rumus-music.github.io/"
        )

        loadInterstitial()
    }

    private fun loadInterstitial() {

        startAppAd = StartAppAd(this)

        startAppAd?.loadAd()
    }

    override fun onBackPressed() {

        if (webView.canGoBack()) {
            webView.goBack()
        } else {

            startAppAd?.showAd()

            super.onBackPressed()
        }
    }
}
