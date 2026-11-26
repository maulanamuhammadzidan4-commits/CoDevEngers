package com.codevenger.app.domain.repository

import com.codevenger.app.domain.model.FoundationInfo
import kotlinx.coroutines.flow.Flow

/**
 * Domain repository boundary for application foundation metadata.
 */
interface FoundationRepository {
    fun observeFoundationInfo(): Flow<FoundationInfo>
}
