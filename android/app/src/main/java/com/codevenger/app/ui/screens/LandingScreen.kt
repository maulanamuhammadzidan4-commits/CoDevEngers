package com.codevenger.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.derivedStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.clipToBounds
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.codevenger.app.ui.navigation.LandingSection
import com.codevenger.app.ui.theme.CoDevEngerNavy
import com.codevenger.app.ui.theme.CoDevEngerRed
import com.codevenger.app.ui.theme.CoDevEngerSkyBlue
import kotlinx.coroutines.launch

private val LandingCanvas = Color(0xFFF6F8FC)
private val LandingInk = Color(0xFF17233F)
private val LandingMuted = Color(0xFF69758C)
private val LandingLine = Color(0xFFE7EBF2)

@Composable
fun LandingScreen(modifier: Modifier = Modifier) {
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()
    val activeSectionIndex by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex.coerceIn(0, LandingSection.entries.lastIndex)
        }
    }

    fun scrollToSection(section: LandingSection) {
        coroutineScope.launch {
            listState.animateScrollToItem(section.ordinal)
        }
    }

    Scaffold(
        modifier = modifier,
        containerColor = LandingCanvas,
    ) { contentPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(contentPadding),
        ) {
            LandingHeader(
                activeSection = LandingSection.entries[activeSectionIndex],
                onSectionSelected = ::scrollToSection,
            )
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                state = listState,
                contentPadding = PaddingValues(bottom = 28.dp),
            ) {
                item(key = LandingSection.HOME.name) {
                    HomeSection(onExploreTeam = { scrollToSection(LandingSection.DEVS) })
                }
                item(key = LandingSection.ABOUT.name) {
                    AboutSection()
                }
                item(key = LandingSection.DEVS.name) {
                    DevsSection()
                }
                item(key = LandingSection.CONTACT.name) {
                    ContactSection()
                }
            }
        }
    }
}

@Composable
private fun LandingHeader(
    activeSection: LandingSection,
    onSectionSelected: (LandingSection) -> Unit,
) {
    Surface(
        color = Color.White,
        shadowElevation = 3.dp,
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(CoDevEngerRed),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "C",
                        color = Color.White,
                        fontSize = 23.sp,
                        fontWeight = FontWeight.Black,
                    )
                }
                Spacer(Modifier.width(10.dp))
                Column {
                    Text(
                        text = "CoDevEnger",
                        color = CoDevEngerNavy,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 21.sp,
                    )
                    Text(
                        text = "CLASS PROJECT",
                        color = LandingMuted,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.4.sp,
                    )
                }
            }
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                LandingSection.entries.forEach { section ->
                    val selected = section == activeSection
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(topStart = 12.dp, topEnd = 12.dp))
                            .clickable { onSectionSelected(section) }
                            .padding(top = 8.dp, bottom = 7.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            text = section.label,
                            color = if (selected) CoDevEngerNavy else LandingMuted,
                            fontSize = 13.sp,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                        Spacer(Modifier.height(6.dp))
                        Box(
                            modifier = Modifier
                                .width(25.dp)
                                .height(3.dp)
                                .clip(CircleShape)
                                .background(if (selected) CoDevEngerRed else Color.Transparent),
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun HomeSection(onExploreTeam: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clipToBounds()
            .background(CoDevEngerNavy),
    ) {
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 75.dp, y = (-88).dp)
                .size(230.dp)
                .background(Color(0xFF172548), CircleShape),
        )
        SectionFrame(
            modifier = Modifier.padding(vertical = 38.dp),
            contentPadding = 24.dp,
        ) {
            Surface(
                color = Color(0xFF192443),
                shape = RoundedCornerShape(50),
            ) {
                Text(
                    text = "LEARN  ·  CREATE  ·  COLLABORATE",
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    color = CoDevEngerSkyBlue,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                )
            }
            Spacer(Modifier.height(20.dp))
            Text(
                text = "Ideas grow\nwhen we build\ntogether.",
                color = Color.White,
                fontSize = 38.sp,
                lineHeight = 43.sp,
                fontWeight = FontWeight.ExtraBold,
            )
            Spacer(Modifier.height(14.dp))
            Text(
                text = "A student-led class project exploring how thoughtful design and technology can bring ideas to life.",
                color = Color(0xFFD4DCEE),
                fontSize = 15.sp,
                lineHeight = 23.sp,
            )
            Spacer(Modifier.height(22.dp))
            Button(
                onClick = onExploreTeam,
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = CoDevEngerRed,
                    contentColor = Color.White,
                ),
                contentPadding = PaddingValues(horizontal = 18.dp, vertical = 13.dp),
            ) {
                Text("Meet the team", fontWeight = FontWeight.Bold)
                Spacer(Modifier.width(10.dp))
                Text("→", fontSize = 18.sp, fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(28.dp))
            HeroProjectCard()
        }
    }
}

