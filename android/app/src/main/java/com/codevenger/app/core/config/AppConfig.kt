package com.codevenger.app.core.config

import com.codevenger.app.BuildConfig

/**
 * Safe runtime configuration backed by BuildConfig (populated from gitignored local.properties).
 * Only anon/publishable keys are ever allowed on client builds.
 */
data class AppConfig(
    val useDummyData: Boolean,
    val supabaseUrl: String,
    val supabaseAnonKey: String,
    val versionName: String,
) {
    val isSupabaseConfigured: Boolean
        get() = !useDummyData && supabaseUrl.isNotBlank() && supabaseAnonKey.isNotBlank()

    companion object {
        fun fromBuildConfig(): AppConfig = AppConfig(
            useDummyData = BuildConfig.USE_DUMMY_DATA,
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseAnonKey = BuildConfig.SUPABASE_ANON_KEY,
            versionName = BuildConfig.VERSION_NAME,
        )
    }
}
