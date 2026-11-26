package com.codevenger.app.data.repository

import com.codevenger.app.core.config.AppConfig
import com.codevenger.app.domain.model.FoundationInfo
import com.codevenger.app.domain.repository.FoundationRepository
import com.codevenger.app.ui.navigation.LandingSection
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf

/**
 * Phase 1 in-memory repository placeholder.
 * Will be replaced/supplemented once backend contracts and Supabase integration are ready.
 */
class FoundationRepositoryImpl(
    private val appConfig: AppConfig,
) : FoundationRepository {

    override fun observeFoundationInfo(): Flow<FoundationInfo> = flowOf(
        FoundationInfo(
            appName = "CoDevEnger",
            versionName = appConfig.versionName,
            isDummyMode = appConfig.useDummyData,
            plannedFlow = listOf("Splash", "Landing Page", "Login", "Dashboard"),
            landingSections = LandingSection.entries.map { it.label },
        ),
    )
}
