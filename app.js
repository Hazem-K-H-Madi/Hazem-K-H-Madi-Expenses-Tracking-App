/**
 * Core Production Application Scripting Architecture
 * Architecture Scope: Offline-First State Management, Optimistic Updates UI Lifecycle,
 * Financial Forecasting Calculators, Custom Embedded Inline SVG Graph Engines.
 */

(function () {
    'use strict';

    // 1. Immutable Shared Constants Mapping
    const CATEGORIES = ["غذاء وتطوير", "فواتير والتزامات", "صحة ورعاية", "تعليم ونمو", "ترفيه ونمط حياة", "أخرى"];
    const CATEGORY_COLORS = {
        "غذاء وتطوير": "#2563eb",
        "فواتير والتزامات": "#8b5cf6",
        "صحة ورعاية": "#10b981",
        "تعليم ونمو": "#f59e0b",
        "ترفيه ونمط حياة": "#ef4444",
        "أخرى": "#64748b"
    };

    // 2. Central Micro-State Application Context
    let appState = {
        personal: { income: 0, expenses: [] },
        family: { income: 0, expenses: [] },
        activeTab: 'personal',
        theme: 'light',
        allocationRatio: 50, // Percent allocated to Personal, remainder to Family
        activeCategoryFilter: null
    };

    // A memory mirror used to execute rapid UI Rollbacks if Database Write pipeline encounters exception states
    let stateMemoryMirror = null;

    // 3. Application Lifecycle Event Listeners Initialization Hook
    document.addEventListener("DOMContentLoaded", () => {
        initializeApplicationCore();
    });

    function initializeApplicationCore() {
        loadStateFromLocalStorage();
        applySystemThemeContext();
        registerDOMEvents();
        renderGlobalDashboardViews();
        checkRecurringBillingDueStatus();
        initializePWAServiceEngine();
    }

    // 4. Persistence & Safe Execution Layer
    function loadStateFromLocalStorage() {
        try {
            const rawStoredData = localStorage.getItem("HAZEM_FINTECH_PWA_STATE");
            if (rawStoredData) {
                const parsedData = JSON.parse(rawStoredData);
                // Schema matching validation check
                if (parsedData.personal && parsedData.family) {
                    appState = { ...appState, ...parsedData };
                }
            } else {
                // Instantiating initial seed empty-state parameters
                appState.personal = { income: 5000, expenses: [] };
                appState.family = { income: 5000, expenses: [] };
            }
            snapshotStateToMirror();
        } catch (storageException) {
            triggerNotificationToast("خطأ أثناء تحميل مخزن البيانات المحلي. تم بدء جلسة آمنة.");
        }
    }

    function saveStateToStoragePipeline() {
        try {
            localStorage.setItem("HAZEM_FINTECH_PWA_STATE", JSON.stringify(appState));
            snapshotStateToMirror();
            return true;
        } catch (writeException) {
            return false; // Signals structural writing exception
        }
    }

    function snapshotStateToMirror() {
        stateMemoryMirror = JSON.parse(JSON.stringify(appState));
    }

    function executeOptimisticRollback(errorMessage) {
        appState = JSON.parse(JSON.stringify(stateMemoryMirror));
        triggerNotificationToast(errorMessage || "فشلت معالجة العملية المزامنة للبيانات. تم استعادة الحالة السابقة.");
        renderGlobalDashboardViews();
    }

    // 5. High-Fidelity UI Presentation Rendering Loop
    function renderGlobalDashboardViews() {
        const activeContext = appState[appState.activeTab];
        
        // Render Dynamic Metrics Counters
        calculateAndAnimateBalanceMetrics(activeContext);
        
        // Execute Calculations Engines
        executeBurnRateForecastingMetrics(activeContext);
        
        // Build Categorized SVG Metrics Arc Charts
        renderCategorizedAnalyticsSVGCharts(activeContext);
        
        // Build Filter Navigation Toolbar Category Chips
        renderCategoryFilterChipsInterface(activeContext);
        
        // Render Active Ledger List Views
        renderLedgerTransactionElements(activeContext);
    }

    function calculateAndAnimateBalanceMetrics(context) {
        const totalAllocatedIncome = Number(context.income || 0);
        const totalCalculatedExpenses = context.expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const netDecrementingRemainingBalance = totalAllocatedIncome - totalCalculatedExpenses;

        document.getElementById("allocated-income-display").textContent = totalAllocatedIncome.toLocaleString('ar-EG');
        document.getElementById("total-expenses-display").textContent = totalCalculatedExpenses.toLocaleString('ar-EG');
        
        // Animate counter execution frame
        animateCounterSequence("balance-counter", netDecrementingRemainingBalance);
    }

    function animateCounterSequence(elementId, terminalTargetValue) {
        const elementReference = document.getElementById(elementId);
        const initialCurrentValue = parseFloat(elementReference.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const animationDuration = 450; // Milliseconds duration frame
        let animationStartTimestamp = null;

        function executionStep(currentTimestamp) {
            if (!animationStartTimestamp) animationStartTimestamp = currentTimestamp;
            const absoluteElapsedProgress = currentTimestamp - animationStartTimestamp;
            const progressRatio = Math.min(absoluteElapsedProgress / animationDuration, 1);
            
            // Ease-out cubic formula transformation mapping
            const transformationEaseRatio = 1 - Math.pow(1 - progressRatio, 3);
            const calculatedInterpolatedFrameValue = initialCurrentValue + (transformationEaseRatio * (terminalTargetValue - initialCurrentValue));
            
            elementReference.textContent = Math.round(calculatedInterpolatedFrameValue).toLocaleString('ar-EG');

            if (absoluteElapsedProgress < animationDuration) {
                window.requestAnimationFrame(executionStep);
            } else {
                elementReference.textContent = Math.round(terminalTargetValue).toLocaleString('ar-EG');
            }
        }
        window.requestAnimationFrame(executionStep);
    }

    function executeBurnRateForecastingMetrics(context) {
        const burnRateValueNode = document.getElementById("burn-rate-value");
        const runwayPredictionValueNode = document.getElementById("runway-prediction-value");
        
        const currentCalendarDate = new Date();
        const activeDayCounterIndex = currentCalendarDate.getDate();
        
        const cumulativeExpensesSum = context.expenses.reduce((sum, item) => sum + Number(item.amount), 0);
        const calculatedDailyBurnRate = activeDayCounterIndex > 0 ? (cumulativeExpensesSum / activeDayCounterIndex) : cumulativeExpensesSum;
        
        burnRateValueNode.textContent = Math.round(calculatedDailyBurnRate).toLocaleString('ar-EG');

        const availableLiquidityNetBalance = Number(context.income || 0) - cumulativeExpensesSum;

        if (calculatedDailyBurnRate <= 0) {
            runwayPredictionValueNode.textContent = "مستقر - لا يوجد استهلاك نشط";
            runwayPredictionValueNode.className = "node-value text-success";
            return;
        }

        const projectedRemainingRunwayDays = Math.floor(availableLiquidityNetBalance / calculatedDailyBurnRate);

        if (availableLiquidityNetBalance <= 0) {
            runwayPredictionValueNode.textContent = "تم استنفاذ كامل الميزانية المتاحة";
            runwayPredictionValueNode.className = "node-value text-danger";
        } else if (projectedRemainingRunwayDays <= 5) {
            runwayPredictionValueNode.textContent = `خطر النفاذ الداهم (خلال ${projectedRemainingRunwayDays.toLocaleString('ar-EG')} أيام)`;
            runwayPredictionValueNode.className = "node-value text-danger";
        } else if (projectedRemainingRunwayDays <= 15) {
            runwayPredictionValueNode.textContent = `تحذير استهلاك مرتفع (${projectedRemainingRunwayDays.toLocaleString('ar-EG')} أيام متبقية)`;
            runwayPredictionValueNode.className = "node-value text-warning";
        } else {
            runwayPredictionValueNode.textContent = `مستقر ومتزن لكافة الشهر الحالي (${projectedRemainingRunwayDays.toLocaleString('ar-EG')} يوم)`;
            runwayPredictionValueNode.className = "node-value text-success";
        }
    }

    function renderCategorizedAnalyticsSVGCharts(context) {
        const chartWrapperNode = document.getElementById("svg-chart-wrapper");
        const legendContainerNode = document.getElementById("chart-legend-container");
        
        chartWrapperNode.innerHTML = "";
        legendContainerNode.innerHTML = "";

        // Build metric hash matrices map mapping items allocation distribution sizes
        const functionalCategoryMapHash = {};
        CATEGORIES.forEach(cat => functionalCategoryMapHash[cat] = 0);
        
        let aggregateSumVal = 0;
        context.expenses.forEach(item => {
            if (functionalCategoryMapHash[item.category] !== undefined) {
                functionalCategoryMapHash[item.category] += Number(item.amount);
                aggregateSumVal += Number(item.amount);
            }
        });

        if (aggregateSumVal === 0) {
            chartWrapperNode.innerHTML = `
                <div class="chart-center-label">
                    <span class="center-num">٠٪</span>
                    <span class="center-txt">لا توجد مصاريف</span>
                </div>
            `;
            return;
        }

        // Programmatic lightweight mathematical parsing and drawing of compound native high-performance SVGs
        const svgElementWrapper = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElementWrapper.setAttribute("width", "100%");
        svgElementWrapper.setAttribute("height", "100%");
        svgElementWrapper.setAttribute("viewBox", "0 0 42 42");
        svgElementWrapper.setAttribute("class", "chart-svg-element");

        const baseTrackingCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        baseTrackingCircle.setAttribute("cx", "21");
        baseTrackingCircle.setAttribute("cy", "21");
        baseTrackingCircle.setAttribute("r", "15.91549430918954");
        baseTrackingCircle.setAttribute("class", "chart-base-circle");
        svgElementWrapper.appendChild(baseTrackingCircle);

        let cumulativeArcOffsetPercentage = 0;

        CATEGORIES.forEach(categoryName => {
            const calculatedCategorySum = functionalCategoryMapHash[categoryName];
            if (calculatedCategorySum <= 0) return;

            const categoryPercentageRatio = (calculatedCategorySum / aggregateSumVal) * 100;
            const arcStrokeDashValue = categoryPercentageRatio;
            const arcStrokeOffsetInverseValue = 100 - cumulativeArcOffsetPercentage + 25; // Adjusted structural orientation mapping

            const analyticalCategoryArc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            analyticalCategoryArc.setAttribute("cx", "21");
            analyticalCategoryArc.setAttribute("cy", "21");
            analyticalCategoryArc.setAttribute("r", "15.91549430918954");
            analyticalCategoryArc.setAttribute("class", "chart-progress-arc");
            analyticalCategoryArc.setAttribute("stroke", CATEGORY_COLORS[categoryName]);
            analyticalCategoryArc.setAttribute("stroke-dasharray", `${arcStrokeDashValue} ${100 - arcStrokeDashValue}`);
            // Modifying explicit SVG mathematical offset mapping paths structural rendering loops
            analyticalCategoryArc.setAttribute("stroke-dashoffset", String(arcStrokeOffsetInverseValue % 100));
            
            svgElementWrapper.appendChild(analyticalCategoryArc);
            cumulativeArcOffsetPercentage += categoryPercentageRatio;

            // Injected dynamic legend items labels configurations elements matching active colors
            const legendItemElement = document.createElement("div");
            legendItemElement.className = "legend-item";
            legendItemElement.innerHTML = `
                <span class="legend-color-dot" style="background-color: ${CATEGORY_COLORS[categoryName]}"></span>
                <span>${categoryName} (${Math.round(categoryPercentageRatio).toLocaleString('ar-EG')}%)</span>
            `;
            legendContainerNode.appendChild(legendItemElement);
        });

        const labelOverlayDOMWrapper = document.createElement("div");
        labelOverlayDOMWrapper.className = "chart-center-label";
        labelOverlayDOMWrapper.innerHTML = `
            <span class="center-num">${aggregateSumVal.toLocaleString('ar-EG')}</span>
            <span class="center-txt">ج.م مسجلة</span>
        `;

        chartWrapperNode.appendChild(svgElementWrapper);
        chartWrapperNode.appendChild(labelOverlayDOMWrapper);
    }

    function renderCategoryFilterChipsInterface(context) {
        const filterWrapperNode = document.getElementById("category-filter-chips");
        filterWrapperNode.innerHTML = "";

        // Build active global all chip selector tag layout node
        const globalAllChipNode = document.createElement("span");
        globalAllChipNode.className = `chip ${appState.activeCategoryFilter === null ? 'active' : ''}`;
        globalAllChipNode.textContent = "الكل القياسي";
        globalAllChipNode.addEventListener("click", () => {
            appState.activeCategoryFilter = null;
            renderGlobalDashboardViews();
        });
        filterWrapperNode.appendChild(globalAllChipNode);

        // Find and iterate distinct present operational tracking classification segments elements matrices rules
        const presentActiveCategoryHashSet = new Set(context.expenses.map(item => item.category));
        
        CATEGORIES.forEach(catName => {
            if (!presentActiveCategoryHashSet.has(catName)) return;

            const structuredFilterChipElement = document.createElement("span");
            structuredFilterChipElement.className = `chip ${appState.activeCategoryFilter === catName ? 'active' : ''}`;
            structuredFilterChipElement.textContent = catName;
            structuredFilterChipElement.addEventListener("click", () => {
                appState.activeCategoryFilter = (appState.activeCategoryFilter === catName) ? null : catName;
                renderGlobalDashboardViews();
            });
            filterWrapperNode.appendChild(structuredFilterChipElement);
        });
    }

    function renderLedgerTransactionElements(context) {
        const ledgerContainerListRoot = document.getElementById("transaction-list-root");
        const emptyStateInterfaceView = document.getElementById("empty-state-view");
        const searchInputNodeTextQuery = document.getElementById("search-input").value.trim().toLowerCase();

        ledgerContainerListRoot.innerHTML = "";

        // Filter and evaluate entries using complex criteria
        let computedFilterRecordCollection = context.expenses.filter(item => {
            const matchesCategoryConstraint = (appState.activeCategoryFilter === null || item.category === appState.activeCategoryFilter);
            const matchesTextSearchQuery = (!searchInputNodeTextQuery || 
                item.notes.toLowerCase().includes(searchInputNodeTextQuery) || 
                item.category.toLowerCase().includes(searchInputNodeTextQuery));
            return matchesCategoryConstraint && matchesTextSearchQuery;
        });

        // Ensure proper ordered array sorting sequencing sequence mapping
        computedFilterRecordCollection.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (computedFilterRecordCollection.length === 0) {
            emptyStateInterfaceView.classList.remove("hidden");
            ledgerContainerListRoot.classList.add("hidden");
            return;
        }

        emptyStateInterfaceView.classList.add("hidden");
        ledgerContainerListRoot.classList.remove("hidden");

        // Use DocumentFragment to optimize memory overhead and render at a smooth 120fps
        const DOMPipelineDocumentFragment = document.createDocumentFragment();

        computedFilterRecordCollection.forEach(transactionNodeRecord => {
            const rowItemWrapperContainer = document.createElement("li");
            rowItemWrapperContainer.className = "tx-row-item-wrapper";
            rowItemWrapperContainer.dataset.id = transactionNodeRecord.id;

            // Constructing backend action background container panel layout views template layers
            const backendSwipeRevealPanel = document.createElement("div");
            backendSwipeRevealPanel.className = "swipe-action-reveal-backend";
            backendSwipeRevealPanel.innerHTML = `<span>مسح وحذف فوري الأثر</span>`;
            rowItemWrapperContainer.appendChild(backendSwipeRevealPanel);

            // Foreground tactile swipe-interactive animation layer surface card element block wrapper elements
            const foregroundInteractiveSurface = document.createElement("div");
            foregroundInteractiveSurface.className = "tx-row-interactive-surface";
            
            const operationalFormattedDate = new Date(transactionNodeRecord.timestamp).toLocaleDateString('ar-EG', {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            foregroundInteractiveSurface.innerHTML = `
                <div class="tx-meta-info-block">
                    <div class="tx-category-icon-avatar" style="color: ${CATEGORY_COLORS[transactionNodeRecord.category]}; background-color: ${CATEGORY_COLORS[transactionNodeRecord.category]}15">
                        ${transactionNodeRecord.category.charAt(0)}
                    </div>
                    <div class="tx-text-headers">
                        <span class="tx-headline-title">${transactionNodeRecord.notes || transactionNodeRecord.category}</span>
                        <span class="tx-sub-timestamp-meta">${operationalFormattedDate}</span>
                    </div>
                </div>
                <div class="tx-monetary-value-block">
                    <span class="tx-amount-numeric">${Number(transactionNodeRecord.amount).toLocaleString('ar-EG')} ج.م</span>
                    ${transactionNodeRecord.isRecurring ? `<span class="badge-recurring">التزام دوري</span>` : ''}
                </div>
            `;

            // Append gesture event listener attachments hooks
            attachMobileSwipeGestureTrackers(foregroundInteractiveSurface, transactionNodeRecord.id);

            rowItemWrapperContainer.appendChild(foregroundInteractiveSurface);
            DOMPipelineDocumentFragment.appendChild(rowItemWrapperContainer);
        });

        ledgerContainerListRoot.appendChild(DOMPipelineDocumentFragment);
    }

    // 6. Mobile Viewport Tactile Touch Gestures & Haptic Feedback Engine
    function attachMobileSwipeGestureTrackers(surfaceElement, transactionRecordId) {
        let initialTouchXCoordinate = 0;
        let deltaCurrentXMoveDistance = 0;
        let isSwipeGestureCapturedActive = false;
        const minimumSwipeExecutionThreshold = -90; // Pixels distance triggered leftwards

        surfaceElement.addEventListener("touchstart", (touchEvent) => {
            initialTouchXCoordinate = touchEvent.touches[0].clientX;
            isSwipeGestureCapturedActive = true;
            surfaceElement.style.transition = "none"; // Explicitly clear easing animations frames to match exact hardware tracing
        }, { passive: true });

        surfaceElement.addEventListener("touchmove", (touchEvent) => {
            if (!isSwipeGestureCapturedActive) return;
            const activeTraceCurrentX = touchEvent.touches[0].clientX;
            deltaCurrentXMoveDistance = activeTraceCurrentX - initialTouchXCoordinate;

            // Restricting structural swipe orientation layout patterns tracking logic leftwards parameters constraints
            if (deltaCurrentXMoveDistance > 0) deltaCurrentXMoveDistance = 0; // Constrain rightwards mutations
            if (deltaCurrentXMoveDistance < -140) deltaCurrentXMoveDistance = -140; // Max constraint range limit boundaries

            surfaceElement.style.transform = `translate3d(${deltaCurrentXMoveDistance}px, 0, 0)`;
        }, { passive: true });

        surfaceElement.addEventListener("touchend", () => {
            isSwipeGestureCapturedActive = false;
            surfaceElement.style.transition = "transform 0.2s ease";

            if (deltaCurrentXMoveDistance <= minimumSwipeExecutionThreshold) {
                // Lock swipe position and execute immediate cascading delete operations pipelines
                surfaceElement.style.transform = "translate3d(-100%, 0, 0)";
                triggerTactileMobileHapticTapFeedback();
                executeTransactionRecordDeletion(transactionRecordId);
            } else {
                // Cancel translation parameters and return layout objects back cleanly
                surfaceElement.style.transform = "translate3d(0,0,0)";
            }
            deltaCurrentXMoveDistance = 0;
        });

        // Click interaction path routes straight to opening inline alteration edit configuration dashboards portals views
        surfaceElement.addEventListener("click", (clickEvent) => {
            // Prevent interference from swipe states
            if (Math.abs(deltaCurrentXMoveDistance) > 5) return;
            openMutationModalPortalDashboardInterface('edit', transactionRecordId);
        });
    }

    function triggerTactileMobileHapticTapFeedback() {
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(10); // Standard discrete precision haptic feedback duration frame length
        }
    }

    // 7. High-Fidelity CRUD Mutator Implementations Core Loops (Optimistic UI Frameworks)
    function executeTransactionMutationPipeline(formSubmissionEvent) {
        formSubmissionEvent.preventDefault();

        const targetMutationIdKey = document.getElementById("mutation-target-id").value;
        const inputEnteredAmount = parseFloat(document.getElementById("tx-amount").value);
        const inputSelectedCategory = document.getElementById("tx-category").value;
        const inputEnteredTimestamp = document.getElementById("tx-timestamp").value;
        const inputCheckboxRecurringStatus = document.getElementById("tx-recurring").checked;
        const inputNotesTextDescription = document.getElementById("tx-notes").value.trim();

        if (isNaN(inputEnteredAmount) || inputEnteredAmount <= 0) {
            triggerNotificationToast("يرجى إدخال قيمة مالية صالحة ومطابقة.");
            return;
        }

        const currentActiveContext = appState[appState.activeTab];

        // Model structural template maps
        const mutatedRecordObject = {
            id: targetMutationIdKey || "TX_NODE_" + Date.now() + Math.random().toString(36).substr(2, 5),
            amount: inputEnteredAmount,
            category: inputSelectedCategory,
            timestamp: inputEnteredTimestamp,
            isRecurring: inputCheckboxRecurringStatus,
            notes: inputNotesTextDescription
        };

        if (targetMutationIdKey) {
            // Processing operational structural updates edits paths elements matching targets keys
            const targetingIndexMatch = currentActiveContext.expenses.findIndex(item => item.id === targetMutationIdKey);
            if (targetingIndexMatch !== -1) currentActiveContext.expenses[targetingIndexMatch] = mutatedRecordObject;
        } else {
            // Prepend transaction array entry record item elements
            currentActiveContext.expenses.unshift(mutatedRecordObject);
        }

        // Trigger Optimistic Layout Refreshes immediately before awaiting secondary asynchronous IO persistence checks
        renderGlobalDashboardViews();
        closeModalPortalDashboardInterface();
        triggerTactileMobileHapticTapFeedback();
        triggerNotificationToast(targetMutationIdKey ? "تمت تعديل العملية وحفظ التغييرات بنجاح" : "تم تسجيل وإضافة المصروف بنجاح");

        // Sync operation to persistent storage engine
        setTimeout(() => {
            const operationPersistenceResultStatus = saveStateToStoragePipeline();
            if (!operationPersistenceResultStatus) {
                executeOptimisticRollback("فشل تخزين البيانات محلياً. تم إلغاء العملية لضمان سلامة محفظتك.");
            }
        }, 30);
    }

    function executeTransactionRecordDeletion(targetRecordId) {
        const targetingActiveContext = appState[appState.activeTab];
        const backupTargetRecordIndex = targetingActiveContext.expenses.findIndex(item => item.id === targetRecordId);
        
        if (backupTargetRecordIndex === -1) return;

        // Perform immediate optimistic arrays transformations removal routines
        targetingActiveContext.expenses.splice(backupTargetRecordIndex, 1);
        renderGlobalDashboardViews();
        triggerNotificationToast("تم حذف القيد المعاملاتي من السجل التشغيلي");

        // Persist deletion modifications layouts changes
        setTimeout(() => {
            const deletionWriteResultStatus = saveStateToStoragePipeline();
            if (!deletionWriteResultStatus) {
                executeOptimisticRollback("تعذر إتمام عملية مسح السجلات محلياً. تم التراجع واستعادة القيد المالي المفقود.");
            }
        }, 30);
    }

    function executeIncomeAllocationSplittingRouting(formSplitterSubmitEvent) {
        formSplitterSubmitEvent.preventDefault();

        const amountSalary = parseFloat(document.getElementById("income-salary").value) || 0;
        const amountFreelance = parseFloat(document.getElementById("income-freelance").value) || 0;
        const amountPassive = parseFloat(document.getElementById("income-passive").value) || 0;

        const aggregateConsolidatedIncomesSum = amountSalary + amountFreelance + amountPassive;

        if (aggregateConsolidatedIncomesSum <= 0) {
            triggerNotificationToast("يرجى إدخال عوائد أو مصادر دخل إضافية لتفعيل الحساب التوزيعي.");
            return;
        }

        const personalAllocationPercentSize = appState.allocationRatio;
        const familyAllocationPercentSize = 100 - personalAllocationPercentSize;

        // Apply mathematical routing allocations straight onto specific parameters blocks context
        appState.personal.income = Math.round(aggregateConsolidatedIncomesSum * (personalAllocationPercentSize / 100));
        appState.family.income = Math.round(aggregateConsolidatedIncomesSum * (familyAllocationPercentSize / 100));

        renderGlobalDashboardViews();
        triggerNotificationToast("تمت معالجة التدفقات المالية وتوزيع السيولة بنجاح وعبر القنوات المحددة.");

        setTimeout(() => {
            if (!saveStateToStoragePipeline()) {
                executeOptimisticRollback("فشلت مزامنة قيم الدخل التوزيعية الجديدة.");
            }
        }, 20);
    }

    function checkRecurringBillingDueStatus() {
        const currentActiveContext = appState[appState.activeTab];
        const structuralRecurringItemsDueCollection = currentActiveContext.expenses.filter(item => item.isRecurring);
        const notificationZoneElementNode = document.getElementById("recurring-billing-zone");

        if (structuralRecurringItemsDueCollection.length > 0) {
            notificationZoneElementNode.classList.remove("hidden");
        } else {
            notificationZoneElementNode.classList.add("hidden");
        }
    }

    function executeBatchProcessingRecurringDeductions() {
        const activeTrackingContext = appState[appState.activeTab];
        const structuralRecurringItemsDueCollection = activeTrackingContext.expenses.filter(item => item.isRecurring);

        if (structuralRecurringItemsDueCollection.length === 0) return;

        // Process rapid iteration loops duplicating and appending fresh execution cycles records matching the current date
        const currentStandardISODateString = new Date().toISOString().substring(0, 16);
        
        structuralRecurringItemsDueCollection.forEach(originalBillTemplate => {
            const duplicatedClonedBillRecordInstance = {
                id: "TX_NODE_" + Date.now() + Math.random().toString(36).substr(2, 5),
                amount: originalBillTemplate.amount,
                category: originalBillTemplate.category,
                timestamp: currentStandardISODateString,
                isRecurring: false, // Generated instance remains single processing transactional entry point object
                notes: `تطبيق تلقائي دوري: ${originalBillTemplate.notes || originalBillTemplate.category}`
            };
            activeTrackingContext.expenses.unshift(duplicatedClonedBillRecordInstance);
        });

        renderGlobalDashboardViews();
        triggerNotificationToast(`تمت معالجة وخصم عدد (${structuralRecurringItemsDueCollection.length.toLocaleString('ar-EG')}) فواتير والتزامات دورية مجدولة.`);
        document.getElementById("recurring-billing-zone").classList.add("hidden");

        setTimeout(() => {
            saveStateToStoragePipeline();
        }, 30);
    }

    // 8. Administrative Enterprise Financial Document Export Engine Layout Mapper
    function generateOfficialStatementReportAdminPrint() {
        const activeScopeLabel = appState.activeTab === 'personal' ? 'المصروفات الشخصية المباشرة' : 'مصروفات المنزل والعائلة المشتركة';
        const targetingContext = appState[appState.activeTab];
        const printCanvasContainerPortal = document.getElementById("hidden-print-canvas");
        
        const timestampGenerationLabel = new Date().toLocaleString('ar-EG', {
            calendar: 'gregory', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        let dataTableRowsMarkupHTMLBuffer = "";
        let calculatedAggregateCostSum = 0;

        targetingContext.expenses.forEach((recordItem, indexValue) => {
            calculatedAggregateCostSum += Number(recordItem.amount);
            dataTableRowsMarkupHTMLBuffer += `
                <tr>
                    <td>${(indexValue + 1).toLocaleString('ar-EG')}</td>
                    <td>${recordItem.category}</td>
                    <td>${new Date(recordItem.timestamp).toLocaleDateString('ar-EG')}</td>
                    <td>${recordItem.notes || '—'}</td>
                    <td style="font-weight: bold; color: #dc2626;">${Number(recordItem.amount).toLocaleString('ar-EG')} ج.م</td>
                </tr>
            `;
        });

        const availableNetSurplusBalance = Number(targetingContext.income || 0) - calculatedAggregateCostSum;

        printCanvasContainerPortal.innerHTML = `
            <header class="print-header">
                <div class="print-title">كشف بيان المركز المالي الموحد</div>
                <div class="print-meta-block">
                    <div>تصنيف التقرير: ${activeScopeLabel}</div>
                    <div>تاريخ الاستخراج والطباعة: ${timestampGenerationLabel}</div>
                    <div>العملة السيادية المعتمدة: الجنيه المصري (ج.م)</div>
                </div>
            </header>
            
            <section>
                <table class="print-data-table">
                    <thead>
                        <tr>
                            <th style="width: 5%">#</th>
                            <th style="width: 20%">التصنيف الهيكلي</th>
                            <th style="width: 15%">تاريخ القيد</th>
                            <th style="width: 40%">البيان والشرح التوضيحي</th>
                            <th style="width: 20%">القيمة المستقطعة</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dataTableRowsMarkupHTMLBuffer || '<tr><td colspan="5" style="text-align:center;">لا توجد معاملات مسجلة ضمن هذه الفترة الإدارية المالية.</td></tr>'}
                    </tbody>
                </table>
            </section>
            
            <div class="print-summary-grid">
                <div>
                    <strong>إجمالي سقف السيولة التوزيعية المخصصة:</strong> 
                    <span style="color: #10b981;">${Number(targetingContext.income || 0).toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div>
                    <strong>إجمالي المصروفات الصادرة والمدفوعات:</strong> 
                    <span style="color: #ef4444;">${calculatedAggregateCostSum.toLocaleString('ar-EG')} ج.م</span>
                </div>
                <div>
                    <strong>صافي الفائض الاستثماري المرحل المتبقي:</strong> 
                    <span style="font-weight: bold; color: #2563eb;">${availableNetSurplusBalance.toLocaleString('ar-EG')} ج.م</span>
                </div>
            </div>
            
            <footer class="print-credit-block">
                Official Financial Statement – Built by Hazem K H Madi - Senior Product Designer
            </footer>
        `;

        // Execute core hardware browser interception loops printer layout managers directly
        window.print();
    }

    // 9. Interactive Elements Core Event Delegation Registrars Routing Interface
    function registerDOMEvents() {
        // Shared Segment Navigator Context Switcher
        document.querySelectorAll(".segment-btn").forEach(btnNode => {
            btnNode.addEventListener("click", (clickEvent) => {
                const targetClickedTabKeyToken = clickEvent.currentTarget.dataset.tab;
                if (appState.activeTab === targetClickedTabKeyToken) return;

                document.querySelectorAll(".segment-btn").forEach(el => el.classList.remove("active"));
                clickEvent.currentTarget.classList.add("active");
                
                appState.activeTab = targetClickedTabKeyToken;
                appState.activeCategoryFilter = null; // Clear down context specific filters active maps
                
                renderGlobalDashboardViews();
                checkRecurringBillingDueStatus();
            });
        });

        // Theme Toggle Button Interceptor
        document.getElementById("theme-toggle").addEventListener("click", () => {
            appState.theme = (appState.theme === 'light') ? 'dark' : 'light';
            applySystemThemeContext();
            saveStateToStoragePipeline();
        });

        // Search Ledger Live Tracker Filters Loops
        document.getElementById("search-input").addEventListener("input", () => {
            renderLedgerTransactionElements(appState[appState.activeTab]);
        });

        // Income Splitting Utility Elements Interface Submissions Hook
        document.getElementById("income-splitter-form").addEventListener("submit", executeIncomeAllocationSplittingRouting);

        // Continuous Slider Metric Ratio Realtime Adjustments Labels Tracker
        document.getElementById("allocation-slider").addEventListener("input", (sliderEvent) => {
            const currentPositionVal = parseInt(sliderEvent.target.value);
            appState.allocationRatio = currentPositionVal;
            document.getElementById("allocation-ratio-label").textContent = `${currentPositionVal}% شخصي / ${100 - currentPositionVal}% عائلي`;
        });

        // Structural Modal Openers and Closers Actions Bindings
        document.getElementById("btn-open-add-modal").addEventListener("click", () => openMutationModalPortalDashboardInterface('add'));
        document.getElementById("btn-close-modal").addEventListener("click", closeModalPortalDashboardInterface);
        document.getElementById("btn-cancel-modal").addEventListener("click", closeModalPortalDashboardInterface);
        document.getElementById("transaction-mutation-form").addEventListener("submit", executeTransactionMutationPipeline);

        // Settings Slider Flyout Panels Actions Targets Controls
        document.getElementById("settings-trigger").addEventListener("click", openSettingsSlideoverMenuInterface);
        document.getElementById("btn-close-settings").addEventListener("click", closeSettingsSlideoverMenuInterface);
        document.getElementById("btn-clear-all-data").addEventListener("click", executeGlobalPurgeFactoryResetClearanceRoutine);

        // Batch processing recurring actions triggers
        document.getElementById("btn-trigger-recurring").addEventListener("click", executeBatchProcessingRecurringDeductions);

        // Administrative printing action trigger button component layout tracker
        document.getElementById("btn-export-statement").addEventListener("click", generateOfficialStatementReportAdminPrint);
    }

    function applySystemThemeContext() {
        document.documentElement.setAttribute("data-theme", appState.theme);
        const themeMetaHeaderNode = document.getElementById("theme-meta");
        if (themeMetaHeaderNode) {
            themeMetaHeaderNode.setAttribute("content", appState.theme === 'dark' ? '#131c2e' : '#ffffff');
        }
    }

    function openMutationModalPortalDashboardInterface(intentModeType, targetRecordId = null) {
        const modalOverlayPortal = document.getElementById("transaction-modal");
        const modalIntentTitleNode = document.getElementById("modal-title-intent");
        const mutationFormElement = document.getElementById("transaction-mutation-form");
        
        mutationFormElement.reset();
        document.getElementById("mutation-target-id").value = "";
        
        // Setup default date configuration inputs strings standard format mapping match fields
        const localDateTimeNowISOString = new Date().toISOString().substring(0, 16);
        document.getElementById("tx-timestamp").value = localDateTimeNowISOString;

        if (intentModeType === 'edit' && targetRecordId) {
            modalIntentTitleNode.textContent = "تعديل تفاصيل القيد المالي الصادر";
            const currentRecordContextMatch = appState[appState.activeTab].expenses.find(item => item.id === targetRecordId);
            
            if (currentRecordContextMatch) {
                document.getElementById("mutation-target-id").value = currentRecordContextMatch.id;
                document.getElementById("tx-amount").value = currentRecordContextMatch.amount;
                document.getElementById("tx-category").value = currentRecordContextMatch.category;
                document.getElementById("tx-timestamp").value = currentRecordContextMatch.timestamp;
                document.getElementById("tx-recurring").checked = currentRecordContextMatch.isRecurring;
                document.getElementById("tx-notes").value = currentRecordContextMatch.notes || "";
            }
        } else {
            modalIntentTitleNode.textContent = "إضافة معاملة خصم جديدة";
        }

        modalOverlayPortal.classList.remove("hidden");
        modalOverlayPortal.setAttribute("aria-hidden", "false");
    }

    function closeModalPortalDashboardInterface() {
        const modalOverlayPortal = document.getElementById("transaction-modal");
        modalOverlayPortal.classList.add("hidden");
        modalOverlayPortal.setAttribute("aria-hidden", "true");
    }

    function openSettingsSlideoverMenuInterface() {
        const settingsSlideoverOverlay = document.getElementById("settings-slideover");
        settingsSlideoverOverlay.classList.remove("hidden");
        settingsSlideoverOverlay.setAttribute("aria-hidden", "false");
    }

    function closeSettingsSlideoverMenuInterface() {
        const settingsSlideoverOverlay = document.getElementById("settings-slideover");
        settingsSlideoverOverlay.classList.add("hidden");
        settingsSlideoverOverlay.setAttribute("aria-hidden", "true");
    }

    function executeGlobalPurgeFactoryResetClearanceRoutine() {
        if (confirm("تحذير أمني قطعي: هل أنت متأكد تماماً من رغبتك في مسح كافة البيانات المسجلة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
            localStorage.removeItem("HAZEM_FINTECH_PWA_STATE");
            triggerNotificationToast("تم تهيئة ومسح قاعدة البيانات بنجاح تام.");
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }

    // 10. Dynamic Floating System Notification Alerts Manager Hub Layout Engine
    function triggerNotificationToast(messageTextDescriptionString) {
        const notificationHubRootNode = document.getElementById("toast-notification-hub");
        
        const toastMessageItemNode = document.createElement("div");
        toastMessageItemNode.className = "toast-message-node";
        toastMessageItemNode.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span>${messageTextDescriptionString}</span>
        `;

        notificationHubRootNode.appendChild(toastMessageItemNode);

        // Automated garbage clearance collection removal of notification node assets elements after animation cycles
        setTimeout(() => {
            toastMessageItemNode.style.opacity = "0";
            toastMessageItemNode.style.transform = "translateY(-10px)";
            toastMessageItemNode.style.transition = "all 0.3s ease";
            setTimeout(() => {
                toastMessageItemNode.remove();
            }, 300);
        }, 3500);
    }

    // 11. Core Progressive Web App Hardware Interceptor Engine Installer Loop
    let interceptedDeferredPWAInstallPromptEventInstance = null;

    function initializePWAServiceEngine() {
        // Handle native PWA capture triggers lifecycle parameters pipelines
        window.addEventListener("beforeinstallprompt", (promptInterceptedEvent) => {
            promptInterceptedEvent.preventDefault();
            interceptedDeferredPWAInstallPromptEventInstance = promptInterceptedEvent;
            
            const actionButtonPWAInstallerTrigger = document.getElementById("btn-pwa-install");
            if (actionButtonPWAInstallerTrigger) {
                actionButtonPWAInstallerTrigger.classList.remove("hidden");
                actionButtonPWAInstallerTrigger.addEventListener("click", executeNativePWAHardwareInstallationSequence);
            }
        });

        // Continuous explicit matching tracking configuration routing maps checking system platform matching iOS structures
        const userAgentMobileDeviceCheck = window.navigator.userAgent.toLowerCase();
        const isIOSSystemSafariDetected = /iphone|ipad|ipod/.test(userAgentMobileDeviceCheck);
        const isRunningInStandaloneDisplayMode = window.matchMedia('(display-mode: standalone)').matches;

        if (isIOSSystemSafariDetected && !isRunningInStandaloneDisplayMode) {
            const iosSafariGuideNodeBox = document.getElementById("ios-safari-guide");
            if (iosSafariGuideNodeBox) iosSafariGuideNodeBox.classList.remove("hidden");
        }

        // Register core background network caching service structural scripts assets
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registrationSuccessObj => {
                        // Successfully bound background thread tracking lifecycle tasks assets parameters mapping
                    })
                    .catch(registrationExceptionError => {
                        // Silently contain execution registration issues mapping pipelines parameters tracking logs
                    });
            });
        }
    }

    function executeNativePWAHardwareInstallationSequence() {
        if (!interceptedDeferredPWAInstallPromptEventInstance) return;
        
        interceptedDeferredPWAInstallPromptEventInstance.prompt();
        interceptedDeferredPWAInstallPromptEventInstance.userChoice.then((userInstallationDecisionToken) => {
            if (userInstallationDecisionToken.outcome === 'accepted') {
                triggerNotificationToast("شكراً لك! تم تثبيت المنظومة المالية بنجاح على جهازك.");
                document.getElementById("btn-pwa-install").classList.add("hidden");
            }
            interceptedDeferredPWAInstallPromptEventInstance = null;
        });
    }

})();
