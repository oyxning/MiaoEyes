document.addEventListener('DOMContentLoaded', function() {
    const verifyButton = document.getElementById('verifyButton');
    const loading = document.getElementById('loading');
    
    verifyButton.addEventListener('click', async function() {
        verifyButton.style.display = 'none';
        loading.style.display = 'block';
        
        try {
            const sessionId = getSessionIdFromUrl() || generateSessionId();
            
            const response = await fetch('/api/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId: sessionId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                setTimeout(() => {
                    window.location.href = data.redirectUrl;
                }, 1000);
            } else {
                showError(data.message);
            }
            
        } catch (error) {
            showError('验证失败，请重试');
        }
    });
    
    function getSessionIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('sessionId');
    }
    
    function generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9);
    }
    
    function showError(message) {
        loading.style.display = 'none';
        verifyButton.style.display = 'block';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'color: #e74c3c; margin-top: 15px; font-size: 14px;';
        
        const verificationBox = document.querySelector('.verification-box');
        verificationBox.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
});