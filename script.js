document.addEventListener('DOMContentLoaded', function() {
    // 初始化变量
    const pages = document.querySelectorAll('.page');
    const indicators = document.querySelectorAll('.page-indicator');
    const prevBtns = document.querySelectorAll('.prev-btn');
    const nextBtns = document.querySelectorAll('.next-btn');
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    const form = document.querySelector('#survey-form');
    const submitBtn = document.querySelector('.submit-btn');
    
    let currentPage = 0;
    const totalPages = pages.length;
    
    // 显示初始页面
    showPage(currentPage);
    updateProgressBar();
    
    // 切换到指定页面
    function showPage(pageIndex) {
        // 确保页面索引在有效范围内
        if (pageIndex < 0) pageIndex = 0;
        if (pageIndex >= totalPages) pageIndex = totalPages - 1;
        
        currentPage = pageIndex;
        
        // 隐藏所有页面
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // 显示当前页面
        pages[pageIndex].classList.add('active');
        
        // 更新页面指示器
        indicators.forEach((indicator, index) => {
            if (index === pageIndex) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        // 更新导航按钮状态
        updateNavigationButtons();
        
        // 更新进度条
        updateProgressBar();
        
        // 滚动到页面顶部
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // 更新导航按钮状态
    function updateNavigationButtons() {
        prevBtns.forEach(btn => {
            btn.style.display = currentPage === 0 ? 'none' : 'block';
        });
        
        nextBtns.forEach(btn => {
            btn.style.display = currentPage === totalPages - 1 ? 'none' : 'block';
        });
        
        // 最后一页才显示提交按钮
        if (submitBtn) {
            submitBtn.style.display = currentPage === totalPages - 1 ? 'inline-block' : 'none';
        }
    }
    
    // 更新进度条
    function updateProgressBar() {
        const progress = ((currentPage + 1) / totalPages) * 100;
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${currentPage + 1} / ${totalPages}`;
    }
    
    // 检查当前页面所有必填字段是否已填写
    function validateCurrentPage() {
        const currentPageElement = pages[currentPage];
        const requiredInputs = currentPageElement.querySelectorAll('input[required]');
        
        let isValid = true;
        
        requiredInputs.forEach(input => {
            // 检查单选按钮和复选框
            if ((input.type === 'radio' || input.type === 'checkbox')) {
                // 获取同名的所有单选按钮
                const inputGroup = currentPageElement.querySelectorAll(`input[name="${input.name}"]`);
                const isChecked = Array.from(inputGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    isValid = false;
                    // 高亮显示未选择的选项组
                    const formGroup = input.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.add('error');
                    }
                } else {
                    const formGroup = input.closest('.form-group');
                    if (formGroup) {
                        formGroup.classList.remove('error');
                    }
                }
            } 
            // 检查文本输入
            else if (input.type === 'text' && input.value.trim() === '') {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        return isValid;
    }
    
    // 页面指示器点击事件
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            // 只允许跳转到已经访问过的页面，或者下一页
            if (index <= currentPage + 1) {
                // 如果要前进到下一页，需要验证当前页
                if (index > currentPage && !validateCurrentPage()) {
                    showSubmitResult('请完成当前页面的所有必填项目', 'error');
                    return;
                }
                showPage(index);
            }
        });
    });
    
    // 上一页按钮点击事件
    prevBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentPage > 0) {
                showPage(currentPage - 1);
            }
        });
    });
    
    // 下一页按钮点击事件
    nextBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 验证当前页面必填项
            if (validateCurrentPage()) {
                if (currentPage < totalPages - 1) {
                    showPage(currentPage + 1);
                }
            } else {
                showSubmitResult('请完成当前页面的所有必填项目', 'error');
            }
        });
    });
    
    // 表单提交处理
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // 验证当前页面（最后一页）
            if (!validateCurrentPage()) {
                showSubmitResult('请完成所有必填项目', 'error');
                return;
            }
            
            submitForm(event);
        });
    }
    
    // 表单提交函数
    function submitForm(event) {
        // 显示加载指示器
        showSubmitResult('正在提交...', 'info');
        
        try {
            // 验证整个表单的必填项是否都已填写
            let allValid = true;
            
            // 遍历所有页面，验证必填项
            pages.forEach((page, index) => {
                // 临时设置当前页面以便验证
                const originalPage = currentPage;
                currentPage = index;
                
                if (!validateCurrentPage()) {
                    allValid = false;
                }
                
                // 恢复当前页面
                currentPage = originalPage;
            });
            
            if (!allValid) {
                showSubmitResult('请完成所有必填项目再提交', 'error');
                return;
            }
            
            // 收集表单数据（仅用于日志）
            const formData = new FormData(form);
            const jsonData = {};
            
            // 处理复选框
            const checkboxGroups = {};
            
            for (let [key, value] of formData.entries()) {
                // 如果是复选框，组合成数组
                if (key.includes('[]')) {
                    const baseKey = key.replace('[]', '');
                    if (!checkboxGroups[baseKey]) {
                        checkboxGroups[baseKey] = [];
                    }
                    checkboxGroups[baseKey].push(value);
                } else {
                    jsonData[key] = value;
                }
            }
            
            // 合并复选框数据
            Object.assign(jsonData, checkboxGroups);
            
            console.log('表单数据验证通过:', jsonData);
            
            // 模拟提交过程
            setTimeout(() => {
                showSubmitResult('提交成功！感谢您参与阿勒泰旅游目的地形象塑造调查问卷。您的反馈对我们非常宝贵。', 'success');
                
                // 重置表单并返回第一页
                setTimeout(() => {
                    form.reset();
                    currentPage = 0;
                    showPage(currentPage);
                }, 3000);
            }, 1500);
        } catch (error) {
            console.error('提交表单时出错:', error);
            showSubmitResult('提交过程中发生错误，请稍后重试', 'error');
        }
    }
    
    // 显示提交结果消息
    function showSubmitResult(message, type) {
        // 移除现有的消息
        const existingMessage = document.querySelector('.submit-result');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建新消息
        const resultElement = document.createElement('div');
        resultElement.className = `submit-result ${type}`;
        resultElement.textContent = message;
        document.body.appendChild(resultElement);
        
        // 自动隐藏消息（除非是错误消息）
        if (type !== 'error') {
            setTimeout(() => {
                resultElement.style.opacity = '0';
                setTimeout(() => {
                    resultElement.remove();
                }, 500);
            }, 3000);
        } else {
            // 为错误消息添加关闭按钮
            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '&times;';
            closeBtn.className = 'close-btn';
            closeBtn.style.marginLeft = '10px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.style.fontWeight = 'bold';
            closeBtn.style.fontSize = '20px';
            
            closeBtn.addEventListener('click', () => {
                resultElement.style.opacity = '0';
                setTimeout(() => {
                    resultElement.remove();
                }, 500);
            });
            
            resultElement.appendChild(closeBtn);
        }
    }
    
    // 添加CSS以突出显示错误
    addErrorStyles();
    
    function addErrorStyles() {
        // 检查是否已添加样式
        if (!document.getElementById('error-styles')) {
            const style = document.createElement('style');
            style.id = 'error-styles';
            style.textContent = `
                .form-group.error {
                    border: 2px solid var(--error-color);
                    animation: shake 0.5s ease-in-out;
                }
                
                .error-message {
                    color: var(--error-color);
                    font-size: 0.9rem;
                    margin-top: 5px;
                }
                
                input.error {
                    border: 2px solid var(--error-color);
                }
                
                .submit-result.info {
                    background-color: rgba(52, 152, 219, 0.9);
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
            `;
            document.head.appendChild(style);
        }
    }
});
