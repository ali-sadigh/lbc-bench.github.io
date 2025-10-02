// Generic MultiSelect Dropdown Class
class MultiSelectDropdown {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.options = {
            searchable: options.searchable || false,
            allOptionText: options.allOptionText || 'All',
            summaryPrefix: options.summaryPrefix || '',
            noSelectionText: options.noSelectionText || 'Select...',
            allSelectedText: options.allSelectedText || 'All',
            items: options.items || [],
            defaultSelected: options.defaultSelected || [],
            onSelectionChange: options.onSelectionChange || (() => {}),
            ...options
        };
        
        this.init();
    }
    
    init() {
        if (!this.container) return;
        
        this.toggleButton = this.container.querySelector('.multiselect-toggle');
        this.dropdownForm = this.container.querySelector('.multiselect-form');
        this.multiselect = this.container.querySelector('.multiselect-dropdown');
        this.summaryElement = this.container.querySelector('.multiselect-summary');
        
        if (!this.toggleButton || !this.dropdownForm || !this.multiselect || !this.summaryElement) return;
        
        this.setupEventListeners();
        this.updateSelection();
    }
    
    setupEventListeners() {
        // Toggle dropdown
        this.toggleButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        // Handle checkbox changes
        this.multiselect.addEventListener('change', (e) => {
            if (e.target.classList.contains('checkbox-item')) {
                this.handleCheckboxChange(e.target);
            }
        });
        
        // Setup search if enabled
        if (this.options.searchable) {
            this.setupSearch();
        }
    }
    
    setupSearch() {
        const optionsContainer = this.multiselect.querySelector('.multiselect-options');
        if (!optionsContainer) return;
        
        // Create search input if it doesn't exist
        let searchInput = optionsContainer.querySelector('.multiselect-search');
        if (!searchInput) {
            searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'form-control form-control-sm multiselect-search';
            searchInput.placeholder = 'Search tags...';
            optionsContainer.insertBefore(searchInput, optionsContainer.firstChild);
        }
        
        searchInput.addEventListener('input', (e) => {
            this.filterOptions(e.target.value);
        });
    }
    
    rebuildOptions(items) {
        const optionsContainer = this.multiselect.querySelector('.multiselect-options');
        if (!optionsContainer) return;
        
        // Clear existing options
        optionsContainer.innerHTML = '';
        
        // Add search input if searchable
        if (this.options.searchable) {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.className = 'form-control form-control-sm multiselect-search';
            searchInput.placeholder = 'Search tags...';
            optionsContainer.appendChild(searchInput);
            
            searchInput.addEventListener('input', (e) => {
                this.filterOptions(e.target.value);
            });
        }
        
        // Add "All" option
        const allOption = document.createElement('div');
        allOption.className = 'multiselect-option';
        allOption.innerHTML = `<label><input type="checkbox" class="checkbox-item" value="All" checked> <strong>(${this.options.allOptionText})</strong></label>`;
        optionsContainer.appendChild(allOption);
        
        // Add individual options
        items.forEach(item => {
            const option = document.createElement('div');
            option.className = 'multiselect-option';
            // Use canonical display names for main filters, raw values for tags
            // const displayName = filterDisplayNames[item] || item;
            const displayName = item;
            option.innerHTML = `<label><input type="checkbox" class="checkbox-item" value="${item}" checked> ${displayName}</label>`;
            optionsContainer.appendChild(option);
        });
        
        this.updateSelection();
    }
    
    toggleDropdown() {
        const isOpen = this.dropdownForm.style.display === 'block';
        if (isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        // Close all other dropdowns before opening this one
        this.closeOtherDropdowns();
        
        this.dropdownForm.style.display = 'block';
        const icon = this.toggleButton.querySelector('.multiselect-icon');
        if (icon) icon.textContent = '▲';
    }
    
    closeOtherDropdowns() {
        // Close all other dropdown instances
        // [window.mainFiltersDropdown, window.tagFiltersDropdown].forEach(dropdown => {
        //     if (dropdown && dropdown !== this && dropdown.dropdownForm.style.display === 'block') {
        //         dropdown.closeDropdown();
        //     }
        // });

        [window.tagFiltersDropdown].forEach(dropdown => {
            if (dropdown && dropdown !== this && dropdown.dropdownForm.style.display === 'block') {
                dropdown.closeDropdown();
            }
        });
    }
    
    closeDropdown() {
        this.dropdownForm.style.display = 'none';
        const icon = this.toggleButton.querySelector('.multiselect-icon');
        if (icon) icon.textContent = '▼';
    }
    
    handleCheckboxChange(checkbox) {
        if (checkbox.value === 'All') {
            this.toggleAllItems(checkbox.checked);
        } else {
            this.updateAllCheckbox();
        }
        this.updateSelection();
        this.options.onSelectionChange(this.getSelectedValues());
    }
    
    toggleAllItems(checked) {
        const checkboxes = this.multiselect.querySelectorAll('.checkbox-item:not([value="All"])');
        checkboxes.forEach(cb => cb.checked = checked);
    }
    
    updateAllCheckbox() {
        const allCheckbox = this.multiselect.querySelector('.checkbox-item[value="All"]');
        const otherCheckboxes = this.multiselect.querySelectorAll('.checkbox-item:not([value="All"])');
        const checkedOthers = Array.from(otherCheckboxes).filter(cb => cb.checked);
        
        if (allCheckbox) {
            allCheckbox.checked = checkedOthers.length === otherCheckboxes.length;
        }
    }
    
    getSelectedValues() {
        const checkboxes = this.multiselect.querySelectorAll('.checkbox-item:not([value="All"])');
        return Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
    }
    
    isAllSelected() {
        const checkboxes = this.multiselect.querySelectorAll('.checkbox-item:not([value="All"])');
        const selected = this.getSelectedValues();
        return selected.length === checkboxes.length;
    }
    
    updateSelection() {
        const selected = this.getSelectedValues();
        let text;
        
        if (selected.length === 0) {
            text = this.options.noSelectionText;
        } else if (this.isAllSelected()) {
            text = this.options.allSelectedText;
        } else if (selected.length === 1) {
            // Use display name mapping for main filters dropdown
            // const displayName = filterDisplayNames[selected[0]] || selected[0];
            const displayName = selected[0];
            text = `${this.options.summaryPrefix}${displayName}`.trim();
        } else {
            text = `${selected.length} ${this.options.summaryPrefix}Selected`.trim();
        }
        
        this.summaryElement.textContent = text;
    }
    
    filterOptions(searchTerm) {
        if (!this.options.searchable) return;
        
        const filter = searchTerm.toLowerCase();
        const options = this.multiselect.querySelectorAll('.multiselect-option');
        options.forEach(opt => {
            const isAllOption = opt.querySelector('.checkbox-item[value="All"]');
            if (isAllOption || opt.textContent.toLowerCase().includes(filter)) {
                opt.style.display = '';
            } else {
                opt.style.display = 'none';
            }
        });
    }
    
    setSelectedValues(values) {
        const checkboxes = this.multiselect.querySelectorAll('.checkbox-item:not([value="All"])');
        checkboxes.forEach(cb => {
            cb.checked = values.includes(cb.value);
        });
        this.updateAllCheckbox();
        this.updateSelection();
    }
}

