/**
 * المستشار المالي الذكي - الروح البرمجية والمحرك الأساسي للعمليات
 * المطور: Hazem K H Madi - Senior Product Designer
 * نظام مالي متكامل مبني بمعايير فنتك عالمية وحسابات معزولة بالكامل.
 */

// ==========================================================================
// 1. STATE CONFIGURATION & APPLICATION CONTEXTS
// ==========================================================================
const AppState = {
    currentContext: 'personal', // الخيارات المتاحة: 'personal' | 'family'
    personal: {
        balance: 0.00,
        transactions: [],
        recurring: []
    },
    family: {
        balance: 0.00,
        transactions: [],
        recurring: []
    },
    ui: {
        theme: 'light',
        deferredPrompt: null,
        activeSwipeRow: null,
        swipeStartX: 0,
        swipeCurrentX: 0
    }
};

// فئات وألوان التصنيفات لربط الرسوم البيانية المتجهة SVG بدقة عالية
const CategoryColorMap = {
    'غذاء': '#f59e0b',
    'تسوق': '#ec4899',
    'مواصلات': '#3b82f6',
    'سكن': '#8b5cf6',
    'فواتير': '#06b6d4',
    'صحة': '#ef4444',
    'ترفيه': '#10b981',
    'أخرى': '#64748b'
};

// ==========================================================================
// 2. INDUSTRIAL-GRADE ASYNCHRONOUS LOCAL STORAGE (IndexedDB Wrapper)
// ==========================================================================
const LocalDB = {
    DB_NAME: 'SmartFinancierDB',
    DB_VERSION: 1,
    
    init() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                // Fallback built on namespace separation if IndexedDB fails entirely
                this.isFallback = true;
                resolve();
                return;
            }
            
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => {
                this.isFallback = true;
                resolve();
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('financial_state')) {
                    db.createObjectStore('financial_state');
                }
            };
        });
    },

    async saveState() {
        const payload = {
            personal: AppState.personal,
            family: AppState.family,
            theme: AppState.ui.theme
        };

        if (this.isFallback) {
            localStorage.setItem('core_fin_state', JSON.stringify(payload));
            return;
        }

        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction(['financial_state'], 'readwrite');
                const store = transaction.objectStore('financial_state');
                const request = store.put(payload, 'global_state');
                request.onsuccess = () => resolve(true);
                request.onerror = () => resolve(false);
            } catch (e) {
                localStorage.setItem('core_fin_state', JSON.stringify(payload));
                resolve(true);
            }
        });
    },

    async loadState() {
        if (this.isFallback) {
            const raw = localStorage.getItem('core_fin_state');
            return raw ? JSON.parse(raw) : null;
        }

        return new Promise((resolve) => {
            try {
                const transaction = this.db.transaction(['financial_state'], 'readonly');
                const store = transaction.objectStore('financial_state');
                const request = store.get('global_state');
                request.onsuccess = (event) => resolve(event.target.result || null);
                request.onerror = () => resolve(null);
            } catch (e) {
                const raw = localStorage.getItem('core_fin_state');
                resolve(raw ? JSON.parse(raw) : null);
            }
        });
    }
};

// ==========================================================================
// 3. HARDWARE CAPABILITIES & MICRO-INTERACTIONS ENGINE
// ==========================================================================
const HardwareEngine = {
    triggerHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10); // Subtle physical click confirmation tactile response
        }
    },
    
    showToast(message, mode = 'success') {
        const hub = document.getElementById('toast-notifications-hub');
        if (!hub) return;

        const toast = document.createElement('div');
        toast.className = `toast-alert-node ${mode === 'success' ? 'success-mode' : 'danger-mode'}`;
        toast.textContent = message;

        hub.appendChild(toast);
        
        // Asynchronous structural clearing loop to avoid garbage leaks
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { toast.remove(); }, 300);
        }, 3500);
    }
};

