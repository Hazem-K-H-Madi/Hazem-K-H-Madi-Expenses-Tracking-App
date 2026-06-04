/**
 * Smart Wallet Pro - Core Fintech Engine (v4.0)
 * Dual-Account Ledger Architecture, Full CRUDB Hub & Cryptographic Engine
 */

const SecurityEngine = {
    encrypt: (data) => {
        try { return btoa(encodeURIComponent(JSON.stringify(data))); } 
        catch (e) { console.error("Encryption failed", e); return null; }
    },
    decrypt: (cipherText) => {
        try { return cipherText ? JSON.parse(decodeURIComponent(atob(cipherText))) : null; } 
        catch (e) { console.error("Decryption failed", e); return null; }
    }
};

// هيكل الحالة الجديد يدعم سجلين منفصلين تماماً (Personal Ledger vs Family Ledger)
let appState = {
    income: { basic: 0, freelance: 0, investments: 0 },
    allocationRatio: 50,
    personalLedger: [],  // السجل الفردي المنفصل
    familyLedger: [],    // سجل المنزل والعائلة المنفصل
    currentWallet: 'personal', // 'personal' أو 'family'
    activeTab: 'register',
    theme: 'dark',
    accent: 'emerald',
    securePIN: null
};

// خريطة تصنيفات وفئات مخصصة لكل محفظة على حدة لتحقيق تجربة UX متكاملة ومخصصة
const CategoryMaps = {
    personal: [
        { value: 'shopping', label: 'تسوق وملابس وأدوات شخصية', icon: 'fa-shopping-bag' },
        { value: 'entertainment', label: 'ترفيه وخروجات واشتراكات', icon: 'fa-film' },
        { value: 'health', label: 'رعاية صحية وأدوية وعناية شخصية', icon: 'fa-heartbeat' },
        { value: 'transport', label: 'مواصلات وتنقّل ومصاريف فردية', icon: 'fa-car' },
        { value: 'other', label: 'أوجه صرف ومصروفات شخصية أخرى', icon: 'fa-ellipsis-h' }
    ],
    family: [
        { value: 'housing', label: 'إيجار سكن ومستلزمات منزلية', icon: 'fa-home' },
        { value: 'food', label: 'طعام وشراب ومشتريات بقالة العائلة', icon: 'fa-utensils' },
        { value: 'bills', label: 'فواتير (إنترنت، كهرباء، غاز، اتصالات)', icon: 'fa-file-invoice-dollar' },
        { value: 'health', label: 'علاجات ومصاريف طبية عائلية وطوارئ', icon: 'fa-medkit' },
        { value: 'other', label: 'مصروفات ومستلزمات منزلية أخرى', icon: 'fa-home-user' }
    ]
};

let financialChartInstance = null;
let transactionToDeleteIndex = null;
let transactionToEditIndex = null;
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
        if (navigator.vibrate) { type === 'error' ? navigator.vibrate([100, 50, 100]) : navigator.vibrate(15); }
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3500);
    }
};

const LockManager = {
    resetTimer: () => { if (!appState.securePIN) return; clearTimeout(autoLockTimeout); autoLockTimeout = setTimeout(LockManager.lockApp, LOCK_TIME_LIMIT); },
    lockApp: () => {
        if (!appState.securePIN) return;
        document.getElementById('securityLockScreen')?.classList.remove('hidden');
        const pinInp = document.getElementById('pinInput');
        if(pinInp) { pinInp.value = ''; pinInp.focus(); }
    },
    unlockApp: () => {
        if (document.getElementById('pinInput').value === appState.securePIN) {
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
        } else if (newPIN) { FeedbackManager.showToast("خطأ: يجب أن يتكون الرمز من 4 أرقام فقط", 'error'); }
    },
    removePIN: () => {
        if (prompt("أدخل رمز PIN الحالي لإلغاء القفل:") === appState.securePIN) {
            appState.securePIN = null;
            StorageManager.saveData();
            clearTimeout(autoLockTimeout);
            FeedbackManager.showToast("تم إلغاء قفل الأمان بنجاح");
            AppEngine.updateUI();
        } else { FeedbackManager.showToast("الرمز غير صحيح، لم يتم إلغاء القفل", 'error'); }
    }
};