// Global active filters set
const activeFilters = new Set(['os_system']);

// Mapping from filter codenames to display names
// const filterDisplayNames = {
//     'os_system': 'Open Scaffold',
//     'os_model': 'Open Weights', 
//     'checked': 'Checked'
// };

// Global data
let leaderboardTagsData = {};

// Function to load leaderboard tags data
function loadLeaderboardTagsData() {
    if (Object.keys(leaderboardTagsData).length === 0) {
        const dataScript = document.getElementById('leaderboard-tags-data');
        if (dataScript) {
            leaderboardTagsData = JSON.parse(dataScript.textContent);
        }
    }
    return leaderboardTagsData;
}

// Function to update tag dropdown based on active leaderboard
function updateTagsForLeaderboard(leaderboardName) {
    if (!window.tagFiltersDropdown) return;
    
    const tagsData = loadLeaderboardTagsData();
    const leaderboardTags = tagsData[leaderboardName] || [];
    
    // Rebuild the tag dropdown with leaderboard-specific tags
    window.tagFiltersDropdown.rebuildOptions(leaderboardTags);
}

// Make function globally accessible
window.updateTagsForLeaderboard = updateTagsForLeaderboard;

// Function to show/hide filter elements based on leaderboard type
function updateFilterVisibility(leaderboardName) {
    // const mainFiltersContainer = document.getElementById('main-filters');
    const tagFiltersContainer = document.getElementById('tag-filters');
    
    // Show all filters for all leaderboards - consistent interface
    // if (mainFiltersContainer) mainFiltersContainer.style.display = '';
    if (tagFiltersContainer) tagFiltersContainer.style.display = '';
}

