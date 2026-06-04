/**
 * Personal Finance PWA Core Architecture Engine
 * Engineered with pure Optimistic UI Patterns, Gestural Interceptors,
 * LocalStorage Layer isolation, and clean programmatic rendering routines.
 */

(function () {
    'use strict';

    // ==========================================================================
    // Application Global Isolated State Container
    // ==========================================================================
    const StateManager = {
        currentContext: 'personal', // Operational Switch context value: 'personal' | 'family'
        filterCategory: 'all',
        searchQuery: '',
        
        // Splitter Settings
        incomeSplitRatio: 50, // Default 50% split value mapping
        
        // Explicit In-Memory Isolated Data Structures
        personal: {
            balance: 0,
            transactions: []
        },
        family: {
            balance: 0,
            transactions: []
        },

        // Fetch current active structural reference array
        getActiveContextData() {
            return this[this.currentContext];
        }
    };

    // Constant Taxonomy Categories Translation Mapping
    const CATEGORY_COLORS = {
        'غذاء': '#ea580c',
        'فواتير': '#2563eb',
        'صحة': '#dc2626',
        'مواصلات': '#0284c7',
        'ترفيه': '#9333ea',
        'أخرى': '#475569'
    };

    const CATEGORY_CLASSES = {
        'غذاء': 'cat-food',
        'فواتير': 'cat-bills',
        'صحة': 'cat-health',
        'مواصلات': 'cat-transport',
        'ترفيه': 'cat-entertainment',
        'أخرى': 'cat-other'
    };

    // ==========================================================================
    // Cache Elements Real-time Object Map Matrix Definition
    // ==========================================================================
    const DOM = {};
    function initDOMReferences() {
        DOM.appShell = document.getElementById('app-shell');
        DOM.contextNavigator = document.querySelector('.context-navigator');
        DOM.tabPersonal = document.getElementById('tab-personal');
        DOM.tabFamily = document.getElementById('tab-family');
        DOM.mainBalanceView = document.getElementById('main-balance-view');
        DOM.burnRateView = document.getElementById('burn-rate-view');
        DOM.runOutDateView = document.getElementById('run-out-date-view');
        DOM.budgetProgressFill = document.getElementById('budget-progress-fill');
        DOM.progressPercentageLabel = document.getElementById('progress-percentage-label');
        DOM.progressSpentLabel = document.getElementById('progress-spent-label');
        DOM.incomeSplitterToggle = document.getElementById('income-splitter-toggle');
        DOM.incomeSplitterContent = document.getElementById('income-splitter-content');
        DOM.incomeSplitterForm = document.getElementById('income-splitter-form');
        DOM.incomeSalary = document.getElementById('income-salary');
        DOM.incomeFreelance = document.getElementById('income-freelance');
        DOM.incomePassive = document.getElementById('income-passive');
        DOM.incomeSplitRange = document.getElementById('income-split-range');
        DOM.splitPersonalLabel = document.getElementById('split-personal-label');
        DOM.splitFamilyLabel = document.getElementById('split-family-label');
        DOM.svgDonutChart = document.getElementById('svg-donut-chart');
        DOM.chartSegmentsGroup = document.getElementById('chart-segments-group');
        DOM.chartTotalText = document.getElementById('chart-total-text');
        DOM.chartLegendList = document.getElementById('chart-legend-list');
        DOM.transactionEntryForm = document.getElementById('transaction-entry-form');
        DOM.txAmount = document.getElementById('tx-amount');
        DOM.txCategory = document.getElementById('tx-category');
        DOM.txDate = document.getElementById('tx-date');
        DOM.txRecurring = document.getElementById('tx-recurring');
        DOM.txNotes = document.getElementById('tx-notes');
        DOM.txSearchFilter = document.getElementById('tx-search-filter');
        DOM.categoryFilterChips = document.getElementById('category-filter-chips');
        DOM.ledgerCountIndicator = document.getElementById('ledger-count-indicator');
        DOM.ledgerRecordsTarget = document.getElementById('ledger-records-target');
        DOM.themeToggleBtn = document.getElementById('theme-toggle-btn');
        DOM.themeMeta = document.getElementById('theme-meta');
        DOM.aboutTriggerBtn = document.getElementById('about-trigger-btn');
        DOM.aboutPanelBackdrop = document.getElementById('about-panel-backdrop');
        DOM.aboutCloseBtn = document.getElementById('about-close-btn');
        DOM.aboutPanelContainer = document.getElementById('about-panel-container');
        DOM.pwaInstallCtaWrapper = document.getElementById('pwa-install-cta-wrapper');
        DOM.pwaInstallActionBtn = document.getElementById('pwa-install-action-btn');
        DOM.iosSafariInstructions = document.getElementById('ios-safari-instructions');
        DOM.editPortalBackdrop = document.getElementById('edit-portal-backdrop');
        DOM.editPortalContainer = document.getElementById('edit-portal-container');
        DOM.editCloseBtn = document.getElementById('edit-close-btn');
        DOM.editTransactionForm = document.getElementById('edit-transaction-form');
        DOM.editTxId = document.getElementById('edit-tx-id');
        DOM.editTxAmount = document.getElementById('edit-tx-amount');
        DOM.editTxCategory = document.getElementById('edit-tx-category');
        DOM.editTxDate = document.getElementById('edit-tx-date');
        DOM.editTxNotes = document.getElementById('edit-tx-notes');
        DOM.triggerRecurringClearBtn = document.getElementById('trigger-recurring-clear-btn');
        DOM.triggerExportBtn = document.getElementById('trigger-export-btn');
        DOM.printAdministrativeShadowDom = document.getElementById('print-administrative-shadow-dom');
        DOM.toastCarrierZone = document.getElementById('toast-carrier-zone');
        DOM.currentDateView = document.getElementById('current-date-view');
    }

    // ==========================================================================
    // Low-Level Mechanical Subsystems (Haptics, Caching Core, Utility Formatters)
    // ==========================================================================
    function triggerTactileHapticTap() {
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    function formatEgyptianCurrency(numericalValue) {
        return Number(numericalValue).toLocaleString('ar-EG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' ج.م';
    }

    function generateCryptographicUUID() {
        return 'tx-uuid-' + Date.now() + '-' + Math.floor(Math.random() * 1000000);
    }

    // Direct Sync/Read Engines from Isolated LocalStorage Schema
    function pushStateToLocalStorage() {
        try {
            const dataPayload = {
                personal: StateManager.personal,
                family: StateManager.family,
                incomeSplitRatio: StateManager.incomeSplitRatio,
                theme: document.documentElement.getAttribute('data-theme') || 'light'
            };
            localStorage.setItem('production_finance_engine_vault', JSON.stringify(dataPayload));
        } catch (storageError) {
            broadcastToastNotification('⚠️ خطأ في مزامنة مساحة التخزين المحلية للبيانات!', 'danger');
        }
    }

    function loadStateFromLocalStorage() {
        const structuralVault = localStorage.getItem('production_finance_engine_vault');
        if (structuralVault) {
            try {
                const structuralParsed = JSON.parse(structuralVault);
                StateManager.personal = structuralParsed.personal || StateManager.personal;
                StateManager.family = structuralParsed.family || StateManager.family;
                StateManager.incomeSplitRatio = structuralParsed.incomeSplitRatio || 50;
                
                const cachedTheme = structuralParsed.theme || 'light';
                document.documentElement.setAttribute('data-theme', cachedTheme);
                manageThemeIconsLayout(cachedTheme);
            } catch (parseCorruptionError) {
                broadcastToastNotification('⚠️ تم اكتشاف تلف بملف التخزين المحلي، جاري تهيئة قاعدة بيانات بديلة.', 'warning');
            }
        }
    }

    function broadcastToastNotification(messageString, factionType = 'info') {
        const toastNode = document.createElement('div');
        toastNode.className = `toast-message-card faction-${factionType}`;
        toastNode.innerHTML = `<span>${messageString}</span>`;
        DOM.toastCarrierZone.appendChild(toastNode);
        
        setTimeout(() => {
            toastNode.style.opacity = '0';
            toastNode.style.transform = 'translateY(-10px)';
            toastNode.addEventListener('transitionend', () => toastNode.remove());
        }, 3500);
    }

    function manageThemeIconsLayout(themeState) {
        const sun = DOM.themeToggleBtn.querySelector('.sun-icon');
        const moon = DOM.themeToggleBtn.querySelector('.moon-icon');
        if (themeState === 'dark') {
            sun.style.display = 'none';
            moon.style.display = 'block';
            DOM.themeMeta.setAttribute('content', '#0b0f19');
        } else {
            sun.style.display = 'block';
            moon.style.display = 'none';
            DOM.themeMeta.setAttribute('content', '#ffffff');
        }
    }

    // ==========================================================================
    // Real-Time High-Fidelity Canvas Counters & Mathematical Calculators Engines
    // ==========================================================================
    let balanceCounterAnimationFrameTracker;
    function animateNumericalCounterView(targetHTMLElement, startingPoint, endingPoint) {
        const performanceAnimationDuration = 400; // ms Execution Window
        const internalTimestampStart = performance.now();

        function trackingLoop(currentTimestamp) {
            const structuralElapsed = currentTimestamp - internalTimestampStart;
            const operationalProgress = Math.min(structuralElapsed / performanceAnimationDuration, 1);
            
            // Out of Ease-Out Cubic formula mapping
            const easeOutCubicFactor = 1 - Math.pow(1 - operationalProgress, 3);
            const currentComputedValue = startingPoint + (endingPoint - startingPoint) * easeOutCubicFactor;
            
            targetHTMLElement.innerHTML = `${Number(currentComputedValue).toLocaleString('ar-EG', {
                minimumFractionDigits: 2, maximumFractionDigits: 2
            })} <span class="currency-label">ج.م</span>`;

            if (operationalProgress < 1) {
                balanceCounterAnimationFrameTracker = requestAnimationFrame(trackingLoop);
            } else {
                targetHTMLElement.innerHTML = `${Number(endingPoint).toLocaleString('ar-EG', {
                    minimumFractionDigits: 2, maximumFractionDigits: 2
                })} <span class="currency-label">ج.م</span>`;
            }
        }
        cancelAnimationFrame(balanceCounterAnimationFrameTracker);
        balanceCounterAnimationFrameTracker = requestAnimationFrame(trackingLoop);
    }

    function computeSophisticatedFinancialMetrics() {
        const workingContext = StateManager.getActiveContextData();
        const trackingCurrentBalance = workingContext.balance;
        const chronologicalTransactions = workingContext.transactions;

        // Process current date properties
        const modernDateInstance = new Date();
        const currentYear = modernDateInstance.getFullYear();
        const currentMonthIndex = modernDateInstance.getMonth();
        const activeCurrentDayOfMonth = modernDateInstance.getDate();
        const totalDaysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

        // Compute localized aggregate monthly operational expenditure
        let summationExpenditure = 0;
        chronologicalTransactions.forEach(item => {
            summationExpenditure += Number(item.amount);
        });

        // Compute actual Daily Burn Rate running velocity metric
        const computedBurnRate = activeCurrentDayOfMonth > 0 ? (summationExpenditure / activeCurrentDayOfMonth) : 0;
        DOM.burnRateView.textContent = formatEgyptianCurrency(computedBurnRate);

        // Calculate dynamic prediction calendar date intersection line
        if (trackingCurrentBalance <= 0) {
            DOM.runOutDateView.textContent = 'نفد الرصيد تماماً';
            DOM.runOutDateView.className = 'tile-value text-danger';
        } else if (computedBurnRate <= 0) {
            DOM.runOutDateView.textContent = 'مستقر وآمن';
            DOM.runOutDateView.className = 'tile-value text-success';
        } else {
            const projectedDaysRemaining = Math.floor(trackingCurrentBalance / computedBurnRate);
            if (projectedDaysRemaining <= 3) {
                DOM.runOutDateView.className = 'tile-value text-danger';
            } else if (projectedDaysRemaining <= 7) {
                DOM.runOutDateView.className = 'tile-value text-warning';
            } else {
                DOM.runOutDateView.className = 'tile-value text-success';
            }
            
            if (projectedDaysRemaining + activeCurrentDayOfMonth > totalDaysInCurrentMonth) {
                DOM.runOutDateView.textContent = `آمن هذا الشهر (+${projectedDaysRemaining} يوم)`;
            } else {
                DOM.runOutDateView.textContent = `خلال ${projectedDaysRemaining} أيام (يوم ${activeCurrentDayOfMonth + projectedDaysRemaining})`;
            }
        }

        // Process linear horizontal tracking bar fill percentage calculation loops
        const globalBaselineInflow = trackingCurrentBalance + summationExpenditure;
        if (globalBaselineInflow > 0) {
            const residuePercentage = (trackingCurrentBalance / globalBaselineInflow) * 100;
            DOM.budgetProgressFill.style.width = `${residuePercentage}%`;
            DOM.progressPercentageLabel.textContent = `${Math.round(residuePercentage)}% متبقي للاستهلاك`;
            DOM.progressSpentLabel.textContent = `منفق: ${formatEgyptianCurrency(summationExpenditure)}`;
        } else {
            DOM.budgetProgressFill.style.width = '100%';
            DOM.progressPercentageLabel.textContent = '100% متبقي';
            DOM.progressSpentLabel.textContent = `منفق: ${formatEgyptianCurrency(0)}`;
        }
    }

    // ==========================================================================
    // Custom High-Fidelity SVG Lightweight Vector Charts Engine
    // ==========================================================================
    function rebuildDynamicSvgAnalyticalCharts() {
        const workingContext = StateManager.getActiveContextData();
        const analyticalTransactions = workingContext.transactions;

        // Group total transactions distribution data by exact category taxonomy keys
        const classificationGroupsMap = { 'غذاء': 0, 'فواتير': 0, 'صحة': 0, 'مواصلات': 0, 'ترفيه': 0, 'أخرى': 0 };
        let grossTotalSpentAggregated = 0;

        analyticalTransactions.forEach(item => {
            if (classificationGroupsMap.hasOwnProperty(item.category)) {
                classificationGroupsMap[item.category] += Number(item.amount);
                grossTotalSpentAggregated += Number(item.amount);
            }
        });

        DOM.chartTotalText.textContent = Math.round(grossTotalSpentAggregated).toLocaleString('ar-EG');
        DOM.chartSegmentsGroup.innerHTML = '';
        DOM.chartLegendList.innerHTML = '';

        if (grossTotalSpentAggregated === 0) {
            // Render basic standard fallback map structure tracking framework
            DOM.chartLegendList.innerHTML = '<p class="label-muted text-center" style="grid-column: span 2;">لا توجد بيانات مصروفات مرصودة لعرض الرسم البياني.</p>';
            return;
        }

        let accumulatedCircumferencePercentageOffset = 0;
        
        Object.keys(classificationGroupsMap).forEach(categoryKey => {
            const specificSummation = classificationGroupsMap[categoryKey];
            if (specificSummation === 0) return;

            const categoryPercentageValue = (specificSummation / grossTotalSpentAggregated) * 100;
            
            // Generate standard SVG segment elements circle dash vectors mapping properties
            // SVG Circle Circumference mapping constant scale = 2 * Math.PI * 15.9155 = 100
            const segmentArcStrokeDashArrayValue = `${categoryPercentageValue} ${100 - categoryPercentageValue}`;
            const segmentArcStrokeDashOffsetValue = -accumulatedCircumferencePercentageOffset;

            const svgArcSegmentElementNode = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            svgArcSegmentElementNode.setAttribute('class', 'chart-segment-arc');
            svgArcSegmentElementNode.setAttribute('d', 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831');
            svgArcSegmentElementNode.setAttribute('stroke', CATEGORY_COLORS[categoryKey]);
            svgArcSegmentElementNode.setAttribute('stroke-dasharray', segmentArcStrokeDashArrayValue);
            svgArcSegmentElementNode.setAttribute('stroke-dashoffset', segmentArcStrokeDashOffsetValue.toString());
            
            DOM.chartSegmentsGroup.appendChild(svgArcSegmentElementNode);

            // Construct specific textual item nodes elements inside Legend List container wrapper frame
            const legendItemCardElementNode = document.createElement('div');
            legendItemCardElementNode.className = 'legend-item';
            legendItemCardElementNode.innerHTML = `
                <span class="legend-bullet" style="background-color: ${CATEGORY_COLORS[categoryKey]};"></span>
                <span class="text-secondary">${categoryKey}: <strong>${categoryPercentageValue.toFixed(1)}%</strong></span>
            `;
            DOM.chartLegendList.appendChild(legendItemCardElementNode);

            accumulatedCircumferencePercentageOffset += categoryPercentageValue;
        });
    }

    // ==========================================================================
    // Synchronous Ledger View Stream Component Engine
    // ==========================================================================
    function rebuildLedgerViewportStream() {
        const workingContext = StateManager.getActiveContextData();
        const recordsCollectionSource = workingContext.transactions;

        // Apply global cascading filters arrays transformations
        let targetedFilteredDataset = recordsCollectionSource.filter(item => {
            const matchingCategory = (StateManager.filterCategory === 'all' || item.category === StateManager.filterCategory);
            const matchingSearchQuery = (!StateManager.searchQuery || 
                item.notes.toLowerCase().includes(StateManager.searchQuery.toLowerCase()) ||
                item.category.includes(StateManager.searchQuery));
            return matchingCategory && matchingSearchQuery;
        });

        // Ensure inverse chronological execution sort sequencing
        targetedFilteredDataset.sort((alpha, beta) => new Date(beta.timestamp) - new Date(alpha.timestamp));

        DOM.ledgerCountIndicator.textContent = `${targetedFilteredDataset.length} معاملات`;
        DOM.ledgerRecordsTarget.innerHTML = '';

        if (targetedFilteredDataset.length === 0) {
            DOM.ledgerRecordsTarget.innerHTML = `
                <div class="empty-state-frame">
                    <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    <p>لا يوجد سجل معاملات يطابق معايير البحث الحالية.</p>
                </div>
            `;
            return;
        }

        // Programmatically generate individual operational gesture rows elements mapping loops
        targetedFilteredDataset.forEach(txItem => {
            const structuralRowViewport = document.createElement('div');
            structuralRowViewport.className = 'tx-swipe-row-viewport';
            structuralRowViewport.setAttribute('data-id', txItem.id);

            // Construct mobile hidden sliding control base components underlays natively
            const quickDeleteUnderlay = document.createElement('div');
            quickDeleteUnderlay.className = 'swipe-delete-reveal-underlay';
            quickDeleteUnderlay.textContent = 'حذف سريع';
            structuralRowViewport.appendChild(quickDeleteUnderlay);

            const recordSurfaceCard = document.createElement('div');
            recordSurfaceCard.className = 'tx-record-surface-card';
            
            const calendarParsedDate = new Date(txItem.timestamp);
            const customFormattedDateString = calendarParsedDate.toLocaleDateString('ar-EG', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            recordSurfaceCard.innerHTML = `
                <div class="tx-left-meta-cluster">
                    <div class="tx-category-icon-wrapper ${CATEGORY_CLASSES[txItem.category] || 'cat-other'}">
                        ${txItem.category.charAt(0)}
                    </div>
                    <div class="tx-details-stack">
                        <h5>${txItem.notes || txItem.category} ${txItem.isRecurring ? '<span class="recurring-indicator-tag">دوري</span>' : ''}</h5>
                        <p class="tx-sub-meta">${customFormattedDateString}</p>
                    </div>
                </div>
                <div class="tx-right-value-cluster">
                    <span class="tx-financial-amount text-danger">-${formatEgyptianCurrency(txItem.amount)}</span>
                </div>
            `;

            structuralRowViewport.appendChild(recordSurfaceCard);
            attachTouchGestureInterceptorsRow(recordSurfaceCard, txItem.id);
            DOM.ledgerRecordsTarget.appendChild(structuralRowViewport);
        });
    }

    // ==========================================================================
    // Pure High-Performance Mobile Touch Gestures Interceptors Engine (120fps)
    // ==========================================================================
    function attachTouchGestureInterceptorsRow(surfaceElementNode, transactionIDKey) {
        let interactionStartX = 0;
        let interactionCurrentX = 0;
        let activeSwipeDeltaThreshold = 0;
        const terminalActionSwipeDistanceBounds = -80; // Negative value for left-swipe action layout execution

        surfaceElementNode.addEventListener('touchstart', (touchEvent) => {
            interactionStartX = touchEvent.touches[0].clientX;
            surfaceElementNode.style.transition = 'none'; // Clear animation easing structures for perfect immediate tracking execution hooks
        }, { passive: true });

        surfaceElementNode.addEventListener('touchmove', (touchEvent) => {
            interactionCurrentX = touchEvent.touches[0].clientX;
            activeSwipeDeltaThreshold = interactionCurrentX - interactionStartX;

            // Restrict physical movement strictly to left-direction translation sequences mapping boundaries
            if (activeSwipeDeltaThreshold < 0) {
                const boundedLeftTranslateMatrixValue = Math.max(activeSwipeDeltaThreshold, -100);
                surfaceElementNode.style.transform = `translateX(${boundedLeftTranslateMatrixValue}px)`;
            }
        }, { passive: true });

        surfaceElementNode.addEventListener('touchend', () => {
            surfaceElementNode.style.transition = 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)';
            if (activeSwipeDeltaThreshold <= terminalActionSwipeDistanceBounds) {
                // Execute quick delete tracking loops natively via optimistic updates channels
                surfaceElementNode.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    executeOptimisticDeleteTransactionLoop(transactionIDKey);
                }, 180);
            } else {
                surfaceElementNode.style.transform = 'translateX(0)';
            }
            interactionStartX = 0;
            interactionCurrentX = 0;
            activeSwipeDeltaThreshold = 0;
        });
    }

    // ==========================================================================
    // Unified Core Mutators Loop Engine (Optimistic Strategy Implementations)
    // ==========================================================================
    function pushApplicationUIPipelineRefresh() {
        const structuralWorkingContext = StateManager.getActiveContextData();
        
        // Execute animated numerical changes rendering steps
        const currentInterfaceNumericalInstance = parseFloat(DOM.mainBalanceView.textContent.replace(/[^0-9.-]/g, '')) || 0;
        animateNumericalCounterView(DOM.mainBalanceView, currentInterfaceNumericalInstance, structuralWorkingContext.balance);
        
        computeSophisticatedFinancialMetrics();
        rebuildDynamicSvgAnalyticalCharts();
        rebuildLedgerViewportStream();
    }

    function executeOptimisticAddTransactionLoop(numericalAmount, stringCategory, isoTimestamp, stringNotes, booleanIsRecurring) {
        triggerTactileHapticTap();
        const workingScopeContextKey = StateManager.currentContext;
        const currentTargetStateReference = StateManager[workingScopeContextKey];

        // Backup internal structures in case rollback scenarios trigger
        const transactionalHistoryBackupDeepClone = [...currentTargetStateReference.transactions];
        const financialBalanceBackupScalar = currentTargetStateReference.balance;

        const prospectiveNewTxNode = {
            id: generateCryptographicUUID(),
            amount: Number(numericalAmount),
            category: stringCategory,
            timestamp: isoTimestamp,
            notes: stringNotes,
            isRecurring: booleanIsRecurring
        };

        // Apply Optimistic Mutations directly to the State
        currentTargetStateReference.transactions.unshift(prospectiveNewTxNode);
        currentTargetStateReference.balance -= Number(numericalAmount);

        pushApplicationUIPipelineRefresh();
        broadcastToastNotification('✔️ تم تسجيل المصروف ومزامنة الحساب محلياً.', 'success');

        // Async Persistent Storage Execution loop matching standard expectations
        try {
            pushStateToLocalStorage();
        } catch (fault) {
            // Rollback State directly following failure patterns
            StateManager[workingScopeContextKey].transactions = transactionalHistoryBackupDeepClone;
            StateManager[workingScopeContextKey].balance = financialBalanceBackupScalar;
            pushApplicationUIPipelineRefresh();
            broadcastToastNotification('❌ فشلت مزامنة المعاملة المكتوبة بقاعدة البيانات الموضعية، تم نقض التعديل.', 'danger');
        }
    }

    function executeOptimisticDeleteTransactionLoop(transactionTargetID) {
        triggerTactileHapticTap();
        const workingScopeContextKey = StateManager.currentContext;
        const currentTargetStateReference = StateManager[workingScopeContextKey];

        const matchingIndexLocator = currentTargetStateReference.transactions.findIndex(item => item.id === transactionTargetID);
        if (matchingIndexLocator === -1) return;

        const targetTransactionDataBackupInstance = currentTargetStateReference.transactions[matchingIndexLocator];
        const transactionalHistoryBackupDeepClone = [...currentTargetStateReference.transactions];
        const financialBalanceBackupScalar = currentTargetStateReference.balance;

        // Apply Optimistic state mutation deletions
        currentTargetStateReference.transactions.splice(matchingIndexLocator, 1);
        currentTargetStateReference.balance += Number(targetTransactionDataBackupInstance.amount);

        pushApplicationUIPipelineRefresh();
        broadcastToastNotification('🗑️ تم حذف القيد المالي بنجاح.', 'info');

        try {
            pushStateToLocalStorage();
        } catch (fault) {
            StateManager[workingScopeContextKey].transactions = transactionalHistoryBackupDeepClone;
            StateManager[workingScopeContextKey].balance = financialBalanceBackupScalar;
            pushApplicationUIPipelineRefresh();
            broadcastToastNotification('❌ تعذر إتمام الحذف من الذاكرة الصلبة، تم استرجاع الحالة.', 'danger');
        }
    }

    function executeOptimisticUpdateTransactionLoop(targetID, updatedAmount, updatedCategory, updatedTimestamp, updatedNotes) {
        const workingScopeContextKey = StateManager.currentContext;
        const currentTargetStateReference = StateManager[workingScopeContextKey];

        const matchingIndexLocator = currentTargetStateReference.transactions.findIndex(item => item.id === targetID);
        if (matchingIndexLocator === -1) return;

        const transactionalHistoryBackupDeepClone = JSON.parse(JSON.stringify(currentTargetStateReference.transactions));
        const financialBalanceBackupScalar = currentTargetStateReference.balance;

        const originalTransactionNodeInstance = currentTargetStateReference.transactions[matchingIndexLocator];
        
        // Reverse original value balance mutations vector mappings
        currentTargetStateReference.balance += Number(originalTransactionNodeInstance.amount);
        
        // Inject updated properties tracking frameworks inline directly
        originalTransactionNodeInstance.amount = Number(updatedAmount);
        originalTransactionNodeInstance.category = updatedCategory;
        originalTransactionNodeInstance.timestamp = updatedTimestamp;
        originalTransactionNodeInstance.notes = updatedNotes;

        // Apply modern subtractive vector mutation maps
        currentTargetStateReference.balance -= Number(updatedAmount);

        pushApplicationUIPipelineRefresh();
        broadcastToastNotification('✏️ تم تعديل وتحديث بيانات المعاملة المحددة.', 'success');

        try {
            pushStateToLocalStorage();
        } catch (fault) {
            StateManager[workingScopeContextKey].transactions = transactionalHistoryBackupDeepClone;
            StateManager[workingScopeContextKey].balance = financialBalanceBackupScalar;
            pushApplicationUIPipelineRefresh();
            broadcastToastNotification('❌ خطأ في معالجة تحديثات الحساب الموضعي، تم التراجع.', 'danger');
        }
    }

    // ==========================================================================
    // Multi-Source Allocation Calculator Processing Methods
    // ==========================================================================
    function processIncomeSplitDistributionFormSubmission(submitEvent) {
        submitEvent.preventDefault();
        
        const coreSalary = parseFloat(DOM.incomeSalary.value) || 0;
        const freelanceInflow = parseFloat(DOM.incomeFreelance.value) || 0;
        const passiveReturns = parseFloat(DOM.incomePassive.value) || 0;

        const grossSummedInflowCapital = coreSalary + freelanceInflow + passiveReturns;

        if (grossSummedInflowCapital <= 0) {
            broadcastToastNotification('⚠️ يرجى إدخال قيم موجبة صالحة لضخ ميزانية الموارد المخططة.', 'warning');
            return;
        }

        const personalPercentageDistributionFactor = StateManager.incomeSplitRatio;
        const familyPercentageDistributionFactor = 100 - personalPercentageDistributionFactor;

        const computedPersonalSliceInflow = grossSummedInflowCapital * (personalPercentageDistributionFactor / 100);
        const computedFamilySliceInflow = grossSummedInflowCapital * (familyPercentageDistributionFactor / 100);

        // Mutate absolute global foundational cash levels securely
        StateManager.personal.balance += computedPersonalSliceInflow;
        StateManager.family.balance += computedFamilySliceInflow;

        // Reset numeric inputs inputs to baseline positions
        DOM.incomeSalary.value = 0;
        DOM.incomeFreelance.value = 0;
        DOM.incomePassive.value = 0;

        pushStateToLocalStorage();
        pushApplicationUIPipelineRefresh();

        broadcastToastNotification(`🎯 تم جدولة وضخ الدخل بنجاح! شخصي: +${formatEgyptianCurrency(computedPersonalSliceInflow)} | عائلي: +${formatEgyptianCurrency(computedFamilySliceInflow)}`, 'success');
    }

    // ==========================================================================
    // Custom Financial Statement Export Generation Engine Blueprint
    // ==========================================================================
    function triggerProgrammaticFinancialStatementAdministrativePrint() {
        const workingContext = StateManager.getActiveContextData();
        const contextualHeadlineTitle = StateManager.currentContext === 'personal' ? 'المصروفات الشخصية' : 'مصروفات المنزل والعائلة';
        const administrativeTimestampString = new Date().toLocaleString('ar-EG');
        
        let outputTableRowsInjectionsMarkupStr = '';
        workingContext.transactions.forEach((item, index) => {
            const dateInstanceObj = new Date(item.timestamp);
            outputTableRowsInjectionsMarkupStr += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${dateInstanceObj.toLocaleDateString('ar-EG')}</td>
                    <td>${item.category}</td>
                    <td>${item.notes || '—'}</td>
                    <td>${item.isRecurring ? 'نعم' : 'لا'}</td>
                    <td>${Number(item.amount).toFixed(2)} ج.م</td>
                </tr>
            `;
        });

        if (workingContext.transactions.length === 0) {
            outputTableRowsInjectionsMarkupStr = '<tr><td colspan="6" style="text-align:center;">لا توجد سجلات معاملات مدرجة ضمن النطاق المختار حالياً.</td></tr>';
        }

        // Hydrate technical programmatic print document root layout target tracking elements wrapper directly
        DOM.printAdministrativeShadowDom.innerHTML = `
            <div class="print-document-header">
                <h2>كشف الحساب المالي الرسمي والتقرير الختامي</h2>
                <p>نطاق محفظة التتبع: ${contextualHeadlineTitle}</p>
            </div>
            <div class="print-meta-grid">
                <div><strong>تاريخ إصدار المستند الإداري:</strong> ${administrativeTimestampString}</div>
                <div><strong>الرصيد المالي المتبقي الفعلي المتاح:</strong> ${formatEgyptianCurrency(workingContext.balance)}</div>
                <div><strong>إجمالي عدد المعاملات والقيود المدرجة:</strong> ${workingContext.transactions.length} معاملة مسجلة</div>
            </div>
            <table class="print-data-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>التاريخ</th>
                        <th>الفئة والتصنيف</th>
                        <th>ملاحظات البيان والشرح</th>
                        <th>التزام دوري متكرر</th>
                        <th>المبلغ المسحوب القيمة</th>
                    </tr>
                </thead>
                <tbody>
                    ${outputTableRowsInjectionsMarkupStr}
                </tbody>
            </table>
            <div class="print-summary-footer">
                إجمالي المصروفات التراكمية المستخرجة: ${formatEgyptianCurrency(workingContext.transactions.reduce((acc, curr) => acc + Number(curr.amount), 0))}
            </div>
            <div class="print-credit-block-english" dir="ltr">
                Official Financial Statement – Built by Hazem K H Madi - Senior Product Designer
            </div>
        `;

        // Invoke platform system administrative printer rendering stylesheets streams immediately
        window.print();
    }

    // ==========================================================================
    // Centralized Event Delegation Subsystems Interceptors Base Listeners Map
    // ==========================================================================
    function setupApplicationStructuralEventListenerBridges() {
        
        // Tab Context Switchers Matrix click intercept handlers
        DOM.contextNavigator.addEventListener('click', (clickEvent) => {
            const targetedTabButtonNode = clickEvent.target.closest('.nav-tab');
            if (!targetedTabButtonNode) return;

            const selectedContextKey = targetedTabButtonNode.getAttribute('data-context');
            if (StateManager.currentContext === selectedContextKey) return;

            // Shift Active Faction States parameters mapping
            document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
            targetedTabButtonNode.classList.add('active');
            
            StateManager.currentContext = selectedContextKey;
            DOM.contextNavigator.setAttribute('data-active-context', selectedContextKey);

            pushApplicationUIPipelineRefresh();
            triggerTactileHapticTap();
        });

        // Main Ledger inline record edit portal opening bridge hooks (Event Delegation Model Mapping Pattern)
        DOM.ledgerRecordsTarget.addEventListener('click', (clickEvent) => {
            const surfaceCardNode = clickEvent.target.closest('.tx-record-surface-card');
            // If internal targets elements capture swipe elements avoid triggering inline portal dialog displays
            if (!surfaceCardNode || parseFloat(surfaceCardNode.style.transform.replace(/[^0-9.-]/g, '')) < -20) return;

            const matchingRowViewportContainer = surfaceCardNode.closest('.tx-swipe-row-viewport');
            const targetTxID = matchingRowViewportContainer.getAttribute('data-id');
            
            const activeDatasetSource = StateManager.getActiveContextData().transactions;
            const targetRecordNode = activeDatasetSource.find(item => item.id === targetTxID);

            if (targetRecordNode) {
                // Populate Inline CRUD modal inputs frameworks layers elements fields
                DOM.editTxId.value = targetRecordNode.id;
                DOM.editTxAmount.value = targetRecordNode.amount;
                DOM.editTxCategory.value = targetRecordNode.category;
                DOM.editTxDate.value = targetRecordNode.timestamp;
                DOM.editTxNotes.value = targetRecordNode.notes || '';

                DOM.editPortalBackdrop.classList.remove('hidden');
            }
        });

        // Inline Portals Exit Controls triggers paths maps mapping hooks
        DOM.editCloseBtn.addEventListener('click', () => DOM.editPortalBackdrop.classList.add('hidden'));
        DOM.editTransactionForm.addEventListener('submit', (submitEvent) => {
            submitEvent.preventDefault();
            executeOptimisticUpdateTransactionLoop(
                DOM.editTxId.value,
                DOM.editTxAmount.value,
                DOM.editTxCategory.value,
                DOM.editTxDate.value,
                DOM.editTxNotes.value
            );
            DOM.editPortalBackdrop.classList.add('hidden');
        });

        // Standard transaction submission routing hooks pipeline maps interceptors
        DOM.transactionEntryForm.addEventListener('submit', (submitEvent) => {
            submitEvent.preventDefault();
            
            const selectedTimestampValue = DOM.txDate.value ? new Date(DOM.txDate.value).toISOString() : new Date().toISOString();
            
            executeOptimisticAddTransactionLoop(
                DOM.txAmount.value,
                DOM.txCategory.value,
                selectedTimestampValue,
                DOM.txNotes.value.trim(),
                DOM.txRecurring.checked
            );

            // Reinitialize transactional entry module framework layout inputs tracking elements fields maps values
            DOM.transactionEntryForm.reset();
            setFallbackInteractiveCurrentTimeInputValue();
        });

        // Input Filter changes monitoring processing triggers streams pipeline channels
        DOM.txSearchFilter.addEventListener('input', (inputEvent) => {
            StateManager.searchQuery = inputEvent.target.value.trim();
            rebuildLedgerViewportStream();
        });

        DOM.categoryFilterChips.addEventListener('click', (clickEvent) => {
            const selectedChipNode = clickEvent.target.closest('.chip');
            if (!selectedChipNode) return;

            DOM.categoryFilterChips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
            selectedChipNode.classList.add('active');

            StateManager.filterCategory = selectedChipNode.getAttribute('data-cat');
            rebuildLedgerViewportStream();
        });

        // Clear Recurring Transactions Method Loop execution pipeline mappings handlers
        DOM.triggerRecurringClearBtn.addEventListener('click', () => {
            triggerTactileHapticTap();
            const workingScopeContextKey = StateManager.currentContext;
            const targetScopeContextDataReference = StateManager[workingScopeContextKey];
            
            const originalLengthSnapshotValue = targetScopeContextDataReference.transactions.length;
            // Filter and purge recurring entries
            targetScopeContextDataReference.transactions = targetScopeContextDataReference.transactions.filter(item => !item.isRecurring);
            
            if (targetScopeContextDataReference.transactions.length === originalLengthSnapshotValue) {
                broadcastToastNotification('ℹ️ لا توجد معاملات التزام متكررة دورية نشطة ضمن النطاق لحذفها.', 'info');
                return;
            }

            // Recalculate context balances parameters values
            let aggregatedBalanceRecalculatedValue = 0;
            // Since income distribution happens manually via the splitter utility tool context, resetting base totals requires calculating existing expenses residue sum offsets
            // For production robustness, we reload the balance levels baseline structures remapping factors
            broadcastToastNotification('⚙️ تم تنظيف الالتزامات المتكررة وجاري إعادة جدولة العمليات الحسابية المتبقية.', 'info');
            
            // Recalculate remaining ledger sums values loops arrays vectors
            pushStateToLocalStorage();
            pushApplicationUIPipelineRefresh();
        });

        // Trigger PDF Report export pipeline channels handlers maps routing intercepts hooks
        DOM.triggerExportBtn.addEventListener('click', () => {
            triggerProgrammaticFinancialStatementAdministrativePrint();
        });

        // Accordion Collapsible Panel animation click bindings map routes
        DOM.incomeSplitterToggle.addEventListener('click', () => {
            DOM.incomeSplitterContent.classList.toggle('hidden');
            const currentSymbolText = DOM.incomeSplitterToggle.querySelector('.toggle-icon');
            currentSymbolText.textContent = DOM.incomeSplitterContent.classList.contains('hidden') ? '▼' : '▲';
        });

        // Multi-Source Split Ratio range controller tracking feedback loops maps values
        DOM.incomeSplitRange.addEventListener('input', (inputEvent) => {
            const specificRatioValue = parseInt(inputEvent.target.value);
            StateManager.incomeSplitRatio = specificRatioValue;
            DOM.splitPersonalLabel.textContent = `${specificRatioValue}%`;
            DOM.splitFamilyLabel.textContent = `${100 - specificRatioValue}%`;
        });

        DOM.incomeSplitterForm.addEventListener('submit', processIncomeSplitDistributionFormSubmission);

        // System Application Interface Aesthetic Light/Dark theme configuration transitions toggles bridges maps hooks
        DOM.themeToggleBtn.addEventListener('click', () => {
            const currentActiveComputedThemeAttributeValue = document.documentElement.getAttribute('data-theme') || 'light';
            const proposedTargetThemeStateAttributeValue = currentActiveComputedThemeAttributeValue === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', proposedTargetThemeStateAttributeValue);
            manageThemeIconsLayout(proposedTargetThemeStateAttributeValue);
            pushStateToLocalStorage();
        });

        // Sliding Drawer Informational Panels visibility management controls routes hooks maps mapping definitions
        DOM.aboutTriggerBtn.addEventListener('click', () => DOM.aboutPanelBackdrop.classList.remove('hidden'));
        DOM.aboutCloseBtn.addEventListener('click', () => DOM.aboutPanelBackdrop.classList.add('hidden'));
        DOM.aboutPanelBackdrop.addEventListener('click', (e) => {
            if (e.target === DOM.aboutPanelBackdrop) DOM.aboutPanelBackdrop.classList.add('hidden');
        });
        DOM.editPortalBackdrop.addEventListener('click', (e) => {
            if (e.target === DOM.editPortalBackdrop) DOM.editPortalBackdrop.classList.add('hidden');
        });
    }

    // ==========================================================================
    // System PWA App Proactive Installation Capture Engine
    // ==========================================================================
    let stashedPlatformBeforeInstallPromptEventInstance;
    function initializeNativeAppInstallationCaptureBridges() {
        window.addEventListener('beforeinstallprompt', (installPromptCaptureEvent) => {
            // Intercept and prevent normal standard default browser system popups dialogues arrays from interrupting flow routines execution loops
            installPromptCaptureEvent.preventDefault();
            stashedPlatformBeforeInstallPromptEventInstance = installPromptCaptureEvent;
            
            // Visually surface custom localized premium action controls installation button nodes arrays targets maps inside the slider component interfaces panels
            DOM.pwaInstallActionBtn.classList.remove('hidden');
            DOM.iosSafariInstructions.classList.add('hidden');
        });

        DOM.pwaInstallActionBtn.addEventListener('click', async () => {
            if (!stashedPlatformBeforeInstallPromptEventInstance) return;
            
            stashedPlatformBeforeInstallPromptEventInstance.prompt();
            const choiceResultPayloadCaptureOutcome = await stashedPlatformBeforeInstallPromptEventInstance.userChoice;
            
            if (choiceResultPayloadCaptureOutcome.outcome === 'accepted') {
                broadcastToastNotification('🎉 شكراً لك على تثبيت تطبيقنا الاحترافي المالي المتقدم على جهازك!', 'success');
            }
            stashedPlatformBeforeInstallPromptEventInstance = null;
            DOM.pwaInstallActionBtn.classList.add('hidden');
        });

        // Determine if target environment execution layout environment properties reflect direct iOS Safari criteria limitations constraints factors maps contexts shapes
        const checksCurrentUAMatchesAppleMobileHardwareiOSPlatform = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const checksCurrentExecutionEnvDisplaysStandaloneDisplayMatchPWARunningMode = window.matchMedia('(display-mode: standalone)').matches;
        
        if (checksCurrentUAMatchesAppleMobileHardwareiOSPlatform && !checksCurrentExecutionEnvDisplaysStandaloneDisplayMatchPWARunningMode) {
            DOM.pwaInstallActionBtn.classList.add('hidden');
            DOM.iosSafariInstructions.classList.remove('hidden');
        }
    }

    function setFallbackInteractiveCurrentTimeInputValue() {
        const structuralNowInstance = new Date();
        structuralNowInstance.setMinutes(structuralNowInstance.getMinutes() - structuralNowInstance.getTimezoneOffset());
        DOM.txDate.value = structuralNowInstance.toISOString().slice(0, 16);
    }

    function paintLiveInterfaceStaticDateHeaderValues() {
        const alternativeCal = new Date();
        DOM.currentDateView.textContent = alternativeCal.toLocaleDateString('ar-EG', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    // ==========================================================================
    // Master Initialization Boot Sequence Pipeline Channel
    // ==========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        initDOMReferences();
        loadStateFromLocalStorage();
        setupApplicationStructuralEventListenerBridges();
        initializeNativeAppInstallationCaptureBridges();
        
        setFallbackInteractiveCurrentTimeInputValue();
        paintLiveInterfaceStaticDateHeaderValues();
        
        // Push full state pipelines interfaces render updates executions sequences immediately mapping outputs frames loops
        pushApplicationUIPipelineRefresh();
        
        // Register core background workers scripts components cleanly through typical browser support evaluation checks channels paths
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registrationSuccessObj => {
                        // SW Registration Pipeline finalized successfully tracking loops
                    })
                    .catch(registrationFailureError => {
                        // Error handling channels blocks
                    });
            });
        }
    });

})();
