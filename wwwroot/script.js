// ===== 后端 API 地址 =====
var API_BASE = '/api';

// ===== 认证系统 =====
(function() {
    var SESSION_KEY = 'class8_session';

    // 获取当前登录用户
    function getCurrentUser() {
        try {
            var data = localStorage.getItem(SESSION_KEY);
            return data ? JSON.parse(data) : null;
        } catch(e) {
            return null;
        }
    }

    function setCurrentUser(user) {
        if (user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
    }

    // 暴露到全局，供其他模块使用
    window.getCurrentUser = getCurrentUser;
    window.setCurrentUser = setCurrentUser;

    // 更新所有页面的 UI
    function updateAuthUI() {
        var user = getCurrentUser();
        var greeting = document.getElementById('userGreeting');
        var loginBtn = document.getElementById('loginBtn');
        var registerBtn = document.getElementById('registerBtn');
        var logoutBtn = document.getElementById('logoutBtn');

        if (!greeting) return;

        if (user) {
            greeting.textContent = '欢迎，' + user.username;
            greeting.style.display = 'inline';
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
        } else {
            greeting.style.display = 'none';
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
        }

        // 处理页面内容显示/隐藏（受保护页面）
        var authRequired = document.getElementById('authRequired');
        var pageBody = document.getElementById('pageBody');
        if (authRequired && pageBody) {
            if (user) {
                authRequired.style.display = 'none';
                pageBody.style.display = 'block';
            } else {
                authRequired.style.display = 'block';
                pageBody.style.display = 'none';
            }
        }

    }

    // 退出
    function logout() {
        setCurrentUser(null);
        updateAuthUI();
    }

    // ===== 弹窗控制 =====
    var loginModal = document.getElementById('loginModal');
    var registerModal = document.getElementById('registerModal');
    var loginBtn = document.getElementById('loginBtn');
    var registerBtn = document.getElementById('registerBtn');
    var logoutBtn = document.getElementById('logoutBtn');
    var loginClose = document.getElementById('loginClose');
    var registerClose = document.getElementById('registerClose');
    var switchToRegister = document.getElementById('switchToRegister');
    var switchToLogin = document.getElementById('switchToLogin');
    var loginForm = document.getElementById('loginForm');
    var registerForm = document.getElementById('registerForm');
    var gotoLoginBtns = document.querySelectorAll('#gotoLogin');

    function openModal(modal) {
        if (modal) modal.classList.add('active');
    }

    function closeModal(modal) {
        if (modal) modal.classList.remove('active');
    }

    // 登录按钮
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            openModal(loginModal);
        });
    }

    // 注册按钮
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            openModal(registerModal);
        });
    }

    // 退出按钮
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }

    // 关闭按钮
    if (loginClose) {
        loginClose.addEventListener('click', function() {
            closeModal(loginModal);
        });
    }
    if (registerClose) {
        registerClose.addEventListener('click', function() {
            closeModal(registerModal);
        });
    }

    // 点击遮罩关闭
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) closeModal(loginModal);
        });
    }
    if (registerModal) {
        registerModal.addEventListener('click', function(e) {
            if (e.target === registerModal) closeModal(registerModal);
        });
    }

    // 切换弹窗
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(loginModal);
            openModal(registerModal);
        });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(registerModal);
            openModal(loginModal);
        });
    }

    // 各页面的"去登录"按钮
    gotoLoginBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
            openModal(loginModal);
        });
    });

    // 登录表单提交（调用后端 API）
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var username = document.getElementById('loginUsername').value.trim();
            var password = document.getElementById('loginPassword').value.trim();

            if (!username || !password) {
                alert('请填写用户名和密码');
                return;
            }

            fetch(API_BASE + '/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username, password: password })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.user) {
                    setCurrentUser(data.user);
                    closeModal(loginModal);
                    loginForm.reset();
                    updateAuthUI();
                } else {
                    alert(data.message || '登录失败');
                }
            })
            .catch(function(err) {
                alert('连接服务器失败，请确保后端已启动');
                console.error(err);
            });
        });
    }

    // 密码强度验证
    function validatePasswordStrength(password) {
        var hint = document.getElementById('passwordHint');
        if (!password) {
            if (hint) hint.textContent = '';
            return true;
        }
        
        var errors = [];
        if (password.length < 8) errors.push('需要8位以上');
        if (!/[A-Z]/.test(password)) errors.push('需要大写字母');
        if (!/[a-z]/.test(password)) errors.push('需要小写字母');
        if (!/[0-9]/.test(password)) errors.push('需要数字');
        
        if (hint) {
            hint.textContent = errors.length > 0 ? '密码不符合要求: ' + errors.join('、') : '密码符合要求';
            hint.style.color = errors.length > 0 ? '#cc0000' : '#28a745';
        }
        
        return errors.length === 0;
    }

    // 密码输入框事件
    var regPassword = document.getElementById('regPassword');
    if (regPassword) {
        regPassword.addEventListener('input', function() {
            validatePasswordStrength(this.value);
        });
    }

    // 注册表单提交（调用后端 API）
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var studentId = document.getElementById('regStudentId').value.trim();
            var username = document.getElementById('regUsername').value.trim();
            var code = document.getElementById('regCode').value.trim();
            var password = document.getElementById('regPassword').value.trim();
            var confirm = document.getElementById('regConfirm').value.trim();

            if (!studentId || !username || !code || !password || !confirm) {
                alert('请填写所有字段');
                return;
            }

            // 密码强度验证
            if (!validatePasswordStrength(password)) {
                alert('密码需要8位以上，包含大写字母、小写字母和数字');
                return;
            }

            if (password !== confirm) {
                alert('两次密码输入不一致');
                return;
            }

            fetch(API_BASE + '/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: studentId,
                    username: username,
                    code: code,
                    password: password
                })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.message && data.message.indexOf('成功') !== -1) {
                    alert(data.message);
                    closeModal(registerModal);
                    registerForm.reset();
                    var hint = document.getElementById('passwordHint');
                    if (hint) hint.textContent = '';
                    openModal(loginModal);
                } else {
                    alert(data.message || '注册失败');
                }
            })
            .catch(function(err) {
                alert('连接服务器失败，请确保后端已启动');
                console.error(err);
            });
        });
    }

    // 页面加载时更新 UI
    updateAuthUI();

    // 未登录时自动弹出登录弹窗
    if (!getCurrentUser() && loginModal) {
        setTimeout(function() {
            openModal(loginModal);
        }, 500);
    }

    // 全局教师面板刷新函数（定义在此处确保在 window.load 之前可用）
    window.refreshTeacherPanel = function() {
        var teacherPanel = document.getElementById('teacherPanel');
        if (!teacherPanel) return;
        
        var user = getCurrentUser();
        console.log('刷新教师面板，用户角色:', user ? user.role : '未登录');
        
        if (user && user.role === 'teacher') {
            teacherPanel.style.display = 'block';
            console.log('教师面板已显示');
        } else {
            teacherPanel.style.display = 'none';
            console.log('教师面板已隐藏');
        }
    };

    // ===== 通知系统 =====
    var notificationModal = document.getElementById('notificationModal');
    var notificationList = document.getElementById('notificationList');
    var notificationClose = document.getElementById('notificationClose');

    // HTML转义函数
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // 加载通知
    function loadNotifications() {
        var user = getCurrentUser();
        if (!user) return;

        fetch(API_BASE + '/notifications?username=' + encodeURIComponent(user.username))
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (!Array.isArray(data) || data.length === 0) {
                    if (notificationList) {
                        notificationList.innerHTML = '<div class="no-notifications">暂无通知</div>';
                    }
                    return;
                }

                if (notificationList) {
                    var html = '';
                    data.forEach(function(notif) {
                        var unreadClass = notif.isRead ? '' : 'unread';
                        html +=
                            '<div class="notification-item ' + unreadClass + '" data-id="' + notif.id + '">' +
                                '<div class="notification-message">' + escapeHtml(notif.message) + '</div>' +
                                '<div class="notification-time">' + notif.createdAt + '</div>' +
                                '<div class="notification-actions">' +
                                    (!notif.isRead ? '<button class="notification-btn read-btn" data-id="' + notif.id + '">标为已读</button>' : '') +
                                    '<button class="notification-btn delete-btn" data-id="' + notif.id + '">删除</button>' +
                                '</div>' +
                            '</div>';
                    });
                    notificationList.innerHTML = html;

                    // 绑定事件
                    var readBtns = notificationList.querySelectorAll('.read-btn');
                    readBtns.forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var notifId = parseInt(this.getAttribute('data-id'));
                            markAsRead(notifId);
                        });
                    });

                    var deleteBtns = notificationList.querySelectorAll('.delete-btn');
                    deleteBtns.forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var notifId = parseInt(this.getAttribute('data-id'));
                            deleteNotification(notifId);
                        });
                    });
                }
            })
            .catch(function(err) {
                console.error('加载通知失败', err);
            });
    }

    // 标记为已读
    function markAsRead(notificationId) {
        var user = getCurrentUser();
        if (!user) return;

        fetch(API_BASE + '/notifications/read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user.username,
                notificationId: notificationId
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                loadNotifications();
            }
        })
        .catch(function(err) {
            console.error('标记已读失败', err);
        });
    }

    // 删除通知
    function deleteNotification(notificationId) {
        var user = getCurrentUser();
        if (!user) return;

        fetch(API_BASE + '/notifications/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user.username,
                notificationId: notificationId
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                loadNotifications();
            }
        })
        .catch(function(err) {
            console.error('删除通知失败', err);
        });
    }

    // 检查未读通知数量
    function checkUnreadNotifications() {
        var user = getCurrentUser();
        if (!user) return;

        fetch(API_BASE + '/notifications/unread-count?username=' + encodeURIComponent(user.username))
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.count > 0) {
                    // 有未读通知，自动弹出通知弹窗
                    setTimeout(function() {
                        loadNotifications();
                        if (notificationModal) {
                            openModal(notificationModal);
                        }
                    }, 1000);
                }
            })
            .catch(function(err) {
                console.error('检查通知失败', err);
            });
    }

    // 通知弹窗关闭按钮
    if (notificationClose) {
        notificationClose.addEventListener('click', function() {
            closeModal(notificationModal);
        });
    }

    // 点击遮罩关闭通知弹窗
    if (notificationModal) {
        notificationModal.addEventListener('click', function(e) {
            if (e.target === notificationModal) closeModal(notificationModal);
        });
    }

    // 登录成功后检查通知
    var originalUpdateAuthUI = updateAuthUI;
    updateAuthUI = function() {
        originalUpdateAuthUI();
        setTimeout(function() {
            checkUnreadNotifications();
        }, 500);
    };

    // 定期检查通知（每30秒）
    setInterval(function() {
        if (getCurrentUser()) {
            checkUnreadNotifications();
        }
    }, 30000);
})();

