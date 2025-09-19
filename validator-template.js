// MiaoEyes验证器模板
// 将此代码嵌入到需要保护的网站页面中

(function() {
    const MiaoEyesValidator = {
        config: {
            apiUrl: 'http://localhost:3000',
            checkEndpoint: '/api/check-verification',
            verifyEndpoint: '/verify',
            sessionTimeout: 300000,
            verificationTimeout: 3600000
        },
        
        init: function(customConfig) {
            Object.assign(this.config, customConfig || {});
            this.checkVerification();
        },
        
        checkVerification: async function() {
            try {
                const response = await fetch(this.config.apiUrl + this.config.checkEndpoint, {
                    method: 'GET',
                    credentials: 'include'
                });
                
                const data = await response.json();
                
                if (!data.verified) {
                    this.redirectToVerification();
                }
                
            } catch (error) {
                console.warn('MiaoEyes验证检查失败:', error);
                this.redirectToVerification();
            }
        },
        
        redirectToVerification: function() {
            const currentUrl = encodeURIComponent(window.location.href);
            const verifyUrl = `${this.config.apiUrl}${this.config.verifyEndpoint}?originalUrl=${currentUrl}`;
            window.location.href = verifyUrl;
        },
        
        generateEmbedCode: function() {
            return `<!-- MiaoEyes验证器 -->\n<script>\n${this.toString()}\nMiaoEyesValidator.init({ apiUrl: 'YOUR_MIAOEYES_URL' });\n<\/script>`;
        }
    };
    
    // 自动初始化
    if (typeof window !== 'undefined') {
        window.MiaoEyesValidator = MiaoEyesValidator;
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                MiaoEyesValidator.init();
            });
        } else {
            MiaoEyesValidator.init();
        }
    }
})();