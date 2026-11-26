package com.codevenger.app.core.di

import com.codevenger.app.core.config.AppConfig
import com.codevenger.app.data.repository.FoundationRepositoryImpl
import com.codevenger.app.domain.repository.FoundationRepository

/**
 * Lightweight dependency container for Phase 1.
 * Keeps data, domain, and UI layers decoupled without overengineering.
 */
class AppContainer(
    val appConfig: AppConfig = AppConfig.fromBuildConfig(),
) {
    val foundationRepository: FoundationRepository by lazy {
        FoundationRepositoryImpl(appConfig = appConfig)
    }
}
