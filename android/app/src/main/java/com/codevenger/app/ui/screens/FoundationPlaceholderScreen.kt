package com.codevenger.app.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.codevenger.app.domain.model.FoundationInfo
import com.codevenger.app.domain.repository.FoundationRepository
import com.codevenger.app.ui.theme.CoDevEngerTheme

/**
 * Minimal Phase 1 launch verification screen.
 */
@Composable
fun FoundationPlaceholderScreen(
    foundationRepository: FoundationRepository,
    modifier: Modifier = Modifier,
) {
    val viewModel: FoundationViewModel = viewModel(
        factory = FoundationViewModel.factory(foundationRepository),
    )
    val state by viewModel.uiState.collectAsStateWithLifecycle()

    FoundationPlaceholderContent(
        info = state.info,
        modifier = modifier,
    )
}

@Composable
private fun FoundationPlaceholderContent(
    info: FoundationInfo?,
    modifier: Modifier = Modifier,
) {
    Scaffold(modifier = modifier.fillMaxSize()) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = MaterialTheme.shapes.large,
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surface,
                ),
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Text(
                        text = info?.appName ?: "CoDevEnger",
                        style = MaterialTheme.typography.headlineMedium,
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Android Project Foundation (${info?.versionName ?: "0.1.0-alpha"})",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Planned Flow: ${info?.plannedFlow?.joinToString(" -> ").orEmpty()}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Landing Sections: ${info?.landingSections?.joinToString(", ").orEmpty()}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun FoundationPlaceholderPreview() {
    CoDevEngerTheme {
        FoundationPlaceholderContent(
            info = FoundationInfo(
                appName = "CoDevEnger",
                versionName = "0.1.0-alpha",
                isDummyMode = true,
                plannedFlow = listOf("Splash", "Landing Page", "Login", "Dashboard"),
                landingSections = listOf("Home", "About", "Devs", "Contact"),
            ),
        )
    }
}
