/**
 * نظام إدارة الميزانية وحساب التدفقات المالية - هندسة متفائلة وأداء فائق
 * تطوير: حازم ك. هـ. ماضي - كبير مصممي المنتجات
 */

// أولاً: مخازن التهيئة الافتراضية للبيانات الأساسية المستقرة للهيكل
const DEFAULT_SYSTEM_STATE = {
    metadata: {
        monthName: "يونيو 2026",
        description: "مصاريف وميزانية الشهر الحالية"
    },
    budgets: {
        personal: 9000,
        family: 27000
    },
    categories: {
        personal: ["حلاقة", "عطر", "طلعات ومصاريف جانبية", "أخرى"],
        family: ["المصروف الشهري لماما", "منظفات ومعجون وشامبو", "أرز وخميرة ومواد تموينية", "مواصلات مشاوير", "ديون البيت السابقة", "أخرى"]
    },
    transactions: [
        // كتل البيانات الأولية المفروضة بالهيكل
        { id: "init-1", tab: "family", amount: 3500, category: "المصروف الشهري لماما", notes: "المصروف الشهري المرصود لماما", recurring: true, timestamp: 1780272000000 },
        { id: "init-2", tab: "family", amount: 1000, category: "منظفات ومعجون وشامبو", notes: "صابون غسيل و جسم و يدين و شامبو و معجون و فرش أسنان", recurring: false, timestamp: 1780275600000 },
        { id: "init-3", tab: "family", amount: 400, category: "أرز وخميرة ومواد تموينية", notes: "أرز مصري و أرز بسمتي و خميرة", recurring: false, timestamp: 1780279200000 },
        { id: "init-4", tab: "family", amount: 250, category: "مواصلات مشاوير", notes: "مواصلات مشوار حسام و فارس ذهاب و إياب", recurring: false, timestamp: 1780282800000 },
        { id: "init-5", tab: "family", amount: 1150, category: "ديون البيت السابقة", notes: "ديون البيت لشهر مايو 5/2026", recurring: false, timestamp: 1780286400000 },
        { id: "init-6", tab: "personal", amount: 200, category: "حلاقة", notes: "حلاقة شعر ودقن", recurring: true, timestamp: 1780290000000 },
        { id: "init-7", tab: "personal", amount: 700, category: "عطر", notes: "زجاجة عطر جديدة", recurring: false, timestamp: 1780293600000 },
        { id: "init-8", tab: "personal", amount: 1100, category: "طلعات ومصاريف جانبية", notes: "طلعات ومصاريف خارجية وجانبية", recurring: false, timestamp: 1780297200000 }
    ]
};

class FintechAppEngine {
    constructor() {
        this.state = {};
        this.currentTab = "personal";
        this.currentFilter = "all";
        this.searchQuery = "";
        this.deferredPrompt = null;
        this.swipeStartX = 0;
        this.activeSwipeRow = null;

        this.init();
    }

    async init() {
        this.loadState();
        this.bindDOMReferences();
        this.registerGlobalEventListeners();
        this.renderUI();
        this.setupPWALifecycle();
        
        // إخفاء شاشة التحميل بانسيابية
        setTimeout(() => {
            const loader = document.getElementById('app-loader');
            if (loader) loader.style.opacity = '0';
            setTimeout(() => loader?.remove(), 400);
        }, 300);
    }

