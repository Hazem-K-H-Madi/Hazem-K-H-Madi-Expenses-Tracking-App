/**
 * Smart Wallet - Advanced Core Engine
 * Architectural Enhancements: Cryptographic Storage, Memory Management, & Haptic UX
 */

// 1. إدارة الحالة والنظام الأمني للمنتج
const SecurityEngine = {
    // تشفير خفيف وسريع للبيانات المالية المحلية لحمايتها من المتطفلين
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
            console.error("Decryption failed - Data might be corrupted or raw", e);
            return null; // التعامل مع البيانات القديمة غير المشفرة
        }
    }
};

// الحالات العامة للتطبيق
let appState = {
    income: { basic: 0, freelance: 0, investments: 0 },
    allocationRatio: 50, // 50% شخصي، 50% منزلي
    ledger: [],
    activeTab: 'register',
    theme: 'dark',
    accent: 'emerald'
};

// متغير الاحتفاظ بمرجع الرسم البياني لمنع الـ Memory Leaks
let financialChartInstance = null;
let transactionToDeleteIndex = null;

// 2. محرك التنبيهات والاهتزاز (Haptic & Feedback UX)
const FeedbackManager = {
    showToast: (message, type = 'success') => {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 50);

        // تفعيل الاهتزاز التفاعلي للهواتف الذكية
        if (navigator.vibrate) {
            if (type === 'error') {
                navigator.vibrate([100, 50, 100]); // اهتزاز مزدوج للخطأ
            } else {
                navigator.vibrate(15); // اهتزاز خفيف جداً للنجاح
            }
        }

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    }
};

// 3. إدارة البيانات والتخزين المستقر (Persistence Layer)
const StorageManager = {
    saveData: () => {
        const encryptedData = SecurityEngine.encrypt(appState);
        if (encryptedData) {
            localStorage.setItem('smart_wallet_secure_data', encryptedData);
        }
    },
    loadData: () => {
        const rawData = localStorage.getItem('smart_wallet_secure_data');
        if (rawData) {
            const decrypted = SecurityEngine.decrypt(rawData);
            if (decrypted) {
                appState = { ...appState, ...decrypted };
                return;
            }
        }
        
        // المحاولة الاحتياطية لقراءة البيانات القديمة غير المشفرة إذا وجدت أثناء الترقية
        const legacyData = localStorage.getItem('smart_wallet_data');
        if (legacyData) {
            try {
                appState = { ...appState, ...JSON.parse(legacyData) };
                StorageManager.saveData(); // تشفيرها فوراً للمستقبل
                localStorage.removeItem('smart_wallet_data'); // حذف القديمة النظيفة
            } catch(e) { console.error("Legacy migration failed", e); }
        }
    }
};