// ==========================================================================
// 4. FINANCIAL CALCULATIONS & VELOCITY TICKER ENGINE
// ==========================================================================
const FinanceCalculator = {
    /**
     * حساب وتحديث الرصيد التفاعلي بتأثير حركي سلس (requestAnimationFrame)
     */
    animateCounter(elementId, startValue, endValue, duration = 400) {
        const obj = document.getElementById(elementId);
        if (!obj) return;
        
        const startTime = performance.now();
        
        function updateNumber(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const currentValue = startValue + progress * (endValue - startValue);
            
            // التنسيق المالي المعتمد للغة العربية والأرقام المتناسقة
            obj.textContent = currentValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        requestAnimationFrame(updateNumber);
    },

    recalculateAndRefreshUI() {
        const context = AppState.currentContext;
        const currentData = AppState[context];
        
        // 1. حساب الرصيد الإجمالي بناءً على المدخلات والمصروفات
        let previousDisplayedBalance = parseFloat(document.getElementById('main-balance-ticker').textContent.replace(/,/g, '')) || 0;
        
        let calculatedIncomes = currentData.transactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            
        let calculatedExpenses = currentData.transactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

        currentData.balance = calculatedIncomes - calculatedExpenses;
        
        // تشغيل عداد الرصيد التنازلي أو التصاعدي
        this.animateCounter('main-balance-ticker', previousDisplayedBalance, currentData.balance);
        
        // 2. تشغيل محرك تحليلات حرق الميزانية وفترة النفاذ المتوقعة (Burn-Rate Forecasting)
        this.evaluateSpendingBurnRate(calculatedExpenses, currentData.balance);
        
        // 3. تحديث مؤشرات ومقاييس الصرف الخطية
        this.updateLinearProgressMeters(calculatedIncomes, calculatedExpenses);
        
        // 4. إعادة بناء الرسم البياني الدائري عالي الأداء SVG
        this.renderDistributionDonutChart(currentData.transactions, calculatedExpenses);
        
        // 5. تحديث وتصفية قائمة السجلات المالية الظاهرية
        UIEngine.renderTransactionLedgerFeed();
    },

    evaluateSpendingBurnRate(totalExpenses, remainingBalance) {
        const burnRateValueEl = document.getElementById('burn-rate-value');
        const exhaustionDateValueEl = document.getElementById('exhaustion-date-value');
        
        const today = new Date();
        const currentDay = today.getDate(); // اليوم الحالي من الشهر الحالي
        
        // حساب متوسط الصرف اليومي الفعلي للشهر الحالي
        const dailyBurn = currentDay > 0 ? (totalExpenses / currentDay) : totalExpenses;
        burnRateValueEl.textContent = `${dailyBurn.toFixed(2)} ج.م/يوم`;

        if (remainingBalance <= 0) {
            exhaustionDateValueEl.textContent = 'الميزانية منتهية حالياً';
            exhaustionDateValueEl.style.color = 'var(--color-danger)';
            return;
        }

        if (dailyBurn === 0) {
            exhaustionDateValueEl.textContent = 'مستقر تماماً (لا يوجد صرف)';
            exhaustionDateValueEl.style.color = 'var(--color-success)';
            return;
        }

        // كم يوم متبقي بناءً على معدل الاستهلاك الحالي
        const daysRemainingBeforeCrash = remainingBalance / dailyBurn;
        const projectExhaustionDay = Math.ceil(currentDay + daysRemainingBeforeCrash);
        
        if (daysRemainingBeforeCrash <= 3) {
            exhaustionDateValueEl.textContent = `حرجة! خلال ${Math.ceil(daysRemainingBeforeCrash)} أيام (يوم ${projectExhaustionDay})`;
            exhaustionDateValueEl.style.color = 'var(--color-danger)';
        } else if (daysRemainingBeforeCrash <= 7) {
            exhaustionDateValueEl.textContent = `تحذير! متوقع يوم ${projectExhaustionDay}`;
            exhaustionDateValueEl.style.color = 'var(--color-warning)';
        } else {
            exhaustionDateValueEl.textContent = `آمن (يوم ${projectExhaustionDay} من الشهر)`;
            exhaustionDateValueEl.style.color = 'var(--color-success)';
        }
    },

    updateLinearProgressMeters(income, expense) {
        const fillBudget = document.getElementById('meter-fill-budget');
        const meterText = document.getElementById('meter-budget-text');
        
        meterText.textContent = `${expense.toFixed(2)} / ${income.toFixed(2)} ج.م`;
        
        if (income === 0) {
            fillBudget.style.width = '0%';
            return;
        }

        const consumptionRatio = (expense / income) * 100;
        fillBudget.style.width = `${Math.min(consumptionRatio, 100)}%`;
        
        // تعديل ألوان المؤشر ديناميكياً حسب خطورة وحجم الصرف
        fillBudget.className = 'meter-fill';
        if (consumptionRatio < 60) {
            fillBudget.classList.add('success');
        } else if (consumptionRatio < 85) {
            fillBudget.classList.add('warning');
        } else {
            fillBudget.classList.add('danger');
        }
    },

    renderDistributionDonutChart(transactions, totalExpenses) {
        const segmentsGroup = document.getElementById('donut-segments-group');
        const legendContainer = document.getElementById('chart-legend-container');
        const centerTotalText = document.getElementById('chart-center-total-text');
        
        segmentsGroup.innerHTML = '';
        legendContainer.innerHTML = '';
        centerTotalText.textContent = `${totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })} ج.م`;

        const expensesOnly = transactions.filter(t => t.type === 'EXPENSE');
        
        if (expensesOnly.length === 0 || totalExpenses === 0) {
            // Render basic empty/neutral spacer ring inside view space
            const baseCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            baseCircle.setAttribute('cx', '100');
            baseCircle.setAttribute('cy', '100');
            baseCircle.setAttribute('r', '70');
            baseCircle.setAttribute('fill', 'transparent');
            baseCircle.setAttribute('stroke', 'var(--color-surface-variant)');
            baseCircle.setAttribute('stroke-width', '20');
            segmentsGroup.appendChild(baseCircle);
            return;
        }

        // تجميع وتلخيص المصروفات طبقاً للفئات المحددة
        const categoryTotals = {};
        expensesOnly.forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount || 0);
        });

        const radius = 70;
        const circumference = 2 * Math.PI * radius; // 2 * 3.14159 * 70 = ~439.82
        let accumulatedAngleOffset = 0;

        Object.keys(categoryTotals).forEach(category => {
            const amount = categoryTotals[category];
            const percentage = (amount / totalExpenses) * 100;
            const strokeDasharrayOffset = circumference - (circumference * percentage) / 100;
            
            // إنشاء ورسم القوس المتجه SVG لكل فئة مالية مستقلة
            const circleSegment = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circleSegment.setAttribute('cx', '100');
            circleSegment.setAttribute('cy', '100');
            circleSegment.setAttribute('r', radius.toString());
            circleSegment.setAttribute('fill', 'transparent');
            circleSegment.setAttribute('stroke', CategoryColorMap[category] || '#64748b');
            circleSegment.setAttribute('stroke-width', '20');
            circleSegment.setAttribute('stroke-dasharray', circumference.toString());
            circleSegment.setAttribute('stroke-dashoffset', strokeDasharrayOffset.toString());
            circleSegment.setAttribute('transform', `rotate(${accumulatedAngleOffset} 100 100)`);
            circleSegment.style.transition = 'stroke-dashoffset 0.5s ease-in-out';
            
            segmentsGroup.appendChild(circleSegment);
            
            // دحرجة زاوية البدء للقوس القادم لضمان عدم التداخل والتطابق
            accumulatedAngleOffset += (percentage / 100) * 360;

            // حقن وبناء صف الدليل التفصيلي للرسم البياني ديناميكياً
            const legendRow = document.createElement('div');
            legendRow.className = 'legend-row-item';
            legendRow.innerHTML = `
                <div class="legend-indicator-pill-group">
                    <span class="color-dot-pill" style="background-color: ${CategoryColorMap[category] || '#64748b'}"></span>
                    <span class="legend-label-text">${category}</span>
                </div>
                <span class="legend-value-shunt">${percentage.toFixed(0)}% (${amount.toFixed(0)} ج.م)</span>
            `;
            legendContainer.appendChild(legendRow);
        });
    }
};

