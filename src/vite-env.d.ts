/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Clé API Google Gemini (palier gratuit) — facultative ; sinon repli local. */
  readonly VITE_GEMINI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
