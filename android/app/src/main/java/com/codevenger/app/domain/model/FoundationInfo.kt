package com.codevenger.app.domain.model

/**
 * Minimal domain model describing the foundation state before backend integration.
 */
data class FoundationInfo(
    val appName: String,
    val versionName: String,
    val isDummyMode: Boolean,
    val plannedFlow: List<String>,
    val landingSections: List<String>,
)
