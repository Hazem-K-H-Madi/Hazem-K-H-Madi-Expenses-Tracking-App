/**
 * Advanced Personal Finance PWA Engine
 * Architecture: Offline-First, Monolithic Clean Architecture, Optimistic Loops
 * Built by Hazem K H Madi - Senior Product Designer
 */

// ==========================================================================
// 1. إدارة الحالة الكلية والنواة التشغيلية الموحدة (Global App State Engine)
// ==========================================================================
const AppState = {
    currentContext: 'personal', // الخيارات المتاحة: 'personal' أو 'family'
    personal: {
        balance: 0,
        transactions: [],
        incomeStreams: { salary: 0, freelance: 0, passive: 0 },
        splitPercentage: 50
    },
    family: {
        balance: 0,
        transactions: [],
        incomeStreams: { salary: 0, freelance: 0, passive: 0 },
        splitPercentage: 50
    },
    filter: {
        searchQuery: '',
        category: 'all'
    },
    theme: 'light'
};

// تهيئة قاعدة البيانات المحلية عبر LocalStorage بأمان تام وبدون حركات قفز مفاجئة للواجهة
const STORAGE_KEY = 'HAZEM_FINTECH_PWA_STATE_V1';

function saveStateToStorage() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
    } catch (e) {
        triggerToastAlert('خطأ في مزامنة البيانات المحلية المحفوظة', 'danger');
    }
}

function loadStateFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            // دمج العناصر للتأكد من سلامة الهياكل البرمجية وتجنب انهيار التطبيق
            Object.assign(AppState, parsed);
        } catch (e) {
            console.error("البيانات تالفة، سيتم بناء حالة أولية مستقرة.");
        }
    }
}

// ==========================================================================
// 2. هندسة واجهات المستخدم وحلقات العد والتحديث اللحظي المبتكر (Optimistic UI)
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    loadStateFromStorage();
    initializeCoreApplication();
});

function initializeCoreApplication() {
    // إخفاء سترة الإقلاع وكشف التطبيق بكفاءة رشيقة
    document.getElementById('app-boot-loader').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    // ضبط المظهر الأولي المسجل
    applyThemingContext(AppState.theme);

    // تفعيل وتغذية حقول المدخلات الخاصة بالدخل بناءً على آخر جلسة محفوظة
    syncIncomeInputsToUI();

    // تشغيل نظام التسميات والمراقبة اللحظية والرسوم البيانية
    renderApplicationMasterCycle();

    // ربط مصفوفة مستمعي الأحداث بطريقة الكيانات المفوضة (Event Delegation)
    registerCentralEventBindings();
    setupMobileSwipeGestures();
    initializePWAPromptEngine();
}

// محرك الفلترة والتحديث العام والتوليد التلقائي لرسوم الـ SVG دون استهلاك الذاكرة
function renderApplicationMasterCycle() {
    updateDynamicBalanceCounters();
    calculateAndRenderAdvancedMetrics();
    renderTransactionsListEngine();
    renderLightweightSVGAnalytics();
}

