# File map

Paths are from the repo root. "Ask for" means: before changing the feature, request the current text of these files.

## Existing features

| Feature | Files |
| --- | --- |
| Settings and folders (config model, add/remove/update folders, presets) | agent/config.go, folderops.go, presets.go, folders_windows.go, folders_other.go, webui_folders.go (if present) and their tests |
| Crawling, rules, snapshot | agent/crawler.go, rules.go, snapshot.go, indexer.go, defaults_test.go |
| Phone API, auth, rate limit | agent/server.go, ratelimit.go, server_test.go, gzip_test.go, roots_test.go |
| Pairing and devices | agent/pairing.go (old token QR), pairing_code.go, paircodes.go, devices.go, webui_pairing.go, pair_api_test.go |
| File access (downloads from PC) | agent/download.go, webui_access.go, download_test.go |
| Uploads (phone to PC) | agent/uploads.go, uploadsettings.go, webui_uploads_open.go, upload_test.go, webui_uploads_test.go |
| Update check | agent/updatecheck.go, webui_update.go, server.go (ping field), brand.go, tests; dashboard bits in web/ |
| Dashboard backend | agent/webui.go, webui_*.go, events.go, logger.go, webui_logs.go, report.go |
| Dashboard frontend | agent/web/templates/index.html, locked.html, web/static/app.js, style.css, theme.js |
| Terminal UX, start-up, background | agent/main.go, console*.go, banner.go, explain.go, launch.go, detach_*.go, explorer_*.go, brand.go |
| Autostart | agent/autostart*.go |
| Troubleshooter | agent/doctor*.go, webui_doctor.go |
| mDNS discovery | agent/mdns.go, mobile/src/discovery/index.ts |
| Windows icon and file details | agent/winres/*, agent/rsrc_windows_*.syso |
| App shell, navigation | mobile/App.tsx, index.ts, src/session.tsx, src/settings.ts, src/components/TabBar.tsx |
| Pairing and connection (app) | src/pairing.ts, src/api/client.ts, src/screens/PairScreen.tsx, src/platform/* |
| Sync and database | src/sync.ts, src/db/index.ts, src/db/queries.ts, src/types.ts |
| Browse, search, filters, selection | src/screens/FilesScreen.tsx, ListScreen.tsx, src/components/FileRow.tsx, FilterSheet.tsx, SelectionBar.tsx, src/filters.ts, useSelection.ts, fileTypes.ts, format.ts |
| File details, open, share, preview | src/components/DetailsSheet.tsx, src/useFileActions.ts, src/files.ts, src/actions.tsx |
| Downloads (queue, save, UI) | src/downloadQueue.ts, downloads.ts, components/DownloadsBar.tsx, DownloadsSheet.tsx, Bar.tsx, actions.tsx |
| Upload (app) | src/upload.ts, useUpload.ts, components/UploadSheet.tsx, SendToPcCard.tsx |
| Onboarding and info | src/screens/WelcomeScreen.tsx, components/AgentInfo.tsx, src/demo.ts |
| Settings screen (app) | src/screens/SettingsScreen.tsx, src/version.ts, src/brand.ts, components/BrandFooter.tsx, TrustNotice.tsx |
| Theme and UI kit | src/theme/*, src/ui/* |
| App build config | mobile/app.json, eas.json, package.json, tsconfig.json |
| Website | site/build.mjs, site.json, package.json, src/index.html, docs.html, 404.html, src/assets/app.js, style.css, partials/*, .github/workflows/pages.yml |
| Release and packaging | .goreleaser.yaml, .github/workflows/release.yml, ci.yml, scripts/*, packaging/linux/perigee.desktop, branding/* |
| Docs | README.md, SECURITY.md, docs/*.md (API, FAQ, GETTING_STARTED, PRIVACY, SECURITY_MODEL, FEATURES), THIRD_PARTY_NOTICES.md (generated) |

## Future features (docs/FEATURES.md, "Ideas for later" and Milestones 7-8)

| Feature | What it needs | Ask for |
| --- | --- | --- |
| System tray / menu-bar icon | A tray library (cgo on macOS; GNOME needs an extension); menu: open dashboard, show pairing code, pause, quit | agent/main.go, launch.go, autostart.go, webui.go, webui_pairing.go, .goreleaser.yaml, .github/workflows/release.yml |
| Scheduled rescans | A config key, a ticker, a dashboard setting | agent/indexer.go, config.go, main.go, webui.go, web/templates/index.html, web/static/app.js |
| Pause sharing | One flag checked by the auth middleware; a dashboard switch; an app message | agent/server.go, config.go, webui.go, web/*, mobile/src/api/client.ts, session.tsx |
| `.nosync` private-folder marker | Crawler skips folders with the marker; explain it in the path tester | agent/crawler.go, crawler_test.go, rules.go, docs/GETTING_STARTED.md |
| Disk-usage view | Sizes by folder and type (agent stat endpoint, app query) | agent/webui.go, snapshot.go, web/*, mobile/src/db/queries.ts, screens/HomeScreen.tsx |
| Duplicate finder | SQL on name and size; a list screen | mobile/src/db/queries.ts, screens/*, tabs in components/TabBar.tsx and App.tsx |
| Per-device approval | A pending state for new phones; approve in the dashboard | agent/server.go (pairHandler), devices.go, webui_pairing.go, web/*, mobile/src/pairing.ts, PairScreen.tsx, api/client.ts |
| Several PCs in one app | One database per PC; a PC switcher | mobile/src/pairing.ts, db/index.ts, session.tsx, App.tsx, sync.ts, pcPaths.ts, screens/SettingsScreen.tsx, HomeScreen.tsx |
| Phone as an extra source | Index the phone's own files; media permissions | mobile/src/db/*, sync.ts, screens/FilesScreen.tsx, app.json |
| Faster sync (delta, watcher, resume) | Agent file watcher, an API `since` parameter, incremental app sync (API additive) | agent/indexer.go, crawler.go, server.go, docs/API.md, mobile/src/sync.ts, db/* |
| Smarter search (FTS5, fuzzy) | A schema migration and new queries | mobile/src/db/index.ts, queries.ts, sync.ts |
| Check-my-setup in the problem report | Add doctor results to the report text | agent/report.go, webui_logs.go, doctor.go |
| Encrypt the connection | New handshake from the pairing code, authenticated encryption of requests and bodies; changes API docs, banners and privacy wording | agent/server.go, pairing_code.go, paircodes.go, devices.go, webui_pairing.go, mobile/src/api/client.ts, files.ts, upload.ts, pairing.ts, docs/API.md, SECURITY_MODEL.md, PRIVACY.md, site/src/index.html, components/TrustNotice.tsx, the dashboard banners |
| Keep folder structure for folder downloads (Android) | A save method that takes subfolders (native or SAF) | mobile/src/downloads.ts, downloadQueue.ts, app.json, package.json |
| Share to the app from other apps | Android intent filter via a config plugin; hand shared files to the upload sheet | mobile/app.json, App.tsx, useUpload.ts, upload.ts, actions.tsx |
| Received-files list and whole-folder upload | Agent keeps a list; app picks folders | agent/uploads.go, webui_*.go, web/*, mobile/src/upload.ts, useUpload.ts |
| Phone-to-phone through the PC | An inbox per phone on the agent, "new file" notice, reuse the download queue | agent/devices.go, server.go, uploads.go, download.go, new inbox file, mobile/src/api/client.ts, actions.tsx, downloadQueue.ts, UploadSheet.tsx |
| Clear temporary files | Settings rows (app) and a dashboard button | mobile/src/screens/SettingsScreen.tsx, files.ts (clearOpenedFiles), downloadQueue.ts, agent/webui*.go, web/* |
| Background downloads (foreground service) | A native library; the queue must survive the app closing | mobile/src/downloadQueue.ts, files.ts, app.json, package.json |
| Byte-level resume of downloads | Use Range with a saved partial file | mobile/src/files.ts, downloadQueue.ts |
| Download counts on the landing page | Sum GitHub's per-file download_count | site/src/assets/app.js, site/src/index.html, site/build.mjs, .github/workflows/pages.yml |
| iPhone release | Build, discovery, permissions, save to Files | mobile/app.json, eas.json, src/discovery/index.ts, downloads.ts (iOS branch), platform/*, docs/STORE_LISTING.md |
| Store releases (Play, App Store) | Accounts, listings, data-safety forms | docs/STORE_LISTING.md, docs/PUBLISHING.md, mobile/eas.json, app.json |
| Package managers (winget, AUR, COPR) | Manifests and release wiring | .goreleaser.yaml, .github/workflows/release.yml, new packaging/* |
| Code signing and notarization | SignPath (Windows), a macOS runner job (Apple) | .github/workflows/release.yml, .goreleaser.yaml, scripts/make-macapp.sh |
| Localization | Move UI strings out of components | mobile/src/screens/*, components/*, agent/web/*, docs |
| OTA updates (EAS Update) | expo-updates config | mobile/app.json, eas.json, package.json |