@Composable
private fun HeroProjectCard() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Color(0xFF131D39))
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(13.dp))
                .background(Color(0xFF26385D)),
            contentAlignment = Alignment.Center,
        ) {
            Text("01", color = CoDevEngerSkyBlue, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }
        Spacer(Modifier.width(13.dp))
        Column {
            Text(
                text = "A project built by learning",
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
            )
            Spacer(Modifier.height(3.dp))
            Text(
                text = "Curiosity first. Progress together.",
                color = Color(0xFFAFBCD3),
                fontSize = 12.sp,
            )
        }
    }
}

@Composable
private fun AboutSection() {
    SectionFrame {
        SectionHeading(
            eyebrow = "ABOUT THE PROJECT",
            title = "A class project,\nmade together.",
        )
        Spacer(Modifier.height(14.dp))
        Text(
            text = "CoDevEnger is a shared space to learn, experiment, and create. We bring design and development together to turn classroom ideas into a thoughtful digital experience.",
            color = LandingMuted,
            fontSize = 15.sp,
            lineHeight = 24.sp,
        )
        Spacer(Modifier.height(24.dp))
        BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
            val sideBySide = maxWidth >= 540.dp
            if (sideBySide) {
                Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                    AboutInfoCard(
                        modifier = Modifier.weight(1f),
                        label = "OUR VISION",
                        title = "Make room for good ideas.",
                        description = "Create welcoming digital experiences that make learning and sharing feel natural.",
                        accent = CoDevEngerSkyBlue,
                    )
                    AboutInfoCard(
                        modifier = Modifier.weight(1f),
                        label = "OUR MISSION",
                        title = "Learn by making.",
                        description = "Explore, build, and refine as a team—one useful step at a time.",
                        accent = CoDevEngerRed,
                    )
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    AboutInfoCard(
                        label = "OUR VISION",
                        title = "Make room for good ideas.",
                        description = "Create welcoming digital experiences that make learning and sharing feel natural.",
                        accent = CoDevEngerSkyBlue,
                    )
                    AboutInfoCard(
                        label = "OUR MISSION",
                        title = "Learn by making.",
                        description = "Explore, build, and refine as a team—one useful step at a time.",
                        accent = CoDevEngerRed,
                    )
                }
            }
        }
    }
}

@Composable
private fun AboutInfoCard(
    label: String,
    title: String,
    description: String,
    accent: Color,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(19.dp)) {
            Box(
                modifier = Modifier
                    .size(9.dp)
                    .clip(CircleShape)
                    .background(accent),
            )
            Spacer(Modifier.height(15.dp))
            Text(
                text = label,
                color = LandingMuted,
                fontSize = 10.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.3.sp,
            )
            Spacer(Modifier.height(7.dp))
            Text(
                text = title,
                color = LandingInk,
                fontSize = 19.sp,
                lineHeight = 24.sp,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(7.dp))
            Text(
                text = description,
                color = LandingMuted,
                fontSize = 13.sp,
                lineHeight = 20.sp,
            )
        }
    }
}

@Composable
private fun DevsSection() {
    SectionFrame {
        SectionHeading(
            eyebrow = "THE DEVS",
            title = "Many skills.\nOne shared goal.",
        )
        Spacer(Modifier.height(13.dp))
        Text(
            text = "A good project takes ideas, care, and code. Meet the different parts of the work that bring CoDevEnger together.",
            color = LandingMuted,
            fontSize = 15.sp,
            lineHeight = 24.sp,
        )
        Spacer(Modifier.height(22.dp))
        BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {
            val cards = listOf(
                TeamFocus("01", "Ideas & research", "Turning questions into a clear direction.", CoDevEngerSkyBlue),
                TeamFocus("02", "Design & UI", "Making each screen feel simple and welcoming.", CoDevEngerRed),
                TeamFocus("03", "App development", "Bringing the experience to life in code.", CoDevEngerNavy),
            )
            if (maxWidth >= 620.dp) {
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    cards.forEach { focus ->
                        TeamFocusCard(focus, Modifier.weight(1f))
                    }
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    cards.forEach { focus -> TeamFocusCard(focus) }
                }
            }
        }
    }
}

