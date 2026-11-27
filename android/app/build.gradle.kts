import java.util.Properties
import java.net.URI
import java.net.URISyntaxException
import java.util.Base64
import groovy.json.JsonException
import groovy.json.JsonOutput
import groovy.json.JsonSlurper

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
}

val localProps = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) {
        file.inputStream().use { load(it) }
    }
}

fun localPropOrDefault(key: String, defaultValue: String): String {
    val raw = localProps.getProperty(key)?.trim()
    return if (raw.isNullOrEmpty()) defaultValue else raw
}

fun String.escapeForBuildConfig(): String =
    replace("\\", "\\\\").replace("\"", "\\\"")

fun isPublicSupabaseKey(value: String): Boolean {
    if (value.startsWith("sb_publishable_")) return true

    val encodedClaims = value.split('.').getOrNull(1) ?: return false
    val claims = try {
        val json = String(Base64.getUrlDecoder().decode(encodedClaims), Charsets.UTF_8)
        JsonSlurper().parseText(json) as? Map<*, *>
    } catch (_: IllegalArgumentException) {
        return false
    } catch (_: JsonException) {
        return false
    }
    return claims?.get("role") == "anon"
}

val useDummyData = localPropOrDefault("USE_DUMMY_DATA", "true").toBooleanStrictOrNull()
    ?: throw GradleException("USE_DUMMY_DATA must be true or false.")
val supabaseUrl = localPropOrDefault("SUPABASE_URL", "")
val supabaseAnonKey = localPropOrDefault("SUPABASE_ANON_KEY", "")

if (!useDummyData && (supabaseUrl.isBlank() || supabaseAnonKey.isBlank())) {
    throw GradleException(
        "Set SUPABASE_URL and SUPABASE_ANON_KEY in android/local.properties, " +
            "or keep USE_DUMMY_DATA=true."
    )
}
if (supabaseUrl.isNotBlank()) {
    val parsedUrl = try {
        URI(supabaseUrl)
    } catch (_: URISyntaxException) {
        throw GradleException("SUPABASE_URL must be a valid HTTPS URL.")
    }
    if (parsedUrl.scheme != "https" || parsedUrl.host.isNullOrBlank()) {
        throw GradleException("SUPABASE_URL must be a valid HTTPS URL.")
    }
}
if (supabaseAnonKey.isNotBlank() && !isPublicSupabaseKey(supabaseAnonKey)) {
    throw GradleException(
        "SUPABASE_ANON_KEY must be a Supabase publishable key or a legacy anon JWT. " +
            "Privileged service_role/secret keys are not allowed in the Android app."
    )
}

val landingConfigAssets = layout.buildDirectory.dir("generated/landing-config/assets")
val generateLandingConfig = tasks.register("generateLandingConfig") {
    val configFile = landingConfigAssets.map { it.file("landing/assets/js/config.js") }

    inputs.property("useDummyData", useDummyData)
    inputs.property("supabaseUrl", supabaseUrl)
    inputs.property("supabaseAnonKey", supabaseAnonKey)
    outputs.file(configFile)

    doLast {
        val output = configFile.get().asFile
        output.parentFile.mkdirs()
        output.writeText(
            """
            window.APP_CONFIG = {
              USE_DUMMY_DATA: $useDummyData,
              SUPABASE_URL: ${JsonOutput.toJson(supabaseUrl)},
              SUPABASE_ANON_KEY: ${JsonOutput.toJson(supabaseAnonKey)}
            };
            """.trimIndent()
        )
    }
}

android {
    namespace = "com.codevenger.app"
    sourceSets["main"].assets.srcDir(rootProject.file("../frontend/pages"))
    sourceSets["main"].assets.srcDir(landingConfigAssets.get().asFile)
    tasks.named("preBuild").configure {
        dependsOn(generateLandingConfig)
    }

    compileSdk {
        version = release(36) {
            minorApiLevel = 1
        }
    }

    defaultConfig {
        applicationId = "com.codevenger.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "0.1.0-alpha"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        buildConfigField("boolean", "USE_DUMMY_DATA", useDummyData.toString())
        buildConfigField("String", "SUPABASE_URL", "\"${supabaseUrl.escapeForBuildConfig()}\"")
        buildConfigField("String", "SUPABASE_ANON_KEY", "\"${supabaseAnonKey.escapeForBuildConfig()}\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.activity.compose)

    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)

    implementation(libs.androidx.navigation.compose)
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.coil.compose)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)

    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
