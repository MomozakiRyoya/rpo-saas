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

async function getJobs(token) {
  const response = await fetch(`${API_URL}/api/jobs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  return data;
}

async function main() {
  const token = await login();
  const jobs = await getJobs(token);
  
  if (jobs.data && jobs.data.length > 0) {
    console.log('利用可能なジョブ:');
    jobs.data.slice(0, 5).forEach(job => {
      console.log(`- ${job.id}: ${job.title}`);
    });
    console.log(`\n最初のJob IDを使用: ${jobs.data[0].id}`);
    return jobs.data[0].id;
  } else {
    console.log('ジョブが見つかりません');
  }
}

main().then(jobId => {
  if (jobId) {
    console.log(`\nテストコマンド:\nnode test-generation.js ${jobId}`);
  }
});