    loadState() {
        const localData = localStorage.getItem('__fintech_pwa_state_v1');
        if (localData) {
            try {
                this.state = JSON.parse(localData);
            } catch (e) {
                this.state = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_STATE));
            }
        } else {
            this.state = JSON.parse(JSON.stringify(DEFAULT_SYSTEM_STATE));
            this.saveStateToStorage();
        }
    }

    saveStateToStorage() {
        localStorage.setItem('__fintech_pwa_state_v1', JSON.stringify(this.state));
    }

    bindDOMReferences() {
        this.dom = {
            monthName: document.getElementById('display-month-name'),
            monthDesc: document.getElementById('display-month-desc'),
            grandTotal: document.getElementById('grand-total'),
            burnRate: document.getElementById('burn-rate'),
            forecastDay: document.getElementById('forecast-day'),
            tabBtns: document.querySelectorAll('.tab-btn'),
            searchInput: document.getElementById('search-input'),
            categoryFilters: document.getElementById('category-filters'),
            transactionsList: document.getElementById('transactions-list'),
            emptyState: document.getElementById('empty-state'),
            settingsPanel: document.getElementById('settings-panel'),
            transactionModal: document.getElementById('transaction-modal'),
            txForm: document.getElementById('transaction-form'),
            txId: document.getElementById('tx-id'),
            txAmount: document.getElementById('tx-amount'),
            txCategory: document.getElementById('tx-category'),
            txNotes: document.getElementById('tx-notes'),
            txRecurring: document.getElementById('tx-recurring'),
            modalTitle: document.getElementById('modal-title'),
            incomeSplitterTotal: document.getElementById('income-splitter-total'),
            incomeSplitterRange: document.getElementById('income-splitter-range'),
            familyPctLabel: document.getElementById('family-pct-label'),
            allocFamilyVal: document.getElementById('alloc-family-val'),
            allocPersonalVal: document.getElementById('alloc-personal-val'),
            pwaInstallBtn: document.getElementById('pwa-install-btn'),
            iosInstructions: document.getElementById('ios-instructions'),
            chartWrapper: document.getElementById('svg-chart-wrapper'),
            chartLegend: document.getElementById('chart-legend'),
            themeToggle: document.getElementById('theme-toggle')
        };
    }

    registerGlobalEventListeners() {
        // إدارة التبويب (Tabs)
        this.dom.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.dom.tabBtns.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
                e.target.classList.add('active');
                e.target.setAttribute('aria-selected', 'true');
                this.currentTab = e.target.dataset.tab;
                this.currentFilter = "all";
                this.renderUI();
            });
        });

        // تحرير عناوين الأشهر والوصف مضمنّاً (Inline Inline Contenteditable)
        this.setupInlineEditing(this.dom.monthName, 'monthName');
        this.setupInlineEditing(this.dom.monthDesc, 'description');

        // البحث والفلاتر
        this.dom.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.renderTransactionsOnly();
        });

        // فتح وإغلاق النوافذ (Modals & Slide-overs) via Event Delegation
        document.body.addEventListener('click', (e) => {
            if (e.target.id === 'btn-open-add-modal') this.openTransactionModal();
            if (e.target.id === 'settings-toggle') this.toggleSlideOver(this.dom.settingsPanel, true);
            if (e.target.id === 'theme-toggle') this.toggleTheme();
            if (e.target.id === 'btn-export-statement') this.generateFinancialReport();
            if (e.target.id === 'btn-apply-allocation') this.applyIncomeAllocation();
            
            const closeTarget = e.target.dataset.close;
            if (closeTarget) {
                if (closeTarget === 'transaction') this.closeTransactionModal();
                if (closeTarget === 'settings') this.toggleSlideOver(this.dom.settingsPanel, false);
            }
        });

        // مستودع النموذج الرئيسي للإضافة والتعديل التفاؤلي
        this.dom.txForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTransactionFormSubmit();
        });

        // معالج تقسيم الميزانية (Income Splitter Sliders)
        this.dom.incomeSplitterRange.addEventListener('input', () => this.updateAllocationMetrics());
        this.dom.incomeSplitterTotal.addEventListener('input', () => this.updateAllocationMetrics());
    }

    setupInlineEditing(element, stateKey) {
        element.setAttribute('contenteditable', 'true');
        
        // جلب المحتوى المسبق
        element.innerText = this.state.metadata[stateKey];

        element.addEventListener('blur', () => {
            const cleanText = element.innerText.trim();
            if(cleanText.length > 0) {
                this.state.metadata[stateKey] = cleanText;
                this.saveStateToStorage();
                this.showToast("تم تحديث البيانات الوصفية للميزانية بنجاح", "success");
            } else {
                element.innerText = this.state.metadata[stateKey];
            }
        });

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') { e.preventDefault(); element.blur(); }
        });
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        this.dom.themeToggle.innerText = nextTheme === 'dark' ? '☀️' : '🌙';
        document.getElementById('theme-meta').setAttribute('content', nextTheme === 'dark' ? '#020617' : '#0f172a');
    }

    triggerHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;
        document.getElementById('toast-container').appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // إدارة الحسابات المالية اللحظية الفائقة
    calculateFinancials() {
        const totals = { personal: 0, family: 0 };
        
        this.state.transactions.forEach(tx => {
            if (totals[tx.tab] !== undefined) {
                totals[tx.tab] += tx.amount;
            }
        });

        const remFamily = this.state.budgets.family - totals.family;
        const remPersonal = this.state.budgets.personal - totals.personal;
        const grandTotal = remFamily + remPersonal;

        // ميكانيكية التحريك الديناميكي للعداد النبضي المالي (Animate Count)
        this.animateCounterDisplay(this.dom.grandTotal, grandTotal);

        // حساب معدل الحرق اليومي والتنبؤ الأفضل المتقدم
        const today = new Date();
        const currentDay = today.getDate();
        const totalSpent = totals.personal + totals.family;
        const burnRate = currentDay > 0 ? (totalSpent / currentDay) : totalSpent;
        this.dom.burnRate.innerText = `${burnRate.toFixed(2)} ج.م`;

        if (grandTotal <= 0) {
            this.dom.forecastDay.innerText = "نفذت الميزانية";
            this.dom.forecastDay.style.color = "var(--danger)";
        } else if (burnRate === 0) {
            this.dom.forecastDay.innerText = "مستقر";
            this.dom.forecastDay.style.color = "var(--success)";
        } else {
            const daysLeft = Math.floor(grandTotal / burnRate);
            const targetDay = currentDay + daysLeft;
            this.dom.forecastDay.innerText = `يوم ${Math.min(targetDay, 30)}`;
            this.dom.forecastDay.style.color = daysLeft < 5 ? "var(--danger)" : "var(--success)";
        }

        return { remFamily, remPersonal, totals };
    }

    animateCounterDisplay(targetElement, finalValue) {
        let start = 0;
        const duration = 400; // ملي ثانية
        const startTime = performance.now();
        
        const formatCurrency = (val) => `${val.toLocaleString('ar-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ج.م`;

        function updateCount(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out quad
            const easeProgress = progress * (2 - progress);
            const currentValue = start + (finalValue - start) * easeProgress;
            
            targetElement.innerText = formatCurrency(currentValue);

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        }
        requestAnimationFrame(updateCount);
    }

    renderUI() {
        this.calculateFinancials();
        this.renderFilters();
        this.renderTransactionsOnly();
        this.renderSVGAnalytics();
        this.updateAllocationMetrics();
    }

    renderFilters() {
        const currentCats = this.state.categories[this.currentTab];
        this.dom.categoryFilters.innerHTML = `<button class="chip ${this.currentFilter === 'all' ? 'active' : ''}" data-category="all">الكل</button>`;
        
        currentCats.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `chip ${this.currentFilter === cat ? 'active' : ''}`;
            btn.dataset.category = cat;
            btn.innerText = cat;
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
                btn.classList.add('active');
                this.currentFilter = cat;
                this.renderTransactionsOnly();
            });
            this.dom.categoryFilters.appendChild(btn);
        });
    }

    renderTransactionsOnly() {
        this.dom.transactionsList.innerHTML = "";
        
        const filtered = this.state.transactions.filter(tx => {
            if (tx.tab !== this.currentTab) return false;
            if (this.currentFilter !== "all" && tx.category !== this.currentFilter) return false;
            if (this.searchQuery) {
                return tx.notes.toLowerCase().includes(this.searchQuery) || tx.category.toLowerCase().includes(this.searchQuery);
            }
            return true;
        }).sort((a,b) => b.timestamp - a.timestamp);

        if(filtered.length === 0) {
            this.dom.emptyState.classList.remove('hidden');
            return;
        }
        this.dom.emptyState.classList.add('hidden');

        filtered.forEach(tx => {
            const wrapper = document.createElement('div');
            wrapper.className = "tx-row-wrapper";
            
            wrapper.innerHTML = `
                <div class="tx-swipe-action-left">حذف 🗑️</div>
                <div class="tx-row" data-id="${tx.id}">
                    <div class="tx-info">
                        <span class="tx-meta">${tx.notes}</span>
                        <span class="tx-subtext">
                            <span>${tx.category}</span> • 
                            <span>${new Date(tx.timestamp).toLocaleDateString('ar-EG')}</span>
                            ${tx.recurring ? '<span class="recurring-badge">دورية</span>' : ''}
                        </span>
                    </div>
                    <div class="tx-amount-display">${tx.amount.toLocaleString('ar-EG')} ج.م</div>
                </div>
            `;

            // ربط أحداث الإيماءات والسحب السريع (Swipe gestures for mobile viewports)
            const row = wrapper.querySelector('.tx-row');
            this.attachSwipeGestures(row, tx.id);

            // حدث الضغط للتعديل (Inline expansion / Edit modal click)
            row.addEventListener('click', (e) => {
                if (Math.abs(parseInt(row.style.transform.replace(/[^0-9-]/g, '')) || 0) > 10) return;
                this.openTransactionModal(tx);
            });

            this.dom.transactionsList.appendChild(wrapper);
        });
    }

    attachSwipeGestures(row, id) {
        row.addEventListener('touchstart', (e) => {
            this.swipeStartX = e.touches[0].clientX;
            this.activeSwipeRow = row;
        }, { passive: true });

        row.addEventListener('touchmove', (e) => {
            const currentX = e.touches[0].clientX;
            const diffX = currentX - this.swipeStartX;
            // السحب لليمين في واجهات RTL يعني السحب باتجاه الموجب للحذف
            if (diffX > 0 && diffX < 120) {
                row.style.transform = `translateX(${diffX}px)`;
            }
        }, { passive: true });

        row.addEventListener('touchend', (e) => {
            const diffX = e.changedTouches[0].clientX - this.swipeStartX;
            if (diffX > 80) {
                // تفعيل التفاؤلي الفوري للحذف
                this.executeOptimisticDelete(id);
            } else {
                row.style.transform = "translateX(0px)";
            }
        }, { passive: true });
    }

    executeOptimisticDelete(id) {
        this.triggerHapticFeedback();
        const previousTxIndex = this.state.transactions.findIndex(t => t.id === id);
        const backupTx = this.state.transactions[previousTxIndex];

        // الحذف المتفائل الواعد لسرعة التجاوب الإنسيابي
        this.state.transactions.splice(previousTxIndex, 1);
        this.renderUI();
        this.saveStateToStorage();
        this.showToast("تم حذف المعاملة فوراً", "success");
    }

    renderSVGAnalytics() {
        const { totals } = this.calculateFinancials();
        const activeSpent = totals[this.currentTab] || 0;
        const activeBudget = this.state.budgets[this.currentTab];
        
        // بناء وتوزيع الدونات شارت الخفيف المعتمد على الفئات
        const catMap = {};
        this.state.transactions.filter(t => t.tab === this.currentTab).forEach(t => {
            catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        });

        this.dom.chartLegend.innerHTML = "";
        this.dom.chartWrapper.innerHTML = "";

        const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
        let colorIdx = 0;

        let svgContent = `<svg viewBox="0 0 36 36" width="100%" height="100%">`;
        let accumulatedPercent = 0;

        if (activeSpent === 0) {
            svgContent += `<circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--border-color)" stroke-width="4"></circle></svg>`;
            this.dom.chartWrapper.innerHTML = svgContent;
            return;
        }

        for (const [category, amount] of Object.entries(catMap)) {
            const pct = (amount / activeSpent) * 100;
            const color = colors[colorIdx % colors.length];
            colorIdx++;

            // حسابات المحيط للمخطط الخطي الدائري
            const strokeDashArray = `${pct} ${100 - pct}`;
            const strokeDashOffset = 100 - accumulatedPercent + 25; // ابدأ من الأعلى

            svgContent += `
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="${color}" 
                        stroke-width="4" stroke-dasharray="${strokeDashArray}" 
                        stroke-dashoffset="${strokeDashOffset}"></circle>
            `;
            accumulatedPercent += pct;

            // بناء الدليل الإرشادي التابع للمخطط
            const legendItem = document.createElement('div');
            legendItem.className = "legend-item";
            legendItem.innerHTML = `
                <span class="legend-dot" style="background:${color}"></span>
                <span>${category}: <strong>${amount.toLocaleString('ar-EG')} ج.م</strong> (${pct.toFixed(0)}%)</span>
            `;
            this.dom.chartLegend.appendChild(legendItem);
        }

        svgContent += `</svg>`;
        this.dom.chartWrapper.innerHTML = svgContent;
    }

    openTransactionModal(tx = null) {
        // ملء خيارات الفئة المستهدفة للتبويب الفعال
        this.dom.txCategory.innerHTML = "";
        this.state.categories[this.currentTab].forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.innerText = cat;
            this.dom.txCategory.appendChild(opt);
        });

        if (tx) {
            this.dom.modalTitle.innerText = "تعديل المعاملة";
            this.dom.txId.value = tx.id;
            this.dom.txAmount.value = tx.amount;
            this.dom.txCategory.value = tx.category;
            this.dom.txNotes.value = tx.notes;
            this.dom.txRecurring.checked = tx.recurring;
        } else {
            this.dom.modalTitle.innerText = "إضافة معاملة جديدة";
            this.dom.txForm.reset();
            this.dom.txId.value = "";
        }
        this.dom.transactionModal.classList.add('open');
        this.dom.transactionModal.setAttribute('aria-hidden', 'false');
    }

    closeTransactionModal() {
        this.dom.transactionModal.classList.remove('open');
        this.dom.transactionModal.setAttribute('aria-hidden', 'true');
    }

    toggleSlideOver(panel, open) {
        if(open) {
            panel.classList.add('open');
            panel.setAttribute('aria-hidden', 'false');
        } else {
            panel.classList.remove('open');
            panel.setAttribute('aria-hidden', 'true');
        }
    }

    handleTransactionFormSubmit() {
        const id = this.dom.txId.value;
        const amount = parseFloat(this.dom.txAmount.value);
        const category = this.dom.txCategory.value;
        const notes = this.dom.txNotes.value.trim();
        const recurring = this.dom.txRecurring.checked;

        if(!amount || !notes) {
            this.showToast("يرجى ملء الحقول الإلزامية كاملة", "error");
            return;
        }

        this.triggerHapticFeedback();

        if (id) {
            // نمط التعديل
            const tx = this.state.transactions.find(t => t.id === id);
            if(tx) {
                tx.amount = amount;
                tx.category = category;
                tx.notes = notes;
                tx.recurring = recurring;
            }
        } else {
            // نمط الإضافة الإنشائية الجديدة
            const newTx = {
                id: 'tx-' + Date.now(),
                tab: this.currentTab,
                amount,
                category,
                notes,
                recurring,
                timestamp: Date.now()
            };
            this.state.transactions.push(newTx);
        }

        this.renderUI();
        this.saveStateToStorage();
        this.closeTransactionModal();
        this.showToast("تم تحديث وحفظ الحركة المالية المجدولة تفاؤلياً", "success");
    }

    updateAllocationMetrics() {
        const totalIncome = parseFloat(this.dom.incomeSplitterTotal.value) || 0;
        const familyPct = parseInt(this.dom.incomeSplitterRange.value) || 0;
        const personalPct = 100 - familyPct;

        this.dom.familyPctLabel.innerText = `${familyPct}%`;

        const familyAllocation = (totalIncome * familyPct) / 100;
        const personalAllocation = (totalIncome * personalPct) / 100;

        this.dom.allocFamilyVal.innerText = `${familyAllocation.toLocaleString('ar-EG')} ج.م`;
        this.dom.allocPersonalVal.innerText = `${personalAllocation.toLocaleString('ar-EG')} ج.م`;
    }

    applyIncomeAllocation() {
        const totalIncome = parseFloat(this.dom.incomeSplitterTotal.value) || 0;
        const familyPct = parseInt(this.dom.incomeSplitterRange.value) || 0;

        this.state.budgets.family = (totalIncome * familyPct) / 100;
        this.state.budgets.personal = (totalIncome * (100 - familyPct)) / 100;

        this.renderUI();
        this.saveStateToStorage();
        this.toggleSlideOver(this.dom.settingsPanel, false);
        this.showToast("تمت إعادة توزيع ميزانية الدخل الإجمالي المعتمد", "success");
    }

    generateFinancialReport() {
        const printArea = document.getElementById('print-statement-template');
        const now = new Date();
        
        let tableRows = "";
        this.state.transactions.forEach(t => {
            tableRows += `
                <tr>
                    <td>${t.notes}</td>
                    <td>${t.tab === 'personal' ? 'شخصي' : 'العائلة والمنزل'}</td>
                    <td>${t.category}</td>
                    <td>${t.amount.toFixed(2)} ج.م</td>
                    <td>${new Date(t.timestamp).toLocaleDateString('ar-EG')}</td>
                </tr>
            `;
        });

        printArea.innerHTML = `
            <div class="print-header">
                <h2>كشف الحساب الإداري الرسمي للميزانية والشهر</h2>
                <p>تاريخ الاستخراج والإصدار: ${now.toLocaleString('ar-EG')}</p>
                <p>مستهدف النطاق الحالي: <strong>${this.state.metadata.monthName}</strong></p>
            </div>
            <table class="print-table">
                <thead>
                    <tr>
                        <th>البيان والملاحظة</th>
                        <th>القسم التشغيلي</th>
                        <th>التصنيف والفئة</th>
                        <th>المبلغ المسدد</th>
                        <th>التاريخ</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            <div class="print-footer">
                <p>Official Financial Statement – Built by Hazem K H Madi - Senior Product Designer</p>
                <p>رابط الهوية المهنية المعتمدة: https://hazemkhmadi.framer.ai</p>
            </div>
        `;

        window.print();
    }

    setupPWALifecycle() {
        // رصد أحداث تثبيت الـ PWA
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.dom.pwaInstallBtn.style.display = 'block';
        });

        this.dom.pwaInstallBtn.addEventListener('click', async () => {
            if (this.deferredPrompt) {
                this.deferredPrompt.prompt();
                const { outcome } = await this.deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    this.dom.pwaInstallBtn.style.display = 'none';
                }
                this.deferredPrompt = null;
            }
        });

        // رصد وتنبيه مستخدمي الـ iOS السفاري
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isIOS && !isStandalone) {
            this.dom.iosInstructions.style.display = 'block';
        }
    }
}

// البدء اللحظي والتشغيل الهندسي
document.addEventListener('DOMContentLoaded', () => {
    window.FintechAppInstance = new FintechAppEngine();
});
