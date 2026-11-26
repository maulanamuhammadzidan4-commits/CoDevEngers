package com.codevenger.app.ui.navigation

import kotlinx.serialization.Serializable

/**
 * Planned top-level navigation destinations for CoDevEnger:
 * Splash -> Landing -> Login -> Dashboard.
 */
sealed interface AppDestination {
    @Serializable
    data object Splash : AppDestination

    @Serializable
    data object Landing : AppDestination

    @Serializable
    data object Login : AppDestination

    @Serializable
    data object Dashboard : AppDestination
}

/**
 * Sections defined on the Penpot Landing Page.
 */
enum class LandingSection(val label: String) {
    HOME("Home"),
    ABOUT("About"),
    DEVS("Devs"),
    CONTACT("Contact"),
}
