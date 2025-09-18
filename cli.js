#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// 创建命令行交互界面
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 项目根目录
const projectRoot = path.resolve(__dirname);

// 清理项目函数
function cleanProject() {
  console.log('\n=== 开始清理项目 ===');
  
  try {
    // 删除node_modules
    const nodeModulesPath = path.join(projectRoot, 'node_modules');
    if (fs.existsSync(nodeModulesPath)) {
      console.log('正在删除主项目node_modules...');
      // 在Windows上使用rmdir /s /q，在其他系统上使用rm -rf
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${nodeModulesPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${nodeModulesPath}"`, { stdio: 'ignore' });
      }
    }

    // 删除client的node_modules
    const clientNodeModulesPath = path.join(projectRoot, 'src', 'client', 'node_modules');
    if (fs.existsSync(clientNodeModulesPath)) {
      console.log('正在删除client node_modules...');
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${clientNodeModulesPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${clientNodeModulesPath}"`, { stdio: 'ignore' });
      }
    }

    // 删除构建文件
    const clientDistPath = path.join(projectRoot, 'src', 'client', 'dist');
    if (fs.existsSync(clientDistPath)) {
      console.log('正在删除client构建文件...');
      if (process.platform === 'win32') {
        execSync(`rmdir /s /q "${clientDistPath}"`, { stdio: 'ignore' });
      } else {
        execSync(`rm -rf "${clientDistPath}"`, { stdio: 'ignore' });
      }
    }

    // 删除npm锁文件
    const lockFiles = [
      path.join(projectRoot, 'package-lock.json'),
      path.join(projectRoot, 'yarn.lock'),
      path.join(projectRoot, 'src', 'client', 'package-lock.json'),
      path.join(projectRoot, 'src', 'client', 'yarn.lock')
    ];

    lockFiles.forEach(lockFile => {
      if (fs.existsSync(lockFile)) {
        console.log(`正在删除锁文件: ${path.basename(lockFile)}`);
        fs.unlinkSync(lockFile);
      }
    });

    console.log('\n项目清理完成！');
  } catch (error) {
    console.error('清理项目时出错:', error.message);
    process.exit(1);
  }
}

// 安装项目函数
function installProject() {
  console.log('\n=== 开始安装项目 ===');
  
  try {
    // 安装主项目依赖
    console.log('正在安装主项目依赖...');
    execSync('npm install', { stdio: 'inherit', cwd: projectRoot });
    
    // 安装client依赖
    console.log('\n正在安装client依赖...');
    execSync('npm install', { stdio: 'inherit', cwd: path.join(projectRoot, 'src', 'client') });
    
    // 构建client
    console.log('\n正在构建client...');
    execSync('npm run build', { stdio: 'inherit', cwd: path.join(projectRoot, 'src', 'client') });
    
    console.log('\n项目安装完成！');
  } catch (error) {
    console.error('安装项目时出错:', error.message);
    process.exit(1);
  }
}

// 显示命令行菜单
function showMenu() {
  console.log('\n=== MiaoEyes 命令行管理工具 ===');
  console.log('1. 清理项目（删除依赖和构建文件）');
  console.log('2. 安装项目（安装依赖并构建）');
  console.log('3. 退出');
  
  rl.question('请选择操作 (1-3): ', (choice) => {
    switch (choice.trim()) {
      case '1':
        rl.question('警告：此操作将删除所有依赖和构建文件，是否继续？(y/n): ', (confirm) => {
          if (confirm.toLowerCase() === 'y') {
            cleanProject();
            showMenu();
          } else {
            console.log('操作已取消。');
            showMenu();
          }
        });
        break;
      case '2':
        installProject();
        showMenu();
        break;
      case '3':
        console.log('感谢使用MiaoEyes命令行管理工具！再见。');
        rl.close();
        break;
      default:
        console.log('无效的选择，请重新输入。');
        showMenu();
    }
  });
}

// 处理Ctrl+C退出
process.on('SIGINT', () => {
  console.log('\n感谢使用MiaoEyes命令行管理工具！再见。');
  rl.close();
  process.exit(0);
});

// 启动命令行菜单
showMenu();