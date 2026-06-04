# 📱 MboaClean — Générer l'APK Android

L'app web est empaquetée en application Android native avec **Capacitor**. Le projet
Android se trouve dans le dossier [`android/`](android/). Voici **deux façons** d'obtenir
le fichier `.apk` installable.

> Identité de l'app : `appId = cm.mboaclean.app`, nom = **MboaClean** (voir [capacitor.config.ts](capacitor.config.ts)).

---

## ☁️ Option 1 — Build dans le cloud (recommandé, rien à installer)

Aucun outil Android sur ton PC. GitHub compile l'APK pour toi.

1. Crée un dépôt GitHub et pousse le dossier `mboaclean/` (avec le sous-dossier `android/`).
2. Le workflow [.github/workflows/android-apk.yml](.github/workflows/android-apk.yml) se lance
   automatiquement au push, **ou** manuellement : onglet **Actions → Build Android APK → Run workflow**.
3. À la fin (~5 min), ouvre le run → section **Artifacts** → télécharge **`MboaClean-apk`**.
4. Dézippe : tu obtiens **`app-debug.apk`** → copie-le sur le téléphone et installe-le.

> 🔑 Pour activer l'IA Gemini dans l'APK : dépôt GitHub → **Settings → Secrets and variables →
> Actions → New repository secret** → nom `VITE_GEMINI_API_KEY`, valeur = ta clé gratuite.
> Sans secret, l'app marche quand même (assistant + conseils en mode local).

---

## 💻 Option 2 — Build local avec Android Studio

Une seule installation (inclut le JDK + le SDK Android), puis build hors-ligne.

1. Installe **Android Studio** : https://developer.android.com/studio
2. Dans ce dossier :
   ```bash
   npm install
   npm run android:open      # build web + sync + ouvre Android Studio
   ```
3. Dans Android Studio : **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. L'APK est généré dans :
   `android/app/build/outputs/apk/debug/app-debug.apk`

### En ligne de commande (si le SDK Android est déjà configuré)
```bash
npm run android:apk
# → android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📲 Installer l'APK sur le téléphone

1. Transfère `app-debug.apk` sur le téléphone (USB, WhatsApp, Drive…).
2. Ouvre-le → autorise **« Installer des applications de sources inconnues »** si demandé.
3. Installe → l'icône **MboaClean** apparaît sur l'écran d'accueil.

> Permissions utilisées : **caméra** (photo du dépôt), **localisation** (GPS du signalement),
> **internet** (carte + IA). Déclarées dans
> [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml).

---

## 🔁 Après une modification du code
```bash
npm run android:sync   # rebuild web + recopie dans le projet Android
```
puis rebuild l'APK (Option 1 ou 2).

## ⚠️ Debug vs Release
`app-debug.apk` est parfait pour **tester et partager**. Pour le **Play Store**, il faut un
**APK/AAB signé** (release) avec une clé de signature — étape suivante quand tu seras prêt à publier.
