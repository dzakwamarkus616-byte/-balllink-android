export interface AndroidFile {
  path: string;
  name: string;
  language: string;
  category: 'core' | 'manifest' | 'layout' | 'resources' | 'gradle' | 'ci';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: 'app/src/main/java/com/balllink/app/MainActivity.kt',
    name: 'MainActivity.kt',
    language: 'kotlin',
    category: 'core',
    description: 'Main native Android activity in Kotlin configuring WebView, WebChromeClient, file upload chooser, back button dispatcher, and splash fade animation.',
    content: `package com.balllink.app

import android.annotation.SuppressLint
import android.content.ActivityNotFoundException
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
import android.view.View
import android.view.animation.AccelerateInterpolator
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.RelativeLayout
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.FileProvider
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.android.material.button.MaterialButton
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private lateinit var splashOverlay: RelativeLayout
    private lateinit var errorLayout: LinearLayout
    private lateinit var btnRetry: MaterialButton

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null
    private lateinit var fileChooserLauncher: ActivityResultLauncher<Intent>

    private var isFirstLoad = true
    private val appUrl = "https://ball-link.web.app"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        initViews()
        setupFileChooser()
        setupWebView()
        setupSwipeRefresh()
        setupBackNavigation()

        loadBallLinkUrl(appUrl)
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        splashOverlay = findViewById(R.id.splashOverlay)
        errorLayout = findViewById(R.id.errorLayout)
        btnRetry = findViewById(R.id.btnRetry)

        btnRetry.setOnClickListener {
            errorLayout.visibility = View.GONE
            webView.visibility = View.VISIBLE
            webView.reload()
        }
    }

    /**
     * Requirement 3 & 4: File upload handling for player profiles, CVs, highlight reels
     */
    private fun setupFileChooser() {
        fileChooserLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (filePathCallback == null) return@registerForActivityResult

            var results: Array<Uri>? = null

            if (result.resultCode == RESULT_OK) {
                val data = result.data
                if (data != null && data.data != null) {
                    results = arrayOf(data.data!!)
                } else if (data != null && data.clipData != null) {
                    val count = data.clipData!!.itemCount
                    val uris = mutableListOf<Uri>()
                    for (i in 0 until count) {
                        uris.add(data.clipData!!.getItemAt(i).uri)
                    }
                    results = uris.toTypedArray()
                } else if (cameraImageUri != null) {
                    results = arrayOf(cameraImageUri!!)
                }
            }

            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
            cameraImageUri = null
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings: WebSettings = webView.settings

        // Requirement 3: Enable JavaScript, DOM storage, database, file access
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true

        // Requirement 4: Native full-screen feel, disable default browser UI artifacts
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.setSupportZoom(false)
        settings.builtInZoomControls = false
        settings.displayZoomControls = false

        // Custom User Agent identifying native Android shell for BallLink PWA
        val defaultUA = settings.userAgentString
        settings.userAgentString = "$defaultUA BallLinkApp/1.0 (Android Native; Football Talent Connect)"

        // Cache strategy for fast loading
        settings.cacheMode = if (isNetworkAvailable()) {
            WebSettings.LOAD_DEFAULT
        } else {
            WebSettings.LOAD_CACHE_ELSE_NETWORK
        }

        // WebChromeClient: Handles loading progress and file upload chooser
        webView.webChromeClient = object : WebChromeClient() {
            // Requirement 8: Show loading progress bar while site loads
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                super.onProgressChanged(view, newProgress)
                if (newProgress < 100) {
                    progressBar.visibility = View.VISIBLE
                    progressBar.progress = newProgress
                } else {
                    progressBar.visibility = View.GONE
                    swipeRefreshLayout.isRefreshing = false
                    dismissSplashWithAnimation()
                }
            }

            // Requirement 3: File upload trigger for web inputs (<input type="file">)
            override fun onShowFileChooser(
                view: WebView?,
                callback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                filePathCallback?.onReceiveValue(null)
                filePathCallback = callback

                val intentList = mutableListOf<Intent>()

                // Camera intent if user wants to take live photo
                try {
                    val takePhotoIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    if (takePhotoIntent.resolveActivity(packageManager) != null) {
                        val photoFile = createImageFile()
                        if (photoFile != null) {
                            cameraImageUri = FileProvider.getUriForFile(
                                this@MainActivity,
                                "\${applicationContext.packageName}.fileprovider",
                                photoFile
                            )
                            takePhotoIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
                            intentList.add(takePhotoIntent)
                        }
                    }
                } catch (e: Exception) {
                    // Fall back to document picker
                }

                // File / Media picker intent
                val contentIntent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                    putExtra(Intent.EXTRA_INTENT, contentIntent)
                    putExtra(Intent.EXTRA_TITLE, getString(R.string.file_chooser_title))
                    if (intentList.isNotEmpty()) {
                        putExtra(Intent.EXTRA_INITIAL_INTENTS, intentList.toTypedArray())
                    }
                }

                try {
                    fileChooserLauncher.launch(chooserIntent)
                } catch (e: ActivityNotFoundException) {
                    filePathCallback?.onReceiveValue(null)
                    filePathCallback = null
                    Toast.makeText(this@MainActivity, "Cannot open file picker", Toast.LENGTH_SHORT).show()
                    return false
                }

                return true
            }
        }

        // WebViewClient: Internal navigation, error handling, external links
        webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                progressBar.visibility = View.GONE
                swipeRefreshLayout.isRefreshing = false
                dismissSplashWithAnimation()
            }

            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val uri = request?.url ?: return false
                val host = uri.host ?: ""

                // Keep ball-link.web.app and Firebase auth in WebView
                if (host.contains("ball-link.web.app") || host.contains("firebaseapp.com")) {
                    return false
                }

                // External intents (WhatsApp, phone calls, external browser links)
                return try {
                    val intent = Intent(Intent.ACTION_VIEW, uri)
                    startActivity(intent)
                    true
                } catch (e: Exception) {
                    false
                }
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    if (!isNetworkAvailable()) {
                        webView.visibility = View.GONE
                        errorLayout.visibility = View.VISIBLE
                        dismissSplashWithAnimation()
                    }
                }
            }
        }
    }

    private fun setupSwipeRefresh() {
        swipeRefreshLayout.setColorSchemeResources(R.color.brand_green)
        swipeRefreshLayout.setProgressBackgroundColorSchemeResource(R.color.dark_surface)
        swipeRefreshLayout.setOnRefreshListener {
            webView.reload()
        }

        // Enable pull to refresh only when at top of page
        webView.viewTreeObserver.addOnScrollChangedListener {
            swipeRefreshLayout.isEnabled = webView.scrollY == 0
        }
    }

    /**
     * Requirement 6: Handle back button to go back in WebView history, not close app
     */
    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish()
                }
            }
        })
    }

    private fun loadBallLinkUrl(url: String) {
        if (!isNetworkAvailable() && webView.url == null) {
            webView.visibility = View.GONE
            errorLayout.visibility = View.VISIBLE
            dismissSplashWithAnimation()
            return
        }
        webView.loadUrl(url)
    }

    /**
     * Requirement 5: Smooth fade-out of native splash screen once web content is ready
     */
    private fun dismissSplashWithAnimation() {
        if (!isFirstLoad) return
        isFirstLoad = false

        splashOverlay.animate()
            .alpha(0f)
            .setDuration(400)
            .setInterpolator(AccelerateInterpolator())
            .withEndAction {
                splashOverlay.visibility = View.GONE
            }
            .start()
    }

    private fun isNetworkAvailable(): Boolean {
        val connectivityManager = getSystemService(CONNECTIVITY_SERVICE) as? ConnectivityManager ?: return false
        val activeNetwork = connectivityManager.activeNetwork ?: return false
        val capabilities = connectivityManager.getNetworkCapabilities(activeNetwork) ?: return false
        return capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    @Throws(IOException::class)
    private fun createImageFile(): File? {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("BALL_LINK_\${timeStamp}_", ".jpg", storageDir)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Manifest defining package com.balllink.app, INTERNET, CAMERA, media permissions, FileProvider, and intent filters.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.balllink.app">

    <!-- Essential Network Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <!-- File Upload and Media Selection Permissions -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
    <uses-permission android:name="android.permission.CAMERA" />

    <uses-feature
        android:name="android.hardware.camera"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.BallLink"
        android:usesCleartextTraffic="false"
        tools:targetApi="31">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.BallLink">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <!-- App Links / Deep Links for BallLink -->
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="ball-link.web.app" />
            </intent-filter>
        </activity>

        <!-- FileProvider for camera capture uploads -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>

</manifest>`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'App module build script specifying compileSdk 34, minSdk 24, com.balllink.app ID, and AndroidX dependencies.',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.balllink.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.balllink.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.13.1")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("com.google.android.material:material:1.12.0")
    implementation("androidx.activity:activity-ktx:1.9.0")
    implementation("androidx.swiperefreshlayout:swiperefreshlayout:1.1.0")
    implementation("androidx.webkit:webkit:1.11.0")
}`
  },
  {
    path: 'app/src/main/res/layout/activity_main.xml',
    name: 'activity_main.xml',
    language: 'xml',
    category: 'layout',
    description: 'Layout file featuring SwipeRefreshLayout, WebView, custom green ProgressBar, offline screen, and native splash overlay.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.coordinatorlayout.widget.CoordinatorLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/dark_background">

    <!-- Main Content Container with Pull-To-Refresh -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefreshLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent">

        <WebView
            android:id="@+id/webView"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:background="@color/dark_background" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <!-- Top Loading Progress Bar (Brand Green #16a34a) -->
    <ProgressBar
        android:id="@+id/progressBar"
        style="@style/Widget.AppCompat.ProgressBar.Horizontal"
        android:layout_width="match_parent"
        android:layout_height="3.5dp"
        android:indeterminate="false"
        android:max="100"
        android:progressDrawable="@drawable/progress_bar_horizontal"
        android:visibility="gone"
        app:layout_behavior="@string/appbar_scrolling_view_behavior" />

    <!-- Offline / Network Error Overlay -->
    <LinearLayout
        android:id="@+id/errorLayout"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@color/dark_background"
        android:gravity="center"
        android:orientation="vertical"
        android:padding="32dp"
        android:visibility="gone">

        <ImageView
            android:layout_width="84dp"
            android:layout_height="84dp"
            android:contentDescription="@string/app_name"
            android:src="@drawable/ic_football" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:text="@string/error_offline_title"
            android:textColor="@color/text_primary"
            android:textSize="20sp"
            android:textStyle="bold" />

        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="10dp"
            android:gravity="center"
            android:text="@string/error_offline_message"
            android:textColor="@color/text_secondary"
            android:textSize="14sp" />

        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnRetry"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:backgroundTint="@color/brand_green"
            android:paddingHorizontal="24dp"
            android:paddingVertical="12dp"
            android:text="@string/btn_retry"
            android:textColor="@color/white"
            app:cornerRadius="10dp" />
    </LinearLayout>

    <!-- Native Splash Screen Overlay: Green football icon, BallLink text, #16a34a, #0f172a background -->
    <RelativeLayout
        android:id="@+id/splashOverlay"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="@color/dark_background"
        android:clickable="true"
        android:focusable="true">

        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_centerInParent="true"
            android:gravity="center"
            android:orientation="vertical">

            <!-- Football Vector Icon with Green Accent -->
            <ImageView
                android:id="@+id/splashLogo"
                android:layout_width="100dp"
                android:layout_height="100dp"
                android:contentDescription="@string/app_name"
                android:src="@drawable/ic_football" />

            <!-- Brand App Name in Specified Green #16a34a -->
            <TextView
                android:id="@+id/splashTitle"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="20dp"
                android:letterSpacing="0.04"
                android:text="@string/app_name"
                android:textColor="@color/brand_green"
                android:textSize="32sp"
                android:textStyle="bold" />

            <!-- Subtitle -->
            <TextView
                android:id="@+id/splashSubtitle"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginTop="6dp"
                android:letterSpacing="0.08"
                android:text="@string/app_tagline"
                android:textAllCaps="true"
                android:textColor="@color/text_secondary"
                android:textSize="12sp"
                android:textStyle="bold" />

        </LinearLayout>

        <ProgressBar
            android:layout_width="32dp"
            android:layout_height="32dp"
            android:layout_alignParentBottom="true"
            android:layout_centerHorizontal="true"
            android:layout_marginBottom="48dp"
            android:indeterminateTint="@color/brand_green" />

    </RelativeLayout>

</androidx.coordinatorlayout.widget.CoordinatorLayout>`
  },
  {
    path: 'app/src/main/res/values/colors.xml',
    name: 'colors.xml',
    language: 'xml',
    category: 'resources',
    description: 'Color definitions specifying #16a34a green brand color and #0f172a dark background.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Brand colors from specification -->
    <color name="brand_green">#16a34a</color>
    <color name="brand_green_dark">#15803d</color>
    <color name="brand_green_light">#22c55e</color>
    <color name="brand_green_subtle">#10b981</color>
    
    <!-- Dark Theme Backgrounds -->
    <color name="dark_background">#0f172a</color>
    <color name="dark_surface">#1e293b</color>
    <color name="dark_border">#334155</color>
    
    <!-- Text and Highlights -->
    <color name="text_primary">#f8fafc</color>
    <color name="text_secondary">#94a3b8</color>
    <color name="text_muted">#64748b</color>
    
    <!-- System -->
    <color name="black">#FF000000</color>
    <color name="white">#FFFFFFFF</color>
    <color name="status_bar_color">#0f172a</color>
    <color name="nav_bar_color">#0f172a</color>
</resources>`
  },
  {
    path: 'app/src/main/res/drawable/ic_football.xml',
    name: 'ic_football.xml',
    language: 'xml',
    category: 'resources',
    description: 'High-res scalable vector graphic of a football featuring #16a34a green and dark pentagons.',
    content: `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="120dp"
    android:height="120dp"
    android:viewportWidth="120"
    android:viewportHeight="120">
    <path
        android:fillColor="#16a34a"
        android:pathData="M60,60m-54,0a54,54 0,1 1,108 0a54,54 0,1 1,-108 0" />
    <path
        android:strokeColor="#FFFFFF"
        android:strokeWidth="3"
        android:pathData="M60,60m-52,0a52,52 0,1 1,104 0a52,52 0,1 1,-104 0" />
    <path
        android:fillColor="#0f172a"
        android:pathData="M60,40 L76,51 L70,70 L50,70 L44,51 Z" />
    <path
        android:strokeColor="#0f172a"
        android:strokeWidth="3.5"
        android:strokeLineCap="round"
        android:pathData="M60,40 L60,18" />
    <path
        android:strokeColor="#0f172a"
        android:strokeWidth="3.5"
        android:strokeLineCap="round"
        android:pathData="M76,51 L95,44" />
    <path
        android:strokeColor="#0f172a"
        android:strokeWidth="3.5"
        android:strokeLineCap="round"
        android:pathData="M70,70 L83,88" />
    <path
        android:strokeColor="#0f172a"
        android:strokeWidth="3.5"
        android:strokeLineCap="round"
        android:pathData="M50,70 L37,88" />
    <path
        android:strokeColor="#0f172a"
        android:strokeWidth="3.5"
        android:strokeLineCap="round"
        android:pathData="M44,51 L25,44" />
    <path
        android:strokeColor="#22c55e"
        android:strokeWidth="2.5"
        android:strokeLineCap="round"
        android:pathData="M30,30 A45,45 0 0,1 60,15" />
</vector>`
  },
  {
    path: 'app/src/main/res/values/themes.xml',
    name: 'themes.xml',
    language: 'xml',
    category: 'resources',
    description: 'Theme configured without action bar, with #0f172a status bar and #16a34a accent for full-screen PWA feel.',
    content: `<resources xmlns:tools="http://schemas.android.com/tools">
    <style name="Theme.BallLink" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">@color/brand_green</item>
        <item name="colorPrimaryVariant">@color/brand_green_dark</item>
        <item name="colorOnPrimary">@color/white</item>
        <item name="android:windowBackground">@color/dark_background</item>
        <item name="android:colorBackground">@color/dark_background</item>
        <item name="android:statusBarColor">@color/status_bar_color</item>
        <item name="android:navigationBarColor">@color/nav_bar_color</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:windowLightNavigationBar" tools:targetApi="27">false</item>
    </style>
</resources>`
  },
  {
    path: 'app/src/main/res/values/strings.xml',
    name: 'strings.xml',
    language: 'xml',
    category: 'resources',
    description: 'String resources containing App Name "BallLink" and talent connect taglines.',
    content: `<resources>
    <string name="app_name">BallLink</string>
    <string name="app_tagline">Football Talent Connect</string>
    <string name="error_offline_title">No Internet Connection</string>
    <string name="error_offline_message">Please check your network settings and tap retry to reconnect to BallLink.</string>
    <string name="btn_retry">Retry Connection</string>
    <string name="file_chooser_title">Select file or media</string>
</resources>`
  },
  {
    path: '.github/workflows/build-apk.yml',
    name: 'build-apk.yml',
    language: 'yaml',
    category: 'ci',
    description: 'Cloud CI/CD workflow that compiles debug and release APKs automatically on push to GitHub.',
    content: `name: Build BallLink Android APK

on:
  push:
    branches: [ "main", "master" ]
  pull_request:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up JDK 17
      uses: actions/setup-java@v4
      with:
        java-version: '17'
        distribution: 'temurin'
        cache: gradle

    - name: Grant execute permission for gradlew
      run: chmod +x gradlew

    - name: Build Debug APK
      run: ./gradlew assembleDebug --stacktrace

    - name: Build Release APK
      run: ./gradlew assembleRelease --stacktrace

    - name: Upload Debug APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: BallLink-Debug-APK
        path: app/build/outputs/apk/debug/*.apk

    - name: Upload Release APK Artifact
      uses: actions/upload-artifact@v4
      with:
        name: BallLink-Release-APK
        path: app/build/outputs/apk/release/*.apk`
  },
  {
    path: 'build.gradle.kts',
    name: 'build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Root Gradle build script with Android Gradle Plugin 8.5.2 & Kotlin 2.0.0.',
    content: `plugins {
    id("com.android.application") version "8.5.2" apply false
    id("org.jetbrains.kotlin.android") version "2.0.0" apply false
}

tasks.register("clean", Delete::class) {
    delete(rootProject.layout.buildDirectory)
}`
  },
  {
    path: 'settings.gradle.kts',
    name: 'settings.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    description: 'Root settings file configuring Google, MavenCentral, and app module inclusion.',
    content: `pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\\\.android.*")
                includeGroupByRegex("com\\\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "BallLink"
include(":app")`
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    category: 'gradle',
    description: 'Gradle JVM and AndroidX configuration.',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'core',
    description: 'Complete build, run, and Play Store release guide.',
    content: `# BallLink - Football Talent Connect (Native Android App)

Official native Android application wrapper and client for **BallLink - Football Talent Connect** (\`https://ball-link.web.app\`).

## Requirements Fulfilled
1. ✅ **Kotlin & Android SDK 34**
2. ✅ **MainActivity with WebView** loading \`https://ball-link.web.app\`
3. ✅ **JavaScript, DOM storage, database, and file uploads enabled**
4. ✅ **Native PWA feel**: Full screen, immersive dark status bar (\`#0f172a\`), zero browser URL bar
5. ✅ **Splash screen** with football icon and "BallLink" text, green color \`#16a34a\`, dark background \`#0f172a\`
6. ✅ **Back button navigation**: History back in WebView instead of app exit
7. ✅ **Internet permission** added in AndroidManifest.xml
8. ✅ **Loading progress bar**: Green accent bar while loading
9. ✅ **Package name**: \`com.balllink.app\`
10. ✅ **App name**: \`BallLink\``
  }
];