// ==========================================================================
// 5. REVOLUTIONARY GESTURE ENGINE (Interactive Pointer/Touch Sweeping)
// ==========================================================================
const GestureEngine = {
    initTouchDelegation(containerSelector) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        // الاستعانة بـ Event Delegation لربط أحداث اللمس بالمرجع الأب لتوفير موارد الذاكرة
        container.addEventListener('touchstart', (e) => {
            const surface = e.target.closest('.tx-item-row-surface');
            if (!surface) return;
            
            AppState.ui.activeSwipeRow = surface;
            AppState.ui.swipeStartX = e.touches[0].clientX;
            surface.style.transition = 'none'; // تعطيل الحركات مؤقتاً أثناء التمرير اللحظي باليد
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            const surface = AppState.ui.activeSwipeRow;
            if (!surface) return;

            AppState.ui.swipeCurrentX = e.touches[0].clientX;
            const deltaX = AppState.ui.swipeCurrentX - AppState.ui.swipeStartX;
            
            // قصر السحب فقط على الاتجاه الأيسر لكشف خيار الحذف السريع في واجهات الاستخدام RTL
            if (deltaX < 0 && deltaX > -120) {
                surface.style.transform = `translate3d(${deltaX}px, 0, 0)`;
            }
        }, { passive: true });

        container.addEventListener('touchend', () => {
            const surface = AppState.ui.activeSwipeRow;
            if (!surface) return;

            surface.style.transition = 'transform 0.25s var(--spring-easing)';
            const deltaX = AppState.ui.swipeCurrentX - AppState.ui.swipeStartX;
            
            if (deltaX < -65) {
                // تجاوز عتبة التمرير المطلوبة بنجاح -> فتح وإظهار الخيار بشكل كامل
                surface.style.transform = `translate3d(-80px, 0, 0)`;
            } else {
                // فشل في تجاوز العتبة -> ارتداد العنصر للوضع الطبيعي فوراً
                surface.style.transform = `translate3d(0, 0, 0)`;
            }
            AppState.ui.activeSwipeRow = null;
        }, { passive: true });
    }
};