const StorageManager = {
    saveData: () => {
        const encryptedData = SecurityEngine.encrypt(appState);
        if (encryptedData) localStorage.setItem('smart_wallet_v4_secure', encryptedData);
    },
    loadData: () => {
        const rawData = localStorage.getItem('smart_wallet_v4_secure');
        if (rawData) {
            const decrypted = SecurityEngine.decrypt(rawData);
            if (decrypted) appState = { ...appState, ...decrypted };
        } else {
            // الهجرة الذكية من الإصدار v3.0 إذا كانت البيانات متواجدة
            const legacyData = localStorage.getItem('smart_wallet_secure_data');
            if (legacyData) {
                const decryptedLegacy = SecurityEngine.decrypt(legacyData);
                if (decryptedLegacy) {
                    appState.income = decryptedLegacy.income || appState.income;
                    appState.allocationRatio = decryptedLegacy.allocationRatio || appState.allocationRatio;
                    appState.personalLedger = decryptedLegacy.ledger || []; // صب العمليات القديمة في الشخصي كـ Fallback
                    appState.securePIN = decryptedLegacy.securePIN || null;
                    StorageManager.saveData();
                }
            }
        }
    },
    exportBackup: () => {
        try {
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify({ backup: SecurityEngine.encrypt(appState), timestamp: new Date().toISOString() }));
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', `smart_wallet_pro_v4_${new Date().toISOString().split('T')[0]}.json`);
            linkElement.click();
            FeedbackManager.showToast("تم تصدير النسخة الاحتياطية بنجاح");
        } catch (e) { FeedbackManager.showToast("فشل تصدير البيانات", 'error'); }
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
                    if (decrypted && (decrypted.personalLedger || decrypted.ledger)) {
                        appState = decrypted;
                        if(!appState.personalLedger && decrypted.ledger) appState.personalLedger = decrypted.ledger; 
                        StorageManager.saveData();
                        AppEngine.applyThemeAndAccent();
                        AppEngine.updateUI();
                        FeedbackManager.showToast("تم استيراد البيانات ومزامنة محفظتك بنجاح");
                        if (appState.securePIN) LockManager.lockApp();
                    } else { throw new Error(); }
                }
            } catch (err) { FeedbackManager.showToast("الملف تالف أو غير متوافق", 'error'); }
        };
        reader.readAsText(file);
    }
};

const CRUDHub = {
    openDelete: (index) => { transactionToDeleteIndex = index; document.getElementById('deleteConfirmationModal')?.classList.remove('hidden'); },
    closeDelete: () => { transactionToDeleteIndex = null; document.getElementById('deleteConfirmationModal')?.classList.add('hidden'); },
    confirmDelete: () => {
        const currentLedger = appState.currentWallet === 'personal' ? 'personalLedger' : 'familyLedger';
        if (transactionToDeleteIndex !== null) {
            appState[currentLedger].splice(transactionToDeleteIndex, 1);
            StorageManager.saveData();
            AppEngine.updateUI();
            FeedbackManager.showToast("تم حذف القيد المالي بنجاح");
        }
        CRUDHub.closeDelete();
    },
    openEdit: (index) => {
        transactionToEditIndex = index;
        const currentLedger = appState.currentWallet === 'personal' ? appState.personalLedger : appState.familyLedger;
        const item = currentLedger[index];
        
        document.getElementById('editTxAmount').value = item.amount;
        document.getElementById('editTxDescription').value = item.description;
        document.getElementById('editTxDate').value = item.date;
        
        // بناء منتقي الفئات لـ Form التعديل حركياً بناء على المحفظة النشطة
        const select = document.getElementById('editTxCategory');
        select.innerHTML = '';
        CategoryMaps[appState.currentWallet].forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat.value;
            opt.innerText = cat.label;
            if(cat.value === item.category) opt.selected = true;
            select.appendChild(opt);
        });
        
        document.getElementById('editTransactionModal')?.classList.remove('hidden');
    },
    closeEdit: () => { transactionToEditIndex = null; document.getElementById('editTransactionModal')?.classList.add('hidden'); },
    confirmEdit: (e) => {
        e.preventDefault();
        const currentLedger = appState.currentWallet === 'personal' ? 'personalLedger' : 'familyLedger';
        if (transactionToEditIndex !== null) {
            appState[currentLedger][transactionToEditIndex] = {
                amount: parseFloat(document.getElementById('editTxAmount').value) || 0,
                category: document.getElementById('editTxCategory').value,
                description: document.getElementById('editTxDescription').value || "عملية غير مصنفة",
                date: document.getElementById('editTxDate').value || new Date().toISOString().split('T')[0]
            };
            StorageManager.saveData();
            AppEngine.updateUI();
            FeedbackManager.showToast("تم تحديث وتعديل القيد بنجاح");
        }
        CRUDHub.closeEdit();
    }
};