// Table Update Logic - Optimized for lazy loading
function updateTable() {
    // Only process the currently visible leaderboard table
    const container = document.getElementById('leaderboard-container');
    if (!container) return;
    
    const visibleLeaderboard = container.querySelector('.tabcontent.active');
    if (!visibleLeaderboard) return;
    
    const tableRows = visibleLeaderboard.querySelectorAll('.data-table tbody tr:not(.no-results)');
    let visibleRowCount = 0;

    const searchString = document.querySelector("#leaderboard-search-input").value;
    
    tableRows.forEach(row => {
        // Show row by default
        let showRow = true;
        // Check filters
        // for (const filter of activeFilters) {
        //     if (row.getAttribute(`data-${filter}`) !== 'true') {
        //         showRow = false;
        //         break;
        //     }
        // }
        
        // Check tag filter
        if (showRow && window.tagFiltersDropdown) {
            const selectedTags = window.tagFiltersDropdown.getSelectedValues();
            const allTagsSelected = window.tagFiltersDropdown.isAllSelected();
            
            if (!allTagsSelected) {
                const rowTags = (row.getAttribute('data-tags') || '').split(',').map(t => t.trim()).filter(Boolean);
                if (!rowTags.some(tag => selectedTags.includes(tag))) {
                    showRow = false;
                }
            }
        }

        if (showRow && searchString.length != 0) {
            const name = row.getAttribute(`data-name`);
            if (!name.includes(searchString)) {
                showRow = false;
            }
        }
        
        // Toggle row visibility
        row.style.display = showRow ? '' : 'none';
        if (showRow) visibleRowCount++;
    });
    
    const noResultsMessage = visibleLeaderboard.querySelector('.no-results');
    // Show/hide no results message
    if (visibleRowCount === 0 && (activeFilters.size > 0 || !isAllTagsSelected())) {
        noResultsMessage.style.display = 'table-row';
    } else {
        noResultsMessage.style.display = 'none';
    }
}

// Updated Filter Button Logic
// function updateActiveFilters(selectedFilters) {
//     activeFilters.clear();
//     selectedFilters.forEach(filter => activeFilters.add(filter));
//     updateTable();
// }

// Global dropdown instances
// let mainFiltersDropdown = null;
let tagFiltersDropdown = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Main Filters Dropdown with dynamic options
    // mainFiltersDropdown = new MultiSelectDropdown('main-filters', {
    //     searchable: false,
    //     allOptionText: 'All Filters',
    //     summaryPrefix: '',
    //     noSelectionText: 'No Filters',
    //     allSelectedText: 'All Filters',
    //     defaultSelected: ['os_system'], // Default to Open Scaffold checked
    //     onSelectionChange: updateActiveFilters
    // });
    
    // Dynamically rebuild the main filters dropdown with canonical names
    // const filterOptions = Object.keys(filterDisplayNames);
    // mainFiltersDropdown.rebuildOptions(filterOptions);
    
    // Initialize Tag Filters Dropdown
    tagFiltersDropdown = new MultiSelectDropdown('tag-filters', {
        searchable: false,
        allOptionText: 'All Tags',
        summaryPrefix: '',
        noSelectionText: 'No Tags',
        allSelectedText: 'All Tags',
        onSelectionChange: (selectedTags) => {
            updateTable(); // Just update table when tag selection changes
        }
    });

    const searchInput = document.getElementById("leaderboard-search-input");

    searchInput.addEventListener("input", function (event) {
        updateTable();
    });
    
    // Initialize with tags for the default leaderboard (code-generation-limited-context)
    updateTagsForLeaderboard('code-generation-limited-context');
    
    // Set initial selection for main filters
    // if (mainFiltersDropdown) {
    //     mainFiltersDropdown.setSelectedValues(['os_system']);
    // }
    
    // Make both dropdowns globally accessible
    // window.mainFiltersDropdown = mainFiltersDropdown;
    window.tagFiltersDropdown = tagFiltersDropdown;
    
    // Check for initial leaderboard visibility (in case landing directly on code-generation-limited-context)
    setTimeout(() => {
        const activeLeaderboard = document.querySelector('.tabcontent.active');
        if (activeLeaderboard) {
            const leaderboardId = activeLeaderboard.id;
            const leaderboardName = leaderboardId.replace('leaderboard-', '');
            updateFilterVisibility(leaderboardName);
            updateTagsForLeaderboard(leaderboardName); // Update tags for the initial leaderboard
        }
    }, 100);
});

// --- Leaderboard Description Update ---
function updateLeaderboardDescription(leaderboardName) {
    const textContainer = document.getElementById('leaderboard-description-text');
    if (!textContainer) return;
    
    const descriptions = {
        'code-generation-limited-context': '<em>Code Generation Limited Context</em>',
        'code-comprehension': '<em>Code Comprehension</em>',
        'code-generation-heavy-context': '<em>Code Generation Heavy Context</em>',
    };
    
    const normalizedName = leaderboardName.toLowerCase();
    textContainer.innerHTML = descriptions[normalizedName] || '';
}

// Make the function globally available
window.updateLeaderboardDescription = updateLeaderboardDescription;

// --- Legacy Functions for Backward Compatibility ---
// These functions are kept for any external dependencies but use the new dropdown instances
function getSelectedTags() {
    return window.tagFiltersDropdown ? window.tagFiltersDropdown.getSelectedValues() : [];
}