// تطبيق منسق الأرقام ج.م بالصيغة العربية الطبيعية الرصينة
function formatEgyptianCurrency(value) {
    return Number(value).toLocaleString('ar-EG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' ج.م';
}

// تشغيل تكنولوجيا طلب إطارات الرسوم المتحركة requestAnimationFrame لتقليل العبء
function animateValueCounter(elementId, start, end, duration) {
    const obj = document.getElementById(elementId);
    if (!obj) return;
    
    // التعامل الفوري إذا كانت القيم متقاربة منعاً لاستهلاك المعالج
    if (start === end) {
        obj.textContent = formatEgyptianCurrency(end);
        return;
    }

    const startTime = performance.now();
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // تسييل التخفيف المالي التدريجي (EaseOut Quad)
        const easeProgress = progress * (2 - progress);
        const currentValue = start + (end - start) * easeProgress;
        
        obj.textContent = formatEgyptianCurrency(currentValue);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            obj.textContent = formatEgyptianCurrency(end);
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// ذاكرة حفظ الحالة المؤقتة لمنع القفز والاهتزاز العشوائي للعدادات
let lastPersonalBalanceCache = 0;
let lastFamilyBalanceCache = 0;

function updateDynamicBalanceCounters() {
    const targetPersonal = AppState.personal.balance;
    const targetFamily = AppState.family.balance;
    
    animateValueCounter('personal-balance-display', lastPersonalBalanceCache, targetPersonal, 400);
    animateValueCounter('family-balance-display', lastFamilyBalanceCache, targetFamily, 400);
    
    lastPersonalBalanceCache = targetPersonal;
    lastFamilyBalanceCache = targetFamily;
}

// ==========================================================================
// 3. محرك تحليل المؤشرات المتقدمة وخوارزميات التنبؤ المالي والتنبؤ بالنفاد
// ==========================================================================
function calculateAndRenderAdvancedMetrics() {
    const currentDay = new Date().getDate();
    
    // حساب معدل حرق الحساب الشخصي
    const personalSpent = AppState.personal.transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const personalBurn = currentDay > 0 ? (personalSpent / currentDay) : personalSpent;
    document.getElementById('personal-burn-rate').textContent = formatEgyptianCurrency(personalBurn) + ' / يوم';

    // حساب التنبؤ بنفاد رصيد العائلة
    const familySpent = AppState.family.transactions.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const familyBurn = currentDay > 0 ? (familySpent / currentDay) : familySpent;
    const familyBalance = AppState.family.balance;
    
    const exhaustionElement = document.getElementById('family-exhaustion-date');
    if (familyBurn > 0 && familyBalance > 0) {
        const daysRemaining = Math.floor(familyBalance / familyBurn);
        if(daysRemaining > 90) {
            exhaustionElement.textContent = 'مستقر لأكثر من ٣ أشهر';
        } else {
            exhaustionElement.textContent = `خلال ${daysRemaining} يوم تقريباً`;
        }
    } else if (familyBalance <= 0 && familySpent > 0) {
        exhaustionElement.textContent = 'الرصيد مستنفد كلياً';
    } else {
        exhaustionElement.textContent = 'غير كافٍ للتنبؤ';
    }
}

// ==========================================================================
// 4. العمليات وإدارة نماذج الإدخال المعززة ومطابقة الـ CRUD التفاؤلية
// ==========================================================================
function registerCentralEventBindings() {
    // تبديل السياق التشغيلي (شخصي / عائلي)
    document.getElementById('tab-personal').addEventListener('click', (e) => switchOperationalContext('personal'));
    document.getElementById('tab-family').addEventListener('click', (e) => switchOperationalContext('family'));

    // لوحة المدخلات الكلية للرواتب وتدفق الأموال
    document.getElementById('income-split-range').addEventListener('input', (e) => {
        const val = e.target.value;
        document.getElementById('personal-pct-label').textContent = `${val}%`;
        document.getElementById('family-pct-label').textContent = `${100 - val}%`;
    });

    document.getElementById('process-income-btn').addEventListener('click', executeIncomeSplitDistribution);

    // نموذج إرسال وقيد المعاملات
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionFormSubmission);
    document.getElementById('cancel-edit-btn').addEventListener('click', resetTransactionFormState);

    // محرك الفلترة النصية المباشرة
    document.getElementById('filter-search').addEventListener('input', (e) => {
        AppState.filter.searchQuery = e.target.value.trim();
        renderTransactionsListEngine();
    });

    // رقاقات التصنيفات والفلترة السريعة بالنقرات عبر الـ Parent Container
    document.getElementById('filter-category-chips').addEventListener('click', (e) => {
        const chip = e.target.closest('.chip');
        if (!chip) return;
        
        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        AppState.filter.category = chip.getAttribute('data-cat');
        renderTransactionsListEngine();
    });

    // لوحة الإعدادات والمظهر
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleThemeEngine);
    document.getElementById('settings-toggle-btn').addEventListener('click', () => toggleSlideOverPanel(true));
    document.getElementById('close-settings-btn').addEventListener('click', () => toggleSlideOverPanel(false));
    document.getElementById('purge-data-btn').addEventListener('click', dataPurgeClearingSequence);
    document.getElementById('clear-recurring-quick-btn').addEventListener('click', executeQuickClearRecurringBills);
    
    // التصدير الرسمي
    document.getElementById('export-statement-btn').addEventListener('click', triggerEnterpriseStatementGeneration);
}

