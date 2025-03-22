// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('surveyForm');
    const visitedRadios = document.querySelectorAll('input[name="visited"]');
    const visitedPlacesGroup = document.getElementById('visitedPlacesGroup');
    const watchedMediaRadios = document.querySelectorAll('input[name="watched_media"]');
    const watchedMediaGroup = document.getElementById('watchedMediaGroup');
    const mediaHelpfulGroup = document.getElementById('mediaHelpfulGroup');
    const mediaPositiveGroup = document.getElementById('mediaPositiveGroup');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    
    // 进度条相关变量
    const totalRequiredFields = document.querySelectorAll('input[required]').length;
    let completedFields = 0;
    
    // 初始状态设置
    checkVisitedStatus();
    checkWatchedMediaStatus();
    updateProgress();
    enhanceFormInputs();
    addBackgroundEffects();
    
    // 监听"是否去过阿勒泰"的变化
    visitedRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            checkVisitedStatus();
            animateSectionChange();
            updateProgress();
        });
    });
    
    // 监听"是否看过影视作品"的变化
    watchedMediaRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            checkWatchedMediaStatus();
            animateSectionChange();
            updateProgress();
        });
    });
    
    // 监听所有输入项的变化，更新进度条
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', function() {
            updateProgress();
            
            // 为选中的选项添加高亮效果
            if (input.type === 'radio' || input.type === 'checkbox') {
                const parent = input.closest('.options');
                if (parent) {
                    const options = parent.querySelectorAll('.option');
                    options.forEach(opt => {
                        const optInput = opt.querySelector('input');
                        if (optInput.checked) {
                            opt.classList.add('selected');
                        } else {
                            opt.classList.remove('selected');
                        }
                    });
                }
            }
        });
    });
    
    // 为选项添加点击效果
    document.querySelectorAll('.option').forEach(option => {
        option.addEventListener('click', function(e) {
            // 防止点击其他输入框时触发
            if (e.target.tagName === 'INPUT' && e.target.type === 'text') {
                return;
            }
            
            const input = this.querySelector('input');
            if (!input) return;
            
            if (input.type === 'radio') {
                input.checked = true;
                
                // 选中当前，取消同组其他选中状态
                const name = input.name;
                document.querySelectorAll(`.option input[name="${name}"]`).forEach(radio => {
                    const parentOption = radio.closest('.option');
                    if (radio === input) {
                        parentOption.classList.add('selected');
                    } else {
                        parentOption.classList.remove('selected');
                    }
                });
            } else if (input.type === 'checkbox') {
                input.checked = !input.checked;
                
                // 切换当前选中状态
                if (input.checked) {
                    this.classList.add('selected');
                } else {
                    this.classList.remove('selected');
                }
            }
            
            // 触发change事件
            const event = new Event('change', { bubbles: true });
            input.dispatchEvent(event);
        });
    });
    
    // 监听"其他"选项的勾选
    document.querySelectorAll('input[type="checkbox"][value="其他"], input[type="radio"][value="其他"]').forEach(input => {
        const nextSibling = input.parentElement.nextElementSibling;
        if (nextSibling && nextSibling.classList.contains('other-input')) {
            const otherInput = nextSibling;
            
            input.addEventListener('change', function() {
                otherInput.disabled = !this.checked;
                if (!this.checked) {
                    otherInput.value = '';
                } else {
                    otherInput.focus();
                }
            });
            
            // 初始状态
            otherInput.disabled = !input.checked;
            
            // 点击文本框自动选中对应的"其他"选项
            otherInput.addEventListener('focus', function() {
                if (!input.checked) {
                    input.checked = true;
                    input.closest('.option').classList.add('selected');
                    const event = new Event('change', { bubbles: true });
                    input.dispatchEvent(event);
                }
            });
        }
    });
    
    // 表单提交处理
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (validateForm()) {
            // 显示提交中状态
            showLoadingState(true);
            
            // 收集表单数据
            const formData = new FormData(form);
            const formDataObject = {};
            
            // 转换为对象
            for (const [key, value] of formData.entries()) {
                if (formDataObject[key]) {
                    if (!Array.isArray(formDataObject[key])) {
                        formDataObject[key] = [formDataObject[key]];
                    }
                    formDataObject[key].push(value);
                } else {
                    formDataObject[key] = value;
                }
            }
            
            // 发送数据到服务器
            submitFormData(formDataObject);
        } else {
            // 滚动到第一个错误
            const firstError = document.querySelector('.error-message');
            if (firstError) {
                const formGroup = firstError.closest('.form-group');
                if (formGroup) {
                    formGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    });
    
    // 为重置按钮添加确认功能
    const resetBtn = document.querySelector('.reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function(e) {
            if (!confirm('确定要重置表单吗？所有填写的内容将被清空。')) {
                e.preventDefault();
            } else {
                // 重置后更新进度条和其他UI状态
                setTimeout(() => {
                    checkVisitedStatus();
                    checkWatchedMediaStatus();
                    updateProgress();
                    
                    // 重置选中状态样式
                    document.querySelectorAll('.option').forEach(option => {
                        option.classList.remove('selected');
                    });
                }, 100);
            }
        });
    }
    
    // 检查"是否去过阿勒泰"的状态并控制相关问题的显示
    function checkVisitedStatus() {
        const hasVisited = document.querySelector('input[name="visited"][value="是"]').checked;
        
        if (visitedPlacesGroup) {
            if (hasVisited) {
                visitedPlacesGroup.style.display = 'block';
                visitedPlacesGroup.classList.add('active');
                // 启用相关的必填项
                enableRequiredFields(visitedPlacesGroup);
            } else {
                visitedPlacesGroup.style.display = 'none';
                visitedPlacesGroup.classList.remove('active');
                // 禁用相关的必填项
                disableRequiredFields(visitedPlacesGroup);
            }
        }
    }
    
    // 检查"是否看过影视作品"的状态并控制相关问题的显示
    function checkWatchedMediaStatus() {
        const hasWatchedMedia = document.querySelector('input[name="watched_media"][value="是"]').checked;
        
        if (watchedMediaGroup) {
            if (hasWatchedMedia) {
                watchedMediaGroup.style.display = 'block';
                mediaHelpfulGroup.style.display = 'block';
                mediaPositiveGroup.style.display = 'block';
                
                watchedMediaGroup.classList.add('active');
                mediaHelpfulGroup.classList.add('active');
                mediaPositiveGroup.classList.add('active');
                
                // 启用相关的必填项
                enableRequiredFields(watchedMediaGroup);
                enableRequiredFields(mediaHelpfulGroup);
                enableRequiredFields(mediaPositiveGroup);
            } else {
                watchedMediaGroup.style.display = 'none';
                mediaHelpfulGroup.style.display = 'none';
                mediaPositiveGroup.style.display = 'none';
                
                watchedMediaGroup.classList.remove('active');
                mediaHelpfulGroup.classList.remove('active');
                mediaPositiveGroup.classList.remove('active');
                
                // 禁用相关的必填项
                disableRequiredFields(watchedMediaGroup);
                disableRequiredFields(mediaHelpfulGroup);
                disableRequiredFields(mediaPositiveGroup);
            }
        }
    }
    
    // 启用区域内的必填字段
    function enableRequiredFields(container) {
        const inputs = container.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.required = true;
        });
        updateTotalRequiredFields();
    }
    
    // 禁用区域内的必填字段
    function disableRequiredFields(container) {
        const inputs = container.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.required = false;
        });
        updateTotalRequiredFields();
    }
    
    // 更新总必填字段数量
    function updateTotalRequiredFields() {
        const visibleRequiredFields = document.querySelectorAll('input[required]:not([disabled])');
        const visibleFieldsCount = visibleRequiredFields.length;
        updateProgress();
    }
    
    // 表单验证
    function validateForm() {
        let isValid = true;
        
        // 清除所有错误消息
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('has-error');
        });
        
        // 验证所有必填项
        const requiredInputs = form.querySelectorAll('input[required]:not([disabled])');
        requiredInputs.forEach(input => {
            if (input.type === 'radio') {
                const name = input.name;
                const checkedRadio = form.querySelector(`input[name="${name}"]:checked`);
                if (!checkedRadio) {
                    isValid = false;
                    showError(input, '请选择一个选项');
                }
            } else if (input.type === 'checkbox') {
                const name = input.name;
                const checkedCheckbox = form.querySelector(`input[name="${name}"]:checked`);
                if (!checkedCheckbox) {
                    isValid = false;
                    showError(input, '请至少选择一个选项');
                }
            } else if (!input.value.trim()) {
                isValid = false;
                showError(input, '此字段为必填项');
            }
        });
        
        return isValid;
    }
    
    // 显示错误信息
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            
            // 对于单选按钮或复选框，将错误消息添加到选项组的末尾
            if (input.type === 'radio' || input.type === 'checkbox') {
                const optionsContainer = formGroup.querySelector('.options');
                optionsContainer.appendChild(errorElement);
            } else {
                input.parentNode.insertBefore(errorElement, input.nextSibling);
            }
        }
        
        errorElement.textContent = message;
        
        // 使错误消息有动画效果
        errorElement.style.animation = 'none';
        setTimeout(() => {
            errorElement.style.animation = 'fadeIn 0.3s ease-out';
        }, 10);
        
        // 高亮显示有问题的表单组
        formGroup.classList.add('has-error');
        
        // 监听输入，移除错误消息
        const handler = function() {
            errorElement.textContent = '';
            errorElement.remove();
            formGroup.classList.remove('has-error');
            input.removeEventListener('input', handler);
            input.removeEventListener('change', handler);
        };
        
        input.addEventListener('input', handler);
        input.addEventListener('change', handler);
    }
    
    // 提交表单数据到服务器
    function submitFormData(data) {
        // 使用fetch API发送数据
        fetch('/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            showLoadingState(false);
            if (data.success) {
                showSubmitResult(true, data.message || '问卷提交成功！感谢您的参与！');
                form.reset();
                
                // 重置后更新UI状态
                setTimeout(() => {
                    checkVisitedStatus();
                    checkWatchedMediaStatus();
                    updateProgress();
                    
                    // 重置选中状态样式
                    document.querySelectorAll('.option').forEach(option => {
                        option.classList.remove('selected');
                    });
                    
                    // 平滑滚动到顶部
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }, 100);
            } else {
                showSubmitResult(false, data.message || '提交失败，请稍后重试');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showLoadingState(false);
            showSubmitResult(false, '网络错误，请稍后重试');
        });
    }
    
    // 显示加载状态
    function showLoadingState(isLoading) {
        const submitBtn = form.querySelector('.submit-btn');
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerText = '提交中...';
            submitBtn.classList.add('loading');
            
            // 添加表单提交中的透明度效果
            form.style.opacity = '0.7';
            form.style.pointerEvents = 'none';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerText = '提交问卷';
            submitBtn.classList.remove('loading');
            
            // 恢复表单透明度
            form.style.opacity = '';
            form.style.pointerEvents = '';
        }
    }
    
    // 显示提交结果
    function showSubmitResult(success, message) {
        // 创建结果提示元素
        const resultElement = document.createElement('div');
        resultElement.className = 'submit-result ' + (success ? 'success' : 'error');
        resultElement.textContent = message;
        
        document.body.appendChild(resultElement);
        
        // 3秒后自动消失
        setTimeout(() => {
            resultElement.style.opacity = '0';
            setTimeout(() => {
                if (resultElement.parentNode) {
                    document.body.removeChild(resultElement);
                }
            }, 500);
        }, 3000);
    }
    
    // 增强表单输入体验
    function enhanceFormInputs() {
        // 初始化选中态
        document.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked').forEach(input => {
            const option = input.closest('.option');
            if (option) {
                option.classList.add('selected');
            }
        });
        
        // 为所有部分添加可折叠功能
        document.querySelectorAll('section h2').forEach(heading => {
            heading.style.cursor = 'pointer';
            
            // 添加切换图标
            const toggleIcon = document.createElement('span');
            toggleIcon.className = 'toggle-icon';
            toggleIcon.innerHTML = '&#9660;'; // 下箭头
            heading.appendChild(toggleIcon);
            
            heading.addEventListener('click', function() {
                const section = this.parentElement;
                const content = Array.from(section.children).filter(el => el !== this);
                
                if (section.classList.contains('collapsed')) {
                    section.classList.remove('collapsed');
                    toggleIcon.innerHTML = '&#9660;';
                    
                    // 使用动画显示内容
                    content.forEach(el => {
                        el.style.display = '';
                        el.style.animation = 'fadeIn 0.5s ease-in-out';
                    });
                } else {
                    section.classList.add('collapsed');
                    toggleIcon.innerHTML = '&#9654;'; // 右箭头
                    
                    // 使用动画隐藏内容
                    content.forEach(el => {
                        el.style.animation = 'fadeOut 0.3s ease-in-out';
                        setTimeout(() => {
                            if (section.classList.contains('collapsed')) {
                                el.style.display = 'none';
                            }
                        }, 280);
                    });
                }
            });
        });
    }
    
    // 更新进度条
    function updateProgress() {
        // 获取所有具有name属性的必填字段
        const requiredFieldNames = new Set();
        form.querySelectorAll('input[required]:not([disabled])').forEach(input => {
            requiredFieldNames.add(input.name);
        });
        
        const totalFields = requiredFieldNames.size;
        let completedFields = 0;
        
        // 检查每个必填字段是否已填写
        requiredFieldNames.forEach(name => {
            const inputs = form.querySelectorAll(`input[name="${name}"]`);
            let isCompleted = false;
            
            inputs.forEach(input => {
                if (input.type === 'radio' || input.type === 'checkbox') {
                    if (input.checked) {
                        isCompleted = true;
                    }
                } else if (input.value.trim()) {
                    isCompleted = true;
                }
            });
            
            if (isCompleted) {
                completedFields++;
            }
        });
        
        // 计算完成百分比
        const percentage = totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0;
        
        // 使用动画更新进度条
        animateProgressBar(percentage);
        
        // 更新进度文本
        progressText.textContent = `完成度: ${percentage}%`;
        
        return percentage;
    }
    
    // 进度条动画
    function animateProgressBar(targetPercentage) {
        const currentWidth = parseInt(progressBar.style.width || '0');
        const targetWidth = targetPercentage;
        const duration = 500; // 动画持续时间（毫秒）
        const fps = 60;
        const steps = duration / 1000 * fps;
        const increment = (targetWidth - currentWidth) / steps;
        
        let currentStep = 0;
        
        const animateStep = function() {
            currentStep++;
            
            const newWidth = currentWidth + increment * currentStep;
            progressBar.style.width = `${newWidth}%`;
            
            // 根据进度改变颜色
            if (newWidth < 30) {
                progressBar.style.background = 'linear-gradient(90deg, #ff7675, #e84393)';
            } else if (newWidth < 70) {
                progressBar.style.background = 'linear-gradient(90deg, #fdcb6e, #e17055)';
            } else {
                progressBar.style.background = 'linear-gradient(90deg, #4a90e2, #6c63ff)';
            }
            
            if (currentStep < steps) {
                requestAnimationFrame(animateStep);
            }
        };
        
        requestAnimationFrame(animateStep);
    }
    
    // 动画显示/隐藏部分
    function animateSectionChange() {
        const visibleGroups = document.querySelectorAll('.form-group.active');
        visibleGroups.forEach((group, index) => {
            group.style.animationDelay = (index * 0.1) + 's';
            group.style.animation = 'fadeIn 0.5s ease-in-out forwards';
        });
    }
    
    // 添加背景效果
    function addBackgroundEffects() {
        // 平滑滚动
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // 添加视差滚动效果
        window.addEventListener('scroll', function() {
            const scrollPosition = window.scrollY;
            
            // 轻微移动背景图片，创建视差效果
            document.body.style.backgroundPosition = `center ${scrollPosition * 0.3}px`;
            
            // 根据滚动位置更新header的样式
            const header = document.querySelector('header');
            if (header) {
                if (scrollPosition > 100) {
                    header.style.transform = 'scale(0.98)';
                    header.style.opacity = '0.95';
                } else {
                    header.style.transform = 'scale(1)';
                    header.style.opacity = '1';
                }
            }
        });
    }
    
    // 初始化
    function init() {
        // 禁用所有"其他"输入框，除非相应的复选框被选中
        document.querySelectorAll('.other-input').forEach(input => {
            const prevElement = input.previousElementSibling;
            if (prevElement && prevElement.classList.contains('option')) {
                const checkbox = prevElement.querySelector('input[value="其他"]');
                if (checkbox) {
                    input.disabled = !checkbox.checked;
                }
            }
        });
        
        // 添加选项中的span元素（如果尚未添加）
        document.querySelectorAll('.option input[type="radio"], .option input[type="checkbox"]').forEach(input => {
            if (!input.nextElementSibling || input.nextElementSibling.tagName !== 'SPAN') {
                const span = document.createElement('span');
                const text = input.parentNode.textContent.trim();
                span.textContent = text;
                
                // 清空父元素的文本节点
                const parent = input.parentNode;
                while (parent.firstChild) {
                    parent.removeChild(parent.firstChild);
                }
                
                parent.appendChild(input);
                parent.appendChild(span);
            }
        });
        
        // 初始化表单组的激活状态
        document.querySelectorAll('.form-group').forEach(group => {
            const inputs = group.querySelectorAll('input[type="radio"]:checked, input[type="checkbox"]:checked, input[type="text"]:not([value=""])');
            if (inputs.length > 0) {
                group.classList.add('active');
            }
        });
        
        // 初始化折叠/展开状态
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            // 只展开第一个部分，折叠其他部分（在大屏幕上）
            if (index === 0 || window.innerWidth < 768) {
                section.classList.remove('collapsed');
            } else {
                const heading = section.querySelector('h2');
                if (heading) {
                    const toggleIcon = heading.querySelector('.toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.innerHTML = '&#9654;'; // 右箭头
                    }
                    
                    const content = Array.from(section.children).filter(el => el !== heading);
                    content.forEach(el => {
                        el.style.display = 'none';
                    });
                    
                    section.classList.add('collapsed');
                }
            }
        });
    }
    
    // 添加一个淡入淡出动画的CSS样式
    const fadeOutStyle = document.createElement('style');
    fadeOutStyle.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(10px); }
        }
    `;
    document.head.appendChild(fadeOutStyle);
    
    // 执行初始化
    init();
}); 