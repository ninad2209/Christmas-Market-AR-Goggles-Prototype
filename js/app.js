/* ============================================
   Christmas AR Goggles - G94
   Main Application JavaScript
   ============================================ */

// Mock Stall Data - Expanded for Scenario 3
const StallData = {
    vegan: [
        { name: 'VegaMax', type: 'Vegan Stall', distance: 120, wait: 5, rating: 4.5, score: 0 },
        { name: 'Plant Power', type: 'Vegan Stall', distance: 180, wait: 3, rating: 4.8, score: 0 },
    ],
    vegetarian: [
        { name: 'Green Garden', type: 'Vegetarian Stall', distance: 85, wait: 3, rating: 4.2, score: 0 },
        { name: 'Veggie Delight', type: 'Vegetarian Stall', distance: 150, wait: 5, rating: 4.6, score: 0 }
    ],
    halal: [
        { name: 'Halal Delights', type: 'Halal Stall', distance: 200, wait: 8, rating: 4.7, score: 0 },
        { name: 'Crescent Kitchen', type: 'Halal Stall', distance: 110, wait: 6, rating: 4.3, score: 0 }
    ],
    glutenfree: [
        { name: 'Free & Fresh', type: 'Gluten-Free Stall', distance: 140, wait: 4, rating: 4.4, score: 0 }
    ],
    drinks: [
        { name: 'Glühwein Stand', type: 'Drinks Stall', distance: 60, wait: 2, rating: 4.9, score: 0 },
        { name: 'Hot Cocoa Corner', type: 'Drinks Stall', distance: 100, wait: 4, rating: 4.5, score: 0 }
    ],
    sweets: [
        { name: 'Sugar & Spice', type: 'Sweets Stall', distance: 75, wait: 3, rating: 4.6, score: 0 },
        { name: 'Cookie Castle', type: 'Sweets Stall', distance: 130, wait: 5, rating: 4.4, score: 0 }
    ]
};

// Scenario 2: Group Members Data
const GroupMembers = [
    { id: 'A', name: 'You', role: 'leader', location: null, isLost: false },
    { id: 'B', name: 'Max', role: 'member', location: 'Coffee Club', isLost: false },
    { id: 'C', name: 'Emma', role: 'member', location: null, isLost: false }
];

// Scenario 2: Meeting Locations
const MeetingLocations = {
    entrance: { name: 'Market Entrance', distance: 150 },
    exit: { name: 'Exit Gate', distance: 200 },
    church: { name: 'Church Entrance', distance: 100 }
};

// Application State
const AppState = {
    gazeEnabled: false,
    menuOpen: false,
    currentView: 'none',
    activeGoal: 'Welcome to the Christmas Market',
    dwellTimeout: null,
    dwellTarget: null,
    gazePosition: { x: 0, y: 0 },
    // Task 1 specific state
    selectedFilter: null,
    currentDestination: null,
    previousDestination: null,
    isNavigating: false,
    isDiverted: false,
    // Navigation timer state
    navigationTimer: null,
    currentDistance: 0,
    originalDistance: 0,
    destinationType: null,  // 'stall' or 'facility'
    // Scenario 3: Multi-stall selection
    selectedStalls: [],
    plannedRoute: [],
    currentRouteIndex: 0,
    availableStalls: [],
    // Scenario 2: Group Management
    groupMembers: [...GroupMembers],
    selectedLostMember: null,
    meetingPoint: null,
    meetingTime: null,
    isLeaderView: true  // Toggle between leader and lost member view
};

// DOM References
const DOM = {
    gazeReticle: null,
    gazeStatus: null,
    gestureFeedback: null,
    activeGoal: null,
    timeDisplay: null,
    mainContent: null,
    menuToggle: null,
    sideMenu: null,
    // Task 1 panels
    foodPanel: null,
    stallCard: null,
    facilitiesPanel: null,
    continuePrompt: null,
    arNavigation: null,
    // Scenario 3 panels
    stallListPanel: null,
    stallList: null,
    arrivedPanel: null,
    // Scenario 2 panels
    groupPanel: null,
    lostMemberAlert: null,
    memberDetailsModal: null,
    locationSelector: null,
    timeSelector: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeDOMReferences();
    initializeKeyboardControls();
    initializeMouseTracking();
    initializeMenuToggle();
    initializeTask1Handlers();
    initializeScenario2Handlers();
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);

    console.log('🎄 Christmas AR Goggles initialized');
    console.log('Press G to toggle gaze mode, N to confirm, S to cancel');
    console.log('Press L to simulate lost member (Scenario 2)');
});

// Initialize DOM References
function initializeDOMReferences() {
    DOM.gazeReticle = document.getElementById('gaze-reticle');
    DOM.gazeStatus = document.getElementById('gaze-status');
    DOM.gestureFeedback = document.getElementById('gesture-feedback');
    DOM.activeGoal = document.getElementById('active-goal');
    DOM.timeDisplay = document.getElementById('time-display');
    DOM.mainContent = document.getElementById('main-content');
    DOM.menuToggle = document.getElementById('menu-toggle');
    DOM.sideMenu = document.getElementById('side-menu');
    // Task 1 panels
    DOM.foodPanel = document.getElementById('food-panel');
    DOM.stallCard = document.getElementById('stall-card');
    DOM.facilitiesPanel = document.getElementById('facilities-panel');
    DOM.continuePrompt = document.getElementById('continue-prompt');
    DOM.arNavigation = document.getElementById('ar-navigation');
    // Scenario 3 panels
    DOM.stallListPanel = document.getElementById('stall-list-panel');
    DOM.stallList = document.getElementById('stall-list');
    DOM.arrivedPanel = document.getElementById('arrived-panel');
    // Scenario 2 panels
    DOM.groupPanel = document.getElementById('group-panel');
    DOM.lostMemberAlert = document.getElementById('lost-member-alert');
    DOM.memberDetailsModal = document.getElementById('member-details-modal');
    DOM.locationSelector = document.getElementById('location-selector');
    DOM.timeSelector = document.getElementById('time-selector');
}