// ===== 导航栏高亮当前页面 =====
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-list a');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(function(link) {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
});

// ===== 页面跳转时的过渡效果 =====
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-list a');

    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            if (!this.classList.contains('active')) {
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.3s ease';
            }
        });
    });
});

// ===== 流星雨 Canvas 动画 =====
(function() {
    var canvas = document.getElementById('starfall-canvas');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');
    var width, height;

    var stars = [];
    var meteors = [];
    var STAR_COUNT = 200;
    var METEOR_COUNT = 4;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    function initStars() {
        stars = [];
        for (var i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.8 + 0.2,
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }
    }

    function initMeteors() {
        meteors = [];
        for (var i = 0; i < METEOR_COUNT; i++) {
            resetMeteor(i);
        }
    }

    function resetMeteor(index) {
        meteors[index] = {
            x: Math.random() * width * 1.2 - width * 0.1,
            y: Math.random() * height * 0.3,
            len: Math.random() * 120 + 60,
            speed: Math.random() * 6 + 4,
            angle: Math.PI / 4 + Math.random() * 0.4,
            alpha: Math.random() * 0.6 + 0.4,
            life: 0,
            maxLife: Math.random() * 80 + 60
        };
    }

    function updateStars(time) {
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            s.currentAlpha = s.alpha * (0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinklePhase));
        }
    }

    function updateMeteors() {
        for (var i = 0; i < meteors.length; i++) {
            var m = meteors[i];
            m.life++;

            if (m.life > m.maxLife) {
                setTimeout(function(idx) {
                    resetMeteor(idx);
                }, Math.random() * 2000, i);
                continue;
            }

            m.x += Math.cos(m.angle) * m.speed;
            m.y += Math.sin(m.angle) * m.speed;

            if (m.life > m.maxLife * 0.7) {
                m.alpha *= 0.98;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + s.currentAlpha + ')';
            ctx.fill();
        }

        for (var i = 0; i < meteors.length; i++) {
            var m = meteors[i];
            if (m.life > m.maxLife) continue;

            var tailX = m.x - Math.cos(m.angle) * m.len;
            var tailY = m.y - Math.sin(m.angle) * m.len;

            var gradient = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 4);
            gradient.addColorStop(0, 'rgba(255, 255, 255, ' + (m.alpha * 0.9) + ')');
            gradient.addColorStop(0.3, 'rgba(200, 220, 255, ' + (m.alpha * 0.4) + ')');
            gradient.addColorStop(1, 'rgba(200, 220, 255, 0)');

            ctx.beginPath();
            ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            var tailGradient = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
            tailGradient.addColorStop(0, 'rgba(200, 220, 255, ' + (m.alpha * 0.6) + ')');
            tailGradient.addColorStop(0.5, 'rgba(150, 180, 255, ' + (m.alpha * 0.3) + ')');
            tailGradient.addColorStop(1, 'rgba(150, 180, 255, 0)');

            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = tailGradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    }

    function animate(time) {
        updateStars(time);
        updateMeteors();
        draw();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', function() {
        resize();
        initStars();
        initMeteors();
    });

    resize();
    initStars();
    initMeteors();
    animate(0);
})();

