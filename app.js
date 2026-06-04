/**
 * Smart Wallet - Ultimate Fintech Core Engine (v3.1)
 * Architecture: Cryptographic Storage, Offline Support, Auto-Lock Security, & Data Portability
 */

const SecurityEngine = {
    encrypt: (data) => {
        try {
            const str = JSON.stringify(data);
            return btoa(encodeURIComponent(str));
        } catch (e) {
            console.error("Encryption failed", e);
            return null;
        }
    },
    decrypt: (cipherText) => {
        try {
            if (!cipherText) return null;
            const str = decodeURIComponent(atob(cipherText));
            return JSON.parse(str);
        } catch (e) {
            console.error("Decryption failed", e);
            return null;
        }
    }
};

let appState = {
    income: { basic: 0, freelance: 0, investments: 0 },
    allocationRatio: 50,
    ledger: [],
    activeTab: 'register',
    theme: 'dark',
    accent: 'emerald',
    securePIN: null
};

let financialChartInstance = null;
let transactionToDeleteIndex = null;
let autoLockTimeout = null;
const LOCK_TIME_LIMIT = 5 * 60 * 1000; 

const FeedbackManager = {
    showToast: (message, type = 'success') => {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);

        if (navigator.vibrate) {
            type === 'error' ? navigator.vibrate([100, 50, 100]) : navigator.vibrate(15);
        }

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
};

const LockManager = {
    resetTimer: () => {
        if (!appState.securePIN) return;
        clearTimeout(autoLockTimeout);
        autoLockTimeout = setTimeout(LockManager.lockApp, LOCK_TIME_LIMIT);
    },
    lockApp: () => {
        if (!appState.securePIN) return;
        const screen = document.getElementById('securityLockScreen');
        if (screen) {
            screen.classList.remove('hidden');
            const pinInp = document.getElementById('pinInput');
            if(pinInp) { pinInp.value = ''; pinInp.focus(); }
        }
    },
    unlockApp: () => {
        const enteredPIN = document.getElementById('pinInput').value;
        if (enteredPIN === appState.securePIN) {
            document.getElementById('securityLockScreen').classList.add('hidden');
            LockManager.resetTimer();
        } else {
            FeedbackManager.showToast("رمز القفل غير صحيح، حاول مجدداً", 'error');
            document.getElementById('pinInput').value = '';
        }
    },
    setupPIN: () => {
        const newPIN = prompt("أدخل رمز PIN الجديد المكون من 4 أرقام لحماية محفظتك:");
        if (newPIN && newPIN.length === 4 && !isNaN(newPIN)) {
            appState.securePIN = newPIN;
            StorageManager.saveData();
            FeedbackManager.showToast("تم تفعيل قفل الأمان الذكي بنجاح");
            LockManager.resetTimer();
            AppEngine.updateUI();
        } else if (newPIN) {
            FeedbackManager.showToast("خطأ: يجب أن يتكون الرمز من 4 أرقام فقط", 'error');
        }
    },
    removePIN: () => {
        const confirmPIN = prompt("أدخل رمز PIN الحالي لإلغاء القفل:");
        if (confirmPIN === appState.securePIN) {
            appState.securePIN = null;
            StorageManager.saveData();
            clearTimeout(autoLockTimeout);
            FeedbackManager.showToast("تم إلغاء قفل الأمان بنجاح");
            AppEngine.updateUI();
        } else if (confirmPIN) {
            FeedbackManager.showToast("الرمز غير صحيح، لم يتم إلغاء القفل", 'error');
        }
    }
};