// ==========================================================================
// 6. RICH UI/UX LIFECYCLE MANAGEMENT ENGINE
// ==========================================================================
const UIEngine = {
    initDOMHooks() {
        // الروابط والتحويلات الخاصة بتبديل الحسابات المالية (Context Switcher)
        document.getElementById('tab-personal').addEventListener('click', (e) => this.switchContext('personal', e.currentTarget));
        document.getElementById('tab-family').addEventListener('click', (e) => this.switchContext('family', e.currentTarget));
        
        // المحولات والروابط الخاصة بالمظهر الداكن والناري
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleApplicationTheme());
        
        // التحكم في فتح النوافذ المنبثقة والـ Bottom Sheets التفاعلية
        document.getElementById('settings-trigger').addEventListener('click', () => this.openModalSheet('modal-settings-panel'));
        document.getElementById('trigger-add-transaction-modal').addEventListener('click', () => {
            document.getElementById('core-transaction-submission-form').reset();
            document.getElementById('tx-edit-id-hidden').value = '';
            document.getElementById('modal-tx-title').textContent = 'تسجيل معاملة مالية جديدة';
            document.getElementById('tx-date-input').value = new Date().toISOString().split('T')[0];
            this.openModalSheet('modal-transaction-form');
        });
        document.getElementById('trigger-recurring-manager').addEventListener('click', () => {
            this.populateRecurringManagerWorkspace();
            this.openModalSheet('modal-recurring-manager');
        });

        // روابط الإغلاق الشاملة لكافة النوافذ عبر الـ Dataset Targets
        document.querySelectorAll('[data-close-target]').forEach(btn => {
            btn.addEventListener('click', () => this.closeModalSheet(btn.getAttribute('data-close-target')));
        });

        // معالجة تبديل نوع المعاملة المالية داخل النموذج الداخلي (مصروف / دخل)
        document.querySelectorAll('.mode-selector-intent .segment-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-selector-intent .segment-btn').forEach(b => b.classList.remove('active', 'mode-expense-btn', 'mode-income-btn'));
                const target = e.currentTarget;
                target.classList.add('active');
                const type = target.getAttribute('data-type');
                
                const catGroup = document.getElementById('tx-category-group');
                const catSelect = document.getElementById('tx-category-select');
                
                if (type === 'EXPENSE') {
                    target.classList.add('mode-expense-btn');
                    catGroup.style.display = 'flex';
                    catSelect.required = true;
                } else {
                    target.classList.add('mode-income-btn');
                    catGroup.style.display = 'none';
                    catSelect.required = false;
                }
            });
        });

        // إتاحة توسيع أداة توزيع الدخل متعدد المصادر بروية وحركة ناعمة
        document.getElementById('toggle-splitter-btn').addEventListener('click', (e) => {
            const panel = document.getElementById('splitter-collapsible-content');
            panel.classList.toggle('hidden');
            e.currentTarget.textContent = panel.classList.contains('hidden') ? 'توسيع الأداة' : 'طي الأداة';
        });

        // إدارة ديناميكية لإضافة سطور مصادر الدخل داخل الموزع المالي
        document.getElementById('add-income-stream-row').addEventListener('click', () => this.injectNewIncomeStreamInputFieldRow());
        document.getElementById('income-rows-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-income-row-btn')) {
                const rows = document.querySelectorAll('.income-input-row');
                if (rows.length > 1) {
                    e.target.closest('.income-input-row').remove();
                    this.calculateLiveIncomeSplitterPreviews();
                } else {
                    HardwareEngine.showToast('يجب أن يتواجد مصدر دخل واحد على الأقل في القائمة.', 'danger');
                }
            }
        });

        // ربط شريط التوزيع بحدث التحديث اللحظي للمعاينة الحسابية
        document.getElementById('allocation-ratio-slider').addEventListener('input', () => this.calculateLiveIncomeSplitterPreviews());
        document.getElementById('income-rows-container').addEventListener('input', () => this.calculateLiveIncomeSplitterPreviews());

        // تأكيد وحفظ التوزيع وضخه في الأرصدة الحالية المعزولة
        document.getElementById('income-splitter-form').addEventListener('submit', (e) => this.handleIncomeSplitterCommitment(e));

        // معالجة الفلترة والبحث اللحظي المتقدم في السجل
        document.getElementById('transaction-search-input').addEventListener('input', () => this.renderTransactionLedgerFeed());
        document.getElementById('filter-category-select').addEventListener('change', () => this.renderTransactionLedgerFeed());
        document.getElementById('filter-date-start').addEventListener('input', () => this.renderTransactionLedgerFeed());
        document.getElementById('filter-date-end').addEventListener('input', () => this.renderTransactionLedgerFeed());

        // معالجة إرسال النموذج الرئيسي للمعاملات المالية (Optimistic CRUD Core Framework)
        document.getElementById('core-transaction-submission-form').addEventListener('submit', (e) => this.handleCoreTransactionFormSubmission(e));

        // معالجة حذف وتعديل السجلات عبر الضغط والـ Event Delegation
        const virtualList = document.getElementById('transactions-virtual-list');
        virtualList.addEventListener('click', (e) => {
            const underlayDelete = e.target.closest('.tx-swipe-underlay-action');
            if (underlayDelete) {
                const txId = underlayDelete.getAttribute('data-id');
                this.executeOptimisticDeleteTransaction(txId);
                return;
            }

            const surfaceRow = e.target.closest('.tx-item-row-surface');
            if (surfaceRow) {
                // في حال نقر السجل، فتح خيار التعديل الشامل عبر الـ Bottom Sheet المخصص
                const txId = surfaceRow.getAttribute('data-id');
                this.invokeEditTransactionModeIntoForm(txId);
            }
        });

        // تشغيل المعالجة الجمعية للفواتير الدورية بنقرة واحدة لقسم العمليات المستحق
        document.getElementById('batch-process-recurring-btn').addEventListener('click', () => this.executeBatchProcessRecurringBills());

        // محرك تصدير كشوفات الحساب الرسمية المطبوعة
        document.getElementById('trigger-export-statement').addEventListener('click', () => this.generateStructuredFinancialStatementBlob());

        // محرك تطهير وتنظيف قواعد البيانات النووي الكامل (Nuclear Clean Reset)
        document.getElementById('system-wipe-nuclear-btn').addEventListener('click', () => this.executeNuclearSystemDatabaseWipe());
    },

    switchContext(targetContext, element) {
        if (AppState.currentContext === targetContext) return;
        
        HardwareEngine.triggerHapticFeedback();
        
        document.querySelectorAll('.segmented-control [role="tab"]').forEach(btn => btn.classList.remove('active'));
        element.classList.add('active');
        
        AppState.currentContext = targetContext;
        
        // إعادة تهيئة محركات الفلترة والبحث لتجنب تشتيت السجل المالي المعزول الجديد
        document.getElementById('transaction-search-input').value = '';
        document.getElementById('filter-category-select').value = 'ALL';
        document.getElementById('filter-date-start').value = '';
        document.getElementById('filter-date-end').value = '';

        FinanceCalculator.recalculateAndRefreshUI();
    },

    toggleApplicationTheme() {
        const body = document.body;
        const metaColor = document.getElementById('theme-meta-color');
        
        if (body.classList.contains('dark-mode')) {
            body.classList.remove('dark-mode');
            AppState.ui.theme = 'light';
            if (metaColor) metaColor.setAttribute('content', '#f8fafc');
            document.querySelector('.sun-icon').style.display = 'block';
            document.querySelector('.moon-icon').style.display = 'none';
        } else {
            body.classList.add('dark-mode');
            AppState.ui.theme = 'dark';
            if (metaColor) metaColor.setAttribute('content', '#090d16');
            document.querySelector('.sun-icon').style.display = 'none';
            document.querySelector('.moon-icon').style.display = 'block';
        }
        LocalDB.saveState();
    },

    openModalSheet(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('hidden');
    },

    closeModalSheet(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.add('hidden');
    },

    injectNewIncomeStreamInputFieldRow() {
        const container = document.getElementById('income-rows-container');
        const nextId = performance.now();
        
        const row = document.createElement('div');
        row.className = 'income-input-row';
        row.setAttribute('data-row-id', nextId.toString());
        row.innerHTML = `
            <div class="form-group flex-2">
                <label class="form-label">مصدر الدخل (راتب، عمل حر، استثمار)</label>
                <input type="text" class="form-input income-source-title" placeholder="مصدر إضافي" required>
            </div>
            <div class="form-group flex-1">
                <label class="form-label">المبلغ (ج.م)</label>
                <input type="number" class="form-input income-source-amount" min="0" step="0.01" placeholder="0.00" required>
            </div>
            <button type="button" class="remove-income-row-btn" aria-label="حذف المصدر">×</button>
        `;
        container.appendChild(row);
    },

    calculateLiveIncomeSplitterPreviews() {
        const rows = document.querySelectorAll('.income-input-row');
        let totalAggregatedIncome = 0;
        
        rows.forEach(row => {
            const amtVal = parseFloat(row.querySelector('.income-source-amount').value) || 0;
            totalAggregatedIncome += amtVal;
        });

        const sliderRatio = parseInt(document.getElementById('allocation-ratio-slider').value) || 0;
        const pctPersonal = sliderRatio;
        const pctFamily = 100 - sliderRatio;

        document.getElementById('pct-personal-label').textContent = pctPersonal.toString();
        document.getElementById('pct-family-label').textContent = pctFamily.toString();

        const amtPersonal = (totalAggregatedIncome * pctPersonal) / 100;
        const amtFamily = (totalAggregatedIncome * pctFamily) / 100;

        document.getElementById('preview-amt-personal').textContent = `${amtPersonal.toFixed(2)} ج.م`;
        document.getElementById('preview-amt-family').textContent = `${amtFamily.toFixed(2)} ج.م`;
    },

    async handleIncomeSplitterCommitment(e) {
        e.preventDefault();
        
        const rows = document.querySelectorAll('.income-input-row');
        let totalAggregatedIncome = 0;
        const descriptions = [];

        for (let row of rows) {
            const titleInput = row.querySelector('.income-source-title');
            const amtInput = row.querySelector('.income-source-amount');
            
            if (!titleInput.value.trim() || !amtInput.value || parseFloat(amtInput.value) <= 0) {
                HardwareEngine.showToast('يرجى ملء جميع حقول مصادر الدخل بقيم صحيحة وأكبر من الصفر.', 'danger');
                return;
            }
            
            totalAggregatedIncome += parseFloat(amtInput.value);
            descriptions.push(titleInput.value.trim());
        }

        const sliderRatio = parseInt(document.getElementById('allocation-ratio-slider').value) || 0;
        const amtPersonal = (totalAggregatedIncome * sliderRatio) / 100;
        const amtFamily = (totalAggregatedIncome * (100 - sliderRatio)) / 100;

        const timestamp = new Date().toISOString();
        const baseDescription = `حقن عبر موزع الدخل المعياري [${descriptions.join(' + ')}]`;

        // حقن الحصص النقدية بطريقة تضمن عدم تداخل أو تسريب الحسابات لبعضها
        if (amtPersonal > 0) {
            AppState.personal.transactions.unshift({
                id: 'TX-' + performance.now() + '-P',
                type: 'INCOME',
                amount: amtPersonal,
                category: 'أخرى',
                date: timestamp.split('T')[0],
                notes: `${baseDescription} - حصة الحساب الشخصي بقيمة ${sliderRatio}%`,
                isRecurring: false
            });
        }

        if (amtFamily > 0) {
            AppState.family.transactions.unshift({
                id: 'TX-' + performance.now() + '-F',
                type: 'INCOME',
                amount: amtFamily,
                category: 'أخرى',
                date: timestamp.split('T')[0],
                notes: `${baseDescription} - حصة العائلة والمنزل بقيمة ${100 - sliderRatio}%`,
                isRecurring: false
            });
        }

        HardwareEngine.triggerHapticFeedback();
        HardwareEngine.showToast('تم ضخ وتوزيع التدفقات المالية بنجاح داخل الخزائن المعزولة.');
        
        // إعادة تهيئة وضبط المدخلات بالكامل بعد اكتمال التوزيع والضخ الحسابي
        document.getElementById('income-splitter-form').reset();
        const container = document.getElementById('income-rows-container');
        container.innerHTML = `
            <div class="income-input-row" data-row-id="0">
                <div class="form-group flex-2">
                    <label class="form-label">مصدر الدخل (راتب، عمل حر، استثمار)</label>
                    <input type="text" class="form-input income-source-title" placeholder="مثال: الراتب الأساسي" required>
                </div>
                <div class="form-group flex-1">
                    <label class="form-label">المبلغ (ج.م)</label>
                    <input type="number" class="form-input income-source-amount" min="0" step="0.01" placeholder="0.00" required>
                </div>
                <button type="button" class="remove-income-row-btn" aria-label="حذف المصدر">×</button>
            </div>
        `;
        this.calculateLiveIncomeSplitterPreviews();
        document.getElementById('splitter-collapsible-content').classList.add('hidden');
        document.getElementById('toggle-splitter-btn').textContent = 'توسيع الأداة';

        // حفظ وتحديث الأداء محلياً وإعادة رسم اللوحات
        FinanceCalculator.recalculateAndRefreshUI();
        await LocalDB.saveState();
    },

    async handleCoreTransactionFormSubmission(e) {
        e.preventDefault();
        
        const context = AppState.currentContext;
        const editId = document.getElementById('tx-edit-id-hidden').value;
        const isExpense = document.querySelector('.mode-selector-intent .segment-btn.active').getAttribute('data-type') === 'EXPENSE';
        
        const amount = parseFloat(document.getElementById('tx-amount-input').value) || 0;
        const category = isExpense ? document.getElementById('tx-category-select').value : 'أخرى';
        const date = document.getElementById('tx-date-input').value;
        const notes = document.getElementById('tx-notes-input').value.trim() || 'معاملة مالية مبهمة';
        const isRecurring = document.getElementById('tx-is-recurring').checked;

        if (amount <= 0 || (isExpense && !category) || !date) {
            HardwareEngine.showToast('يرجى التحقق من استيفاء كافة الحقول والمبالغ الإلزامية المطلوبة أولاً.', 'danger');
            return;
        }

        // نسخ احتياطية للحالة في حال التراجع عن التحديث اللحظي التفاؤلي (Optimistic UI Rollback)
        const previousTransactionsBackup = [...AppState[context].transactions];
        
        if (editId) {
            // نمط تحديث وحفظ تعديلات معاملة مسبقة ومسجلة تاريخياً
            const index = AppState[context].transactions.findIndex(t => t.id === editId);
            if (index !== -1) {
                AppState[context].transactions[index] = {
                    id: editId,
                    type: isExpense ? 'EXPENSE' : 'INCOME',
                    amount: amount,
                    category: category,
                    date: date,
                    notes: notes,
                    isRecurring: isRecurring
                };
            }
            HardwareEngine.showToast('تم حفظ تعديلات المعاملة بنجاح.');
        } else {
            // نمط إنشاء وضخ معطيات معاملة مالية جديدة كلياً
            const newTransaction = {
                id: 'TX-' + performance.now(),
                type: isExpense ? 'EXPENSE' : 'INCOME',
                amount: amount,
                category: category,
                date: date,
                notes: notes,
                isRecurring: isRecurring
            };
            AppState[context].transactions.unshift(newTransaction);
            HardwareEngine.showToast('تم تسجيل وحفظ المعاملة المالية المحددة.');
        }

        this.closeModalSheet('modal-transaction-form');
        HardwareEngine.triggerHapticFeedback();
        
        // التحديث التفاؤلي الفوري لواجهة المستخدم (Optimistic UI Framework)
        FinanceCalculator.recalculateAndRefreshUI();

        // تمرير وكتابة التحديث غير المتزامن بداخل قواعد البيانات المحلية المستقرة
        const success = await LocalDB.saveState();
        if (!success) {
            // التراجع الفوري والسلس في حالة حدوث خطأ أو عطل في تخزين البيانات وتوضيح الخلل
            AppState[context].transactions = previousTransactionsBackup;
            FinanceCalculator.recalculateAndRefreshUI();
            HardwareEngine.showToast('فشل في حفظ البيانات داخل وحدة التخزين المحلية، تم التراجع الفوري عن المدخلات.', 'danger');
        }
    },

    invokeEditTransactionModeIntoForm(txId) {
        const context = AppState.currentContext;
        const transaction = AppState[context].transactions.find(t => t.id === txId);
        if (!transaction) return;

        document.getElementById('tx-edit-id-hidden').value = transaction.id;
        document.getElementById('modal-tx-title').textContent = 'تعديل وتدقيق المعاملة المالية الحالية';
        document.getElementById('tx-amount-input').value = transaction.amount;
        document.getElementById('tx-date-input').value = transaction.date;
        document.getElementById('tx-notes-input').value = transaction.notes;
        document.getElementById('tx-is-recurring').checked = transaction.isRecurring || false;

        // ضبط واجهة منبثق التحديد ونوع المعاملة طبقاً للسجل التاريخي المستدعى
        document.querySelectorAll('.mode-selector-intent .segment-btn').forEach(b => b.classList.remove('active', 'mode-expense-btn', 'mode-income-btn'));
        const catGroup = document.getElementById('tx-category-group');
        const catSelect = document.getElementById('tx-category-select');

        if (transaction.type === 'EXPENSE') {
            const btn = document.getElementById('tx-mode-expense');
            btn.classList.add('active', 'mode-expense-btn');
            catGroup.style.display = 'flex';
            catSelect.value = transaction.category;
            catSelect.required = true;
        } else {
            const btn = document.getElementById('tx-mode-income');
            btn.classList.add('active', 'mode-income-btn');
            catGroup.style.display = 'none';
            catSelect.value = '';
            catSelect.required = false;
        }

        this.openModalSheet('modal-transaction-form');
    },

    async executeOptimisticDeleteTransaction(txId) {
        const context = AppState.currentContext;
        const previousTransactionsBackup = [...AppState[context].transactions];

        AppState[context].transactions = AppState[context].transactions.filter(t => t.id !== txId);
        
        HardwareEngine.triggerHapticFeedback();
        HardwareEngine.showToast('تم شطب وحذف العملية المحددة بشكل عاجل وتحديث الموازين.');
        
        // التحديث التفاؤلي الفوري
        FinanceCalculator.recalculateAndRefreshUI();

        // تأكيد وحفظ التحديث غير المتزامن
        const success = await LocalDB.saveState();
        if (!success) {
            AppState[context].transactions = previousTransactionsBackup;
            FinanceCalculator.recalculateAndRefreshUI();
            HardwareEngine.showToast('فشل في مزامنة الحذف، تم استعادة السجل المحذوف تلقائياً.', 'danger');
        }
    },

    populateRecurringManagerWorkspace() {
        const context = AppState.currentContext;
        const bucket = document.getElementById('recurring-items-bucket');
        bucket.innerHTML = '';

        const recurringItems = AppState[context].transactions.filter(t => t.isRecurring === true);

        if (recurringItems.length === 0) {
            bucket.innerHTML = '<p class="empty-state-text" style="padding:16px 0;">لا توجد أي فواتير دورية متكررة مسجلة في هذا الحساب حالياً.</p>';
            return;
        }

        // بناء وعرض الفواتير المتكررة المثبتة داخل لوحة المتابعة
        recurringItems.forEach(item => {
            const row = document.createElement('div');
            row.className = 'skeleton-row';
            row.style.justifyContent = 'space-between';
            row.style.background = 'var(--color-surface-variant)';
            row.style.marginBottom = '8px';
            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:12px;">
                    <span style="font-size:1.2rem;">${item.type === 'EXPENSE' ? '🧾' : '💰'}</span>
                    <div style="display:flex; flex-direction:column;">
                        <span style="font-size:0.85rem; font-weight:bold; color:var(--color-text-main);">${item.notes}</span>
                        <span style="font-size:0.7rem; color:var(--color-text-muted);">${item.category} • فاتورة مستحقة شهرياً</span>
                    </div>
                </div>
                <span style="font-size:0.9rem; font-weight:bold; color:${item.type === 'EXPENSE' ? 'var(--color-danger)' : 'var(--color-success)'}">
                    ${item.type === 'EXPENSE' ? '-' : '+'}${parseFloat(item.amount).toFixed(2)} ج.م
                </span>
            `;
            bucket.appendChild(row);
        });
    },

    async executeBatchProcessRecurringBills() {
        const context = AppState.currentContext;
        const recurringItems = AppState[context].transactions.filter(t => t.isRecurring === true);

        if (recurringItems.length === 0) {
            HardwareEngine.showToast('لا توجد فواتير متكررة لتطبيقها داخل القسم الحالي.', 'warning');
            return;
        }

        const previousTransactionsBackup = [...AppState[context].transactions];
        const currentMonthString = new Date().toLocaleString('ar-EG', { month: 'long' });

        // تكرار وحقن المعاملات للشهر الجديد مع الحفاظ التام على عزل المعطيات والبيانات عن أي قسم آخر
        recurringItems.forEach(bill => {
            const spawnedTx = {
                ...bill,
                id: 'TX-REC-SPAWN-' + performance.now() + '-' + Math.random(),
                date: new Date().toISOString().split('T')[0],
                notes: `[استحقاق ${currentMonthString}] - الدورة الآلية لـ: ${bill.notes}`,
                isRecurring: false // النسخ المولدة تفرز كمعاملات اعتيادية غير دورية لمنع التكاثر اللا نهائي
            };
            AppState[context].transactions.unshift(spawnedTx);
        });

        HardwareEngine.triggerHapticFeedback();
        HardwareEngine.showToast(`تم ضخ وتمرير إجمالي (${recurringItems.length}) فواتير والتزامات دورية لشهر الحالي بنجاح.`);
        
        this.closeModalSheet('modal-recurring-manager');
        FinanceCalculator.recalculateAndRefreshUI();
        
        await LocalDB.saveState();
    },

    renderTransactionLedgerFeed() {
        const context = AppState.currentContext;
        const virtualList = document.getElementById('transactions-virtual-list');
        const emptyState = document.getElementById('ledger-empty-state');
        
        // جلب قيم ومحددات التصفية والبحث اللحظية والبيان النصي الموجه
        const searchQuery = document.getElementById('transaction-search-input').value.toLowerCase().trim();
        const categoryFilter = document.getElementById('filter-category-select').value;
        const dateStart = document.getElementById('filter-date-start').value;
        const dateEnd = document.getElementById('filter-date-end').value;

        // تصفية وحصر مصفوفة البيانات التاريخية المعزولة بناء على خيارات الفلترة المفعلة
        const filteredData = AppState[context].transactions.filter(t => {
            const matchesSearch = t.notes.toLowerCase().includes(searchQuery);
            const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
            const matchesDateStart = !dateStart || t.date >= dateStart;
            const matchesDateEnd = !dateEnd || t.date <= dateEnd;
            
            return matchesSearch && matchesCategory && matchesDateStart && matchesDateEnd;
        });

        // التعامل مع عرض الحالة الفارغة بدقة وسلاسة تفاعلية متفوقة
        if (filteredData.length === 0) {
            virtualList.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        // بناء وسرد كتل وعناصر الواجهة بالاعتماد على الهياكل البنيوية السريعة ومحرك اللمس والسحب الجانبي
        let htmlFragment = '';
        filteredData.forEach(tx => {
            const avatar = tx.type === 'EXPENSE' ? (tx.category.substring(0, 2)) : 'دخل';
            const sign = tx.type === 'EXPENSE' ? '-' : '+';
            const intentClass = tx.type === 'EXPENSE' ? 'expense-intent-color' : 'income-intent-color';
            const recIndicator = tx.isRecurring ? ' <span style="color:var(--color-brand-primary);">🔄 دورية</span>' : '';

            htmlFragment += `
                <div class="tx-item-swipe-container">
                    <div class="tx-swipe-underlay-action" data-id="${tx.id}">
                        <span>حذف 🗑️</span>
                    </div>
                    <div class="tx-item-row-surface" data-id="${tx.id}">
                        <div class="tx-row-leading">
                            <div class="category-avatar-badge" style="background-color: ${tx.type === 'EXPENSE' ? (CategoryColorMap[tx.category] || '#64748b') : 'var(--color-success-bg)'}; color: ${tx.type === 'EXPENSE' ? 'white' : 'var(--color-success)'}">
                                ${avatar}
                            </div>
                            <div class="tx-core-metadata-block">
                                <span class="tx-row-notes-title">${tx.notes}${recIndicator}</span>
                                <div class="tx-row-subline-meta">
                                    <span class="category-tag-chip">${tx.category}</span>
                                    <span>•</span>
                                    <span>${tx.date}</span>
                                </div>
                            </div>
                        </div>
                        <div class="tx-amount-trailing-readout ${intentClass}">
                            <span>${sign}${parseFloat(tx.amount).toFixed(2)} ج.م</span>
                        </div>
                    </div>
                </div>
            `;
        });

        virtualList.innerHTML = htmlFragment;
    },

    generateStructuredFinancialStatementBlob() {
        // طباعة إدارية نظيفة وراقية ومخصصة عبر استدعاء النوافذ المخفية المعزولة لـ Print Stylesheet
        HardwareEngine.showToast('يتم الآن تحضير وتوليد كشف الميزانية الرسمي للطباعة الإدارية المحمية...');
        setTimeout(() => {
            window.print();
        }, 500);
    },

    executeNuclearSystemDatabaseWipe() {
        const confirmation = confirm('تحذير نهائي خطير وموجّه! هل أنت متأكد تماماً من رغبتك في مسح وتطهير كافة البيانات، السجلات، التدفقات النقدية والملفات المخزنة في النظام نهائياً؟ لا يمكن التراجع عن هذا الإجراء مطلقاً.');
        if (!confirmation) return;

        localStorage.clear();
        
        if (window.indexedDB) {
            indexedDB.deleteDatabase(LocalDB.DB_NAME);
        }

        HardwareEngine.triggerHapticFeedback();
        alert('تم تطهير وتصفير قاعدة البيانات المركزية بنجاح، سيتم إعادة تشغيل النظام بشكل فوري بالكامل.');
        window.location.reload();
    }
};

// ==========================================================================
// 7. NATIVE PWA ENGINE (Installation Capture Hooks & Manual Overlays)
// ==========================================================================
const PWAEngine = {
    initLifecycle() {
        // رصد التقاط نافذة التثبيت الافتراضية والتحكم اليدوي المتقدم بها لتجربة استخدام فائقة
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            AppState.ui.deferredPrompt = e;
            
            const banner = document.getElementById('pwa-install-banner-block');
            if (banner) banner.style.display = 'flex';
        });

        const nativeBtn = document.getElementById('pwa-native-install-btn');
        if (nativeBtn) {
            nativeBtn.addEventListener('click', async () => {
                const promptEvent = AppState.ui.deferredPrompt;
                if (!promptEvent) return;

                promptEvent.prompt();
                const { outcome } = await promptEvent.userChoice;
                
                if (outcome === 'accepted') {
                    HardwareEngine.showToast('شكراً لتثبيت التطبيق على جهازك بنجاح!');
                }
                AppState.ui.deferredPrompt = null;
                document.getElementById('pwa-install-banner-block').style.display = 'none';
            });
        }

        // رصد واكتشاف أجهزة آبل بنظام iOS لتمرير وإظهار الموجه الإرشادي المخصص لمستخدمي متصفح سفاري المظلومين
        const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        
        if (isIos && !isStandalone) {
            const manualPanel = document.getElementById('ios-manual-routing-panel');
            if (manualPanel) manualPanel.style.display = 'block';
        }
    }
};

// ==========================================================================
// 8. MASTER RUNTIME BOOTSTRAPPING KERNEL (System Initialization Entry Point)
// ==========================================================================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. فتح وتدقيق قنوات الاتصال والتأصيل بداخل قاعدة البيانات المحلية غير المتزامنة
    await LocalDB.init();
    const storedState = await LocalDB.loadState();
    
    if (storedState) {
        if (storedState.personal) AppState.personal = storedState.personal;
        if (storedState.family) AppState.family = storedState.family;
        if (storedState.theme) AppState.ui.theme = storedState.theme;
    }

    // 2. تفعيل المظهر المختار والمخزن مسبقاً في إعدادات ذاكرة المستخدم
    if (AppState.ui.theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('.sun-icon').style.display = 'none';
        document.querySelector('.moon-icon').style.display = 'block';
        const metaColor = document.getElementById('theme-meta-color');
        if (metaColor) metaColor.setAttribute('content', '#090d16');
    }

    // 3. ربط أحداث العناصر والنوافذ التفاعلية والأزرار بداخل واجهة التطبيق كاملة
    UIEngine.initDOMHooks();

    // 4. إطلاق وتفعيل محرك رصد الحركات والسحب اللمسي عالي الكثافة لصفوف السجل المالي
    GestureEngine.initTouchDelegation('#transactions-virtual-list');

    // 5. إطلاق وتهيئة دورة حياة تثبيت تطبيقات الويب التقدمية (PWA Core Lifecycle)
    PWAEngine.initLifecycle();

    // 6. الحساب الأولي الفوري للأرقام والموازين وضخ البيانات وبناء الرسوم البيانية المتجهة لإنعاش الشاشة الافتتاحية
    FinanceCalculator.recalculateAndRefreshUI();
});