// ===== 公告/作业功能（事项页面） =====
(function() {
    var teacherPanel = document.getElementById('teacherPanel');
    var announcementForm = document.getElementById('announcementForm');
    var announcementType = document.getElementById('announcementType');
    var announcementTitle = document.getElementById('announcementTitle');
    var announcementContent = document.getElementById('announcementContent');
    var announcementDeadline = document.getElementById('announcementDeadline');
    var deadlineGroup = document.getElementById('deadlineGroup');
    var announcementsList = document.getElementById('announcementsList');

    // 如果不在事项页面，直接返回
    if (!announcementsList) return;

    // HTML转义函数
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    // 检查是否为教师
    function isTeacher() {
        var user = window.getCurrentUser ? window.getCurrentUser() : null;
        if (!user) return false;
        return user.role === 'teacher';
    }

    // 显示/隐藏教师面板
    function updateTeacherPanel() {
        if (teacherPanel) {
            teacherPanel.style.display = isTeacher() ? 'block' : 'none';
        }
    }

    // 切换公告类型时显示/隐藏截止时间
    if (announcementType && deadlineGroup) {
        announcementType.addEventListener('change', function() {
            deadlineGroup.style.display = this.value === 'homework' ? 'block' : 'none';
        });
    }

    // 加载公告列表
    function loadAnnouncements() {
        fetch(API_BASE + '/announcements')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (!Array.isArray(data) || data.length === 0) {
                    if (announcementsList) {
                        announcementsList.innerHTML = '<div class="empty-message">暂无公告或作业</div>';
                    }
                    return;
                }

                if (announcementsList) {
                    var html = '';
                    data.forEach(function(ann) {
                        var typeText = ann.type === 'homework' ? '作业' : '公告';
                        var typeClass = ann.type;
                        var deadlineHtml = ann.deadline ? '<div class="announcement-deadline">⏰ 截止时间：' + ann.deadline + '</div>' : '';
                        var deleteBtn = isTeacher() ? '<button class="delete-announcement-btn" data-id="' + ann.id + '">删除</button>' : '';
                        
                        html +=
                            '<div class="announcement-item">' +
                                '<div class="announcement-header">' +
                                    '<span class="announcement-title">' + escapeHtml(ann.title) + '</span>' +
                                    '<span class="announcement-type ' + typeClass + '">' + typeText + '</span>' +
                                '</div>' +
                                '<div class="announcement-meta">' +
                                    '<span>👤 ' + escapeHtml(ann.author) + '</span>' +
                                    '<span>🕒 ' + ann.createdAt + '</span>' +
                                '</div>' +
                                '<div class="announcement-content">' + escapeHtml(ann.content) + '</div>' +
                                deadlineHtml +
                                '<div class="announcement-actions">' + deleteBtn + '</div>' +
                            '</div>';
                    });
                    announcementsList.innerHTML = html;

                    // 绑定删除按钮事件
                    var deleteBtns = announcementsList.querySelectorAll('.delete-announcement-btn');
                    deleteBtns.forEach(function(btn) {
                        btn.addEventListener('click', function() {
                            var annId = parseInt(this.getAttribute('data-id'));
                            deleteAnnouncement(annId);
                        });
                    });
                }
            })
            .catch(function(err) {
                console.error('加载公告失败', err);
                if (announcementsList) {
                    announcementsList.innerHTML = '<div class="empty-message">加载公告失败</div>';
                }
            });
    }

    // 删除公告
    function deleteAnnouncement(annId) {
        if (!confirm('确定要删除这条公告/作业吗？')) return;

        fetch(API_BASE + '/announcements/' + annId, {
            method: 'DELETE'
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                alert(data.message);
                loadAnnouncements();
            } else {
                alert(data.message || '删除失败');
            }
        })
        .catch(function(err) {
            alert('操作失败');
            console.error(err);
        });
    }

    // 发布公告/作业
    if (announcementForm) {
        announcementForm.addEventListener('submit', function(e) {
            e.preventDefault();

            var user = window.getCurrentUser ? window.getCurrentUser() : null;
            if (!user || user.role !== 'teacher') {
                alert('只有教师才能发布公告/作业');
                return;
            }

            var title = announcementTitle.value.trim();
            var content = announcementContent.value.trim();
            var type = announcementType.value;
            var deadline = announcementDeadline.value ? new Date(announcementDeadline.value).toISOString() : null;

            if (!title || !content) {
                alert('请填写标题和内容');
                return;
            }

            fetch(API_BASE + '/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    type: type,
                    author: user.username,
                    deadline: deadline
                })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.message) {
                    alert(data.message);
                    announcementForm.reset();
                    deadlineGroup.style.display = 'none';
                    loadAnnouncements();
                } else {
                    alert(data.message || '发布失败');
                }
            })
            .catch(function(err) {
                alert('发布失败，请确保后端已启动');
                console.error(err);
            });
        });
    }

    // 页面加载时初始化
    updateTeacherPanel();
    loadAnnouncements();
})();

