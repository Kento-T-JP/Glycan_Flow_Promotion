# Glycan Flow Promotion

糖鎖生合成、特にN型糖鎖がゴルジ体で処理される流れを、反応ネットワークとして操作しながら理解するための静的Webアプリケーションです。

ユーザーは、糖の材料・ゴルジ体での反応時間を変更し、マンノシダーゼ、MGAT、GalT、ST/FUT の働きを増やす・減らす・止めることで、未加工タイプ、枝分かれタイプ、仕上げ済みタイプの分布がどう変わるかを確認できます。

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