// 4. إدارة النوافذ المنبثقة والتأكيدات (Modals UI)
const ModalManager = {
    openDeleteConfirmation: (index) => {
        transactionToDeleteIndex = index;
        const modal = document.getElementById('deleteConfirmationModal');
        if (modal) modal.classList.remove('hidden');
    },
    closeDeleteConfirmation: () => {
        transactionToDeleteIndex = null;
        const modal = document.getElementById('deleteConfirmationModal');
        if (modal) modal.classList.add('hidden');
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

// 5. محرك الحسابات والتحديثات الديناميكية (Core Engine)
const AppEngine = {
    init: () => {
        StorageManager.loadData();
        
        // استعادة التبويب النشط الأخير من الـ sessionStorage لتحسين الـ UX
        const savedTab = sessionStorage.getItem('activeTab');
        if (savedTab) appState.activeTab = savedTab;

        AppEngine.applyThemeAndAccent();
        AppEngine.bindEvents();
        AppEngine.updateUI();
        
        // إخفاء شاشة التحميل
        const loader = document.getElementById('appLoader');
        if (loader) loader.classList.add('hidden');
    },

    bindEvents: () => {
        // حقول الدخل
        ['basicIncome', 'freelanceIncome', 'investmentsIncome'].forEach(id => {
            document.getElementById(id)?.addEventListener('input', AppEngine.handleIncomeChange);
        });

        // السلايدر
        const slider = document.getElementById('allocationSlider');
        slider?.addEventListener('input', (e) => {
            appState.allocationRatio = parseInt(e.target.value);
            AppEngine.updateUI();
        });
        slider?.addEventListener('change', () => StorageManager.saveData());

        // التبويبات
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.currentTarget.getAttribute('data-tab');
                AppEngine.switchTab(tabId);
            });
        });

        // نموذج إضافة معاملة
        document.getElementById('transactionForm')?.addEventListener('submit', AppEngine.handleTransactionSubmit);

        // أزرار الحذف والتأكيد في المودال
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', ModalManager.confirmDelete);
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', ModalManager.closeDeleteConfirmation);
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

        // إضافة المعاملة في أول المصفوفة لتبدو الأحدث في الأعلى
        appState.ledger.unshift({ amount, category, description, date });
        StorageManager.saveData();
        
        // إعادة تهيئة حقول الإدخال
        document.getElementById('txAmount').value = '';
        document.getElementById('txDescription').value = '';
        
        AppEngine.updateUI();
        FeedbackManager.showToast("تم تسجيل العملية المالية بنجاح");
    },

    switchTab: (tabId) => {
        appState.activeTab = tabId;
        sessionStorage.setItem('activeTab', tabId); // حفظ التبويب لمنع الضياع عند الريفرش
        
        document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));

        document.querySelector(`.tab-button[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`${tabId}Pane`)?.classList.remove('hidden');

        if (tabId === 'analytics') {
            // إعادة بناء الرسم البياني بدقة عند الانتقال للتبويب
            setTimeout(() => AppEngine.renderAnalyticsChart(), 50);
        }
    },

    applyThemeAndAccent: () => {
        document.documentElement.setAttribute('data-theme', appState.theme);
        document.documentElement.setAttribute('data-accent', appState.accent);
    },

    updateUI: () => {
        // تحديث قيم حقول الإدخال لتطابق الـ State الحالية
        if(document.getElementById('basicIncome')) document.getElementById('basicIncome').value = appState.income.basic || '';
        if(document.getElementById('freelanceIncome')) document.getElementById('freelanceIncome').value = appState.income.freelance || '';
        if(document.getElementById('investmentsIncome')) document.getElementById('investmentsIncome').value = appState.income.investments || '';
        if(document.getElementById('allocationSlider')) document.getElementById('allocationSlider').value = appState.allocationRatio;

        // الحسابات الرياضية للمحرك الذكي
        const totalIncome = appState.income.basic + appState.income.freelance + appState.income.investments;
        const personalBudget = (totalIncome * appState.allocationRatio) / 100;
        const familyBudget = totalIncome - personalBudget;

        const totalExpenses = appState.ledger.reduce((sum, item) => sum + item.amount, 0);
        const remainingBudget = totalIncome - totalExpenses;

        // تحديث النصوص في الواجهة
        document.getElementById('totalIncomeText').innerText = totalIncome.toFixed(2);
        document.getElementById('personalAllocText').innerText = personalBudget.toFixed(2);
        document.getElementById('familyAllocText').innerText = familyBudget.toFixed(2);
        
        document.getElementById('dashboardTotalIncome').innerText = totalIncome.toFixed(2);
        document.getElementById('dashboardExpenses').innerText = totalExpenses.toFixed(2);
        document.getElementById('dashboardRemaining').innerText = remainingBudget.toFixed(2);

        // تحديث نِسب السلايدر النصية
        document.getElementById('personalRatioLabel').innerText = `${appState.allocationRatio}%`;
        document.getElementById('familyRatioLabel').innerText = `${100 - appState.allocationRatio}%`;

        // مؤشر التحذير المتقدم من انخفاض الميزانية المتوفرة لـ UX الفينتك
        const remainingCard = document.getElementById('remainingCard');
        const alertBanner = document.getElementById('budgetAlertBanner');
        
        if (remainingBudget < (totalIncome * 0.15) && totalIncome > 0) {
            remainingCard?.classList.add('low-budget');
            alertBanner?.classList.remove('hidden');
        } else {
            remainingCard?.classList.remove('low-budget');
            alertBanner?.classList.add('hidden');
        }

        // تحديث سجل قيد العمليات
        AppEngine.renderLedger();
        
        // تحديث الرسم البياني إذا كان تبويب التحليل نشطاً
        if (appState.activeTab === 'analytics') {
            AppEngine.renderAnalyticsChart();
        }
    },

    renderLedger: () => {
        const container = document.getElementById('ledgerListContainer');
        if (!container) return;

        if (appState.ledger.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-receipt"></i>
                    <p>السجل المالي نظيف تماماً! لم يتم رصد أي عمليات صرف مالي على هذه المحفظة بعد.</p>
                </div>`;
            return;
        }

        // خريطة الأيقونات المخصصة للفئات
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
                    <div class="category-icon-tag">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="item-details">
                        <h4>${item.description}</h4>
                        <span>${item.date}</span>
                    </div>
                </div>
                <div class="ledger-item-left">
                    <span class="item-amount-badge">${item.amount.toFixed(2)} ج.م</span>
                    <button class="btn-reverse-transaction" onclick="ModalManager.openDeleteConfirmation(${index})" title="حذف القيد المالي">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            list.appendChild(li);
        });

        container.appendChild(list);
    },

    renderAnalyticsChart: () => {
        const ctx = document.getElementById('analyticsChart')?.getContext('2d');
        if (!ctx) return;

        // تجميع المصاريف حسب الفئة لتغذية الـ Chart
        const categoriesData = {
            housing: 0, food: 0, transport: 0, bills: 0, health: 0, entertainment: 0, shopping: 0, other: 0
        };
        
        appState.ledger.forEach(item => {
            if (categoriesData[item.category] !== undefined) {
                categoriesData[item.category] += item.amount;
            } else {
                categoriesData.other += item.amount;
            }
        });

        const dataValues = Object.values(categoriesData);
        const hasExpenses = dataValues.some(v => v > 0);

        // حل مشكلة تسريب الذاكرة وتضارب الرسوم (Crucial Memory Management Fixed)
        if (financialChartInstance) {
            financialChartInstance.destroy();
        }

        if (!hasExpenses) {
            // إظهار نص بديل إذا لم يكن هناك مصاريف لعرضها
            document.getElementById('chartEmptyState').classList.remove('hidden');
            document.getElementById('analyticsChart').classList.add('hidden');
            return;
        }

        document.getElementById('chartEmptyState').classList.add('hidden');
        document.getElementById('analyticsChart').classList.remove('hidden');

        // جلب لون السمات للحصول على رسم متناسق مع الـ Accent Color الحالي
        const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#10b981';

        financialChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['سكن/مرافق', 'طعام/شراب', 'مواصلات', 'فواتير', 'صحة', 'ترفيه', 'تسوّق', 'أخرى'],
                datasets: [{
                    data: dataValues,
                    backgroundColor: [
                        '#ef4444', '#f97316', '#eab308', '#06b6d4', 
                        '#10b981', '#6366f1', '#a855f7', '#64748b'
                    ],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1e293b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { family: 'Cairo', size: 11 },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim() || '#94a3b8'
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
};

// تشغيل التطبيق بمجرد تحميل الشجرة الهيكلية
document.addEventListener('DOMContentLoaded', AppEngine.init);
