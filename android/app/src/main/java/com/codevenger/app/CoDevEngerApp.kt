package com.codevenger.app

import android.app.Application
import com.codevenger.app.core.di.AppContainer

/**
 * Application entry point for CoDevEnger.
 */
class CoDevEngerApp : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer()
    }
}
