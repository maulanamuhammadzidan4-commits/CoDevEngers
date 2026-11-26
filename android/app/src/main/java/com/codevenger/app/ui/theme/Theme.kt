package com.codevenger.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColorScheme = lightColorScheme(
    primary = PenpotCharcoalButton,
    onPrimary = PenpotWhite,
    primaryContainer = PenpotSurfaceGray,
    onPrimaryContainer = PenpotBlack,
    secondary = PenpotNavPillGray,
    onSecondary = PenpotWhite,
    secondaryContainer = PenpotLightCanvas,
    onSecondaryContainer = PenpotBlack,
    background = LightBackground,
    onBackground = PenpotBlack,
    surface = PenpotWhite,
    onSurface = PenpotBlack,
    surfaceVariant = PenpotLightCanvas,
    onSurfaceVariant = PenpotCharcoalButton,
    outline = LightOutline,
)

private val DarkColorScheme = darkColorScheme(
    primary = PenpotSurfaceGray,
    onPrimary = PenpotBlack,
    primaryContainer = PenpotCharcoalButton,
    onPrimaryContainer = PenpotWhite,
    secondary = PenpotNavPillGray,
    onSecondary = PenpotBlack,
    secondaryContainer = PenpotAvatarDark,
    onSecondaryContainer = PenpotWhite,
    background = DarkBackground,
    onBackground = PenpotWhite,
    surface = PenpotDarkCanvas,
    onSurface = PenpotWhite,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = PenpotLightCanvas,
    outline = DarkOutline,
)

/**
 * Root Material 3 theme for CoDevEnger.
 * Defaults to [ThemeMode.SYSTEM] and accepts an explicit [themeMode] so a future toggle
 * can override light/dark appearance without rewriting theme call sites.
 */
@Composable
fun CoDevEngerTheme(
    themeMode: ThemeMode = ThemeMode.SYSTEM,
    content: @Composable () -> Unit,
) {
    val darkTheme = themeMode.isDarkTheme(isSystemDark = isSystemInDarkTheme())
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = CoDevEngerTypography,
        shapes = CoDevEngerShapes,
        content = content,
    )
}
