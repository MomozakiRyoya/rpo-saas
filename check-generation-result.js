const API_URL = 'https://rpo-saas-backend-production-84a8.up.railway.app';

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

async function checkJobResult(token, queueName, jobId) {
  const response = await fetch(`${API_URL}/queue/job/${queueName}/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('\n=== ジョブ結果詳細 ===');
  console.log('ステータス:', data.state);
  console.log('結果:', JSON.stringify(data.returnvalue, null, 2));
  if (data.failedReason) {
    console.log('エラー:', data.failedReason);
  }
  return data;
}

async function main() {
  const token = await login();
  
  // テキスト生成ジョブの結果確認
  console.log('📝 テキスト生成ジョブの結果:');
  await checkJobResult(token, 'text-generation', '1');
  
  // 画像生成ジョブの結果確認
  console.log('\n🖼️  画像生成ジョブの結果:');
  await checkJobResult(token, 'image-generation', '1');
}

main().catch(console.error);
