package com.codevenger.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.codevenger.app.ui.CoDevEngerRoot

/**
 * Single-activity Compose host for the CoDevEnger Android application.
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val container = (application as CoDevEngerApp).container
        setContent {
            CoDevEngerRoot(appContainer = container)
        }
    }
}
