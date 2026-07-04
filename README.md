# Glycan Flow Promotion

フローネットワークを用いた糖鎖生合成過程の数理モデル化を紹介する、静的なインタラクティブWebアプリケーションです。

## Local Preview

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

## GitHub Pages

This repository is ready to publish from the repository root.

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Select `main` and `/ (root)`.
5. Save the settings.

The app uses only static files:

- `index.html`
- `styles.css`
- `app.js`

PDF files are intentionally ignored by Git.