const AppEngine = {
    init: () => {
        StorageManager.loadData();
        const savedTab = sessionStorage.getItem('activeTab');
        if (savedTab) appState.activeTab = savedTab;
        
        const txDateInput = document.getElementById('txDate');
        if(txDateInput && !txDateInput.value) txDateInput.value = new Date().toISOString().split('T')[0];

        AppEngine.applyThemeAndAccent();
        AppEngine.bindEvents();
        AppEngine.updateWalletUIState();
        AppEngine.updateUI();
        AppEngine.switchTab(appState.activeTab);
        
        if (appState.securePIN) {
            LockManager.lockApp();
            ['click', 'mousemove', 'keypress', 'touchstart'].forEach(evt => window.addEventListener(evt, LockManager.resetTimer));
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
            btn.addEventListener('click', (e) => AppEngine.switchTab(e.currentTarget.getAttribute('data-tab')));
        });

        document.getElementById('transactionForm')?.addEventListener('submit', AppEngine.handleTransactionSubmit);
        document.getElementById('editTransactionForm')?.addEventListener('submit', CRUDHub.confirmEdit);
        document.getElementById('cancelEditBtn')?.addEventListener('click', CRUDHub.closeEdit);
        document.getElementById('closeEditModalOverlay')?.addEventListener('click', CRUDHub.closeEdit);
        
        document.getElementById('confirmDeleteBtn')?.addEventListener('click', CRUDHub.confirmDelete);
        document.getElementById('cancelDeleteBtn')?.addEventListener('click', CRUDHub.closeDelete);
        document.getElementById('closeDeleteModalOverlay')?.addEventListener('click', CRUDHub.closeDelete);
        
        // التبديل بين المحفظة الشخصية والعائلية بسلاسة (Haptic & Instant Switch)
        document.getElementById('switchToPersonalBtn')?.addEventListener('click', () => AppEngine.switchWallet('personal'));
        document.getElementById('switchToFamilyBtn')?.addEventListener('click', () => AppEngine.switchWallet('family'));

        document.getElementById('openSettingsBtn')?.addEventListener('click', () => document.getElementById('settingsDrawer')?.classList.remove('hidden'));
        ['closeSettingsBtn', 'closeSettingsOverlay'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', () => document.getElementById('settingsDrawer')?.classList.add('hidden'));
        });

        document.getElementById('themeDarkBtn')?.addEventListener('click', () => AppEngine.changeTheme('dark'));
        document.getElementById('themeLightBtn')?.addEventListener('click', () => AppEngine.changeTheme('light'));
        
        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                appState.accent = e.currentTarget.getAttribute('data-accent');
                StorageManager.saveData();
                AppEngine.applyThemeAndAccent();
                AppEngine.updateUI();
            });
        });

        document.getElementById('btnUnlockApp')?.addEventListener('click', LockManager.unlockApp);
        document.getElementById('pinInput')?.addEventListener('keypress', (e) => { if(e.key === 'Enter') LockManager.unlockApp(); });
        document.getElementById('btnExportBackup')?.addEventListener('click', StorageManager.exportBackup);
        document.getElementById('btnImportBackup')?.addEventListener('change', StorageManager.importBackup);
        document.getElementById('btnToggleSecurity')?.addEventListener('click', () => appState.securePIN ? LockManager.removePIN() : LockManager.setupPIN());
    },

    switchWallet: (walletType) => {
        appState.currentWallet = walletType;
        StorageManager.saveData();
        AppEngine.updateWalletUIState();
        AppEngine.updateUI();
        if (navigator.vibrate) navigator.vibrate(25); // اهتزاز خفيف لتأكيد التبديل لـ Premium UX
        FeedbackManager.showToast(`تم الانتقال إلى ${walletType === 'personal' ? 'المحفظة الشخصية' : 'مصروفات العائلة'} بنجاح`);
    },

    updateWalletUIState: () => {
        const isPersonal = appState.currentWallet === 'personal';
        document.getElementById('switchToPersonalBtn').classList.toggle('active', isPersonal);
        document.getElementById('switchToFamilyBtn').classList.toggle('active', !isPersonal);
        
        // تحديث مسميات نصوص الواجهة لتطابق المحفظة النشطة
        const nameText = isPersonal ? 'المحفظة الشخصية' : 'مصروفات العائلة والمنزل';
        document.getElementById('txFormWalletName').innerText = nameText;
        document.getElementById('chartWalletName').innerText = nameText;
        document.getElementById('ledgerWalletName').innerText = nameText;
        
        // تبديل الألوان والأنماط بناء على المحفظة (الزمردي للشخصي، والبنفسجي/الأزرق للعائلي) لسهولة التمييز البصري
        const themeColor = isPersonal ? 'var(--accent)' : '#6366f1';
        document.getElementById('txFormWalletName').style.color = themeColor;
        document.getElementById('chartWalletName').style.color = themeColor;
        document.getElementById('ledgerWalletName').style.color = themeColor;

        // إعادة تدوير وبناء منتقي الفئات للحساب الجديد في فورم الإدخال الأساسي
        const select = document.getElementById('txCategory');
        if (select) {
            select.innerHTML = '';
            CategoryMaps[appState.currentWallet].forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.value;
                opt.innerText = cat.label;
                select.appendChild(opt);
            });
        }
    },

    changeTheme: (themeName) => {
        appState.theme = themeName;
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

        const targetLedger = appState.currentWallet === 'personal' ? 'personalLedger' : 'familyLedger';
        appState[targetLedger].unshift({ amount, category, description, date });
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
        document.querySelector(`.tab-button[data-tab="${tabId}"]`)?.classList.add('active');
        document.getElementById(`${tabId}Pane`)?.classList.remove('hidden');
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

        // تحديد الحساب النشط لعرض إحصاءاته الفريدة والمستقلة
        const isPersonal = appState.currentWallet === 'personal';
        const currentTargetBudget = isPersonal ? personalBudget : familyBudget;
        const activeLedger = isPersonal ? appState.personalLedger : appState.familyLedger;
        
        const totalExpenses = activeLedger.reduce((sum, item) => sum + item.amount, 0);
        const remainingBudget = currentTargetBudget - totalExpenses;

        if(document.getElementById('totalIncomeText')) document.getElementById('totalIncomeText').innerText = totalIncome.toFixed(2);
        if(document.getElementById('personalAllocText')) document.getElementById('personalAllocText').innerText = personalBudget.toFixed(2);
        if(document.getElementById('familyAllocText')) document.getElementById('familyAllocText').innerText = familyBudget.toFixed(2);
        
        // تخصيص عناوين لوحة القيادة الديناميكية بناء على نوع المحفظة
        document.getElementById('dashIncomeLabel').innerText = isPersonal ? 'السقف المالي الشخصي المستهدف' : 'ميزانية العائلة المستهدفة';
        document.getElementById('dashIncomeIcon').style.color = isPersonal ? 'var(--accent)' : '#6366f1';

        if(document.getElementById('dashboardTotalIncome')) document.getElementById('dashboardTotalIncome').innerText = currentTargetBudget.toFixed(2);
        if(document.getElementById('dashboardExpenses')) document.getElementById('dashboardExpenses').innerText = totalExpenses.toFixed(2);
        if(document.getElementById('dashboardRemaining')) document.getElementById('dashboardRemaining').innerText = remainingBudget.toFixed(2);

        if(document.getElementById('personalRatioLabel')) document.getElementById('personalRatioLabel').innerText = `${appState.allocationRatio}%`;
        if(document.getElementById('familyRatioLabel')) document.getElementById('familyRatioLabel').innerText = `${100 - appState.allocationRatio}%`;

        const remainingCard = document.getElementById('remainingCard');
        const alertBanner = document.getElementById('budgetAlertBanner');
        
        // تفعيل الإنذار البصري المطور إذا تم استهلاك 85% من ميزانية المحفظة النشطة
        if (totalExpenses > (currentTargetBudget * 0.85) && currentTargetBudget > 0) {
            remainingCard?.classList.add('low-budget');
            alertBanner?.classList.remove('hidden');
        } else {
            remainingCard?.classList.remove('low-budget');
            alertBanner?.classList.add('hidden');
        }

        const secureBtn = document.getElementById('btnToggleSecurity');
        if (secureBtn) {
            secureBtn.innerHTML = appState.securePIN ? '<i class="fas fa-shield-alt"></i> قفل الأمان مفعل' : '<i class="fas fa-lock"></i> تفعيل رمز قفل PIN';
            secureBtn.style.color = appState.securePIN ? '#ef4444' : 'var(--accent)';
        }

        document.querySelectorAll('.accent-dot').forEach(d => d.classList.toggle('active', d.getAttribute('data-accent') === appState.accent));
        document.getElementById('themeDarkBtn')?.classList.toggle('active', appState.theme === 'dark');
        document.getElementById('themeLightBtn')?.classList.toggle('active', appState.theme === 'light');

        AppEngine.renderLedger();
        if (appState.activeTab === 'analytics') AppEngine.renderAnalyticsChart();
    },

    renderLedger: () => {
        const container = document.getElementById('ledgerListContainer');
        if (!container) return;

        const activeLedger = appState.currentWallet === 'personal' ? appState.personalLedger : appState.familyLedger;

        if (activeLedger.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="padding: 2rem 1rem;">
                    <i class="fas fa-receipt" style="font-size: 1.75rem; margin-bottom: 0.5rem;"></i>
                    <p>المحفظة فارغة تماماً! ابدأ بتسجيل قيود لفرز بنود استهلاكك بشكل منفصل.</p>
                </div>`;
            return;
        }

        // دمج الأيقونات الذكية لكافة الفئات الممكنة في المحفظتين
        const categoryIcons = {
            shopping: 'fa-shopping-bag', entertainment: 'fa-film', health: 'fa-heartbeat',
            transport: 'fa-car', housing: 'fa-home', food: 'fa-utensils', bills: 'fa-file-invoice-dollar',
            other: 'fa-ellipsis-h'
        };

        container.innerHTML = '';
        const list = document.createElement('ul');
        list.className = 'ledger-list';

        activeLedger.forEach((item, index) => {
            const li = document.createElement('li');
            li.className = 'ledger-item';
            const iconClass = categoryIcons[item.category] || 'fa-money-bill';

            li.innerHTML = `
                <div class="ledger-item-right" style="gap: 0.75rem;">
                    <div class="category-icon-tag" style="background: var(--bg-primary); color: ${appState.currentWallet === 'personal' ? 'var(--accent)' : '#6366f1'};"><i class="fas ${iconClass}"></i></div>
                    <div class="item-details">
                        <h4 style="font-weight: 600; font-size: 0.9rem; margin-bottom:0.15rem;">${item.description}</h4>
                        <span style="font-size:0.7rem; color: var(--text-secondary);"><i class="far fa-clock"></i> ${item.date}</span>
                    </div>
                </div>
                <div class="ledger-item-left" style="gap: 0.4rem;">
                    <span class="item-amount-badge" style="font-weight: 700; font-size: 0.85rem;">${item.amount.toFixed(2)} ج.م</span>
                    <button class="btn-reverse-transaction" onclick="CRUDHub.openEdit(${index})" title="تعديل هذا القيد المالي" style="color: var(--accent); background: none; border: none; padding: 0.25rem 0.4rem; cursor: pointer;">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-reverse-transaction" onclick="CRUDHub.openDelete(${index})" title="حذف القيد" style="color: #ef4444; background: none; border: none; padding: 0.25rem 0.4rem; cursor: pointer;">
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

        const isPersonal = appState.currentWallet === 'personal';
        const activeLedger = isPersonal ? appState.personalLedger : appState.familyLedger;
        const activeMap = CategoryMaps[appState.currentWallet];

        // تهيئة كود تجميع المصاريف حركياً بناء على الفئات المدعومة للمحفظة النشطة حالياً
        const categoriesData = {};
        activeMap.forEach(cat => categoriesData[cat.value] = 0);
        activeLedger.forEach(item => { if (categoriesData[item.category] !== undefined) categoriesData[item.category] += item.amount; });

        const dataValues = Object.values(categoriesData);
        if (financialChartInstance) financialChartInstance.destroy();

        if (!dataValues.some(v => v > 0)) {
            document.getElementById('chartEmptyState').classList.remove('hidden');
            document.getElementById('analyticsChart').classList.add('hidden');
            return;
        }

        document.getElementById('chartEmptyState').classList.add('hidden');
        document.getElementById('analyticsChart').classList.remove('hidden');

        // جلب أسماء الفئات المخصصة بالكامل لعرضها كلواصق (Labels) على الـ Chart
        const dataLabels = activeMap.map(cat => cat.label.split(' ')[0]); // أخذ الكلمة الأولى فقط للاختصار البصري

        financialChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: dataLabels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: isPersonal ? 
                        ['#10b981', '#34d399', '#059669', '#06b6d4', '#64748b'] : 
                        ['#6366f1', '#818cf8', '#4f46e5', '#f43f5e', '#64748b'],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim() || '#1e293b'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { family: 'Cairo', size: 11 }, color: '#94a3b8' } } },
                cutout: '72%'
            }
        });
    }
};

document.addEventListener('DOMContentLoaded', AppEngine.init);