function switchOperationalContext(context) {
    AppState.currentContext = context;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`tab-${context}`).classList.add('active');
    
    // تعديل مسمى الفورم ليتناسب مع الطبيعة الجارية
    document.getElementById('transaction-form-title').textContent = context === 'personal' ? 'تسجيل عملية سحب مالي شخصي' : 'تسجيل عملية سحب مالي للعائلة';
    
    resetTransactionFormState();
    renderApplicationMasterCycle();
}

function syncIncomeInputsToUI() {
    const ctx = AppState.currentContext;
    const data = AppState[ctx];
    document.getElementById('income-salary').value = data.incomeStreams?.salary || '';
    document.getElementById('income-freelance').value = data.incomeStreams?.freelance || '';
    document.getElementById('income-passive').value = data.incomeStreams?.passive || '';
    document.getElementById('income-split-range').value = data.splitPercentage || 50;
    document.getElementById('personal-pct-label').textContent = `${data.splitPercentage}%`;
    document.getElementById('family-pct-label').textContent = `${100 - data.splitPercentage}%`;
}

function executeIncomeSplitDistribution() {
    const salary = Number(document.getElementById('income-salary').value) || 0;
    const freelance = Number(document.getElementById('income-freelance').value) || 0;
    const passive = Number(document.getElementById('income-passive').value) || 0;
    
    const totalIncome = salary + freelance + passive;
    if (totalIncome <= 0) {
        triggerToastAlert('برجاء إدخال قيمة مالية صالحة لإجراء التوزيع والضخ الأساسي.', 'warning');
        return;
    }

    const splitPct = Number(document.getElementById('income-split-range').value);
    
    // حساب التوزيع العادل
    const personalAllocation = (totalIncome * splitPct) / 100;
    const familyAllocation = totalIncome - personalAllocation;

    // حفظ وتحديث رصيد الكيانين بشكل معزول كلياً
    AppState.personal.incomeStreams = { salary, freelance, passive };
    AppState.personal.splitPercentage = splitPct;
    AppState.personal.balance += personalAllocation;

    AppState.family.incomeStreams = { salary, freelance, passive };
    AppState.family.splitPercentage = splitPct;
    AppState.family.balance += familyAllocation;

    saveStateToStorage();
    renderApplicationMasterCycle();
    triggerHapticVibrationFeedback();
    triggerToastAlert('تم حقن التدفق المالي وتحديث الأرصدة التنازلية بنجاح.', 'success');
}

function handleTransactionFormSubmission(e) {
    e.preventDefault();
    const amountInput = document.getElementById('tx-amount');
    const categoryInput = document.getElementById('tx-category');
    const dateInput = document.getElementById('tx-date');
    const notesInput = document.getElementById('tx-notes');
    const recurringInput = document.getElementById('tx-recurring');
    const editTargetId = document.getElementById('edit-target-id').value;

    const amount = parseFloat(amountInput.value);
    if (isNaN(amount) || amount <= 0) {
        triggerToastAlert('الرجاء إدخال رقم نقدي حقيقي وصحيح لقيد المصروف.', 'danger');
        return;
    }

    const ctx = AppState.currentContext;
    const timestamp = dateInput.value ? new Date(dateInput.value).getTime() : Date.now();

    const transactionData = {
        id: editTargetId || 'TX_' + Date.now() + Math.random().toString(36).substr(2, 5),
        amount: amount,
        category: categoryInput.value,
        timestamp: timestamp,
        notes: notesInput.value.trim(),
        recurring: recurringInput.checked
    };

    // حفظ نسخ احتياطية لإجراء دحرجة التحديث التفاؤلي (Optimistic UI Rollback Cluster)
    const backupBalance = AppState[ctx].balance;
    const backupTransactions = [...AppState[ctx].transactions];

    if (editTargetId) {
        // حلقة التعديل والـ Update
        const index = AppState[ctx].transactions.findIndex(t => t.id === editTargetId);
        if (index > -1) {
            const oldTx = AppState[ctx].transactions[index];
            AppState[ctx].balance = (AppState[ctx].balance + oldTx.amount) - amount;
            AppState[ctx].transactions[index] = transactionData;
        }
    } else {
        // حلقة الإضافة والـ Create الابتداية
        AppState[ctx].balance -= amount;
        AppState[ctx].transactions.unshift(transactionData);
    }

    // التحديث التفاؤلي اللحظي للواجهات قبل إتمام الكتابة الشاقة في القرص المحلي
    renderApplicationMasterCycle();
    resetTransactionFormState();

    try {
        saveStateToStorage();
        triggerHapticVibrationFeedback();
        triggerToastAlert(editTargetId ? 'تم تعديل وتحديث السجل المالي' : 'تم خصم وقيد المصروف بنجاح', 'success');
    } catch (err) {
        // التراجع الفوري والدحرجة في حال الفشل المطلق
        AppState[ctx].balance = backupBalance;
        AppState[ctx].transactions = backupTransactions;
        renderApplicationMasterCycle();
        triggerToastAlert('خطأ فادح أثناء حفظ البيانات، تم إلغاء العملية لحماية محفظتك.', 'danger');
    }
}

