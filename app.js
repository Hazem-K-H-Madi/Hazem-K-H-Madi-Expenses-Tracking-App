/**
 * Advanced Personal Finance Platform Engine
 * Architecture: Isolated Dual-Context State, Optimistic UI UI Logic, Lifecycle Management
 */

(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // Core Application State Schema Definition
    // -------------------------------------------------------------------------
    const AppState = {
        currentContext: 'personal', // 'personal' or 'family'
        balances: {
            personal: 0.00,
            family: 0.00
        },
        transactions: [], // Unified storage array containing context keys
        incomeSources: [
            { id: 'default-1', title: 'الراتب الأساسي', amount: 25000 }
        ],
        allocationRatio: 50, // Allocation speed calculation parameter matching slider
        filters: {
            searchQuery: '',
            category: 'all'
        }
    };

    // Category Metadata System Configuration
    const CategoryColorMap = {
        'السكن': '#3b82f6',
        'الغذاء': '#10b981',
        'النقل': '#f59e0b',
        'الصحة': '#ef4444',
        'الترفيه': '#8b5cf6',
        'التسوق': '#ec4899',
        'أخرى': '#64748b'
    };

    // -------------------------------------------------------------------------
    // Core Database Operations (localStorage Layer Architecture)
    // -------------------------------------------------------------------------
    const StorageEngine = {
        saveAll() {
            try {
                localStorage.setItem('FIN_PWA_BALANCES', JSON.stringify(AppState.balances));
                localStorage.setItem('FIN_PWA_TRANSACTIONS', JSON.stringify(AppState.transactions));
                localStorage.setItem('FIN_PWA_INCOME', JSON.stringify(AppState.incomeSources));
                localStorage.setItem('FIN_PWA_RATIO', AppState.allocationRatio.toString());
            } catch (e) {
                NotificationCenter.toast('خطأ أثناء مزامنة البيانات محلياً', 'danger');
            }
        },
        loadAll() {
            try {
                const storedBalances = localStorage.getItem('FIN_PWA_BALANCES');
                const storedTx = localStorage.getItem('FIN_PWA_TRANSACTIONS');
                const storedInc = localStorage.getItem('FIN_PWA_INCOME');
                const storedRatio = localStorage.getItem('FIN_PWA_RATIO');

                if (storedBalances) AppState.balances = JSON.parse(storedBalances);
                if (storedTx) AppState.transactions = JSON.parse(storedTx);
                if (storedInc) AppState.incomeSources = JSON.parse(storedInc);
                if (storedRatio) AppState.allocationRatio = parseInt(storedRatio, 10);
            } catch (e) {
                NotificationCenter.toast('فشل في تحميل البيانات المخزنة', 'danger');
            }
        }
    };

    // -------------------------------------------------------------------------
    // Micro-interactions Feedback, Animation Request Counters & Toasts
    // -------------------------------------------------------------------------
    const NotificationCenter = {
        toast(message, type = 'primary') {
            const hub = document.getElementById('global-toast-notification-hub');
            if (!hub) return;
            const element = document.createElement('div');
            element.className = `toast-alert-instance toast-${type}`;
            element.innerHTML = `<span>${message}</span>`;
            hub.appendChild(element);
            
            setTimeout(() => {
                element.style.opacity = '0';
                setTimeout(() => element.remove(), 300);
            }, 3500);
        },
        triggerHaptic() {
            if ('vibrate' in navigator) {
                navigator.vibrate(10); // Standard precise physical tactile feedback frame
            }
        }
    };

    // Frame-accurate Counter Interpolation Utility via requestAnimationFrame
    function animateCounterValue(elementId, start, end, duration = 400) {
        const obj = document.getElementById(elementId);
        if (!obj) return;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // EaseOutQuad function optimization
            const easeProgress = progress * (2 - progress);
            const currentVal = start + (end - start) * easeProgress;
            
            obj.textContent = Math.floor(currentVal).toLocaleString('ar-EG', { minimumFractionDigits: 0 });
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                obj.textContent = end.toLocaleString('ar-EG', { minimumFractionDigits: 0 });
            }
        }
        requestAnimationFrame(updateCounter);
    }

    // -------------------------------------------------------------------------
    // Computational Finance Utilities & Insights Engines
    // -------------------------------------------------------------------------
    const FinancialCalculators = {
        calculateBurnRateAndPrediction() {
            const currentContext = AppState.currentContext;
            const currentBalance = AppState.balances[currentContext];
            
            // Filter actions inside target tracking parameters
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth();
            const firstDayOfMonth = new Date(year, month, 1);
            
            const currentMonthTransactions = AppState.transactions.filter(tx => {
                return tx.context === currentContext && new Date(tx.timestamp) >= firstDayOfMonth;
            });

            const totalSpent = currentMonthTransactions.reduce((acc, tx) => acc + parseFloat(tx.amount), 0);
            const daysElapsed = Math.max(now.getDate(), 1);
            const dailyBurnRate = totalSpent / daysElapsed;

            // Render Burn Rate Interface
            const burnDisplay = document.getElementById('burn-rate-display');
            if (burnDisplay) {
                burnDisplay.innerHTML = `${Math.round(dailyBurnRate).toLocaleString('ar-EG')} ج.م <small>/ يوم</small>`;
            }

            // Forecast Runway Execution Logic
            const runwayPredictionDisplay = document.getElementById('runway-prediction-display');
            const runwayStatusTile = document.getElementById('runway-status-tile');
            
            if (!runwayPredictionDisplay || !runwayStatusTile) return;

            if (dailyBurnRate <= 0) {
                runwayPredictionDisplay.textContent = "مستقر وآمن";
                runwayStatusTile.classList.remove('warning-state');
                return;
            }

            const projectedDaysRemaining = currentBalance / dailyBurnRate;
            const currentDayNumber = now.getDate();
            const targetDepletionDay = Math.ceil(currentDayNumber + projectedDaysRemaining);
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            if (targetDepletionDay <= daysInMonth) {
                runwayPredictionDisplay.textContent = `يوم ${targetDepletionDay.toLocaleString('ar-EG')} للشهر الحالي`;
                runwayStatusTile.classList.add('warning-state');
            } else {
                runwayPredictionDisplay.textContent = "آمن لنهاية الشهر";
                runwayStatusTile.classList.remove('warning-state');
            }
        },

        processRecurringTransactions() {
            const lastProcessedMonth = localStorage.getItem('FIN_PWA_LAST_RECURRING_CYCLE');
            const currentMonthKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
            
            if (lastProcessedMonth === currentMonthKey) return; // Cycle already computed historically

            let mutated = false;
            AppState.transactions.forEach(tx => {
                if (tx.isRecurring) {
                    // Create simulated execution projection copy mapping onto the active month
                    mutated = true;
                    AppState.balances[tx.context] -= parseFloat(tx.amount);
                    NotificationCenter.toast(`تطبيق تلقائي للفاتورة الدورية: ${tx.notes || tx.category}`, 'warning');
                }
            });

            if (mutated) {
                localStorage.setItem('FIN_PWA_LAST_RECURRING_CYCLE', currentMonthKey);
                StorageEngine.saveAll();
            }
        }
    };

    // -------------------------------------------------------------------------
    // Core Template View Rendering Engines (UX / UI Management Framework)
    // -------------------------------------------------------------------------
    const InterfaceRenderer = {
        renderAll() {
            this.updateLiveDate();
            this.syncContextView();
            this.renderIncomeRows();
            this.renderTransactionFeed();
            this.renderSVGAnalyticsChart();
            FinancialCalculators.calculateBurnRateAndPrediction();
        },

        updateLiveDate() {
            const dateBox = document.getElementById('live-date-display');
            if (dateBox) {
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
                dateBox.textContent = new Date().toLocaleDateString('ar-EG', options);
            }
        },

        syncContextView() {
            // Context Switching Indicator Positioning Optimization
            const isPersonal = AppState.currentContext === 'personal';
            const indicator = document.querySelector('.active-tab-indicator');
            if (indicator) {
                indicator.style.transform = isPersonal ? 'translateX(0)' : 'translateX(-100%)';
            }

            // Sync Context Classes For Structural Tracking
            const activeTab = document.getElementById(isPersonal ? 'tab-personal' : 'tab-family');
            const inactiveTab = document.getElementById(isPersonal ? 'tab-family' : 'tab-personal');
            
            if (activeTab && inactiveTab) {
                activeTab.classList.add('active');
                activeTab.setAttribute('aria-selected', 'true');
                inactiveTab.classList.remove('active');
                inactiveTab.setAttribute('aria-selected', 'false');
            }

            // Read state dynamic values safely
            const previousDisplayedValue = parseFloat(document.getElementById('live-counter-balance').dataset.lastVal || '0');
            const targetBalanceValue = AppState.balances[AppState.currentContext];
            document.getElementById('live-counter-balance').dataset.lastVal = targetBalanceValue;

            animateCounterValue('live-counter-balance', previousDisplayedValue, targetBalanceValue);
        },

        renderIncomeRows() {
            const container = document.getElementById('income-sources-container');
            if (!container) return;
            container.innerHTML = '';

            AppState.incomeSources.forEach((src) => {
                const div = document.createElement('div');
                div.className = 'income-row-module';
                div.innerHTML = `
                    <input type="text" class="inc-title" value="${src.title}" data-id="${src.id}" placeholder="مصدر الدخل">
                    <input type="number" class="inc-val" value="${src.amount}" data-id="${src.id}" placeholder="القيمة">
                    <button class="remove-income-row-btn" data-id="${src.id}">&times;</button>
                `;
                container.appendChild(div);
            });

            // Re-apply values onto displays
            const slider = document.getElementById('allocation-range-slider');
            if (slider) {
                slider.value = AppState.allocationRatio;
                document.getElementById('ratio-personal-display').textContent = `${AppState.allocationRatio}%`;
                document.getElementById('ratio-family-display').textContent = `${100 - AppState.allocationRatio}%`;
            }
        },

        renderTransactionFeed() {
            const targetFeed = document.getElementById('transactions-feed-target');
            const ledgerCountIndicator = document.getElementById('ledger-count-indicator');
            if (!targetFeed) return;

            targetFeed.innerHTML = '';
            
            // Execute filtered operational parsing arrays
            const filteredData = AppState.transactions.filter(tx => {
                if (tx.context !== AppState.currentContext) return false;
                if (AppState.filters.category !== 'all' && tx.category !== AppState.filters.category) return false;
                if (AppState.filters.searchQuery) {
                    const needle = AppState.filters.searchQuery.toLowerCase();
                    const noteMatch = tx.notes && tx.notes.toLowerCase().includes(needle);
                    const catMatch = tx.category.toLowerCase().includes(needle);
                    const amountMatch = tx.amount.toString().includes(needle);
                    if (!noteMatch && !catMatch && !amountMatch) return false;
                }
                return true;
            });

            if (ledgerCountIndicator) {
                ledgerCountIndicator.textContent = `${filteredData.length} معاملات`;
            }

            if (filteredData.length === 0) {
                targetFeed.innerHTML = `
                    <div class="empty-state-card">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        <p>لا توجد معاملات مسجلة تفي بمتطلبات التصفية المحددة.</p>
                    </div>`;
                return;
            }

            // Render active transaction rows sorting natively by chron order
            filteredData.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(tx => {
                const container = document.createElement('div');
                container.className = 'swipe-item-container';
                container.dataset.id = tx.id;

                const dateFormatted = new Date(tx.timestamp).toLocaleString('ar-EG', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
                
                container.innerHTML = `
                    <div class="swipe-action-underlay-left">حذف فوري</div>
                    <div class="transaction-row-surface" data-id="${tx.id}">
                        <div class="row-identity-block">
                            <div class="category-avatar-badge">${this.getCategoryEmoji(tx.category)}</div>
                            <div class="row-textual-meta">
                                <h4>${tx.notes || tx.category} ${tx.isRecurring ? '<span class="recurring-pill-indicator">دورية</span>' : ''}</h4>
                                <p>${dateFormatted} | ${tx.category}</p>
                            </div>
                        </div>
                        <div class="row-financial-block">
                            <span class="row-amount-value">${parseFloat(tx.amount).toLocaleString('ar-EG')} ج.م</span>
                        </div>
                    </div>
                `;
                targetFeed.appendChild(container);
            });

            // Initialize Event Gesture Listeners on Injected Output Rows
            GestureEngine.bindSwipeMechanics();
        },

        renderSVGAnalyticsChart() {
            const container = document.getElementById('category-donut-chart-box');
            const legendContainer = document.getElementById('chart-legend-container');
            if (!container || !legendContainer) return;

            container.innerHTML = '';
            legendContainer.innerHTML = '';

            // Aggregate transaction category valuations metrics
            const currentContext = AppState.currentContext;
            const totals = {};
            let grandTotal = 0;

            Object.keys(CategoryColorMap).forEach(cat => totals[cat] = 0);
            
            AppState.transactions.filter(tx => tx.context === currentContext).forEach(tx => {
                if (totals[tx.category] !== undefined) {
                    totals[tx.category] += parseFloat(tx.amount);
                } else {
                    totals['أخرى'] += parseFloat(tx.amount);
                }
                grandTotal += parseFloat(tx.amount);
            });

            if (grandTotal === 0) {
                container.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" stroke-width="4"></circle></svg>`;
                legendContainer.innerHTML = '<p style="font-size:11px; color:var(--text-muted)">لم يتم تسجيل قيم مصروفات لعرضها بيانياً.</p>';
                return;
            }

            // Construct Highly Lightweight Programmatic SVG Donut Segment Layers
            let svgContent = `<svg width="100%" height="100%" viewBox="0 0 42 42" class="donut-chart-svg">`;
            let accumulatedPercentage = 0;

            Object.keys(totals).forEach(cat => {
                const val = totals[cat];
                if (val === 0) return;

                const pct = (val / grandTotal) * 100;
                const strokeDashArray = `${pct} ${100 - pct}`;
                const strokeDashOffset = 100 - accumulatedPercentage + 25; // 25 structural starting offset configuration

                svgContent += `<circle cx="21" cy="21" r="15.915" fill="transparent" stroke="${CategoryColorMap[cat]}" stroke-width="5" stroke-dasharray="${strokeDashArray}" stroke-dashoffset="${strokeDashOffset}"></circle>`;
                
                // Add structured row legend elements
                const row = document.createElement('div');
                row.className = 'legend-row-item';
                row.innerHTML = `
                    <div class="legend-pill-info">
                        <span class="color-indicator-dot" style="background-color:${CategoryColorMap[cat]}"></span>
                        <span>${cat}</span>
                    </div>
                    <span class="legend-pct-val">${Math.round(pct).toLocaleString('ar-EG')}%</span>
                `;
                legendContainer.appendChild(row);

                accumulatedPercentage += pct;
            });

            svgContent += `</svg>`;
            container.innerHTML = svgContent;
        },

        getCategoryEmoji(cat) {
            const emojis = { 'السكن': '🏠', 'الغذاء': '🍔', 'النقل': '🚗', 'الصحة': '🏥', 'الترفيه': '🎉', 'التسوق': '🛒', 'أخرى': '📦' };
            return emojis[cat] || '🪙';
        }
    };

    // -------------------------------------------------------------------------
    // Optimistic UI Upgrades & Mutation Command Control Chains (CRUD Controls)
    // -------------------------------------------------------------------------
    const MutationHandlers = {
        executeOptimisticTransactionSave(formData) {
            NotificationCenter.triggerHaptic();
            
            // Generate rollback cache snapshot
            const originalBalances = JSON.stringify(AppState.balances);
            const originalTransactions = JSON.stringify(AppState.transactions);

            const amount = parseFloat(formData.amount);
            const context = AppState.currentContext;

            if (formData.id) {
                // Modifying transaction operational path
                const idx = AppState.transactions.findIndex(t => t.id === formData.id);
                if (idx !== -1) {
                    const oldTx = AppState.transactions[idx];
                    AppState.balances[oldTx.context] += parseFloat(oldTx.amount); // reverse old value calculation
                    
                    AppState.transactions[idx] = {
                        id: formData.id,
                        context: context,
                        amount: amount,
                        category: formData.category,
                        timestamp: formData.timestamp,
                        isRecurring: formData.isRecurring,
                        notes: formData.notes
                    };
                    AppState.balances[context] -= amount;
                }
            } else {
                // New transaction logging trajectory
                const newTx = {
                    id: 'tx-' + Date.now(),
                    context: context,
                    amount: amount,
                    category: formData.category,
                    timestamp: formData.timestamp,
                    isRecurring: formData.isRecurring,
                    notes: formData.notes
                };
                AppState.transactions.push(newTx);
                AppState.balances[context] -= amount;
            }

            // Execute instantaneous rendering upgrade
            InterfaceRenderer.renderAll();
            PortalManager.closeAll();

            // Persistence write processing pipeline
            try {
                StorageEngine.saveAll();
                NotificationCenter.toast('تمت العملية وحفظ السجلات بنجاح', 'success');
            } catch (err) {
                // Rollback execution block sequence
                AppState.balances = JSON.parse(originalBalances);
                AppState.transactions = JSON.parse(originalTransactions);
                InterfaceRenderer.renderAll();
                NotificationCenter.toast('فشل الحفظ ببيانات الجهاز، تم التراجع تلقائياً', 'danger');
            }
        },

        executeOptimisticDelete(txId) {
            NotificationCenter.triggerHaptic();
            const originalBalances = JSON.stringify(AppState.balances);
            const originalTransactions = JSON.stringify(AppState.transactions);

            const txIndex = AppState.transactions.findIndex(t => t.id === txId);
            if (txIndex === -1) return;

            const targetTx = AppState.transactions[txIndex];
            AppState.balances[targetTx.context] += parseFloat(targetTx.amount);
            AppState.transactions.splice(txIndex, 1);

            InterfaceRenderer.renderAll();

            try {
                StorageEngine.saveAll();
                NotificationCenter.toast('تم حذف المعاملة من السجلات الحالية', 'success');
            } catch (e) {
                AppState.balances = JSON.parse(originalBalances);
                AppState.transactions = JSON.parse(originalTransactions);
                InterfaceRenderer.renderAll();
                NotificationCenter.toast('فشل التعديل، تم استرداد السجلات الملغاة', 'danger');
            }
        },

        executeIncomeSplitOperation() {
            let runningSum = 0;
            const rows = document.querySelectorAll('.income-row-module');
            
            // Read active input values dynamically to preserve form text changes
            AppState.incomeSources = [];
            rows.forEach(row => {
                const title = row.querySelector('.inc-title').value || 'مصدر دخل';
                const amount = parseFloat(row.querySelector('.inc-val').value) || 0;
                const id = row.querySelector('.inc-title').dataset.id;
                
                AppState.incomeSources.push({ id, title, amount });
                runningSum += amount;
            });

            if (runningSum <= 0) {
                NotificationCenter.toast('الرجاء إدخال قيم صالحة لمصادر الدخل أولاً', 'warning');
                return;
            }

            const personalShare = (AppState.allocationRatio / 100) * runningSum;
            const familyShare = ((100 - AppState.allocationRatio) / 100) * runningSum;

            AppState.balances.personal += personalShare;
            AppState.balances.family += familyShare;

            StorageEngine.saveAll();
            InterfaceRenderer.renderAll();
            NotificationCenter.toast('تم توزيع الدخل بالتناسب وتحديث الأرصدة المتاحة', 'success');
        }
    };

    // -------------------------------------------------------------------------
    // Mobile Viewports 60fps Gesture Tracking Framework Engine
    // -------------------------------------------------------------------------
    const GestureEngine = {
        bindSwipeMechanics() {
            const rows = document.querySelectorAll('.transaction-row-surface');
            rows.forEach(row => {
                let startX = 0;
                let currentX = 0;
                let isSwiping = false;
                const parent = row.parentElement;
                const maxSwipeDistance = -80; // Distance execution limit parameter for left quick-delete triggers

                row.addEventListener('touchstart', (e) => {
                    startX = e.touches[0].clientX;
                    isSwiping = true;
                    row.style.transition = 'none';
                }, { passive: true });

                row.addEventListener('touchmove', (e) => {
                    if (!isSwiping) return;
                    currentX = e.touches[0].clientX;
                    const diff = currentX - startX;

                    // Restrict swipe movement vector bounds to only handle swipe-left operations
                    if (diff < 0 && diff > maxSwipeDistance * 1.5) {
                        row.style.transform = `translate3d(${diff}px, 0, 0)`;
                    }
                }, { passive: true });

                row.addEventListener('touchend', (e) => {
                    isSwiping = false;
                    row.style.transition = 'transform 0.2s var(--spring-easing)';
                    const diff = currentX - startX;

                    if (diff <= maxSwipeDistance) {
                        row.style.transform = `translate3d(${maxSwipeDistance}px, 0, 0)`;
                        setTimeout(() => {
                            if (confirm('هل تود بالتأكيد حذف هذه المعاملة عبر المسح السريع؟')) {
                                MutationHandlers.executeOptimisticDelete(parent.dataset.id);
                            } else {
                                row.style.transform = 'translate3d(0,0,0)';
                            }
                        }, 50);
                    } else {
                        row.style.transform = 'translate3d(0,0,0)';
                    }
                });
            });
        }
    };

    // -------------------------------------------------------------------------
    // Portal Sheet Modal Management Overlays Lifecycle Block
    // -------------------------------------------------------------------------
    const PortalManager = {
        openTransactionPortal(txId = null) {
            const modal = document.getElementById('transaction-portal-modal');
            const form = document.getElementById('transaction-mutation-form');
            const title = document.getElementById('portal-modal-title');
            
            if (!modal || !form) return;
            form.reset();
            document.getElementById('form-mutation-id').value = '';
            
            // Configure default execution date parsing target values
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            document.getElementById('form-date-input-field').value = now.toISOString().slice(0,16);

            if (txId) {
                title.textContent = 'تعديل المعاملة المالية';
                const tx = AppState.transactions.find(t => t.id === txId);
                if (tx) {
                    document.getElementById('form-mutation-id').value = tx.id;
                    document.getElementById('form-amount-input').value = tx.amount;
                    document.getElementById('form-category-select').value = tx.category;
                    document.getElementById('form-date-input-field').value = new Date(tx.timestamp).toISOString().slice(0,16);
                    document.getElementById('form-recurring-checkbox').checked = tx.isRecurring;
                    document.getElementById('form-notes-textarea').value = tx.notes || '';
                }
            } else {
                title.textContent = 'تسجيل مصروفة جديدة';
            }

            modal.classList.add('active-portal');
            modal.setAttribute('aria-hidden', 'false');
        },

        openSettingsPortal() {
            const modal = document.getElementById('settings-portal-modal');
            if (modal) {
                modal.classList.add('active-portal');
                modal.setAttribute('aria-hidden', 'false');
            }
        },

        closeAll() {
            const portals = document.querySelectorAll('.portal-overlay-backdrop');
            portals.forEach(p => {
                p.classList.remove('active-portal');
                p.setAttribute('aria-hidden', 'true');
            });
        }
    };

    // -------------------------------------------------------------------------
    // Administrative Financial Statement Printing Layout Generation Engine
    // -------------------------------------------------------------------------
    const PrintStatementEngine = {
        generateAndPrint() {
            const printTarget = document.getElementById('hidden-print-administrative-template');
            if (!printTarget) return;

            const currentContextName = AppState.currentContext === 'personal' ? 'المصروفات الشخصية' : 'مصروفات المنزل والعائلة';
            const sortedTx = AppState.transactions
                .filter(t => t.context === AppState.currentContext)
                .sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));

            let tableRowsHtml = '';
            sortedTx.forEach((t, i) => {
                tableRowsHtml += `
                    <tr>
                        <td>${(i+1).toLocaleString('ar-EG')}</td>
                        <td>${new Date(t.timestamp).toLocaleDateString('ar-EG')}</td>
                        <td>${t.category}</td>
                        <td>${t.notes || '---'}</td>
                        <td style="direction:ltr;">${parseFloat(t.amount).toLocaleString('ar-EG')} ج.م</td>
                    </tr>
                `;
            });

            printTarget.innerHTML = `
                <div class="print-header">
                    <h1 style="font-size:22px; margin-bottom:5px;">كشف الحساب المالي الإداري الرسمي</h1>
                    <p style="font-size:12px; color:#555;">نوع الحساب المالي: ${currentContextName} | تاريخ إصدار التقرير الفعلي: ${new Date().toLocaleString('ar-EG')}</p>
                    <p style="font-size:14px; margin-top:10px; font-weight:bold;">الرصيد المتاح الحالي للحساب: ${AppState.balances[AppState.currentContext].toLocaleString('ar-EG')} ج.م</p>
                </div>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>التاريخ</th>
                            <th>التصنيف</th>
                            <th>البيان والملاحظات</th>
                            <th>القيمة المالية</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRowsHtml || '<tr><td colspan="5" style="text-align:center;">لا توجد معاملات مسجلة في هذا النطاق المالي الحركي.</td></tr>'}
                    </tbody>
                </table>
                <div style="margin-top:40px; border-top:1px dashed #000; padding-top:15px; font-size:10px; text-align:center; direction:ltr !important;">
                    Official Financial Statement – Built by Hazem K H Madi - Senior Product Designer
                </div>
            `;

            window.print();
        }
    };

    // -------------------------------------------------------------------------
    // Global Event Delegation & Application Lifecycle Initialization Bindings
    // -------------------------------------------------------------------------
    function initEventDelegation() {
        // App-Level Context Tabs Switchers
        document.querySelectorAll('.context-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetContext = e.currentTarget.dataset.context;
                if (AppState.currentContext !== targetContext) {
                    AppState.currentContext = targetContext;
                    InterfaceRenderer.syncContextView();
                    InterfaceRenderer.renderTransactionFeed();
                    InterfaceRenderer.renderSVGAnalyticsChart();
                    FinancialCalculators.calculateBurnRateAndPrediction();
                }
            });
        });

        // Theme Toggle Button
        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                const container = document.getElementById('app-container');
                const sunIcon = themeBtn.querySelector('.sun-icon');
                const moonIcon = themeBtn.querySelector('.moon-icon');
                const metaThemeColor = document.getElementById('theme-meta-color');

                if (container.classList.contains('app-light-mode')) {
                    container.classList.remove('app-light-mode');
                    container.classList.add('app-dark-mode');
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                    if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a');
                } else {
                    container.classList.remove('app-dark-mode');
                    container.classList.add('app-light-mode');
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                    if (metaThemeColor) metaThemeColor.setAttribute('content', '#ffffff');
                }
            });
        }

        // Floating Action Button Trigger Portal Open
        const fab = document.getElementById('global-fab-trigger');
        if (fab) fab.addEventListener('click', () => PortalManager.openTransactionPortal());

        // Portals Core Exit Controls
        document.getElementById('portal-close-btn').addEventListener('click', PortalManager.closeAll);
        document.getElementById('form-cancel-btn').addEventListener('click', PortalManager.closeAll);
        document.getElementById('settings-close-btn').addEventListener('click', PortalManager.closeAll);
        
        // Settings Portal Trigger Activation
        document.getElementById('settings-trigger-btn').addEventListener('click', PortalManager.openSettingsPortal);

        // Core Form Mutation Execution Submit Link
        const mutationForm = document.getElementById('transaction-mutation-form');
        if (mutationForm) {
            mutationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {
                    id: document.getElementById('form-mutation-id').value || null,
                    amount: document.getElementById('form-amount-input').value,
                    category: document.getElementById('form-category-select').value,
                    timestamp: document.getElementById('form-date-input-field').value,
                    isRecurring: document.getElementById('form-recurring-checkbox').checked,
                    notes: document.getElementById('form-notes-textarea').value
                };
                MutationHandlers.executeOptimisticTransactionSave(formData);
            });
        }

        // Income Splitter Execution Trigger
        document.getElementById('execute-split-btn').addEventListener('click', MutationHandlers.executeIncomeSplitOperation);

        // Allocation Slider Real-time Input Monitor
        const allocationSlider = document.getElementById('allocation-range-slider');
        if (allocationSlider) {
            allocationSlider.addEventListener('input', (e) => {
                AppState.allocationRatio = parseInt(e.target.value, 10);
                document.getElementById('ratio-personal-display').textContent = `${AppState.allocationRatio}%`;
                document.getElementById('ratio-family-display').textContent = `${100 - AppState.allocationRatio}%`;
            });
        }

        // Add Income Line Component Dynamically
        document.getElementById('add-income-source-btn').addEventListener('click', () => {
            AppState.incomeSources.push({ id: 'inc-' + Date.now(), title: '', amount: 0 });
            InterfaceRenderer.renderIncomeRows();
        });

        // Event Delegation For Income Source Removal Target Rows
        const incomeContainer = document.getElementById('income-sources-container');
        if (incomeContainer) {
            incomeContainer.addEventListener('click', (e) => {
                if (e.target.classList.contains('remove-income-row-btn')) {
                    const rowId = e.target.dataset.id;
                    AppState.incomeSources = AppState.incomeSources.filter(s => s.id !== rowId);
                    InterfaceRenderer.renderIncomeRows();
                }
            });
        }

        // Category Filter Chips Carousel Selection Engine Handles
        const filterCarousel = document.getElementById('category-filter-carousel');
        if (filterCarousel) {
            filterCarousel.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-chip')) {
                    filterCarousel.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    AppState.filters.category = e.target.dataset.category;
                    InterfaceRenderer.renderTransactionFeed();
                }
            });
        }

        // Real-Time Transaction Predictive Search Filtering Input Bar
        const searchInput = document.getElementById('transaction-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                AppState.filters.searchQuery = e.target.value;
                InterfaceRenderer.renderTransactionFeed();
            });
        }

        // Global Transaction Feed Inline Portal Expansion Hook (Edit Trigger via Delegation)
        const feedContainer = document.getElementById('transactions-feed-target');
        if (feedContainer) {
            feedContainer.addEventListener('click', (e) => {
                const surfaceRow = e.target.closest('.transaction-row-surface');
                if (surfaceRow) {
                    const txId = surfaceRow.dataset.id;
                    PortalManager.openTransactionPortal(txId);
                }
            });
        }

        // Quick-Action Clear Recurring Deductions Engine Button
        document.getElementById('clear-recurring-quick-btn').addEventListener('click', () => {
            if (confirm('هل تود إلغاء تفعيل حالة التكرار الدوري التلقائي لكافة النفقات المثبتة حالياً؟')) {
                AppState.transactions.forEach(t => { if (t.context === AppState.currentContext) t.isRecurring = false; });
                StorageEngine.saveAll();
                InterfaceRenderer.renderAll();
                NotificationCenter.toast('تم إلغاء الحالة الدورية لكافة فواتير هذا القسم الحركي', 'success');
            }
        });

        // Administrative Balance Sheet Printing Document Action Button
        document.getElementById('export-statement-btn').addEventListener('click', () => {
            PortalManager.closeAll();
            setTimeout(() => { PrintStatementEngine.generateAndPrint(); }, 350);
        });
    }

    // -------------------------------------------------------------------------
    // Native-Feel Custom PWA Intercept Installation Engine Installation
    // -------------------------------------------------------------------------
    let deferredAppPrompt = null;
    function setupPWAPromptEngine() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredAppPrompt = e;
            const banner = document.getElementById('pwa-install-banner-block');
            if (banner) banner.style.display = 'flex';
        });

        const installBtn = document.getElementById('pwa-install-action-btn');
        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (!deferredAppPrompt) return;
                deferredAppPrompt.prompt();
                const { outcome } = await deferredAppPrompt.userChoice;
                if (outcome === 'accepted') {
                    const banner = document.getElementById('pwa-install-banner-block');
                    if (banner) banner.style.display = 'none';
                }
                deferredAppPrompt = null;
            });
        }

        // Inline Fallback Identification For iOS Safari Targets
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isIOS && !isStandalone) {
            const banner = document.getElementById('pwa-install-banner-block');
            const installActionBtn = document.getElementById('pwa-install-action-btn');
            const iosGuide = document.getElementById('ios-safari-guide');
            
            if (banner) banner.style.display = 'flex';
            if (installActionBtn) installActionBtn.style.display = 'none';
            if (iosGuide) iosGuide.style.display = 'block';
        }
    }

    // -------------------------------------------------------------------------
    // Execution Core App Bootstrap
    // -------------------------------------------------------------------------
    window.addEventListener('DOMContentLoaded', () => {
        StorageEngine.loadAll();
        initEventDelegation();
        setupPWAPromptEngine();
        FinancialCalculators.processRecurringTransactions();
        InterfaceRenderer.renderAll();

        // Register Service Worker Isolation Engine Target Block
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('service-worker.js')
                .catch(err => console.error('PWA SW Register Aborted:', err));
        }
    });

})();
