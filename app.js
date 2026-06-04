/**
 * ==========================================================================
 * Smart Wallet PWA Core State Management Module Engine
 * Architecture Year: 2026
 * Creator: Hazem K H Madi - Senior Product Designer
 * ==========================================================================
 */

(function () {
    'use strict';

    // Application Universal Centralized State Matrix
    let state = {
        income: { salary: 0, freelance: 0, investments: 0 },
        allocationPct: 50, // Represents Percentage allocated to Personal pool
        personal: { allocated: 0, spent: 0, remaining: 0, expenses: [] },
        family: { allocated: 0, spent: 0, remaining: 0, expenses: [] },
        currentTab: 'personal', // 'personal' | 'family'
        settings: { theme: 'dark', accent: 'emerald' }
    };

    // ChartJS Global Instance Reference Pointer
    let categoryChartInstance = null;
    let deferredPrompt = null; // PWA installation listener hook

    /**
     * Database Persistence Layer (LocalStorage Adapters)
     */
    function saveStateToLocalStorage() {
        localStorage.setItem('hazem_finance_pwa_state', JSON.stringify(state));
    }

    function loadStateFromLocalStorage() {
        const cached = localStorage.getItem('hazem_finance_pwa_state');
        if (cached) {
            try {
                state = JSON.parse(cached);
            } catch (e) {
                console.error("خطأ فادح في قراءة قاعدة البيانات المحلية التالفة. استعادة الافتراضيات.", e);
            }
        }
    }

    /**
     * Application Initialization Sequence Workflow Entrypoint
     */
    window.addEventListener('DOMContentLoaded', () => {
        loadStateFromLocalStorage();
        initPWAEnvironment();
        applySystemSettings();
        synchronizeUIFields();
        calculateFinancialPools(false); // Silent calculation check routine
        renderActiveDashboard();
        attachCoreEventListeners();
        
        // Terminate Loader Screen Overlay smoothly
        setTimeout(() => {
            const loader = document.getElementById('app-loader');
            if (loader) {
                loader.style.opacity = '0';
                setTimeout(() => loader.classList.add('hidden'), 400);
            }
        }, 600);
    });

    /**
     * Progressive Web App (PWA) Offline & Lifecycle Systems Registration Engine
     */
    function initPWAEnvironment() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .then(reg => console.log('تم تسجيل Service Worker بنجاح بنطاق التتبع 오프라인:', reg.scope))
                .catch(err => console.error('فشل تسجيل ملف Service Worker المرجعي الأساسي:', err));
        }

        // Custom intercept handling for browser native download prompts
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            // Un-hide specialized structural download banners
            document.getElementById('install-banner').classList.remove('hidden');
            document.getElementById('btn-install-shortcut').classList.remove('hidden');
        });
    }

    /**
     * Custom Application Settings & Aesthetic Layout Drivers
     */
    function applySystemSettings() {
        const root = document.documentElement;
        root.setAttribute('data-theme', state.settings.theme);
        root.setAttribute('data-accent', state.settings.accent);

        // Synchronize settings active configurations inside elements DOM
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme-val') === state.settings.theme);
        });
        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.classList.toggle('active', dot.getAttribute('data-accent-val') === state.settings.accent);
        });
    }

    function synchronizeUIFields() {
        document.getElementById('inc-salary').value = state.income.salary || '';
        document.getElementById('inc-freelance').value = state.income.freelance || '';
        document.getElementById('inc-investments').value = state.income.investments || '';
        document.getElementById('allocation-slider').value = state.allocationPct;
        document.getElementById('exp-date').value = new Date().toISOString().split('T')[0];
    }

    /**
     * Core Financial Logic: Dynamic Allocation Calculation Module
     */
    function calculateFinancialPools(shouldTriggerToast = true) {
        const sal = parseFloat(document.getElementById('inc-salary').value) || 0;
        const free = parseFloat(document.getElementById('inc-freelance').value) || 0;
        const inv = parseFloat(document.getElementById('inc-investments').value) || 0;

        state.income.salary = sal;
        state.income.freelance = free;
        state.income.investments = inv;

        const totalIncome = sal + free + inv;
        state.allocationPct = parseInt(document.getElementById('allocation-slider').value);

        // Core Mathematical Split Logic
        const personalShare = totalIncome * (state.allocationPct / 100);
        const familyShare = totalIncome * ((100 - state.allocationPct) / 100);

        state.personal.allocated = personalShare;
        state.family.allocated = familyShare;

        // Re-evaluate cumulative dynamic subtraction sums loops
        state.personal.spent = state.personal.expenses.reduce((sum, item) => sum + item.amount, 0);
        state.family.spent = state.family.expenses.reduce((sum, item) => sum + item.amount, 0);

        state.personal.remaining = state.personal.allocated - state.personal.spent;
        state.family.remaining = state.family.allocated - state.family.spent;

        saveStateToLocalStorage();
        updateVisualCounters(totalIncome, personalShare, familyShare);

        if (shouldTriggerToast) {
            spawnToastNotification("تمت إعادة جدولة الحسابات وتثبيت الميزانيات الموزعة بنجاح.");
        }
    }

    /**
     * Refined Animation Logic: Counter-Up Fluid Acceleration Mechanics
     */
    function updateVisualCounters(totalInc, pAlloc, fAlloc) {
        animateNumberDisplay('total-income-val', totalInc);
        animateNumberDisplay('val-alloc-personal', pAlloc);
        animateNumberDisplay('val-alloc-family', fAlloc);
        
        document.getElementById('pct-personal').innerText = `${state.allocationPct}%`;
        document.getElementById('pct-family').innerText = `${100 - state.allocationPct}%`;
    }

    function animateNumberDisplay(targetId, finalValue) {
        const element = document.getElementById(targetId);
        if (!element) return;
        
        const startValue = parseFloat(element.innerText.replace(/,/g, '')) || 0;
        const duration = 800; // ms duration
        let startTime = null;

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // EaseOut Quad Formula
            const easeProgress = progress * (2 - progress);
            const currentNum = startValue + (easeProgress * (finalValue - startValue));
            
            element.innerText = currentNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        }
        window.requestAnimationFrame(step);
    }

    /**
     * Complete Visual Interface Render Core Pipeline Orchestrator
     */
    function renderActiveDashboard() {
        const currentData = state[state.currentTab];
        
        // Counter Updates for current selected channel view
        animateNumberDisplay('dash-allocated', currentData.allocated);
        animateNumberDisplay('dash-spent', currentData.spent);
        animateNumberDisplay('dash-remaining', currentData.remaining);

        // Low Budget Visual Warning Condition Evaluator (< 15%)
        const cardRemaining = document.getElementById('card-remaining');
        const alertBanner = document.getElementById('budget-warning-alert');
        
        const threshold = currentData.allocated * 0.15;
        if (currentData.allocated > 0 && currentData.remaining < threshold) {
            cardRemaining.classList.add('low-budget');
            alertBanner.classList.remove('hidden');
        } else {
            cardRemaining.classList.remove('low-budget');
            alertBanner.classList.add('hidden');
        }

        renderLedgerHistoryList(currentData.expenses);
        buildFinancialPieChart(currentData.expenses);
    }

    function renderLedgerHistoryList(expenses) {
        const container = document.getElementById('ledger-list');
        const emptyState = document.getElementById('ledger-empty-state');
        document.getElementById('ledger-count').innerText = `${expenses.length} عمليات متبقية`;

        container.innerHTML = '';
        
        if (expenses.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        emptyState.classList.add('hidden');

        // Reverse chronologically sorted tracking view output
        const renderQueue = [...expenses].reverse();

        renderQueue.forEach(item => {
            const li = document.createElement('li');
            li.className = 'ledger-item';
            li.innerHTML = `
                <div class="ledger-item-right">
                    <div class="category-icon-tag">${extractCategoryIcon(item.category)}</div>
                    <div class="item-details">
                        <h4>${escapeHTML(item.description || 'مصروف عام بدون وصف')}</h4>
                        <span>${item.date} | الفئة: <small>${item.category}</small></span>
                    </div>
                </div>
                <div class="ledger-item-left">
                    <span class="item-amount-badge">${item.amount.toFixed(2)} ج.م</span>
                    <button class="btn-reverse-transaction" data-id="${item.id}" title="عكس وقيد استرداد مالي">
                        <i class="fa-solid fa-arrow-rotate-left"></i>
                    </button>
                </div>
            `;
            container.appendChild(li);
        });
    }

    function extractCategoryIcon(cat) {
        const tokens = cat.split(' ');
        return tokens.length > 1 ? tokens[0] : '💸';
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    /**
     * Specialized Analytics View Canvas Engine Management ChartJS Integration
     */
    function buildFinancialPieChart(expenses) {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        const emptyState = document.getElementById('chart-empty-state');
        
        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }

        if (expenses.length === 0) {
            emptyState.classList.remove('hidden');
            document.getElementById('categoryChart').style.display = 'none';
            return;
        }
        emptyState.classList.add('hidden');
        document.getElementById('categoryChart').style.display = 'block';

        // Aggregate category structures totals
        const categoricalTotals = {};
        expenses.forEach(e => {
            categoricalTotals[e.category] = (categoricalTotals[e.category] || 0) + e.amount;
        });

        const labels = Object.keys(categoricalTotals);
        const dataValues = Object.values(categoricalTotals);
        
        // Fetch matching specific computational palette accents
        const primaryAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

        categoryChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: dataValues,
                    backgroundColor: [
                        primaryAccent, '#6366f1', '#f59e0b', '#ef4444', 
                        '#ec4899', '#a855f7', '#06b6d4', '#14b8a6'
                    ],
                    borderWidth: 2,
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-secondary').trim()
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        rtl: true,
                        labels: {
                            font: { family: 'Cairo', size: 11 },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim()
                        }
                    },
                    tooltip: {
                        rtl: true,
                        bodyFont: { family: 'Cairo' },
                        titleFont: { family: 'Cairo' }
                    }
                },
                cutout: '65%'
            }
        });
    }

    /**
     * Command Processing Pipeline: Transaction Operations Entries Form Injection
     */
    function processExpenseSubmission() {
        const amountEl = document.getElementById('exp-amount');
        const catEl = document.getElementById('exp-category');
        const descEl = document.getElementById('exp-desc');
        const dateEl = document.getElementById('exp-date');

        const amount = parseFloat(amountEl.value);
        const category = catEl.value;
        const description = descEl.value.trim();
        const date = dateEl.value;

        if (isNaN(amount) || amount <= 0 || !category || !date) {
            spawnToastNotification("خطأ فادح: يرجى استكمال الحقول المطلوبة بشكل صحيح وقيد مالي دقيق.", "error");
            return;
        }

        const newTransaction = {
            id: 'tx-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            amount,
            category,
            description,
            date
        };

        // Push transactional block elements directly inside active database isolated scope
        state[state.currentTab].expenses.push(newTransaction);
        
        // Instant Recalculation Routine Loop trigger
        calculateFinancialPools(false);
        renderActiveDashboard();

        // Clear Fields Wrapper
        amountEl.value = '';
        descEl.value = '';
        
        spawnToastNotification("تم ترحيل وقيد العملية المالية وإهلاكها من الميزانية المتاحة بنجاح.");
    }

    function reverseTransactionRecord(id) {
        const operationalList = state[state.currentTab].expenses;
        const index = operationalList.findIndex(e => e.id === id);
        
        if (index !== -1) {
            operationalList.splice(index, 1);
            calculateFinancialPools(false);
            renderActiveDashboard();
            spawnToastNotification("تم إلغاء القيد المالي المرجعي وإرجاع المبلغ التقديري للرصيد الحسابي الحاضر.");
        }
    }

    /**
     * High Performance Advanced Custom Financial Export PDF/PNG Processing Platform Engine
     */
    function triggerDocumentExportEngine(formatType) {
        const currentData = state[state.currentTab];
        const tabTitleArabic = state.currentTab === 'personal' ? "المصروفات الشخصية (المحفظة الخاصة)" : "مصروفات المنزل والعائلة (الميزانية المشتركة)";
        
        // Bind latest actual database states inside offline shadow context template wrapper DOM
        document.getElementById('print-timestamp').innerText = new Date().toLocaleString('ar-EG');
        document.getElementById('print-report-type').innerText = tabTitleArabic;
        document.getElementById('print-income-total').innerText = (state.income.salary + state.income.freelance + state.income.investments).toFixed(2) + " ج.م";
        document.getElementById('print-allocated-total').innerText = currentData.allocated.toFixed(2) + " ج.m";
        document.getElementById('print-spent-total').innerText = currentData.spent.toFixed(2) + " ج.م";
        document.getElementById('print-remaining-total').innerText = currentData.remaining.toFixed(2) + " ج.م";

        const tableBody = document.getElementById('print-table-rows');
        tableBody.innerHTML = '';

        if (currentData.expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#94a3b8;">لا توجد قيود مسجلة بكشف الحساب الحالي.</td></tr>`;
        } else {
            currentData.expenses.forEach(e => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${e.date}</td>
                    <td>${e.category}</td>
                    <td>${escapeHTML(e.description || 'بدون بيان')}</td>
                    <td style="color:#ef4444;font-weight:bold;">${e.amount.toFixed(2)} ج.م</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        // Invoke Snapshot Renderer Logic Container Engine Context
        const captureTarget = document.getElementById('hidden-print-template');
        
        // Canvas Translation Strategy Execution parameters
        html2canvas(captureTarget, {
            scale: 2, // Retain high resolution vector graphics printing text standard
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            if (formatType === 'png') {
                const imgData = canvas.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = `SmartWallet_Report_${state.currentTab}_2026.png`;
                link.href = imgData;
                link.click();
                spawnToastNotification("تم تصدير وحفظ مستند التقرير الصوري PNG بنجاح بجهازك.");
            } else if (formatType === 'pdf') {
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
                const { jsPDF } = window.jspdf;
                
                // Build dynamic aspect mapping bounding calculations standard A4 document canvas
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgWidth = 210; // A4 standard width bounds
                const pageHeight = 295;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;
                }
                
                pdf.save(`SmartWallet_Statement_${state.currentTab}_2026.pdf`);
                spawnToastNotification("تم إنشاء وتنزيل ملف كشف الحساب المالي PDF المعتمد بنجاح.");
            }
        }).catch(err => {
            console.error("خطأ فني في معالجة التقارير المصدرة:", err);
            spawnToastNotification("فشل تفعيل المحرك: حدث خطأ أثناء تشكيل المستند الداخلي.", "error");
        });
    }

    /**
     * Notification Pipeline UI Micro-interactions Wrapper Layer
     */
    function spawnToastNotification(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type === 'error' ? 'error' : ''}`;
        toast.innerHTML = `<i class="fa-solid ${type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check'}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);
        // Force Reflow browser event trigger mapping animation transition logic
        toast.offsetHeight; 
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    /**
     * Unified Declarative Core Event Management Registration Hub Loop
     */
    function attachCoreEventListeners() {
        // Budget lock submission interaction execution
        document.getElementById('btn-lock-allocation').addEventListener('click', () => calculateFinancialPools(true));

        // Income/Slider live updates layout changes checks
        document.getElementById('allocation-slider').addEventListener('input', () => {
            calculateFinancialPools(false);
        });

        // Main Tab Intercept Switching Core Loop logic binding
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const selectedTab = e.currentTarget.getAttribute('data-tab');
                if (state.currentTab === selectedTab) return;

                document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');

                state.currentTab = selectedTab;
                saveStateToLocalStorage();
                renderActiveDashboard();
                
                // Visual Simulation haptic ripple feed response trigger
                spawnToastNotification(`تم الانتقال للعمل على قناة: ${state.currentTab === 'personal' ? 'المحفظة الشخصية' : 'ميزانية العائلة'}`);
            });
        });

        // Form Submission interceptor entry points
        document.getElementById('btn-add-expense').addEventListener('click', processExpenseSubmission);

        // Delegation loop monitoring list deletions
        document.getElementById('ledger-list').addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-reverse-transaction');
            if (btn) {
                const transactionId = btn.getAttribute('data-id');
                reverseTransactionRecord(transactionId);
            }
        });

        // Export Mechanism Click Bindings Execution triggers
        document.getElementById('btn-export-png').addEventListener('click', () => triggerDocumentExportEngine('png'));
        document.getElementById('btn-export-pdf').addEventListener('click', () => triggerDocumentExportEngine('pdf'));

        // Settings Drawer UI Interface controls trigger logic
        const settingsDrawer = document.getElementById('settings-drawer');
        document.getElementById('btn-toggle-settings').addEventListener('click', () => settingsDrawer.classList.remove('hidden'));
        document.getElementById('btn-close-settings').addEventListener('click', () => settingsDrawer.classList.add('hidden'));
        document.querySelector('.drawer-overlay').addEventListener('click', () => settingsDrawer.classList.add('hidden'));

        // Theme switching processing loops engines setup
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                state.settings.theme = e.currentTarget.getAttribute('data-theme-val');
                saveStateToLocalStorage();
                applySystemSettings();
                renderActiveDashboard(); // Force recreate matching palette elements canvas context
            });
        });

        document.querySelectorAll('.accent-dot').forEach(dot => {
            dot.addEventListener('click', (e) => {
                state.settings.accent = e.currentTarget.getAttribute('data-accent-val');
                saveStateToLocalStorage();
                applySystemSettings();
                renderActiveDashboard();
            });
        });

        // Native System Prompts PWA Installation Event triggers execution listeners code
        document.getElementById('btn-install-confirm').addEventListener('click', () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('وافق المستخدم المحترف على تثبيت النظام المالي بنجاح.');
                    }
                    deferredPrompt = null;
                    document.getElementById('install-banner').classList.add('hidden');
                });
            }
        });

        document.getElementById('btn-install-cancel').addEventListener('click', () => {
            document.getElementById('install-banner').classList.add('hidden');
        });

        document.getElementById('btn-install-shortcut').addEventListener('click', () => {
            const confirmBtn = document.getElementById('btn-install-confirm');
            if (confirmBtn) confirmBtn.click();
        });
    }

})();
