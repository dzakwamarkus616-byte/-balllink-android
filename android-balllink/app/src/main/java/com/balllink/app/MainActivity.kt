package com.balllink.app

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
                                "${applicationContext.packageName}.fileprovider",
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
        return File.createTempFile("BALL_LINK_${timeStamp}_", ".jpg", storageDir)
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