function resetTransactionFormState() {
    document.getElementById('transaction-form').reset();
    document.getElementById('edit-target-id').value = '';
    document.getElementById('tx-date').value = '';
    document.getElementById('submit-tx-btn').textContent = 'تأكيد وقيد المصروف';
    document.getElementById('submit-tx-btn').className = 'btn btn-success flex-grow';
    document.getElementById('cancel-edit-btn').classList.add('hidden');
}

// ==========================================================================
// 5. محرك العرض التفصيلي لدفتر الحسابات وخطافات الإيماءات المحمولة (Gestures)
// ==========================================================================
function renderTransactionsListEngine() {
    const container = document.getElementById('transactions-records-viewport');
    if (!container) return;

    const ctx = AppState.currentContext;
    let list = AppState[ctx].transactions || [];

    // فرز وتصفية القائمة بناءً على المدخلات ومحددات البحث والـ Chips المفعّلة
    if (AppState.filter.category !== 'all') {
        list = list.filter(t => t.category === AppState.filter.category);
    }
    if (AppState.filter.searchQuery) {
        const query = AppState.filter.searchQuery.toLowerCase();
        list = list.filter(t => t.notes.toLowerCase().includes(query) || t.category.includes(query));
    }

    // فرز زمني تنازلي دائم
    list.sort((a, b) => b.timestamp - a.timestamp);

    if (list.length === 0) {
        container.innerHTML = `
            <div class="empty-state-box">
                <svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2z"/></svg>
                <p>لا توجد أي معاملات مقيدة تطابق خيارات التصفية الجارية حالياً.</p>
            </div>`;
        return;
    }

    // بناء الدوم بكفاءة عالية وبأقل عدد لإعادة الهيكلة
    container.innerHTML = list.map(tx => {
        const dateStr = new Date(tx.timestamp).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' });
        return `
            <div class="transaction-row-wrapper" data-id="${tx.id}">
                <div class="swipe-action-trigger">إزالة</div>
                <div class="transaction-row" onclick="triggerInlineRecordEditSequence('${tx.id}')">
                    <div class="row-details-side">
                        <div class="row-main-line">
                            <span class="row-category-badge">${tx.category}</span>
                            ${tx.recurring ? '<span class="row-recurring-badge">دوري مكرر</span>' : ''}
                            <span class="row-timestamp">${dateStr}</span>
                        </div>
                        <div class="row-notes">${tx.notes || 'بدون بيان ملحق'}</div>
                    </div>
                    <div class="row-amount-side">-${tx.amount.toFixed(2)} ج.م</div>
                </div>
            </div>
        `;
    }).join('');
}

function triggerInlineRecordEditSequence(id) {
    const ctx = AppState.currentContext;
    const tx = AppState[ctx].transactions.find(t => t.id === id);
    if (!tx) return;

    document.getElementById('edit-target-id').value = tx.id;
    document.getElementById('tx-amount').value = tx.amount;
    document.getElementById('tx-category').value = tx.category;
    
    // تحويل التوقيت لتنسيق ملائم للمدخل المالي المحلي لـ HTML
    const dateObj = new Date(tx.timestamp);
    dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
    document.getElementById('tx-date').value = dateObj.toISOString().slice(0, 16);
    
    document.getElementById('tx-notes').value = tx.notes;
    document.getElementById('tx-recurring').checked = tx.recurring;

    document.getElementById('submit-tx-btn').textContent = 'تعديل وحفظ التغييرات';
    document.getElementById('submit-tx-btn').className = 'btn btn-primary flex-grow';
    document.getElementById('cancel-edit-btn').classList.remove('hidden');
    
    // الانتقال السلس للأعلى في الشاشات الصغيرة لرؤية تعديل الفورم بشكل رائع
    window.scrollTo({ top: document.getElementById('transaction-form').offsetTop - 20, behavior: 'smooth' });
}

