package com.codevenger.app.ui.theme

/**
 * Theme preference modes.
 * Phase 1 uses [SYSTEM] by default; a manual toggle UI can bind to this enum later.
 */
enum class ThemeMode {
    SYSTEM,
    LIGHT,
    DARK,
    ;

    fun isDarkTheme(isSystemDark: Boolean): Boolean = when (this) {
        SYSTEM -> isSystemDark
        LIGHT -> false
        DARK -> true
    }
}
