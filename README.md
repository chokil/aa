# 翠光 SUIGO

心に残るデジタル体験を創造するクリエイティブスタジオのランディングページです。

## Scripts

- `npm run dev` — Vite 開発サーバー（ポート 5173）
- `npm run build` — 本番ビルド（`dist/` に出力）
- `npm run preview` — 本番ビルドのプレビュー（ポート 4173）

## Vercel へのデプロイ

### GitHub 連携（おすすめ）

1. [vercel.com](https://vercel.com) にログイン
2. **Add New → Project** を選択
3. GitHub リポジトリ `chokil/aa` をインポート
4. 設定はそのままで OK（Vite を自動検出）
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Deploy** をクリック

デプロイ後、`https://プロジェクト名.vercel.app` の URL が発行されます。スマホのブラウザからその URL を開けば確認できます。

### CLI からデプロイ

```bash
npm install -g vercel
vercel login
vercel --prod
```