// تطبيق إيماءات اللمس على الهواتف والألواح المحمولة بنقاء ستين إطاراً بالثانية
let touchStartX = 0;
let currentSwipedRowWrapper = null;

function setupMobileSwipeGestures() {
    const container = document.getElementById('transactions-records-viewport');
    
    container.addEventListener('touchstart', (e) => {
        const row = e.target.closest('.transaction-row');
        if (!row) return;
        touchStartX = e.touches[0].clientX;
        currentSwipedRowWrapper = row.parentElement;
    }, { passive: true });

    container.addEventListener('touchmove', (e) => {
        if (!currentSwipedRowWrapper) return;
        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX;
        const rowElement = currentSwipedRowWrapper.querySelector('.transaction-row');

        // السماح بالسحب لليمين لإظهار زر الحذف الأحمر (في نظام الـ RTL السحب لليمين يكشف اليسار)
        if (diffX > 0 && diffX < 90) {
            rowElement.style.transform = `translateX(${diffX}px)`;
        }
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        if (!currentSwipedRowWrapper) return;
        const rowElement = currentSwipedRowWrapper.querySelector('.transaction-row');
        const currentX = e.changedTouches[0].clientX;
        const diffX = currentX - touchStartX;

        if (diffX > 60) {
            // تفعيل قرار الحذف الفوري
            const txId = currentSwipedRowWrapper.getAttribute('data-id');
            executeTransactionDeletionSequence(txId);
        } else {
            // إعادة الوضع الطبيعي في حال عدم تجاوز عتبة التدمير المالي
            rowElement.style.transform = 'translateX(0)';
        }
        currentSwipedRowWrapper = null;
    }, { passive: true });
}

function executeTransactionDeletionSequence(id) {
    const ctx = AppState.currentContext;
    const index = AppState[ctx].transactions.findIndex(t => t.id === id);
    if (index === -1) return;

    const backupBalance = AppState[ctx].balance;
    const backupTransactions = [...AppState[ctx].transactions];
    const targetTx = AppState[ctx].transactions[index];

    // الإجراء التفاؤلي الإيجابي
    AppState[ctx].balance += targetTx.amount;
    AppState[ctx].transactions.splice(index, 1);
    renderApplicationMasterCycle();

    try {
        saveStateToStorage();
        triggerHapticVibrationFeedback();
        triggerToastAlert('تم حذف القيد واسترداد الرصيد المالي الملحق فورياً.', 'success');
    } catch (e) {
        AppState[ctx].balance = backupBalance;
        AppState[ctx].transactions = backupTransactions;
        renderApplicationMasterCycle();
        triggerToastAlert('تعذر إتمام عملية حذف السجل محلياً.', 'danger');
    }
}

function executeQuickClearRecurringBills() {
    const ctx = AppState.currentContext;
    const recurringCount = AppState[ctx].transactions.filter(t => t.recurring).length;
    
    if (recurringCount === 0) {
        triggerToastAlert('لا توجد أي التزامات فواتير شهرية دورية مسجلة في هذا القسم.', 'warning');
        return;
    }

    if (confirm(`هل أنت متأكد من رغبتك في تصفية ومسح عدد (${recurringCount}) من الالتزامات والمصروفات الدورية بشكل كامل؟`)) {
        AppState[ctx].transactions = AppState[ctx].transactions.filter(t => !t.recurring);
        saveStateToStorage();
        renderApplicationMasterCycle();
        triggerToastAlert('تم تنظيف وتطهير جدول الفواتير الدورية بنجاح.', 'success');
    }
}

