const API_URL = 'https://rpo-saas-backend-production-84a8.up.railway.app';

async function checkStatus() {
  try {
    const response = await fetch(`${API_URL}/diagnostics`);
    const data = await response.json();

    console.log(`\n[${new Date().toLocaleTimeString('ja-JP')}] デプロイ状況:`);
    console.log(`Version: ${data.version}`);
    console.log(`ANTHROPIC_API_KEY: ${data.environment.ANTHROPIC_API_KEY}`);
    console.log(`GEMINI_API_KEY: ${data.environment.GEMINI_API_KEY}`);
    console.log(`RESEND_API_KEY: ${data.environment.RESEND_API_KEY}`);

    if (data.environment.ANTHROPIC_API_KEY === 'SET' && data.environment.GEMINI_API_KEY === 'SET') {
      console.log('\n✅ すべてのAPIキーが設定されました！');
      console.log('\n次のコマンドでテストを実行してください:');
      console.log('node test-generation.js e2622c13-1331-4530-b1f9-643b077c1162');
      process.exit(0);
    } else {
      console.log('\n⏳ APIキーがまだ設定されていません...');
    }
  } catch (error) {
    console.error(`❌ エラー: ${error.message}`);
  }
}

// 15秒ごとにチェック
console.log('🔍 デプロイ監視を開始します... (Ctrl+C で終了)');
checkStatus();
setInterval(checkStatus, 15000);
