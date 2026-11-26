package com.codevenger.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.codevenger.app.core.di.AppContainer
import com.codevenger.app.ui.screens.FoundationPlaceholderScreen
import com.codevenger.app.ui.screens.LandingScreen

/**
 * Hosts the public landing page and the existing future destination placeholders.
 */
@Composable
fun CoDevEngerNavHost(
    appContainer: AppContainer,
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController(),
) {
    NavHost(
        navController = navController,
        startDestination = AppDestination.Landing,
        modifier = modifier,
    ) {
        composable<AppDestination.Splash> {
            FoundationPlaceholderScreen(
                foundationRepository = appContainer.foundationRepository,
            )
        }
        composable<AppDestination.Landing> {
            LandingScreen()
        }
        composable<AppDestination.Login> {
            FoundationPlaceholderScreen(
                foundationRepository = appContainer.foundationRepository,
            )
        }
        composable<AppDestination.Dashboard> {
            FoundationPlaceholderScreen(
                foundationRepository = appContainer.foundationRepository,
            )
        }
    }
}