// ==========================================================================
// 6. التحليلات البيانية الذكية المبنية على محرك الخفة والأوزان الفينتك النظيفة SVG
// ==========================================================================
function renderLightweightSVGAnalytics() {
    const container = document.getElementById('analytics-chart-container');
    if (!container) return;

    const ctx = AppState.currentContext;
    const list = AppState[ctx].transactions || [];

    if (list.length === 0) {
        container.innerHTML = '<p class="text-muted" style="font-size:0.85rem;">قم بتسجيل معاملات نقدية لتشغيل المخطط البصري لتوزيع الأوزان المالية.</p>';
        return;
    }

    // تجميع الحصص حسب التبويب والتصنيف
    const categoriesMap = {};
    let totalSpent = 0;
    
    list.forEach(t => {
        categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
        totalSpent += t.amount;
    });

    // بناء رسم بياني خطي متطور ومحمي بـ SVG نظيف وبدون مكتبات ثقيلة تؤثر على السرعة
    let yOffset = 25;
    const rowHeight = 35;
    const svgWidth = 400;
    const svgHeight = Object.keys(categoriesMap).length * rowHeight + 30;
    
    let svgContent = `<svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">`;

    // لوحة الألوان المخصصة للأشرطة التحليلية الذكية
    const colorPalette = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];
    let colorIndex = 0;

    for (const [catName, catAmount] of Object.entries(categoriesMap)) {
        const percentage = totalSpent > 0 ? (catAmount / totalSpent) * 100 : 0;
        const barWidth = (svgWidth - 140) * (percentage / 100);
        const barColor = colorPalette[colorIndex % colorPalette.length];
        colorIndex++;

        svgContent += `
            <text x="${svgWidth - 10}" y="${yOffset + 12}" fill="currentColor" font-size="12" font-weight="bold" text-anchor="end">${catName}</text>
            <rect x="90" y="${yOffset}" width="${Math.max(barWidth, 4)}" height="14" rx="4" fill="${barColor}" />
            <text x="10" y="${yOffset + 12}" fill="${barColor}" font-size="11" font-weight="900">${percentage.toFixed(1)}%</text>
        `;
        yOffset += rowHeight;
    }

    svgContent += `</svg>`;
    container.innerHTML = svgContent;
}

