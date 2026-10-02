---
description: "CUBIT 日本語ガイド：税、流動性バンド、売却で資金供給される買い壁、V2 モジュールと各部分の実際の状況。"
section: "ようこそ / CUBIT"
reading: "プロトコルを理解する"
home: true
search:
  keywords: [ホーム, ドキュメント, ガイド, CUBIT, はじめに]
---

<div class="home-hero">
  <p class="eyebrow">UNISWAP V4 · プロトコルの流動性</p>
  <h1>買い壁を<span class="line-break"></span>支える<span class="line-break"></span><span class="highlight">仕組みを知る。</span></h1>
  <span class="hero-spark" aria-hidden="true"></span>
  <p class="lead">ローンチ時に置かれる流動性バンド。ETH 買い壁の資金となる売却。このガイドでは CUBIT のルール、使い方、限界を説明します。</p>
  <div class="hero-actions">
    <a href="comprendre/essentiel.md" class="primary-button">ここから始める →</a>
    <a href="securite/etat.md" class="secondary-button">バージョンの状況を見る ↗</a>
  </div>
</div>

<div class="edition-alert">
  <span class="alert-icon" aria-hidden="true">!</span>
  <p><strong>このガイドは CUBIT の新バージョンを説明しています。</strong><span class="line-break"></span>CUBIT は Ethereum にデプロイされ、アプリはそのデプロイを読んでいます。LP 手数料は 0.01 % です。市場は 2026 年 9 月 22 日に開場しました。売買はアプリで行えます。</p>
</div>

<dl class="metric-strip">
  <div><dt>総供給量</dt><dd>2,100万</dd><small>CUBIT · 追加発行なし</small></div>
  <div><dt>購入税</dt><dd>3 %</dd><small>チーム分</small></div>
  <div><dt>売却税</dt><dd>15 %</dd><small>12 % 買い壁 / 3 % チーム</small></div>
  <div><dt>目標 LP 手数料</dt><dd>0.01 %</dd><small>新バージョン · fee 100</small></div>
</dl>

<div class="home-heading"><h2>読み始める場所を選びましょう。</h2><span>01 — 読み方</span></div>

<div class="guide-cards">
  <a href="comprendre/murs.md" class="guide-card"><span class="card-index">01 / 理解する</span><strong>買い壁の<span class="line-break"></span>資金の仕組み。</strong><p>目標価格、各売却の 12 %、tick に固定された買い壁。</p><span class="card-link">仕組みを見る →</span></a>
  <a href="utiliser/swaps.md" class="guide-card"><span class="card-index">02 / 使う</span><strong>署名前に<span class="line-break"></span>確認する。</strong><p>手取りの見積もり、承認、オンチェーンデータ。</p><span class="card-link">利用ガイドを開く →</span></a>
  <a href="developper/architecture.md" class="guide-card"><span class="card-index">03 / 開発する</span><strong>コントラクトから<span class="line-break"></span>インターフェースへ。</strong><p>フック、バンド、V2 レジストリ、Vault。</p><span class="card-link">コードベースを見る →</span></a>
</div>

<div class="home-heading"><h2>一つの市場、二つの独立したブック。</h2><span>02 — 動作の仕組み</span></div>

<div class="mechanism-strip">
  <div><div class="number">01 — 売却</div><strong>売却ごとに 12 % が<span class="line-break"></span>買い壁の資金に。</strong><p>買い壁は売却後に計算された目標に配置されます。ローンチ価格以下では、現在価格の 1 % 下に配置されます。</p></div>
  <div><div class="number">02 — 買い壁</div><strong>固定された水準。<span class="line-break"></span>有限の ETH。</strong><p>買い壁の価格と売却を吸収できる量は別の情報です。</p></div>
  <div><div class="number">03 — バンド</div><strong>一度だけ<span class="line-break"></span>置かれる流動性。</strong><p>供給量の 80 % をローンチ価格から曲線の頂点まで配置し、引き出すことはありません。</p></div>
</div>

## 重要なポイント

各売却は**総 ETH の 12 %** を買い壁に充てます。フックはまず価格が完全に通過した買い壁を空にし、次に待機中の ETH を `cible = 0.4 × prix courant + 0.6 × prix de lancement` に置かれる買い壁に配置します。この目標は売却後の価格で計算されます。この目標が市場より上になるローンチ価格以下では、買い壁は現在価格の 1 % 下に配置されます。説明用の基準を 7 000 単位とすると、目標は**市場が 30k なら 16.2k**、**100k なら 44.2k**、**60k に戻れば 28.2k**です。過去最高値には依存しません。

買い壁は自身の tick にとどまります。完全に通過されると空にされ、その CUBIT は Vault の報酬準備金に移ります。もうバーンはされません。このルールが追加資金や無制限の買い戻し能力を生むことはありません。[例と目標シミュレーターを見る](comprendre/murs.md)。

## 状況を明示するドキュメント

このガイドはコードに実装されているとおりにプロトコルを説明し、**稼働中の Ethereum デプロイ**を明示します。V2 では、Momentum と Forge が 2026 年 9 月 23 日から、Vault が 2026 年 9 月 26 日から公開されています。今後のステップは[ロードマップ](roadmap.md)に記載しています。

バージョンを確認するには、[バージョンの状況](securite/etat.md)、[権限](securite/permissions.md)、[限界](securite/risques.md)の順に参照してください。旧テスト報告は新バージョンを保証しません。
