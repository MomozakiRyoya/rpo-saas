const API_URL = 'https://rpo-saas-backend-production-84a8.up.railway.app';

// ログイン
async function login() {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@demo.com',
      password: 'password123'
    })
  });
  const data = await response.json();
  return data.accessToken;
}

// テキスト生成テスト
async function testTextGeneration(token, jobId) {
  console.log('\n📝 テキスト生成テスト開始...');
  
  const response = await fetch(`${API_URL}/api/generation/text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ jobId })
  });
  
  const data = await response.json();
  console.log('レスポンス:', JSON.stringify(data, null, 2));
  
  if (data.queueJobId) {
    console.log('✅ ジョブがキューに追加されました');
    console.log('Queue Job ID:', data.queueJobId);
    return data.queueJobId;
  } else {
    console.log('❌ エラー:', data);
  }
}

// 画像生成テスト
async function testImageGeneration(token, jobId) {
  console.log('\n🖼️  画像生成テスト開始...');
  
  const response = await fetch(`${API_URL}/api/generation/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ jobId })
  });
  
  const data = await response.json();
  console.log('レスポンス:', JSON.stringify(data, null, 2));
  
  if (data.queueJobId) {
    console.log('✅ ジョブがキューに追加されました');
    console.log('Queue Job ID:', data.queueJobId);
    return data.queueJobId;
  } else {
    console.log('❌ エラー:', data);
  }
}

// ジョブステータス確認
async function checkJobStatus(token, queueName, jobId) {
  console.log(`\n🔍 ジョブステータス確認: ${queueName}/${jobId}`);
  
  const response = await fetch(`${API_URL}/queue/job/${queueName}/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    console.log('ステータス:', data.state);
    console.log('進捗:', data.progress);
    if (data.returnvalue) {
      console.log('結果:', JSON.stringify(data.returnvalue, null, 2));
    }
    if (data.failedReason) {
      console.log('❌ エラー:', data.failedReason);
    }
    return data;
  } else {
    console.log('❌ ジョブ情報取得失敗');
  }
}

// メイン実行
async function main() {
  console.log('🚀 RPO-SaaS API テスト開始\n');
  
  try {
    // ログイン
    console.log('1️⃣ ログイン中...');
    const token = await login();
    console.log('✅ ログイン成功\n');
    
    // テスト用のJob IDを使用（既存のジョブを使用）
    const jobId = process.argv[2] || 'test-job-id';
    console.log(`使用するJob ID: ${jobId}`);
    
    if (jobId === 'test-job-id') {
      console.log('\n⚠️  Job IDが指定されていません');
      console.log('使い方: node test-generation.js <job-id>');
      console.log('例: node test-generation.js cm123abc456');
      return;
    }
    
    // テキスト生成
    const textJobId = await testTextGeneration(token, jobId);
    
    // 3秒待機
    console.log('\n⏳ 3秒待機...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // テキスト生成ジョブのステータス確認
    if (textJobId) {
      await checkJobStatus(token, 'text-generation', textJobId);
    }
    
    // 画像生成
    const imageJobId = await testImageGeneration(token, jobId);
    
    // 3秒待機
    console.log('\n⏳ 3秒待機...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 画像生成ジョブのステータス確認
    if (imageJobId) {
      await checkJobStatus(token, 'image-generation', imageJobId);
    }
    
    console.log('\n✅ テスト完了');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

main();
