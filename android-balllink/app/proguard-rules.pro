# BallLink ProGuard Rules
-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class com.balllink.app.MainActivity$** {
    *;
}