// ============================================
// Task 1 Handlers
// ============================================
function initializeTask1Handlers() {
    // Food filter buttons
    document.querySelectorAll('.filter-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            handleFilterSelection(filter);
        });
    });

    // Stall action buttons
    document.querySelectorAll('.stall-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'start-nav') {
                startNavigation();
            } else if (action === 'more-options') {
                console.log('More options clicked');
            }
        });
    });

    // Facility buttons
    document.querySelectorAll('.facility-item').forEach(btn => {
        btn.addEventListener('click', () => {
            const facility = btn.dataset.facility;
            handleFacilitySelection(facility);
        });
    });

    // Continue prompt buttons
    document.querySelectorAll('.prompt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'continue-yes') {
                handleContinueYes();
            } else if (action === 'continue-no') {
                handleContinueNo();
            }
        });
    });

    // Cancel navigation button
    const cancelNavBtn = document.getElementById('cancel-nav-btn');
    if (cancelNavBtn) {
        cancelNavBtn.addEventListener('click', () => {
            cancelNavigation();
        });
    }

    // Navigate to selected button (Scenario 3)
    const navigateSelectedBtn = document.getElementById('navigate-selected-btn');
    if (navigateSelectedBtn) {
        navigateSelectedBtn.addEventListener('click', () => {
            navigateToSelected();
        });
    }

    // Arrived panel buttons
    const continueRouteBtn = document.getElementById('continue-route-btn');
    if (continueRouteBtn) {
        continueRouteBtn.addEventListener('click', () => {
            continueToNextStall();
        });
    }

    const cancelRouteBtn = document.getElementById('cancel-route-btn');
    if (cancelRouteBtn) {
        cancelRouteBtn.addEventListener('click', () => {
            endRoute();
        });
    }

    // Back button handlers for all panels
    document.querySelectorAll('.panel-back-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const backType = btn.dataset.back;
            handlePanelBack(backType);
        });
    });
}

// Handle panel back button clicks
function handlePanelBack(panelType) {
    console.log(`Back button clicked for: ${panelType}`);

    switch (panelType) {
        case 'food':
            DOM.foodPanel?.classList.add('hidden');
            break;
        case 'stall-list':
            // Go back to food panel
            DOM.stallListPanel?.classList.add('hidden');
            DOM.foodPanel?.classList.remove('hidden');
            setActiveGoal('What are you looking for?');
            return;
        case 'facilities':
            DOM.facilitiesPanel?.classList.add('hidden');
            break;
        case 'group':
            // Only allow closing if no active scenario
            const isScenarioActive = AppState.groupMembers.some(m => m.isLost);
            if (!isScenarioActive) {
                DOM.groupPanel?.classList.add('hidden');
            } else {
                console.log('Cannot close group panel during active scenario');
                return;
            }
            break;
    }

    setActiveGoal('Welcome to the Christmas Market');
}

function handleFilterSelection(filter) {
    console.log(`Filter selected: ${filter}`);
    AppState.selectedFilter = filter;
    AppState.selectedStalls = [];

    // Get stalls for this filter
    const stalls = StallData[filter] || [];

    if (stalls.length === 0) {
        console.log('No stalls found for this filter');
        return;
    }

    // Calculate score for each stall (higher is better)
    // Score = rating * 2 - (distance/50) - (wait/2)
    AppState.availableStalls = stalls.map(stall => ({
        ...stall,
        score: (stall.rating * 2) - (stall.distance / 50) - (stall.wait / 2)
    })).sort((a, b) => b.score - a.score);

    // Populate stall list
    populateStallList(AppState.availableStalls);

    // Hide food panel, show stall list
    hideAllPanels();
    DOM.stallListPanel.classList.remove('hidden');

    setActiveGoal(`Select from ${stalls.length} ${filter} options`);
}

function startNavigation() {
    console.log('Starting navigation to:', AppState.currentDestination);
    AppState.isNavigating = true;
    AppState.destinationType = 'stall';

    // Get distance from stall data (search in arrays)
    let stallInfo = null;
    for (const category of Object.values(StallData)) {
        const found = category.find(s => s.name === AppState.currentDestination);
        if (found) {
            stallInfo = found;
            break;
        }
    }
    if (stallInfo) {
        AppState.originalDistance = stallInfo.distance;
        AppState.currentDistance = AppState.originalDistance;
    }

    // Hide stall card, show AR navigation
    DOM.stallCard.classList.add('hidden');
    DOM.arNavigation.classList.remove('hidden');

    setActiveGoal(`Navigating to ${AppState.currentDestination}`);

    // Start countdown timer
    startNavigationCountdown();
}

