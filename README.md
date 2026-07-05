# Glycan Flow Promotion

糖鎖生合成、特にN型糖鎖がゴルジ体で処理される流れを、ネットワークとして直接操作する静的Webアプリケーションです。

Node は糖鎖、Edge は生合成反応、Edge Capacity は反応能力、Flow は糖鎖生成の流れを表します。ユーザーはネットワーク上のEdgeを選び、Capacityを増やす・減らす・止めることで、Flowと最終糖鎖分布の変化をリアルタイムに確認できます。

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
