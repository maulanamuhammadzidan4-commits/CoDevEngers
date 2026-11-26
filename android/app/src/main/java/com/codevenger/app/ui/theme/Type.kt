package com.codevenger.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Penpot specifies the Poppins font family across all text elements.
 * Font assets (.ttf) are not bundled in the repository or Penpot export yet, so
 * [CoDevEngerFontFamily] currently falls back to [FontFamily.SansSerif].
 * Once Poppins Regular/Bold .ttf files are added to res/font/, swap this definition.
 */
val CoDevEngerFontFamily: FontFamily = FontFamily.SansSerif

val CoDevEngerTypography = Typography(
    headlineMedium = TextStyle(
        fontFamily = CoDevEngerFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 26.sp,
        lineHeight = 32.sp,
    ),
    titleLarge = TextStyle(
        fontFamily = CoDevEngerFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
    ),
    titleMedium = TextStyle(
        fontFamily = CoDevEngerFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 18.sp,
        lineHeight = 24.sp,
    ),
    bodyLarge = TextStyle(
        fontFamily = CoDevEngerFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 22.sp,
    ),
    bodyMedium = TextStyle(
        fontFamily = CoDevEngerFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
    labelLarge = TextStyle(
        fontFamily = CoDevEngerFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 14.sp,
        lineHeight = 20.sp,
    ),
)