function handleFacilitySelection(facility) {
    console.log(`Facility selected: ${facility}`);

    // Stop any existing navigation timer
    stopNavigationCountdown();

    // If currently navigating, this is a diversion - save original distance
    if (AppState.isNavigating && AppState.currentDestination) {
        AppState.previousDestination = AppState.currentDestination;
        AppState.isDiverted = true;
        // Reset distance for the previous destination when we return
    }

    hideAllPanels();
    DOM.arNavigation.classList.remove('hidden');

    // Update navigation for facility
    const facilityNames = {
        wc: 'Restrooms',
        info: 'Info Point',
        firstaid: 'First Aid',
        atm: 'ATM'
    };

    const facilityDistances = {
        wc: 50,
        info: 80,
        firstaid: 150,
        atm: 90
    };

    AppState.currentDistance = facilityDistances[facility] || 100;
    AppState.originalDistance = AppState.currentDistance;
    AppState.destinationType = 'facility';

    document.getElementById('nav-distance').textContent = `${AppState.currentDistance}m`;

    AppState.currentDestination = facilityNames[facility];
    AppState.isNavigating = true;

    setActiveGoal(`Navigating to ${facilityNames[facility]}`);

    // Start countdown timer for facility
    startNavigationCountdown();
}

function showContinuePrompt() {
    console.log('Showing continue prompt for:', AppState.previousDestination);

    // Change background to restroom image
    document.getElementById('reality-layer').style.backgroundImage = "url('assets/wc.jpg')";

    document.getElementById('continue-destination').textContent = AppState.previousDestination;

    DOM.arNavigation.classList.add('hidden');
    DOM.continuePrompt.classList.remove('hidden');

    setActiveGoal('Continue to previous destination?');
}

function handleContinueYes() {
    console.log('Continuing to:', AppState.previousDestination);

    // Change background back to Christmas market
    document.getElementById('reality-layer').style.backgroundImage = "url('assets/Market.jpg')";

    // Restore previous destination
    AppState.currentDestination = AppState.previousDestination;
    AppState.previousDestination = null;
    AppState.isDiverted = false;
    AppState.destinationType = 'stall';

    // Reset distance to original and restart countdown
    let stallInfo = null;
    for (const category of Object.values(StallData)) {
        const found = category.find(s => s.name === AppState.currentDestination);
        if (found) {
            stallInfo = found;
            break;
        }
    }
    if (stallInfo) {
        AppState.originalDistance = stallInfo.distance;
        AppState.currentDistance = AppState.originalDistance;
        document.getElementById('nav-distance').textContent = `${AppState.currentDistance}m`;
    }

    hideAllPanels();
    DOM.arNavigation.classList.remove('hidden');

    setActiveGoal(`Navigating to ${AppState.currentDestination}`);

    // Restart countdown timer
    startNavigationCountdown();
}

function cancelNavigation() {
    console.log('Navigation cancelled');

    // Stop countdown timer
    stopNavigationCountdown();

    // Reset background to Christmas market
    document.getElementById('reality-layer').style.backgroundImage = "url('assets/Market.jpg')";

    AppState.isNavigating = false;
    AppState.currentDestination = null;
    AppState.previousDestination = null;
    AppState.isDiverted = false;
    AppState.currentDistance = 0;
    AppState.originalDistance = 0;

    hideAllPanels();

    setActiveGoal('Welcome to the Christmas Market');
}

function handleContinueNo() {
    console.log('Not continuing, staying at current location');

    // Keep the restroom background since user chose to stay
    // Background stays as wc.jpg

    AppState.previousDestination = null;
    AppState.isDiverted = false;
    AppState.isNavigating = false;
    AppState.currentDestination = null;
    AppState.currentDistance = 0;
    AppState.originalDistance = 0;

    hideAllPanels();

    setActiveGoal('At Restrooms');
}

// ============================================
// Navigation Countdown Timer
// ============================================
function startNavigationCountdown() {
    // Clear any existing timer
    stopNavigationCountdown();

    console.log(`Starting countdown from ${AppState.currentDistance}m`);

    // Update display
    document.getElementById('nav-distance').textContent = `${AppState.currentDistance}m`;

    // Start countdown - decrease by 10m every second
    AppState.navigationTimer = setInterval(() => {
        AppState.currentDistance -= 10;

        if (AppState.currentDistance <= 0) {
            AppState.currentDistance = 0;
            document.getElementById('nav-distance').textContent = '0m';
            stopNavigationCountdown();
            handleArrival();
        } else {
            document.getElementById('nav-distance').textContent = `${AppState.currentDistance}m`;
        }
    }, 1000);
}

function stopNavigationCountdown() {
    if (AppState.navigationTimer) {
        clearInterval(AppState.navigationTimer);
        AppState.navigationTimer = null;
        console.log('Navigation countdown stopped');
    }
}

