package com.codevenger.app.ui

import androidx.compose.runtime.Composable
import com.codevenger.app.core.di.AppContainer
import com.codevenger.app.ui.navigation.CoDevEngerNavHost
import com.codevenger.app.ui.theme.CoDevEngerTheme
import com.codevenger.app.ui.theme.ThemeMode

/**
 * Top-level Compose root applying [CoDevEngerTheme] and hosting [CoDevEngerNavHost].
 */
@Composable
fun CoDevEngerRoot(
    appContainer: AppContainer,
    themeMode: ThemeMode = ThemeMode.SYSTEM,
) {
    CoDevEngerTheme(themeMode = themeMode) {
        CoDevEngerNavHost(appContainer = appContainer)
    }
}
