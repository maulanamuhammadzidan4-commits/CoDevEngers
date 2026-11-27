package com.codevenger.app.ui.screens

import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun LandingScreen(modifier: Modifier = Modifier) {
    var webView by remember { mutableStateOf<WebView?>(null) }
    var canGoBack by remember { mutableStateOf(false) }

    BackHandler(enabled = canGoBack) {
        webView?.goBack()
    }

    AndroidView(
        modifier = modifier
            .fillMaxSize()
            .windowInsetsPadding(WindowInsets.safeDrawing),
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.useWideViewPort = true
                settings.loadWithOverviewMode = false
                settings.mediaPlaybackRequiresUserGesture = true
                isVerticalScrollBarEnabled = false
                webViewClient = object : WebViewClient() {
                    override fun onPageFinished(view: WebView, url: String?) {
                        canGoBack = view.canGoBack()
                    }
                }
                webChromeClient = WebChromeClient()
                webView = this
                loadUrl("file:///android_asset/landing/index.html")
            }
        },
        update = { webView = it },
        onRelease = { view ->
            if (webView === view) webView = null
            view.stopLoading()
            view.destroy()
        },
    )
}