function handleArrival() {
    console.log(`Arrived at ${AppState.currentDestination}`);

    if (AppState.destinationType === 'stall') {
        // Stall image mapping
        const stallImages = {
            'VegaMax': 'assets/Vegamax.webp',
            'Plant Power': 'assets/powerplant.jpg',
            // Add more stall images as needed
        };

        // Show the correct stall image based on destination
        const stallImage = stallImages[AppState.currentDestination] || 'assets/Vegamax.webp';
        document.getElementById('reality-layer').style.backgroundImage = `url('${stallImage}')`;

        AppState.isNavigating = false;

        // Hide navigation UI
        DOM.arNavigation.classList.add('hidden');

        // Update arrived panel with stall name
        document.getElementById('arrived-stall-name').textContent = AppState.currentDestination;

        // Check if there are more stalls in the route
        const hasMoreStalls = AppState.plannedRoute.length > 0 && AppState.currentRouteIndex < AppState.plannedRoute.length - 1;
        const continueBtn = document.getElementById('continue-route-btn');

        if (hasMoreStalls) {
            // Show continue button with next stall name
            const nextStall = AppState.plannedRoute[AppState.currentRouteIndex + 1];
            continueBtn.innerHTML = `<span>➤</span> Continue to ${nextStall.name}`;
            continueBtn.style.display = 'flex';
            setActiveGoal(`Arrived at ${AppState.currentDestination}! Next: ${nextStall.name}`);
        } else {
            // Hide continue button if this is the last stall
            continueBtn.style.display = 'none';
            setActiveGoal(`Arrived at ${AppState.currentDestination}!`);
        }

        // Show arrived panel
        DOM.arrivedPanel.classList.remove('hidden');

    } else if (AppState.destinationType === 'facility') {
        // Arrived at a facility (e.g., Restrooms)
        if (AppState.currentDestination === 'Restrooms') {
            document.getElementById('reality-layer').style.backgroundImage = "url('assets/wc.jpg')";
        }

        // If this was a diversion, show continue prompt
        if (AppState.isDiverted && AppState.previousDestination) {
            showContinuePrompt();
        } else {
            setActiveGoal(`Arrived at ${AppState.currentDestination}!`);
            AppState.isNavigating = false;
            DOM.arNavigation.classList.add('hidden');
        }
    } else if (AppState.destinationType === 'meeting') {
        // Arrived at meeting point (Scenario 2)
        AppState.isNavigating = false;
        DOM.arNavigation.classList.add('hidden');

        // Show group reunited
        showGroupReunited();
    }
}

// ============================================
// Scenario 3: Stall List & Multi-Selection
// ============================================
function populateStallList(stalls) {
    const container = DOM.stallList;
    if (!container) return;

    container.innerHTML = '';

    stalls.forEach((stall, index) => {
        const isRecommended = index === 0;
        const selectionIndex = AppState.selectedStalls.findIndex(s => s.name === stall.name);
        const isSelected = selectionIndex > -1;

        const item = document.createElement('div');
        item.className = `stall-list-item gaze-target ${isRecommended ? 'recommended' : ''} ${isSelected ? 'selected' : ''}`;
        item.dataset.stallName = stall.name;

        item.innerHTML = `
            <div class="stall-item-info">
                <div class="stall-item-name">${stall.name}</div>
                <div class="stall-item-stats">
                    <span class="stall-item-stat">📍 ${stall.distance}m</span>
                    <span class="stall-item-stat">⏱️ ~${stall.wait} min</span>
                    <span class="stall-item-stat">⭐ ${stall.rating}</span>
                </div>
            </div>
            <div class="stall-item-checkbox">${isSelected ? selectionIndex + 1 : ''}</div>
        `;

        item.addEventListener('click', () => {
            toggleStallSelection(stall);
        });

        container.appendChild(item);
    });
}

function toggleStallSelection(stall) {
    const index = AppState.selectedStalls.findIndex(s => s.name === stall.name);

    if (index > -1) {
        // Remove from selection
        AppState.selectedStalls.splice(index, 1);
    } else {
        // Add to selection
        AppState.selectedStalls.push(stall);
    }

    console.log('Selected stalls:', AppState.selectedStalls.map(s => s.name));

    // Re-render the list to update numbers
    populateStallList(AppState.availableStalls);

    // Update button state
    const navBtn = document.getElementById('navigate-selected-btn');
    if (navBtn) {
        navBtn.disabled = AppState.selectedStalls.length === 0;
    }
}

function navigateToSelected() {
    if (AppState.selectedStalls.length === 0) {
        console.log('No stalls selected');
        return;
    }

    // Use selection order (first selected = first visited)
    AppState.plannedRoute = [...AppState.selectedStalls];
    AppState.currentRouteIndex = 0;

    console.log('Planned route:', AppState.plannedRoute.map(s => s.name));

    // Start navigating to first stall
    navigateToNextInRoute();
}

function navigateToNextInRoute() {
    console.log(`navigateToNextInRoute called: index=${AppState.currentRouteIndex}, length=${AppState.plannedRoute.length}`);

    // Safeguard: if no planned route, just return
    if (AppState.plannedRoute.length === 0) {
        console.log('No planned route, returning');
        return;
    }

    if (AppState.currentRouteIndex >= AppState.plannedRoute.length) {
        // Finished all stops
        console.log('Route completed!');
        setActiveGoal('Route completed! 🎉');
        hideAllPanels();
        AppState.plannedRoute = [];
        AppState.currentRouteIndex = 0;
        AppState.selectedStalls = [];
        AppState.isNavigating = false;
        return;
    }

    const nextStall = AppState.plannedRoute[AppState.currentRouteIndex];
    console.log(`Navigating to: ${nextStall.name}, distance: ${nextStall.distance}m`);

    AppState.currentDestination = nextStall.name;
    AppState.originalDistance = nextStall.distance;
    AppState.currentDistance = nextStall.distance;
    AppState.isNavigating = true;
    AppState.destinationType = 'stall';

    // Update navigation display
    document.getElementById('nav-distance').textContent = `${nextStall.distance}m`;
    document.getElementById('continue-destination').textContent = nextStall.name;

    hideAllPanels();
    DOM.arNavigation.classList.remove('hidden');

    setActiveGoal(`Navigating to ${nextStall.name} (${AppState.currentRouteIndex + 1}/${AppState.plannedRoute.length})`);

    // Start countdown
    startNavigationCountdown();
}

function continueToNextStall() {
    console.log('Continuing to next stall');

    // Increment route index
    AppState.currentRouteIndex++;

    // Hide arrived panel
    DOM.arrivedPanel.classList.add('hidden');

    // Navigate to next stall
    navigateToNextInRoute();
}

