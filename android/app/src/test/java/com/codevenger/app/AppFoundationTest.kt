package com.codevenger.app

import com.codevenger.app.core.config.AppConfig
import com.codevenger.app.data.repository.FoundationRepositoryImpl
import com.codevenger.app.ui.navigation.LandingSection
import com.codevenger.app.ui.theme.ThemeMode
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class AppFoundationTest {

    @Test
    fun themeModeFollowsSystemAndSupportsExplicitOverrides() {
        assertTrue(ThemeMode.SYSTEM.isDarkTheme(isSystemDark = true))
        assertFalse(ThemeMode.SYSTEM.isDarkTheme(isSystemDark = false))
        assertFalse(ThemeMode.LIGHT.isDarkTheme(isSystemDark = true))
        assertTrue(ThemeMode.DARK.isDarkTheme(isSystemDark = false))
    }

    @Test
    fun appConfigDoesNotEnableSupabaseWhenDummyOrBlank() {
        val dummyConfig = AppConfig(
            useDummyData = true,
            supabaseUrl = "https://example.supabase.co",
            supabaseAnonKey = "anon-key",
            versionName = "0.1.0-alpha",
        )
        assertFalse(dummyConfig.isSupabaseConfigured)

        val missingKeysConfig = AppConfig(
            useDummyData = false,
            supabaseUrl = "",
            supabaseAnonKey = "",
            versionName = "0.1.0-alpha",
        )
        assertFalse(missingKeysConfig.isSupabaseConfigured)
    }

    @Test
    fun foundationRepositoryEmitsPlannedFlowAndLandingSections() = runTest {
        val repo = FoundationRepositoryImpl(
            appConfig = AppConfig(
                useDummyData = true,
                supabaseUrl = "",
                supabaseAnonKey = "",
                versionName = "0.1.0-alpha",
            ),
        )
        val info = repo.observeFoundationInfo().first()
        assertEquals(listOf("Splash", "Landing Page", "Login", "Dashboard"), info.plannedFlow)
        assertEquals(
            listOf("Home", "About", "Devs", "Contact"),
            LandingSection.entries.map { it.label },
        )
        assertEquals(info.landingSections, LandingSection.entries.map { it.label })
        assertTrue(info.isDummyMode)
    }
}
