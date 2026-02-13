const { spawn } = require('child_process');
const isWin = process.platform === 'win32';
// 逻辑：如果是 Windows 用 .bat，否则用 ./gradlew
const cmd = isWin ? 'gradlew.bat' : './gradlew';
const args = process.argv.slice(2); // 获取传给脚本的参数，比如 bootRun

spawn(cmd, args, {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});