function endRoute() {
    console.log('Ending route');

    // Hide arrived panel
    DOM.arrivedPanel.classList.add('hidden');

    // Reset route state
    AppState.plannedRoute = [];
    AppState.currentRouteIndex = 0;
    AppState.selectedStalls = [];
    AppState.isNavigating = false;

    // Keep the current stall image
    setActiveGoal(`At ${AppState.currentDestination}`);
}

// ============================================
// SCENARIO 2: Group Regrouping
// ============================================
function initializeScenario2Handlers() {
    // View Lost Member button
    document.getElementById('view-lost-member-btn')?.addEventListener('click', showMemberDetails);

    // Close modals
    document.getElementById('close-member-modal')?.addEventListener('click', closeMemberDetails);
    document.getElementById('close-location-modal')?.addEventListener('click', () => {
        DOM.locationSelector.classList.add('hidden');
    });
    document.getElementById('close-time-modal')?.addEventListener('click', () => {
        DOM.timeSelector.classList.add('hidden');
    });

    // Common Location button
    document.getElementById('common-location-btn')?.addEventListener('click', showLocationSelector);

    // Location options
    document.querySelectorAll('.location-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const location = btn.dataset.location;
            selectMeetingLocation(location);
        });
    });

    // Time options
    document.querySelectorAll('.time-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const time = parseInt(btn.dataset.time);
            selectMeetingTime(time);
        });
    });

    // Start Navigation button
    document.getElementById('start-navigation-btn')?.addEventListener('click', navigateToMeetingPoint);

    // Lost member view: Accept/Decline meet request
    document.getElementById('accept-meet-btn')?.addEventListener('click', acceptMeetRequest);
    document.getElementById('decline-meet-btn')?.addEventListener('click', declineMeetRequest);

    // Join Now button
    document.getElementById('join-now-btn')?.addEventListener('click', startJoinNavigation);

    // Dismiss reunited notification
    document.getElementById('dismiss-reunited-btn')?.addEventListener('click', dismissReunited);

    // Dismiss Max declined notification
    document.getElementById('dismiss-declined-btn')?.addEventListener('click', dismissDeclinedAlert);

    // Click outside to close group panel - use document-level handler
    document.addEventListener('click', (e) => {
        // Don't close during active scenario (when someone is lost)
        const isScenarioActive = AppState.groupMembers.some(m => m.isLost);
        if (isScenarioActive) return;

        // Check if group panel is open
        if (DOM.groupPanel && !DOM.groupPanel.classList.contains('hidden')) {
            // Check if click is outside the panel and not on a menu item
            const isClickOnPanel = e.target.closest('#group-panel');
            const isClickOnMenu = e.target.closest('#side-menu') || e.target.closest('#menu-toggle');
            const isClickOnAlert = e.target.closest('.alert-popup');
            const isClickOnModal = e.target.closest('.modal-overlay');

            if (!isClickOnPanel && !isClickOnMenu && !isClickOnAlert && !isClickOnModal) {
                DOM.groupPanel.classList.add('hidden');
                setActiveGoal('Welcome to the Christmas Market');
            }
        }
    });
}

function showGroupPanel() {
    hideAllPanels();
    populateGroupPanel();
    DOM.groupPanel.classList.remove('hidden');

    // Show appropriate view indicator
    if (AppState.isLeaderView) {
        setActiveGoal('👑 Your Group (Leader View)');
    } else {
        setActiveGoal(`👤 ${AppState.selectedLostMember?.name || 'Lost Member'}'s View`);
    }
}

function populateGroupPanel() {
    const container = document.getElementById('group-members-list');
    if (!container) return;

    container.innerHTML = '';

    AppState.groupMembers.forEach(member => {
        const card = document.createElement('div');

        // Determine if this member is the "current user" based on view
        const isCurrentUser = (AppState.isLeaderView && member.role === 'leader') ||
            (!AppState.isLeaderView && member.id === 'B');

        // Build class list
        let cardClasses = 'group-member-card gaze-target';
        if (member.isLost) cardClasses += ' lost';
        if (isCurrentUser) cardClasses += ' leader';  // Use leader class for green border

        card.className = cardClasses;
        card.dataset.memberId = member.id;

        // Determine status text
        let statusText;
        let displayName = member.name;

        if (isCurrentUser) {
            statusText = AppState.isLeaderView ? '👑 Leader (You)' : '👤 You';
        } else if (member.role === 'leader' && !AppState.isLeaderView) {
            // When in Max's view, show leader as far away if meeting is set
            displayName = 'Leader';  // Show as "Leader" not "You"
            statusText = AppState.meetingPoint ? '↗ far away' : '👑 Leader';
        } else if (member.isLost) {
            statusText = '⚠️ Lost';
        } else if (member.role === 'leader') {
            statusText = '👑 Leader';
        } else {
            statusText = '✓ Nearby';
        }

        const statusClass = member.isLost && !isCurrentUser ? 'lost' : '';

        card.innerHTML = `
            <div class="member-avatar-small">👤</div>
            <div class="member-card-info">
                <div class="member-card-name">${displayName}</div>
                <div class="member-card-status ${statusClass}">${statusText}</div>
            </div>
        `;

        if (member.isLost && AppState.isLeaderView) {
            card.addEventListener('click', () => {
                AppState.selectedLostMember = member;
                showMemberDetails();
            });
        }

        container.appendChild(card);
    });
}

