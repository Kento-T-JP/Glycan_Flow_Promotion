# Glycan Flow Promotion

糖鎖生合成のような段階的な生命現象を、反応ネットワークとして操作しながら理解するための静的Webアプリケーションです。

ユーザーは、栄養供給・酵素活性・細胞ストレス・阻害効果を変更し、反応点を促進または抑制することで、生成物の分布がどう変わるかを確認できます。

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