private data class TeamFocus(
    val number: String,
    val title: String,
    val description: String,
    val accent: Color,
)

@Composable
private fun TeamFocusCard(
    focus: TeamFocus,
    modifier: Modifier = Modifier,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(focus.accent.copy(alpha = 0.13f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = focus.number,
                        color = focus.accent,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                    )
                }
                Text(
                    text = "TEAM FOCUS",
                    color = LandingMuted,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                )
            }
            Spacer(Modifier.height(15.dp))
            Text(
                text = focus.title,
                color = LandingInk,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
            )
            Spacer(Modifier.height(6.dp))
            Text(
                text = focus.description,
                color = LandingMuted,
                fontSize = 13.sp,
                lineHeight = 20.sp,
            )
        }
    }
}

@Composable
private fun ContactSection() {
    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var message by rememberSaveable { mutableStateOf("") }

    SectionFrame {
        SectionHeading(
            eyebrow = "GET IN TOUCH",
            title = "Let’s start\na conversation.",
        )
        Spacer(Modifier.height(12.dp))
        Text(
            text = "Have a question or an idea to share? Leave a note below.",
            color = LandingMuted,
            fontSize = 15.sp,
            lineHeight = 23.sp,
        )
        Spacer(Modifier.height(22.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(22.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                LandingTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "Name",
                    placeholder = "Your name",
                )
                LandingTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = "Email",
                    placeholder = "you@example.com",
                    keyboardType = KeyboardType.Email,
                )
                LandingTextField(
                    value = message,
                    onValueChange = { message = it },
                    label = "Message",
                    placeholder = "What would you like to share?",
                    singleLine = false,
                    minLines = 4,
                )
                Button(
                    onClick = {},
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = CoDevEngerRed,
                        contentColor = Color.White,
                    ),
                ) {
                    Text("Submit", fontWeight = FontWeight.Bold)
                    Spacer(Modifier.width(8.dp))
                    Text("→", fontSize = 18.sp, fontWeight = FontWeight.Bold)
                }
                Text(
                    text = "This form is a UI preview and doesn’t send messages yet.",
                    modifier = Modifier.fillMaxWidth(),
                    color = LandingMuted,
                    textAlign = TextAlign.Center,
                    fontSize = 11.sp,
                    lineHeight = 16.sp,
                )
            }
        }
    }
}

@Composable
private fun LandingTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    placeholder: String,
    keyboardType: KeyboardType = KeyboardType.Text,
    singleLine: Boolean = true,
    minLines: Int = 1,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label) },
        placeholder = { Text(placeholder) },
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        singleLine = singleLine,
        minLines = minLines,
        shape = RoundedCornerShape(14.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = CoDevEngerSkyBlue,
            unfocusedBorderColor = LandingLine,
            focusedLabelColor = CoDevEngerNavy,
            cursorColor = CoDevEngerRed,
        ),
    )
}

@Composable
private fun SectionFrame(
    modifier: Modifier = Modifier,
    contentPadding: androidx.compose.ui.unit.Dp = 22.dp,
    content: @Composable ColumnScope.() -> Unit,
) {
    Box(
        modifier = Modifier.fillMaxWidth(),
        contentAlignment = Alignment.TopCenter,
    ) {
        Column(
            modifier = modifier
                .fillMaxWidth()
                .widthIn(max = 760.dp)
                .padding(horizontal = contentPadding, vertical = 40.dp),
            content = content,
        )
    }
}

@Composable
private fun SectionHeading(
    eyebrow: String,
    title: String,
) {
    Text(
        text = eyebrow,
        color = CoDevEngerRed,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 1.4.sp,
    )
    Spacer(Modifier.height(10.dp))
    Text(
        text = title,
        color = CoDevEngerNavy,
        fontSize = 30.sp,
        lineHeight = 35.sp,
        fontWeight = FontWeight.ExtraBold,
    )
}