function triggerLostMember() {
    // Mark Max as lost
    const member = AppState.groupMembers.find(m => m.id === 'B');
    if (member && !member.isLost) {
        member.isLost = true;
        AppState.selectedLostMember = member;

        // Refresh group panel to show updated status
        populateGroupPanel();

        // Show lost member alert
        document.getElementById('lost-member-name').textContent = member.name;
        DOM.lostMemberAlert.classList.remove('hidden');

        setActiveGoal('👑 ⚠️ Group member lost!');
        console.log(`${member.name} is now lost at ${member.location}`);
    }
}

function showMemberDetails() {
    DOM.lostMemberAlert.classList.add('hidden');

    const member = AppState.selectedLostMember;
    if (!member) return;

    document.getElementById('detail-member-name').textContent = member.name;
    document.getElementById('detail-member-location').textContent = member.location || 'Unknown';

    DOM.memberDetailsModal.classList.remove('hidden');
    setActiveGoal(`Viewing ${member.name}'s details`);
}

function closeMemberDetails() {
    DOM.memberDetailsModal.classList.add('hidden');
    setActiveGoal('Group member lost - choose an action');
}

function showLocationSelector() {
    DOM.memberDetailsModal.classList.add('hidden');
    DOM.locationSelector.classList.remove('hidden');
    setActiveGoal('Select a meeting point');
}

function selectMeetingLocation(locationKey) {
    const location = MeetingLocations[locationKey];
    if (!location) return;

    AppState.meetingPoint = location;
    DOM.locationSelector.classList.add('hidden');
    DOM.timeSelector.classList.remove('hidden');

    setActiveGoal(`Meeting at ${location.name} - select time`);
    console.log('Selected meeting point:', location.name);
}

function selectMeetingTime(minutes) {
    AppState.meetingTime = minutes;
    DOM.timeSelector.classList.add('hidden');

    // Show confirmation
    document.getElementById('confirm-location').textContent = AppState.meetingPoint.name;
    document.getElementById('confirm-time').textContent = minutes;
    document.getElementById('meet-request-sent').classList.remove('hidden');

    setActiveGoal('Meeting request sent!');
    console.log(`Meeting set: ${AppState.meetingPoint.name} in ${minutes} minutes`);
}

function navigateToMeetingPoint() {
    document.getElementById('meet-request-sent').classList.add('hidden');

    // Start navigation to meeting point
    AppState.currentDestination = AppState.meetingPoint.name;
    AppState.originalDistance = AppState.meetingPoint.distance;
    AppState.currentDistance = AppState.meetingPoint.distance;
    AppState.isNavigating = true;
    AppState.destinationType = 'meeting';

    document.getElementById('nav-distance').textContent = `${AppState.meetingPoint.distance}m`;

    DOM.arNavigation.classList.remove('hidden');
    setActiveGoal(`Navigating to ${AppState.meetingPoint.name}`);

    startNavigationCountdown();
}

// Lost member perspective functions
function showMeetRequestToLostMember() {
    // Switch to lost member's view
    AppState.isLeaderView = false;

    // Stop the leader's navigation (they're on their way, but we're switching views)
    stopNavigationCountdown();
    DOM.arNavigation.classList.add('hidden');

    // Hide other scenario 2 panels but keep group panel
    hideAllScenario2Panels();

    // Refresh group panel to show Max's perspective (green ring moves to Max)
    populateGroupPanel();

    document.getElementById('meet-location').textContent = AppState.meetingPoint.name;
    document.getElementById('meet-time').textContent = AppState.meetingTime;
    document.getElementById('meet-request-notification').classList.remove('hidden');

    setActiveGoal(`👤 ${AppState.selectedLostMember?.name || 'Max'}'s View: Meeting request received`);
}

function acceptMeetRequest() {
    document.getElementById('meet-request-notification').classList.add('hidden');
    setActiveGoal(`👤 Meet at ${AppState.meetingPoint.name} in ${AppState.meetingTime} min`);

    // Show Join Now prompt after a simulated wait
    setTimeout(() => {
        document.getElementById('join-group-prompt').classList.remove('hidden');
        setActiveGoal('👤 Time to join the group!');
    }, 3000);
}

function declineMeetRequest() {
    document.getElementById('meet-request-notification').classList.add('hidden');

    // Switch back to leader's view
    AppState.isLeaderView = true;

    // Update group panel to show leader's perspective
    populateGroupPanel();

    // Show notification to leader that Max declined
    document.getElementById('declined-location').textContent = AppState.meetingPoint?.name || 'the meeting point';
    document.getElementById('max-declined-alert').classList.remove('hidden');

    setActiveGoal('👑 Max declined the meeting request');
}

function dismissDeclinedAlert() {
    document.getElementById('max-declined-alert').classList.add('hidden');

    // Max will come to leader, so leader just waits - end the navigation
    AppState.meetingPoint = null;
    AppState.meetingTime = null;
    AppState.isNavigating = false;
    AppState.destinationType = null;
    AppState.selectedLostMember = null;

    // Reset Max to not lost (he's coming to you)
    const member = AppState.groupMembers.find(m => m.id === 'B');
    if (member) {
        member.isLost = false;
    }

    // Hide group panel and return to normal
    DOM.groupPanel?.classList.add('hidden');

    setActiveGoal('Waiting for Max to arrive...');

    // After a short wait, show reunited
    setTimeout(() => {
        showGroupReunited();
    }, 3000);
}