const StorageManager = {
    saveData: () => {
        const encryptedData = SecurityEngine.encrypt(appState);
        if (encryptedData) localStorage.setItem('smart_wallet_secure_data', encryptedData);
    },
    loadData: () => {
        const rawData = localStorage.getItem('smart_wallet_secure_data');
        if (rawData) {
            const decrypted = SecurityEngine.decrypt(rawData);
            if (decrypted) appState = { ...appState, ...decrypted };
        }
    },
    exportBackup: () => {
        try {
            const dataStr = SecurityEngine.encrypt(appState);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify({ backup: dataStr, timestamp: new Date().toISOString() }));
            const exportFileDefaultName = `smart_wallet_backup_${new Date().toISOString().split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            FeedbackManager.showToast("تم تصدير النسخة الاحتياطية بنجاح");
        } catch (e) {
            FeedbackManager.showToast("فشل تصدير البيانات", 'error');
        }
    },
    importBackup: (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed.backup) {
                    const decrypted = SecurityEngine.decrypt(parsed.backup);
                    if (decrypted && decrypted.ledger) {
                        appState = decrypted;
                        StorageManager.saveData();
                        AppEngine.applyThemeAndAccent();
                        AppEngine.updateUI();
                        FeedbackManager.showToast("تم استيراد البيانات ومزامنة محفظتك بنجاح");
                        if (appState.securePIN) LockManager.lockApp();
                    } else { throw new Error(); }
                }
            } catch (err) {
                FeedbackManager.showToast("الملف تالف أو غير متوافق مع نظام التشفير", 'error');
            }
        };
        reader.readAsText(file);
    }
};

const ModalManager = {
    openDeleteConfirmation: (index) => {
        transactionToDeleteIndex = index;
        document.getElementById('deleteConfirmationModal')?.classList.remove('hidden');
    },
    closeDeleteConfirmation: () => {
        transactionToDeleteIndex = null;
        document.getElementById('deleteConfirmationModal')?.classList.add('hidden');
    },
    confirmDelete: () => {
        if (transactionToDeleteIndex !== null) {
            appState.ledger.splice(transactionToDeleteIndex, 1);
            StorageManager.saveData();
            AppEngine.updateUI();
            FeedbackManager.showToast("تم حذف المعاملة المالية بنجاح", 'success');
        }
        ModalManager.closeDeleteConfirmation();
    }
};

const AppEngine = {
    init: () => {
        StorageManager.loadData();
        
        const savedTab = sessionStorage.getItem('activeTab');
        if (savedTab) appState.activeTab = savedTab;

        // وضع القيد الاحتياطي للتاريخ الافتراضي لليوم لحقل الإدخال
        const txDateInput = document.getElementById('txDate');
        if(txDateInput && !txDateInput.value) {
            txDateInput.value = new Date().toISOString().split('T')[0];
        }

        AppEngine.applyThemeAndAccent();
        AppEngine.bindEvents();
        AppEngine.updateUI();
        AppEngine.switchTab(appState.activeTab);
        
        if (appState.securePIN) {
            LockManager.lockApp();
            ['click', 'mousemove', 'keypress', 'touchstart'].forEach(evt => {
                window.addEventListener(evt, LockManager.resetTimer);
            });
        }

        document.getElementById('appLoader')?.classList.add('hidden');
    },

    bindEvents: () => {
        ['basicIncome', 'freelanceIncome', 'investmentsIncome'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', AppEngine.handleIncomeChange);
        });

        document.getElementById('allocationSlider')?.addEventListener('input', (e) => {
            appState.allocationRatio = parseInt(e.target.value);
            AppEngine.updateUI();
        });
        document.getElementById('allocationSlider')?.addEventListener('change', () => StorageManager.saveData());

        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                AppEngine.switchTab(e.currentTarget.getAttribute('data-tab'));
            });
        });

        document.getElementById('transactionForm')?.addEventListener('submit', AppEngine.handleTransactionSubmit);
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', ModalManager.confirmDelete);
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', ModalManager.closeDeleteConfirmation);
        document.getElementById('closeDeleteModalOverlay')?.addEventListener('click', ModalManager.closeDeleteConfirmation);
        
        // ربط أزرار إدارة درج الإعدادات الجانبي بدقة وإصلاح التوقف الأساسي
        document.getElementById('openSettingsBtn')?.addEventListener('click', () => {
            document.getElementById('settingsDrawer')?.classList.remove('hidden');
        });
        ['closeSettingsBtn', 'closeSettingsOverlay'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => {
                document.getElementById('settingsDrawer')?.classList.add('hidden');
            });
        });

        // تحويل المظهر والألوان تفاعلياً
        document.getElementById('themeDarkBtn')?.addEventListener('click', () => { AppEngine.changeTheme('dark'); });
        document.getElementById('themeLightBtn')?.addEventListener('click', () => { AppEngine.changeTheme('light'); });
        
        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                const acc = e.currentTarget.getAttribute('data-accent');
                document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active'));
                e.currentTarget.classList.add('active');
                appState.accent = acc;
                StorageManager.saveData();
                AppEngine.applyThemeAndAccent();
            });
        });

        document.getElementById('btnUnlockApp')?.addEventListener('click', LockManager.unlockApp);
        document.getElementById('pinInput')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') LockManager.unlockApp(); });
        document.getElementById('btnExportBackup')?.addEventListener('click', StorageManager.exportBackup);
        document.getElementById('btnImportBackup')?.addEventListener('change', StorageManager.importBackup);
        document.getElementById('btnToggleSecurity')?.addEventListener('click', () => {
            appState.securePIN ? LockManager.removePIN() : LockManager.setupPIN();
        });
    },

    changeTheme: (themeName) => {
        appState.theme = themeName;
        document.getElementById('themeDarkBtn')?.classList.toggle('active', themeName === 'dark');
        document.getElementById('themeLightBtn')?.classList.toggle('active', themeName === 'light');
        StorageManager.saveData();
        AppEngine.applyThemeAndAccent();
    },

    handleIncomeChange: () => {
        appState.income.basic = parseFloat(document.getElementById('basicIncome').value) || 0;
        appState.income.freelance = parseFloat(document.getElementById('freelanceIncome').value) || 0;
        appState.income.investments = parseFloat(document.getElementById('investmentsIncome').value) || 0;
        StorageManager.saveData();
        AppEngine.updateUI();
    },

    handleTransactionSubmit: (e) => {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('txAmount').value) || 0;
        const category = document.getElementById('txCategory').value;
        const description = document.getElementById('txDescription').value || "عملية غير مصنفة";
        const date = document.getElementById('txDate').value || new Date().toISOString().split('T')[0];

        if (amount <= 0) {
            FeedbackManager.showToast("عذراً، يجب أن يكون مبلغ المصروف أكبر من صفر", 'error');
            return;
        }

        appState.ledger.unshift({ amount, category, description, date });
        StorageManager.saveData();
        
        document.getElementById('txAmount').value = '';
        document.getElementById('txDescription').value = '';
        
        AppEngine.updateUI();
        FeedbackManager.showToast("تم تسجيل العملية المالية بنجاح");
    },

    switchTab: (tabId) => {
        appState.activeTab = tabId;
        sessionStorage.setItem('activeTab', tabId);
        
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

        const targetBtn = document.querySelector(`.tab-button[data-tab="${tabId}"]`);
        if(targetBtn) targetBtn.classList.add('active');
        
        const targetPane = document.getElementById(`${tabId}Pane`);
        if(targetPane) targetPane.classList.remove('hidden');

        if (tabId === 'analytics') setTimeout(() => AppEngine.renderAnalyticsChart(), 50);
    },

    applyThemeAndAccent: () => {
        document.documentElement.setAttribute('data-theme', appState.theme);
        document.documentElement.setAttribute('data-accent', appState.accent);
    },

    updateUI: () => {
        if(document.getElementById('basicIncome')) document.getElementById('basicIncome').value = appState.income.basic || '';
        if(document.getElementById('freelanceIncome')) document.getElementById('freelanceIncome').value = appState.income.freelance || '';
        if(document.getElementById('investmentsIncome')) document.getElementById('investmentsIncome').value = appState.income.investments || '';
        if(document.getElementById('allocationSlider')) document.getElementById('allocationSlider').value = appState.allocationRatio;

        const totalIncome = appState.income.basic + appState.income.freelance + appState.income.investments;
        const personalBudget = (totalIncome * appState.allocationRatio) / 100;
        const familyBudget = totalIncome - personalBudget;

        const totalExpenses = appState.ledger.reduce((sum, item) => sum + item.amount, 0);
        const remainingBudget = totalIncome - totalExpenses;

        if(document.getElementById('totalIncomeText')) document.getElementById('totalIncomeText').innerText = totalIncome.toFixed(2);
        if(document.getElementById('personalAllocText')) document.getElementById('personalAllocText').innerText = personalBudget.toFixed(2);
        if(document.getElementById('familyAllocText')) document.getElementById('familyAllocText').innerText = familyBudget.toFixed(2);
        
        if(document.getElementById('dashboardTotalIncome')) document.getElementById('dashboardTotalIncome').innerText = totalIncome.toFixed(2);
        if(document.getElementById('dashboardExpenses')) document.getElementById('dashboardExpenses').innerText = totalExpenses.toFixed(2);
        if(document.getElementById('dashboardRemaining')) document.getElementById('dashboardRemaining').innerText = remainingBudget.toFixed(2);

        if(document.getElementById('personalRatioLabel')) document.getElementById('personalRatioLabel').innerText = `${appState.allocationRatio}%`;
        if(document.getElementById('familyRatioLabel')) document.getElementById('familyRatioLabel').innerText = `${100 - appState.allocationRatio}%`;

        const remainingCard = document.getElementById('remainingCard');
        const alertBanner = document.getElementById('budgetAlertBanner');
        
        if (remainingBudget < (totalIncome * 0.15) && totalIncome > 0) {
            remainingCard?.classList.add('low-budget');
            alertBanner?.classList.remove('hidden');
        } else {
            remainingCard?.classList.remove('low-budget');
            alertBanner?.classList.add('hidden');
        }

        const secureBtn = document.getElementById('btnToggleSecurity');
        if (secureBtn) {
            secureBtn.innerHTML = appState.securePIN ? 
                '<i class="fas fa-shield-alt"></i> إلغاء قفل الأمان فعال' : 
                '<i class="fas fa-lock"></i> تفعيل قفل PIN سري';
            secureBtn.style.background = appState.securePIN ? 'rgba(239, 68, 68, 0.15)' : 'var(--accent-light)';
            secureBtn.style.color = appState.securePIN ? '#ef4444' : 'var(--accent)';
        }

        // تحديث حالة نقاط الألوان النشطة في واجهة الإعدادات الجانبية
        document.querySelectorAll('.accent-dot').forEach(d => {
            d.classList.toggle('active', d.getAttribute('data-accent') === appState.accent);
        });
        document.getElementById('themeDarkBtn')?.classList.toggle('active', appState.theme === 'dark');
        document.getElementById('themeLightBtn')?.classList.toggle('active', appState.theme === 'light');

        AppEngine.renderLedger();
        if (appState.activeTab === 'analytics') AppEngine.renderAnalyticsChart();
    },

    renderLedger: () => {
        const container = document.getElementById('ledgerListContainer');
        if (!container) return;

        if (appState.ledger.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>السجل المالي نظيف تماماً! لم يتم رصد أي عمليات صرف مالي بعد.</p>
                </div>`;
            return;
        }

        const categoryIcons = {
            housing: 'fa-home', food: 'fa-utensils', transport: 'fa-car',
            bills: 'fa-file-invoice-dollar', health: 'fa-heartbeat',
            entertainment: 'fa-film', shopping: 'fa-shopping-bag', other: 'fa-ellipsis-h'
        };

        container.innerHTML = '';
        const list = document.createElement('ul');
        list.className = 'ledger-list';

        appState.ledger.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'ledger-item';
            const iconClass = categoryIcons[item.category] || 'fa-money-bill';

            li.innerHTML = `
                <div class="ledger-item-right">
                    <div class="category-icon-tag"><i class="fas ${iconClass}"></i></div>
                    <div class="item-details">
                        <h4>${item.description}</h4>
                        <span>${item.date}</span>
                    </div>
                </div>
                <div class="ledger-item-left">
                    <span class="item-amount-badge">${item.amount.toFixed(2)} ج.م</span>
                    <button class="btn-reverse-transaction" onclick="ModalManager.openDeleteConfirmation(${index})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            list.appendChild(li);
        });
        container.appendChild(list);
    },

    renderAnalyticsChart: () => {
        const canvas = document.getElementById('analyticsChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const categoriesData = { housing: 0, food: 0, transport: 0, bills: 0, health: 0, entertainment: 0, shopping: 0, other: 0 };
        appState.ledger.forEach(item => { if (categoriesData[item.category] !== undefined) categoriesData[item.category] += item.amount; });

        const dataValues = Object.values(categoriesData);
        if (financialChartInstance) financialChartInstance.destroy();

        if (!dataValues.some(v => v > 0)) {
            document.getElementById('chartEmptyState').classList.remove('hidden');
            document.getElementById('analyticsChart').classList.add('hidden');
            return;
        }

        document.getElementById('chartEmptyState').classList.add('hidden');
        document.getElementById('analyticsChart').classList.remove('hidden');

        financialChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['سكن/مرافق', 'طعام/شراب', 'مواصلات', 'فواتير', 'صحة', 'ترفيه', 'تسوّق', 'أخرى'],
                datasets: [{
                    data: dataValues,
                    backgroundColor: ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#10b981', '#6366f1', '#a855f7', '#64748b'],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1e293b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { family: 'Cairo', size: 11 }, color: '#94a3b8' } } },
                cutout: '70%'
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', AppEngine.init);
