package com.codevenger.app.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.codevenger.app.domain.model.FoundationInfo
import com.codevenger.app.domain.repository.FoundationRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn

data class FoundationUiState(
    val info: FoundationInfo? = null,
)

/**
 * Minimal ViewModel verifying MVVM + StateFlow + Repository wiring in Phase 1.
 */
class FoundationViewModel(
    foundationRepository: FoundationRepository,
) : ViewModel() {

    val uiState: StateFlow<FoundationUiState> = foundationRepository
        .observeFoundationInfo()
        .map { FoundationUiState(info = it) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = FoundationUiState(),
        )

    companion object {
        fun factory(repository: FoundationRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return FoundationViewModel(repository) as T
                }
            }
    }
}