// ===== 留言板功能（后端 API 模式） =====
(function() {
    var messageList = document.getElementById('messageList');
    var messageForm = document.getElementById('messageForm');
    var contentInput = document.getElementById('msgContent');
    var anonymousCheck = document.getElementById('anonymousCheck');
    var adminPanel = document.getElementById('adminPanel');

    if (!messageList) return;

    // 获取当前登录用户
    function getCurrentUser() {
        try {
            var data = localStorage.getItem('class8_session');
            return data ? JSON.parse(data) : null;
        } catch(e) {
            return null;
        }
    }

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    function renderMessages(messages) {
        if (!messageList) return;

        if (!messages || messages.length === 0) {
            messageList.innerHTML = '<div class="empty-message">还没有留言，快来发表第一条吧！</div>';
            return;
        }

        var html = '';
        for (var i = 0; i < messages.length; i++) {
            var msg = messages[i];
            var displayName = msg.isAnonymous ? '匿名' : escapeHtml(msg.name);
            var nameClass = msg.isAnonymous ? 'message-name anonymous' : 'message-name';
            
            // 加载并显示图片
            var imageHtml = '';
            if (msg.image) {
                imageHtml = '<img src="' + msg.image + '" class="message-image" alt="留言图片">';
            }
            
            html +=
                '<div class="message-item" data-message-id="' + msg.id + '">' +
                    '<div class="message-header">' +
                        '<span class="' + nameClass + '">' + displayName + '</span>' +
                        '<span class="message-time">' + msg.time + '</span>' +
                    '</div>' +
                    '<div class="message-content">' + escapeHtml(msg.content) + '</div>' +
                    imageHtml +
                    '<div class="message-actions">' +
                        '<button class="like-btn" data-message-id="' + msg.id + '">👍 点赞 <span class="like-count">0</span></button>' +
                        '<button class="comment-toggle-btn" data-message-id="' + msg.id + '">💬 评论 <span class="comment-count">0</span></button>' +
                    '</div>' +
                    '<div class="comments-section" id="comments-' + msg.id + '">' +
                        '<div class="comments-list" id="comments-list-' + msg.id + '"></div>' +
                        '<div class="comment-form">' +
                            '<input type="text" class="comment-input" data-message-id="' + msg.id + '" placeholder="写下你的评论...">' +
                            '<button class="comment-submit-btn" data-message-id="' + msg.id + '">发送</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
        }
        messageList.innerHTML = html;

        // 加载每条留言的点赞数和评论数
        messages.forEach(function(msg) {
            loadLikeCount(msg.id);
            loadCommentCount(msg.id);
        });

        // 绑定点赞按钮事件
        var likeBtns = messageList.querySelectorAll('.like-btn');
        likeBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var messageId = parseInt(this.getAttribute('data-message-id'));
                toggleLike(messageId);
            });
        });

        // 绑定评论展开按钮
        var commentToggleBtns = messageList.querySelectorAll('.comment-toggle-btn');
        commentToggleBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var messageId = parseInt(this.getAttribute('data-message-id'));
                var commentsSection = document.getElementById('comments-' + messageId);
                if (commentsSection) {
                    commentsSection.classList.toggle('active');
                    if (commentsSection.classList.contains('active')) {
                        loadComments(messageId);
                    }
                }
            });
        });

        // 绑定评论提交按钮
        var commentSubmitBtns = messageList.querySelectorAll('.comment-submit-btn');
        commentSubmitBtns.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var messageId = parseInt(this.getAttribute('data-message-id'));
                submitComment(messageId);
            });
        });
    }

    // 从后端加载留言
    function loadMessages() {
        fetch(API_BASE + '/messages')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                renderMessages(data);
            })
            .catch(function(err) {
                console.error('加载留言失败', err);
                messageList.innerHTML = '<div class="empty-message">加载留言失败，请确保后端已启动</div>';
            });
    }

    // 图片上传预览
    var msgImage = document.getElementById('msgImage');
    var imagePreview = document.getElementById('imagePreview');
    var uploadedImageData = null;

    if (msgImage && imagePreview) {
        msgImage.addEventListener('change', function(e) {
            var file = e.target.files[0];
            if (!file) {
                imagePreview.style.display = 'none';
                uploadedImageData = null;
                return;
            }

            // 检查文件大小（限制为 1MB）
            if (file.size > 1024 * 1024) {
                alert('图片大小不能超过 1MB');
                msgImage.value = '';
                imagePreview.style.display = 'none';
                uploadedImageData = null;
                return;
            }

            var reader = new FileReader();
            reader.onload = function(event) {
                uploadedImageData = event.target.result;
                imagePreview.src = uploadedImageData;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        });
    }

    // 提交留言到后端
    function handleSubmit(e) {
        e.preventDefault();

        var user = getCurrentUser();
        if (!user) {
            alert('请先登录');
            return;
        }

        var content = contentInput.value.trim();
        if (!content) {
            alert('请填写留言内容');
            return;
        }

        var isAnonymous = anonymousCheck ? anonymousCheck.checked : false;

        // 先创建留言
        fetch(API_BASE + '/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user.username,
                content: content,
                isAnonymous: isAnonymous
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.data) {
                var messageId = data.data.id;
                contentInput.value = '';
                if (anonymousCheck) anonymousCheck.checked = false;

                // 如果有图片，上传图片
                if (uploadedImageData) {
                    return fetch(API_BASE + '/uploads', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fileName: 'image_' + messageId + '.png',
                            fileType: 'image',
                            fileData: uploadedImageData,
                            username: user.username,
                            relatedType: 'message',
                            relatedId: messageId
                        })
                    })
                    .then(function(res) { return res.json(); })
                    .then(function() {
                        uploadedImageData = null;
                        if (imagePreview) {
                            imagePreview.style.display = 'none';
                        }
                        if (msgImage) {
                            msgImage.value = '';
                        }
                        loadMessages();
                        alert('留言发布成功！');
                    });
                } else {
                    loadMessages();
                    alert('留言发布成功！');
                }
            } else {
                alert(data.message || '发布失败');
            }
        })
        .catch(function(err) {
            alert('连接服务器失败，请确保后端已启动');
            console.error(err);
        });
    }

    if (messageForm) {
        messageForm.addEventListener('submit', handleSubmit);
    }

    // ===== 管理员功能 =====
    var currentUser = getCurrentUser();
    
    // 检查用户角色是否为教师或班委
    function isAdmin() {
        if (!currentUser) return false;
        return currentUser.role === 'teacher' || currentUser.role === 'classleader';
    }

    // 显示/隐藏管理员面板
    function updateAdminPanel() {
        if (adminPanel) {
            adminPanel.style.display = isAdmin() ? 'block' : 'none';
        }
    }

    // 加载用户列表
    function loadUsers() {
        if (!isAdmin()) return;
        
        fetch(API_BASE + '/admin/users?adminUsername=' + encodeURIComponent(currentUser.username))
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (Array.isArray(data)) {
                    var userList = document.getElementById('userList');
                    if (userList) {
                        var html = '';
                        data.forEach(function(u) {
                            var roleText = u.role === 'teacher' ? '教师' : (u.role === 'classleader' ? '班委' : '学生');
                            var roleClass = u.role;
                            var mutedText = u.isMuted ? ' (已禁言)' : '';
                            html += '<li><div class="user-info"><span>' + escapeHtml(u.username) + '</span><span class="user-role ' + roleClass + '">' + roleText + '</span></div><span class="user-status">' + mutedText + '</span></li>';
                        });
                        userList.innerHTML = html;
                    }
                }
            })
            .catch(function(err) {
                console.error('加载用户列表失败', err);
            });
    }

    // 加载留言管理列表
    function loadMessageAdminList() {
        if (!isAdmin()) return;
        
        fetch(API_BASE + '/messages')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var messageAdminList = document.getElementById('messageAdminList');
                if (!messageAdminList) return;
                
                if (!data || data.length === 0) {
                    messageAdminList.innerHTML = '<div class="empty-message">暂无留言</div>';
                    return;
                }

                var html = '';
                data.forEach(function(msg) {
                    html +=
                        '<div class="message-admin-item">' +
                            '<div class="message-admin-header">' +
                                '<span class="message-admin-author">' + escapeHtml(msg.name) + '</span>' +
                                '<span class="message-admin-time">' + msg.time + '</span>' +
                            '</div>' +
                            '<div class="message-admin-content">' + escapeHtml(msg.content) + '</div>' +
                            '<button class="delete-message-btn" data-id="' + msg.id + '">删除留言</button>' +
                        '</div>';
                });
                messageAdminList.innerHTML = html;

                // 绑定删除按钮事件
                var deleteBtns = messageAdminList.querySelectorAll('.delete-message-btn');
                deleteBtns.forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var messageId = parseInt(this.getAttribute('data-id'));
                        deleteMessage(messageId);
                    });
                });
            })
            .catch(function(err) {
                console.error('加载留言管理列表失败', err);
            });
    }

    // 删除留言
    function deleteMessage(messageId) {
        if (!confirm('确定要删除这条留言吗？')) return;

        fetch(API_BASE + '/admin/deletemessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                adminUsername: currentUser.username,
                messageId: messageId
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                alert(data.message);
                loadMessages();
                loadMessageAdminList();
            } else {
                alert(data.message || '删除失败');
            }
        })
        .catch(function(err) {
            alert('操作失败，请确保后端已启动');
            console.error(err);
        });
    }

    // 管理员操作按钮事件
    var muteBtn = document.getElementById('muteBtn');
    var unmuteBtn = document.getElementById('unmuteBtn');
    var setLeaderBtn = document.getElementById('setLeaderBtn');
    var removeLeaderBtn = document.getElementById('removeLeaderBtn');
    var targetUsernameInput = document.getElementById('targetUsername');

    function getTargetUsername() {
        return targetUsernameInput ? targetUsernameInput.value.trim() : '';
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', function() {
            var target = getTargetUsername();
            if (!target) { alert('请输入目标用户名'); return; }
            
            fetch(API_BASE + '/admin/mute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUsername: currentUser.username, targetUsername: target })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                alert(data.message || '操作成功');
                loadUsers();
            })
            .catch(function(err) { alert('操作失败'); console.error(err); });
        });
    }

    if (unmuteBtn) {
        unmuteBtn.addEventListener('click', function() {
            var target = getTargetUsername();
            if (!target) { alert('请输入目标用户名'); return; }
            
            fetch(API_BASE + '/admin/unmute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUsername: currentUser.username, targetUsername: target })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                alert(data.message || '操作成功');
                loadUsers();
            })
            .catch(function(err) { alert('操作失败'); console.error(err); });
        });
    }

    if (setLeaderBtn) {
        setLeaderBtn.addEventListener('click', function() {
            var target = getTargetUsername();
            if (!target) { alert('请输入目标用户名'); return; }
            
            fetch(API_BASE + '/admin/setclassleader', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUsername: currentUser.username, targetUsername: target })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                alert(data.message || '操作成功');
                loadUsers();
            })
            .catch(function(err) { alert('操作失败'); console.error(err); });
        });
    }

    if (removeLeaderBtn) {
        removeLeaderBtn.addEventListener('click', function() {
            var target = getTargetUsername();
            if (!target) { alert('请输入目标用户名'); return; }
            
            fetch(API_BASE + '/admin/removeclassleader', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminUsername: currentUser.username, targetUsername: target })
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                alert(data.message || '操作成功');
                loadUsers();
            })
            .catch(function(err) { alert('操作失败'); console.error(err); });
        });
    }

    // ===== 点赞功能 =====
    function toggleLike(messageId) {
        var user = getCurrentUser();
        if (!user) {
            alert('请先登录');
            return;
        }

        fetch(API_BASE + '/likes/check?username=' + encodeURIComponent(user.username) + '&messageId=' + messageId)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                if (data.hasLiked) {
                    // 取消点赞
                    fetch(API_BASE + '/likes', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: user.username, messageId: messageId })
                    })
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        loadLikeCount(messageId);
                    });
                } else {
                    // 点赞
                    fetch(API_BASE + '/likes', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: user.username, messageId: messageId })
                    })
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                        loadLikeCount(messageId);
                    });
                }
            });
    }

    function loadLikeCount(messageId) {
        fetch(API_BASE + '/likes?messageId=' + messageId)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var likeBtn = document.querySelector('.like-btn[data-message-id="' + messageId + '"]');
                if (likeBtn) {
                    var countSpan = likeBtn.querySelector('.like-count');
                    if (countSpan) {
                        countSpan.textContent = data.count || 0;
                    }
                }
            });
    }

    // ===== 评论功能 =====
    function loadCommentCount(messageId) {
        fetch(API_BASE + '/comments?messageId=' + messageId)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var commentBtn = document.querySelector('.comment-toggle-btn[data-message-id="' + messageId + '"]');
                if (commentBtn) {
                    var countSpan = commentBtn.querySelector('.comment-count');
                    if (countSpan) {
                        countSpan.textContent = data.length || 0;
                    }
                }
            });
    }

    function loadComments(messageId) {
        fetch(API_BASE + '/comments?messageId=' + messageId)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var commentsList = document.getElementById('comments-list-' + messageId);
                if (!commentsList) return;

                if (!data || data.length === 0) {
                    commentsList.innerHTML = '<div class="empty-message">暂无评论，快来发表第一条评论吧！</div>';
                    return;
                }

                var html = '';
                data.forEach(function(comment) {
                    html +=
                        '<div class="comment-item">' +
                            '<div class="comment-header">' +
                                '<span class="comment-author">' + escapeHtml(comment.username) + '</span>' +
                                '<span class="comment-time">' + comment.createdAt + '</span>' +
                            '</div>' +
                            '<div class="comment-content">' + escapeHtml(comment.content) + '</div>' +
                        '</div>';
                });
                commentsList.innerHTML = html;
            });
    }

    function submitComment(messageId) {
        var user = getCurrentUser();
        if (!user) {
            alert('请先登录');
            return;
        }

        var commentInput = document.querySelector('.comment-input[data-message-id="' + messageId + '"]');
        if (!commentInput) return;

        var content = commentInput.value.trim();
        if (!content) {
            alert('请填写评论内容');
            return;
        }

        fetch(API_BASE + '/comments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user.username,
                messageId: messageId,
                content: content
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.message) {
                commentInput.value = '';
                loadComments(messageId);
                loadCommentCount(messageId);
            } else {
                alert(data.message || '评论失败');
            }
        })
        .catch(function(err) {
            alert('评论失败，请确保后端已启动');
            console.error(err);
        });
    }

    // 页面加载时初始化
    updateAdminPanel();
    loadMessages();
    loadUsers();
    loadMessageAdminList();
})();

// 页面加载完成后淡入并刷新教师面板
window.addEventListener('load', function() {
    document.body.style.opacity = '1';
    document.body.style.transition = 'opacity 0.5s ease';
    
    // 刷新教师面板
    setTimeout(function() {
        if (window.refreshTeacherPanel) {
            window.refreshTeacherPanel();
        }
    }, 600);
});
