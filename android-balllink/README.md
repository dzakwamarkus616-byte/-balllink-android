# BallLink - Football Talent Connect (Native Android App)

Official native Android application wrapper and client for **BallLink - Football Talent Connect** (`https://ball-link.web.app`).

## Features
- **Modern Kotlin & Android SDK 34** (Compatible down to Android 7.0 / SDK 24).
- **High-Performance WebView** with JavaScript, DOM storage, database, and hardware acceleration enabled.
- **Native File & Photo Chooser** (`WebChromeClient.onShowFileChooser`) supporting camera photos, player CV uploads, and media attachments.
- **PWA Immersive Experience**: edge-to-edge layout, dark themed status bar (`#0f172a`), no browser navigation bar.
- **Native Splash Screen**: featuring the football icon, BallLink green branding (`#16a34a`), and dark background (`#0f172a`) with smooth fade-out animation.
- **Hardware Back Button Handling**: navigates back in WebView history before closing the application.
- **Loading Progress Bar**: custom green progress bar indicating network page load progress.
- **Offline Fallback Screen**: graceful retry screen with direct reload button when internet is unavailable.
- **Automated CI/CD**: Pre-configured GitHub Actions workflow to build release & debug APKs in the cloud.

---

## Project Structure
```text
android-balllink/
├── app/
│   ├── src/
│   │   └── main/
│   │       ├── AndroidManifest.xml
│   │       ├── java/com/balllink/app/MainActivity.kt
│   │       └── res/
│   │           ├── drawable/ic_football.xml
│   │           ├── layout/activity_main.xml
│   │           ├── values/colors.xml
│   │           ├── values/strings.xml
│   │           └── values/themes.xml
│   └── build.gradle.kts
├── gradle/wrapper/gradle-wrapper.properties
├── .github/workflows/build-apk.yml
├── build.gradle.kts
├── settings.gradle.kts
└── gradlew / gradlew.bat
```

---

## How to Build the APK

### Method 1: In Android Studio (Recommended)
1. Download or extract the project folder.
2. Open **Android Studio** (Hedgehog, Iguana, Jellyfish, Koala or Ladybug).
3. Select **File > Open** and choose the `android-balllink` folder.
4. Let Gradle sync project dependencies automatically.
5. Connect your Android device via USB or start an Android Emulator.
6. Click the green **Run (▶)** button, or go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
7. Once finished, click **locate** to get `app-debug.apk` ready to install on any Android phone!

### Method 2: Via Command Line (Terminal)
Ensure you have JDK 17 installed and `JAVA_HOME` set:
```bash
# On Mac/Linux:
./gradlew assembleDebug

# On Windows:
gradlew.bat assembleDebug
```
The output APK will be located at:
`app/build/outputs/apk/debug/app-debug.apk`

To build the signed release APK:
```bash
./gradlew assembleRelease
```
Output:
`app/build/outputs/apk/release/app-release.apk`

### Method 3: GitHub Actions (Cloud APK Build - No local setup needed)
1. Push this folder to a GitHub repository.
2. Go to the **Actions** tab in GitHub.
3. The `Build BallLink Android APK` workflow will run automatically.
4. Download the generated `BallLink-Debug-APK` or `BallLink-Release-APK` artifact directly from GitHub!

---

## App Specifications
- **App Name**: BallLink
- **Package Name**: `com.balllink.app`
- **Primary Color**: `#16a34a`
- **Background Color**: `#0f172a`
- **Target URL**: `https://ball-link.web.app`
