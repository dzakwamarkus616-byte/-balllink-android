import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectFiles';

export async function generateAndDownloadProjectZip(customOptions?: {
  appName?: string;
  packageName?: string;
  url?: string;
}): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('BallLink-Android');

  if (!root) {
    throw new Error('Failed to initialize zip root folder');
  }

  const appName = customOptions?.appName || 'BallLink';
  const packageName = customOptions?.packageName || 'com.balllink.app';
  const targetUrl = customOptions?.url || 'https://ball-link.web.app';

  // Add all primary files from registry
  for (const file of ANDROID_PROJECT_FILES) {
    let content = file.content;
    let path = file.path;

    // Apply any customized values
    if (packageName !== 'com.balllink.app') {
      content = content.replace(/com\.balllink\.app/g, packageName);
      if (path.includes('com/balllink/app')) {
        const packagePath = packageName.replace(/\./g, '/');
        path = path.replace('com/balllink/app', packagePath);
      }
    }
    if (appName !== 'BallLink') {
      content = content.replace(/<string name="app_name">BallLink<\/string>/g, `<string name="app_name">${appName}</string>`);
      content = content.replace(/BallLink/g, appName);
    }
    if (targetUrl !== 'https://ball-link.web.app') {
      content = content.replace(/https:\/\/ball-link\.web\.app/g, targetUrl);
    }

    root.file(path, content);
  }

  // Add supplementary helper files
  root.file('gradle/wrapper/gradle-wrapper.properties', `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`);

  root.file('app/src/main/res/drawable/progress_bar_horizontal.xml', `<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:id="@android:id/background">
        <shape>
            <solid android:color="#1e293b" />
        </shape>
    </item>
    <item android:id="@android:id/progress">
        <clip>
            <shape>
                <solid android:color="#16a34a" />
            </shape>
        </clip>
    </item>
</layer-list>`);

  root.file('app/src/main/res/drawable/ic_launcher_background.xml', `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:fillColor="#0f172a"
        android:pathData="M0,0h108v108h-108z" />
</vector>`);

  root.file('app/src/main/res/drawable/ic_launcher_foreground.xml', `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <group
        android:scaleX="0.65"
        android:scaleY="0.65"
        android:translateX="18.9"
        android:translateY="18.9">
        <path
            android:fillColor="#16a34a"
            android:pathData="M54,54m-48,0a48,48 0,1 1,96 0a48,48 0,1 1,-96 0" />
        <path
            android:strokeColor="#FFFFFF"
            android:strokeWidth="3"
            android:pathData="M54,54m-46,0a46,46 0,1 1,92 0a46,46 0,1 1,-92 0" />
        <path
            android:fillColor="#0f172a"
            android:pathData="M54,36 L68,46 L63,63 L45,63 L40,46 Z" />
        <path
            android:strokeColor="#0f172a"
            android:strokeWidth="3"
            android:pathData="M54,36 L54,16 M68,46 L85,40 M63,63 L74,79 M45,63 L34,79 M40,46 L23,40" />
    </group>
</vector>`);

  root.file('app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@drawable/ic_launcher_background" />
    <foreground android:drawable="@drawable/ic_launcher_foreground" />
</adaptive-icon>`);

  root.file('app/src/main/res/xml/file_paths.xml', `<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
    <external-path name="my_images" path="." />
    <cache-path name="cache" path="." />
    <files-path name="files" path="." />
</paths>`);

  root.file('app/src/main/res/xml/backup_rules.xml', `<?xml version="1.0" encoding="utf-8"?>
<full-backup-content>
    <include domain="sharedpref" path="."/>
</full-backup-content>`);

  root.file('app/src/main/res/xml/data_extraction_rules.xml', `<?xml version="1.0" encoding="utf-8"?>
<data-extraction-rules>
    <cloud-backup>
        <include domain="sharedpref" path="."/>
    </cloud-backup>
    <device-transfer>
        <include domain="sharedpref" path="."/>
    </device-transfer>
</data-extraction-rules>`);

  root.file('app/proguard-rules.pro', `-keepattributes JavascriptInterface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepclassmembers class com.balllink.app.MainActivity$** {
    *;
}`);

  root.file('gradlew', `#!/bin/sh
APP_BASE_NAME=\`basename "$0"\`
CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar
exec java -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
`);

  root.file('gradlew.bat', `@echo off
set CLASSPATH=%APP_HOME%\\gradle\\wrapper\\gradle-wrapper.jar
java -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
`);

  // Generate blob and trigger browser download
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `BallLink-Android-Project.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
