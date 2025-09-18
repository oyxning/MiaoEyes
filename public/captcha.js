// 验证码生成脚本
const generateCaptchaImage = (text, width = 200, height = 80) => {
  try {
    // 创建画布
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // 填充背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // 添加干扰线
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, ${Math.random() * 100 + 50}, 0.5)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.lineWidth = Math.random() * 2 + 1;
      ctx.stroke();
    }
    
    // 添加干扰点
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 绘制文本
    const fontSize = height * 0.6;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 绘制每个字符，带有轻微的旋转
    const charWidth = width / text.length;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const x = charWidth * (i + 0.5);
      const y = height / 2;
      const rotation = (Math.random() - 0.5) * 0.4; // -0.2 到 0.2 弧度
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `rgb(${Math.random() * 80}, ${Math.random() * 80}, ${Math.random() * 80})`;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
    
    // 返回画布数据URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to generate captcha:', error);
    // 如果画布不可用，返回一个简单的文本表示
    return `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`;
  }
};

// 导出函数以便在浏览器中使用
if (typeof window !== 'undefined') {
  window.generateCaptchaImage = generateCaptchaImage;
}

// 导出函数以便在Node.js中使用
if (typeof module !== 'undefined') {
  module.exports = { generateCaptchaImage };
}