function startJoinNavigation() {
    document.getElementById('join-group-prompt').classList.add('hidden');

    // Navigate to meeting point (as the lost member)
    AppState.currentDestination = AppState.meetingPoint.name;
    AppState.originalDistance = AppState.meetingPoint.distance;
    AppState.currentDistance = AppState.meetingPoint.distance;
    AppState.isNavigating = true;
    AppState.destinationType = 'meeting';

    document.getElementById('nav-distance').textContent = `${AppState.meetingPoint.distance}m`;

    DOM.arNavigation.classList.remove('hidden');
    setActiveGoal(`👤 Navigating to ${AppState.meetingPoint.name}`);

    startNavigationCountdown();
}

function showGroupReunited() {
    hideAllScenario2Panels();
    DOM.arNavigation.classList.add('hidden');

    // Mark member as no longer lost
    const member = AppState.groupMembers.find(m => m.id === 'B');
    if (member) {
        member.isLost = false;
    }

    document.getElementById('group-reunited').classList.remove('hidden');
    setActiveGoal('🎉 Group reunited!');
}

function dismissReunited() {
    document.getElementById('group-reunited').classList.add('hidden');

    // Reset state
    AppState.meetingPoint = null;
    AppState.meetingTime = null;
    AppState.selectedLostMember = null;
    AppState.isLeaderView = true;  // Reset to leader view

    // Refresh group panel to show normal state then hide it
    populateGroupPanel();
    DOM.groupPanel?.classList.add('hidden');

    // Return to market
    document.getElementById('reality-layer').style.backgroundImage = "url('assets/Market.jpg')";
    setActiveGoal('Welcome to the Christmas Market');
}

function hideAllScenario2Panels() {
    DOM.lostMemberAlert?.classList.add('hidden');
    DOM.memberDetailsModal?.classList.add('hidden');
    DOM.locationSelector?.classList.add('hidden');
    DOM.timeSelector?.classList.add('hidden');
    document.getElementById('meet-request-sent')?.classList.add('hidden');
    document.getElementById('meet-request-notification')?.classList.add('hidden');
    document.getElementById('join-group-prompt')?.classList.add('hidden');
    document.getElementById('group-reunited')?.classList.add('hidden');
    document.getElementById('max-declined-alert')?.classList.add('hidden');
}

// ============================================
// View Management
// ============================================
function hideAllPanels() {
    DOM.foodPanel?.classList.add('hidden');
    DOM.stallCard?.classList.add('hidden');
    DOM.facilitiesPanel?.classList.add('hidden');
    DOM.continuePrompt?.classList.add('hidden');
    DOM.arNavigation?.classList.add('hidden');
    // Scenario 3 panels
    DOM.stallListPanel?.classList.add('hidden');
    DOM.arrivedPanel?.classList.add('hidden');
    // Scenario 2 panels
    DOM.groupPanel?.classList.add('hidden');
    hideAllScenario2Panels();
}

function showView(viewId) {
    hideAllPanels();
    AppState.currentView = viewId;

    switch (viewId) {
        case 'food':
            DOM.foodPanel?.classList.remove('hidden');
            break;
        case 'facilities':
            DOM.facilitiesPanel?.classList.remove('hidden');
            break;
        case 'stall':
            DOM.stallCard?.classList.remove('hidden');
            break;
        case 'navigation':
            DOM.arNavigation?.classList.remove('hidden');
            break;
        case 'continue':
            DOM.continuePrompt?.classList.remove('hidden');
            break;
        case 'stall-list':
            DOM.stallListPanel?.classList.remove('hidden');
            break;
    }

    console.log(`Showing view: ${viewId}`);
}

// ============================================
// Menu Toggle
// ============================================
function initializeMenuToggle() {
    if (DOM.menuToggle) {
        DOM.menuToggle.addEventListener('click', toggleMenu);
    }

    // Add click handlers to menu items
    const menuItems = document.querySelectorAll('#side-menu .menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const action = item.dataset.action;
            if (action) {
                handleMenuAction(action);
                toggleMenu(); // Close menu after selection
            }
        });
    });
}

function toggleMenu() {
    AppState.menuOpen = !AppState.menuOpen;

    if (AppState.menuOpen) {
        DOM.sideMenu.classList.remove('collapsed');
        DOM.sideMenu.classList.add('expanded');
        DOM.menuToggle.setAttribute('aria-expanded', 'true');
    } else {
        DOM.sideMenu.classList.remove('expanded');
        DOM.sideMenu.classList.add('collapsed');
        DOM.menuToggle.setAttribute('aria-expanded', 'false');
    }

    console.log(`Menu: ${AppState.menuOpen ? 'Open' : 'Closed'}`);
}

// Update Time Display
function updateTimeDisplay() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
    if (DOM.timeDisplay) {
        DOM.timeDisplay.textContent = timeStr;
    }
}

// ============================================
// Keyboard Controls (Wizard of Oz)
// ============================================
function initializeKeyboardControls() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        switch (key) {
            case 'g':
                toggleGaze();
                break;
            case 'n':
                triggerGesture('confirm');
                break;
            case 's':
                triggerGesture('cancel');
                break;
            case 'l':
                // Scenario 2: Trigger lost member
                triggerLostMember();
                break;
            case 'm':
                // Scenario 2: Show meet request to lost member (switch view)
                if (AppState.meetingPoint && AppState.meetingTime) {
                    showMeetRequestToLostMember();
                }
                break;
            case 'r':
                // Scenario 2: Show group reunited
                if (AppState.destinationType === 'meeting' && AppState.currentDistance <= 0) {
                    showGroupReunited();
                }
                break;
            case 'arrowup':
                e.preventDefault();
                scrollContent(-100);
                break;
            case 'arrowdown':
                e.preventDefault();
                scrollContent(100);
                break;
            case '1':
                // Quick switch to Task 1 (Discovery)
                setActiveGoal('Task 1: Discovery & Navigation');
                showView('food');
                break;
            case '2':
                // Quick switch to Task 2 (Group)
                setActiveGoal('Task 2: Group Regrouping');
                showGroupPanel();
                break;
            case '3':
                // Quick switch to Task 3 (Selection)
                setActiveGoal('Task 3: Effective Selection');
                break;
            case 'escape':
                // Return to home
                hideAllPanels();
                document.getElementById('reality-layer').style.backgroundImage = "url('assets/Market.jpg')";
                setActiveGoal('Welcome to the Christmas Market');
                break;
        }
    });
}