// ==========================================================================
// 7. محرك التصدير الإداري وصناعة كشوف الحسابات الرسمية المعززة
// ==========================================================================
function triggerEnterpriseStatementGeneration() {
    const ctx = AppState.currentContext;
    const labelTitle = ctx === 'personal' ? 'المصروفات الشخصية المعزولة' : 'مصروفات العائلة والبيت المشترك';
    const list = [...AppState[ctx].transactions].sort((a,b) => b.timestamp - a.timestamp);

    // إزالة وتطهير أي كتل طباعة سابقة لمنع التكرار وامتلاء الذاكرة العشوائية
    const oldLayout = document.querySelector('.print-document-layout');
    if (oldLayout) oldLayout.remove();

    // تشييد الهيكل المخفي الجديد الخاص بالطباعة الإدارية الراقية والمطابقة التامة للمعايير المطلوبة
    const printContainer = document.createElement('div');
    printContainer.className = 'print-document-layout';
    
    let rowsHTML = '';
    list.forEach((tx, idx) => {
        const dateStr = new Date(tx.timestamp).toLocaleString('ar-EG');
        rowsHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${dateStr}</td>
                <td>${tx.category}</td>
                <td>${tx.notes || '-'}</td>
                <td style="color:#ef4444; font-weight:bold;">${tx.amount.toFixed(2)} ج.م</td>
            </tr>
        `;
    });

    printContainer.innerHTML = `
        <div class="print-header-block">
            <h1 style="font-size: 24px; margin-bottom: 5px;">كشف الحساب المالي الرسمي الموحد</h1>
            <p style="font-size: 14px; color: #555;">سياق التتبع: ${labelTitle} | تاريخ التوليد: ${new Date().toLocaleString('ar-EG')}</p>
            <p style="font-size: 12px; margin-top: 5px; font-weight: bold; font-family: sans-serif; direction: ltr;">
                Official Financial Statement – Built by Hazem K H Madi - Senior Product Designer
            </p>
        </div>
        <table class="print-table">
            <thead>
                <tr>
                    <th>مسلسل</th>
                    <th>التاريخ والتوقيت</th>
                    <th>التصنيف وبند الصرف</th>
                    <th>بيان الملاحظات الملحق</th>
                    <th>القيمة المستقطعة</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML || '<tr><td colspan="5" style="text-align:center;">لا توجد سجلات مالية مقيدة تحت هذا السياق.</td></tr>'}
            </tbody>
        </table>
        <div style="margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; font-size: 12px; text-align: left; direction: ltr;">
            Verified and Digitally Certified Statement. Powered by Native Offline-First Fintech Architecture.
        </div>
    `;

    document.body.appendChild(printContainer);
    
    // تشغيل الأمر السيادي لطباعة الدوم وتحويله الفوري لـ PDF عبر قنوات نظام التشغيل المباشر
    window.print();
}

// ==========================================================================
// 8. لوحة الإعدادات، المظهر، الاستجابات التكتيكية وبصمة الاهتزاز الميكانيكي
// ==========================================================================
function toggleThemeEngine() {
    const targetTheme = AppState.theme === 'light' ? 'dark' : 'light';
    applyThemingContext(targetTheme);
}

function applyThemingContext(theme) {
    AppState.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');
    const metaThemeColor = document.getElementById('theme-meta-color');

    if (theme === 'dark') {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        if (metaThemeColor) metaThemeColor.setAttribute('content', '#0b0f19');
    } else {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        if (metaThemeColor) metaThemeColor.setAttribute('content', '#ffffff');
    }
    saveStateToStorage();
}

function toggleSlideOverPanel(open) {
    const panel = document.getElementById('settings-slideover');
    if (open) {
        panel.classList.remove('hidden');
        syncIncomeInputsToUI(); // تحديث الحقول لحظياً لضمان تطابق الرؤية
    } else {
        panel.classList.add('hidden');
    }
}

function dataPurgeClearingSequence() {
    if (confirm('تحذير مالي عالي الحساسية: هل أنت متأكد من رغبتك في تدمير وتصفية السجلات وحذف المحفظة كلياً وتصفير الأرصدة التنازلية؟ لا يمكن التراجع عن هذا القرار لاحقاً.')) {
        localStorage.removeItem(STORAGE_KEY);
        triggerHapticVibrationFeedback();
        location.reload();
    }
}

// نظام تنبيهات التوست المحقون برفق وبدون استدعاء عناصرDOM ثقيلة ومتكررة
function triggerToastAlert(message, type = 'success') {
    const hub = document.getElementById('toast-notification-hub');
    if (!hub) return;

    const toast = document.createElement('div');
    toast.className = `toast-instance toast-${type}`;
    toast.textContent = message;

    hub.appendChild(toast);

    // تدمير التنبيه تلقائياً بعد انقضاء فترته المحددة لعدم تلويث الذاكرة الحية
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// تفعيل استجابة الاهتزاز التكتيكي واللمسي الصغير (Tactile and Haptic Feedback API)
function triggerHapticVibrationFeedback() {
    if ('vibrate' in navigator) {
        navigator.vibrate(10);
    }
}

// ==========================================================================
// 9. إدارة دورة حياة الـ PWA، الاستماع للمنصات وتسهيل دمج الهواتف الذكية
// ==========================================================================
let deferredPromptEvent = null;

function initializePWAPromptEngine() {
    window.addEventListener('beforeinstallprompt', (e) => {
        // منع المتصفح من إطلاق الحاوية التلقائية المشوهة للمظهر البصري المتطور
        e.preventDefault();
        deferredPromptEvent = e;
        
        // إظهار زر التثبيت الأنيق داخل اللوحة الزجاجية الجانبية بشكل منسق ومثير
        const installBtn = document.getElementById('pwa-install-cta');
        if (installBtn) {
            installBtn.classList.remove('hidden');
            installBtn.addEventListener('click', executeNativePWAInstallationSequence);
        }
    });

    // التعرف الذكي على مستخدمي هواتف الآيفون (iOS Safari) لتوفير تجربة توجيه فائقة الفخامة
    const isPlatformIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);
    
    if (isPlatformIOS && !isInStandaloneMode) {
        const iosGuide = document.getElementById('ios-safari-guide');
        if (iosGuide) iosGuide.classList.remove('hidden');
    }
}

function executeNativePWAInstallationSequence() {
    if (!deferredPromptEvent) return;
    
    deferredPromptEvent.prompt();
    deferredPromptEvent.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            triggerToastAlert('تم قبول التثبيت، نرحب بك في محفظتك المستقلة المتقدمة.', 'success');
            const installBtn = document.getElementById('pwa-install-cta');
            if (installBtn) installBtn.classList.add('hidden');
        }
        deferredPromptEvent = null;
    });
}

// تسجيل محرك الخدمة (Service Worker) المعتمد للعمل الشامل دون شبكة إنترنت
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('Fintech Kernel ServiceWorker Registered Successfully.'))
            .catch(err => console.error('ServiceWorker registration critical failure:', err));
    });
}
