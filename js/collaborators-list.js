/**
 * Collaborators List Filtering System
 * Handles client-side filtering by threat rank and status
 */

(function() {
    'use strict';

    // State management
    let currentFilters = {
        threat: 'all',
        status: 'all'
    };

    // DOM elements
    let collaboratorCards = [];
    let filterButtons = [];
    let resultsCounter = null;

    /**
     * Initialize the filtering system
     */
    function init() {
        // Get DOM elements
        collaboratorCards = Array.from(document.querySelectorAll('.collaborator-card'));
        filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
        resultsCounter = document.getElementById('results-count');

        // Attach event listeners
        filterButtons.forEach(button => {
            button.addEventListener('click', handleFilterClick);
        });

        // Initial filter application
        applyFilters();
    }

    // Debounced filter application for better performance
    const debouncedApplyFilters = debounce(applyFilters, 100);

    /**
     * Handle filter button clicks (optimized)
     */
    function handleFilterClick(event) {
        event.preventDefault();
        
        const button = event.currentTarget;
        const filterType = button.dataset.type; // Use dataset for better performance
        const filterValue = button.dataset.filter;

        // Update active state for buttons of the same type
        updateActiveButtons(filterType, button);

        // Update current filters
        currentFilters[filterType] = filterValue;

        // Apply filters with debouncing
        debouncedApplyFilters();
    }

    /**
     * Update active state for filter buttons
     */
    function updateActiveButtons(filterType, activeButton) {
        // Remove active class from all buttons of this type
        const typeButtons = document.querySelectorAll(`.filter-btn[data-type="${filterType}"]`);
        typeButtons.forEach(btn => btn.classList.remove('active'));

        // Add active class to clicked button
        activeButton.classList.add('active');
    }

    /**
     * Apply current filters to collaborator cards
     */
    function applyFilters() {
        let visibleCount = 0;

        collaboratorCards.forEach(card => {
            const cardThreatRank = normalizeValue(card.getAttribute('data-threat-rank'));
            const cardStatus = normalizeValue(card.getAttribute('data-status'));

            // Check if card matches current filters
            const matchesThreat = currentFilters.threat === 'all' || 
                                normalizeValue(currentFilters.threat) === cardThreatRank;
            
            const matchesStatus = currentFilters.status === 'all' || 
                                normalizeValue(currentFilters.status) === cardStatus;

            // Show/hide card based on filter match
            if (matchesThreat && matchesStatus) {
                card.style.display = 'block';
                card.classList.remove('filtered-out');
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.classList.add('filtered-out');
            }
        });

        // Update results counter
        updateResultsCounter(visibleCount);

        // Show/hide no results message
        toggleNoResultsMessage(visibleCount === 0);
    }

    /**
     * Normalize values for comparison (lowercase, handle accents)
     */
    function normalizeValue(value) {
        if (!value || value === 'undefined' || value === 'null') {
            return 'unknown';
        }
        
        return value.toLowerCase()
                   .replace(/é/g, 'e')
                   .replace(/è/g, 'e')
                   .replace(/à/g, 'a')
                   .replace(/ç/g, 'c')
                   .replace(/ô/g, 'o')
                   .replace(/ù/g, 'u')
                   .trim();
    }

    /**
     * Update the results counter
     */
    function updateResultsCounter(count) {
        if (resultsCounter) {
            resultsCounter.textContent = count;
        }
    }

    /**
     * Show/hide no results message
     */
    function toggleNoResultsMessage(show) {
        let noResultsMsg = document.querySelector('.no-results-message');
        
        if (show && !noResultsMsg) {
            // Create no results message
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div class="no-results-content">
                    <p><strong>Aucun collaborateur ne correspond aux filtres sélectionnés.</strong></p>
                    <p>Essayez de modifier vos critères de filtrage ou <button class="reset-filters-btn">réinitialiser tous les filtres</button>.</p>
                </div>
            `;
            
            // Insert after filters
            const filtersDiv = document.querySelector('.collaborators-filters');
            if (filtersDiv && filtersDiv.nextSibling) {
                filtersDiv.parentNode.insertBefore(noResultsMsg, filtersDiv.nextSibling);
            } else if (filtersDiv) {
                filtersDiv.parentNode.appendChild(noResultsMsg);
            }

            // Add reset functionality
            const resetBtn = noResultsMsg.querySelector('.reset-filters-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', resetAllFilters);
            }
        } else if (!show && noResultsMsg) {
            // Remove no results message
            noResultsMsg.remove();
        }
    }

    /**
     * Reset all filters to show all collaborators
     */
    function resetAllFilters() {
        // Reset filter state
        currentFilters = {
            threat: 'all',
            status: 'all'
        };

        // Reset button states
        filterButtons.forEach(button => {
            const filterValue = button.getAttribute('data-filter');
            if (filterValue === 'all') {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });

        // Apply filters (will show all)
        applyFilters();
    }

    /**
     * Add keyboard navigation support
     */
    function addKeyboardSupport() {
        document.addEventListener('keydown', function(event) {
            // ESC key resets filters
            if (event.key === 'Escape') {
                resetAllFilters();
            }
        });
    }

    /**
     * Add URL hash support for filter state persistence
     */
    function addHashSupport() {
        // Read initial state from URL hash
        const hash = window.location.hash.substring(1);
        if (hash) {
            const params = new URLSearchParams(hash);
            const threatFilter = params.get('threat');
            const statusFilter = params.get('status');

            if (threatFilter) {
                currentFilters.threat = threatFilter;
            }
            if (statusFilter) {
                currentFilters.status = statusFilter;
            }

            // Update button states based on URL
            updateButtonStatesFromFilters();
        }

        // Update URL when filters change
        window.addEventListener('hashchange', function() {
            const hash = window.location.hash.substring(1);
            if (!hash) {
                resetAllFilters();
            }
        });
    }

    /**
     * Update button states based on current filters
     */
    function updateButtonStatesFromFilters() {
        filterButtons.forEach(button => {
            const filterType = button.getAttribute('data-type');
            const filterValue = button.getAttribute('data-filter');
            
            if (currentFilters[filterType] === filterValue) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    /**
     * Update URL hash with current filter state
     */
    function updateUrlHash() {
        const params = new URLSearchParams();
        
        if (currentFilters.threat !== 'all') {
            params.set('threat', currentFilters.threat);
        }
        if (currentFilters.status !== 'all') {
            params.set('status', currentFilters.status);
        }

        const hashString = params.toString();
        if (hashString) {
            window.location.hash = hashString;
        } else {
            // Remove hash if no filters are active
            if (window.location.hash) {
                history.replaceState(null, null, window.location.pathname);
            }
        }
    }

    /**
     * Enhanced apply filters with URL update
     */
    function applyFiltersWithUrl() {
        applyFilters();
        updateUrlHash();
    }

    /**
     * Debounce function for performance optimization
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            init();
            addKeyboardSupport();
            addHashSupport();
        });
    } else {
        init();
        addKeyboardSupport();
        addHashSupport();
    }

    // Export for potential external use
    window.CollaboratorsFilter = {
        reset: resetAllFilters,
        applyFilters: applyFilters,
        getCurrentFilters: function() {
            return { ...currentFilters };
        }
    };

})();