// ============================================
// Gaze Control
// ============================================
function toggleGaze() {
    AppState.gazeEnabled = !AppState.gazeEnabled;

    if (AppState.gazeEnabled) {
        DOM.gazeReticle.classList.remove('hidden');
        DOM.gazeStatus.textContent = 'ON';
        DOM.gazeStatus.classList.remove('off');
        DOM.gazeStatus.classList.add('on');
    } else {
        DOM.gazeReticle.classList.add('hidden');
        DOM.gazeStatus.textContent = 'OFF';
        DOM.gazeStatus.classList.remove('on');
        DOM.gazeStatus.classList.add('off');
        clearDwell();
    }

    console.log(`Gaze mode: ${AppState.gazeEnabled ? 'ON' : 'OFF'}`);
}

// Gaze Reticle Movement (follows mouse for simulation)
function initializeMouseTracking() {
    document.addEventListener('mousemove', (e) => {
        if (!AppState.gazeEnabled) return;

        AppState.gazePosition = { x: e.clientX, y: e.clientY };
        DOM.gazeReticle.style.left = `${e.clientX}px`;
        DOM.gazeReticle.style.top = `${e.clientY}px`;

        // Check for gaze targets under cursor
        checkGazeTargets(e.clientX, e.clientY);
    });
}

// Check if gaze is over interactive elements
function checkGazeTargets(x, y) {
    const element = document.elementFromPoint(x, y);
    const gazeTarget = element?.closest('.gaze-target');

    // Remove hover from all targets
    document.querySelectorAll('.gaze-target.gaze-hover').forEach(el => {
        if (el !== gazeTarget) {
            el.classList.remove('gaze-hover');
        }
    });

    if (gazeTarget) {
        gazeTarget.classList.add('gaze-hover');

        // Start dwell if not already dwelling on this target
        if (AppState.dwellTarget !== gazeTarget) {
            startDwell(gazeTarget);
        }
    } else {
        clearDwell();
    }
}

// Start Dwell Selection (2 seconds)
function startDwell(target) {
    clearDwell();

    AppState.dwellTarget = target;
    DOM.gazeReticle.classList.add('dwelling');

    AppState.dwellTimeout = setTimeout(() => {
        // Dwell complete - trigger selection
        triggerGazeSelection(target);
        clearDwell();
    }, 2000); // 2 second dwell
}

// Clear Dwell
function clearDwell() {
    if (AppState.dwellTimeout) {
        clearTimeout(AppState.dwellTimeout);
        AppState.dwellTimeout = null;
    }
    AppState.dwellTarget = null;
    DOM.gazeReticle?.classList.remove('dwelling');
}

// Trigger Gaze Selection
function triggerGazeSelection(target) {
    console.log('Gaze selection triggered on:', target);

    // Visual feedback
    triggerGesture('confirm');

    // Trigger click on the target
    target.click();
}

// ============================================
// Gesture Feedback
// ============================================
function triggerGesture(type) {
    DOM.gestureFeedback.classList.remove('hidden', 'confirm', 'cancel');
    DOM.gestureFeedback.classList.add(type);

    const icon = DOM.gestureFeedback.querySelector('.gesture-icon');
    icon.textContent = type === 'confirm' ? '✓' : '✕';

    // Auto-hide after animation
    setTimeout(() => {
        DOM.gestureFeedback.classList.add('hidden');
    }, 600);

    console.log(`Gesture: ${type === 'confirm' ? 'Head Nod (Confirm)' : 'Head Shake (Cancel)'}`);
}

// ============================================
// Scroll Content
// ============================================
function scrollContent(amount) {
    const scrollableContent = document.querySelector('.scrollable-content');
    if (scrollableContent) {
        scrollableContent.scrollBy({
            top: amount,
            behavior: 'smooth'
        });
    }
    console.log(`Scroll: ${amount > 0 ? 'Down' : 'Up'}`);
}

// ============================================
// Active Goal Management
// ============================================
function setActiveGoal(goal) {
    AppState.activeGoal = goal;
    if (DOM.activeGoal) {
        DOM.activeGoal.textContent = goal;
    }
    console.log(`Active Goal: ${goal}`);
}

// ============================================
// Menu Actions
// ============================================
function handleMenuAction(action) {
    console.log(`Menu action: ${action}`);

    switch (action) {
        case 'discovery':
            setActiveGoal('Finding Food & Drinks');
            showView('food');
            break;
        case 'group':
            setActiveGoal('Group Management');
            showGroupPanel();
            break;
        case 'attractions':
            setActiveGoal('Browsing Attractions');
            break;
        case 'facilities':
            setActiveGoal('Finding Facilities');
            showView('facilities');
            break;
        case 'navigation':
            if (AppState.currentDestination) {
                showView('navigation');
            }
            break;
    }
}

// Export for use in other modules
window.ARApp = {
    state: AppState,
    toggleGaze,
    triggerGesture,
    setActiveGoal,
    showView,
    hideAllPanels
};
