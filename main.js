// Main JavaScript file for Brand software

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Brand software loaded');
    
    // Initialize any interactive elements
    initializeCategorySelection();
    initializeTableTabs();
    initializeHeaderTabs();
    initializeGettingStartedForm();
    initializeAudienceConnect();
    initializeRevenueConnect();
    initializeLoadingScreen();
    initializeDataTables();
    initializeCustomerModal();
});

// Category selection functionality
function initializeCategorySelection() {
    const categoryOptions = document.querySelectorAll('.category-option');
    
    // Exit early if no category options found
    if (categoryOptions.length === 0) {
        return;
    }
    
    categoryOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove active class from all options
            categoryOptions.forEach(opt => opt.classList.remove('active'));
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Check the associated radio button
            const radioButton = this.previousElementSibling;
            if (radioButton && radioButton.type === 'radio') {
                radioButton.checked = true;
            }
        });
    });
}

// Table tabs functionality
function initializeTableTabs() {
    const tableTabs = document.querySelectorAll('.table-tabs .tab');
    
    // Exit early if no table tabs found
    if (tableTabs.length === 0) {
        return;
    }
    
    tableTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tableTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Here you could add logic to show/hide different table content
            console.log('Switched to tab:', this.textContent);
        });
    });
}

// Header tabs functionality
function initializeHeaderTabs() {
    const headerTabs = document.querySelectorAll('.header-tabs h4');
    
    // Exit early if no header tabs found
    if (headerTabs.length === 0) {
        return;
    }
    
    headerTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all header tabs
            headerTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Get the tab data attribute
            const tabName = this.getAttribute('data-tab');
            
            // Hide all tab content
            const allTabContents = document.querySelectorAll('.tab-content');
            allTabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const selectedContent = document.getElementById(tabName + '-content');
            if (selectedContent) {
                selectedContent.classList.add('active');
            }
            
            console.log('Switched to header tab:', this.textContent);
        });
    });
}

// Form submission handling
function handleFormSubmission(formData) {
    console.log('Form submitted with data:', formData);
    // Add your form submission logic here
}

// Utility functions
function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'error' ? '#ff4444' : type === 'success' ? '#44ff44' : '#4444ff'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        font-family: 'Comic Neue', cursive;
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Getting started form functionality
function initializeGettingStartedForm() {
    const form = document.getElementById('getting-started-form');
    const continueButton = document.getElementById('start');
    const urlInput = document.getElementById('homepage-url');
    const errorMessage = document.getElementById('url-error');
    
    if (form && continueButton) {
        continueButton.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Clear any previous error messages
            errorMessage.style.display = 'none';
            urlInput.style.borderColor = '';
            
            // Clear category error styling
            const categoriesDiv = document.querySelector('.categories');
            if (categoriesDiv) {
                categoriesDiv.classList.remove('error');
            }
            
            // Get the URL value and trim whitespace
            const urlValue = urlInput.value.trim();
            
            // Validate URL field
            if (!urlValue) {
                // Show error message
                errorMessage.style.display = 'block';
                urlInput.style.borderColor = '#ff4444';
                urlInput.focus();
                return;
            }
            
            // Basic URL validation
            try {
                new URL(urlValue.startsWith('http') ? urlValue : 'https://' + urlValue);
            } catch (error) {
                errorMessage.textContent = 'Please enter a valid URL (e.g., yourwebsite.com)';
                errorMessage.style.display = 'block';
                urlInput.style.borderColor = '#ff4444';
                urlInput.focus();
                return;
            }
            
            // Get selected category
            const selectedCategory = document.querySelector('input[name="category"]:checked');
            
            // Validate category selection
            if (!selectedCategory) {
                // Show error message for category
                errorMessage.textContent = 'Please select a category that relates to your business.';
                errorMessage.style.display = 'block';
                
                // Add error styling to categories section
                if (categoriesDiv) {
                    categoriesDiv.classList.add('error');
                }
                
                // Focus on the first category option
                const firstCategory = document.querySelector('.category-option');
                if (firstCategory) {
                    firstCategory.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
            
            const categoryValue = selectedCategory.value;
            
            // Store form data (you could also send this to a server)
            const formData = {
                url: urlValue,
                category: categoryValue
            };
            
            console.log('Form submitted successfully:', formData);
            
            // Navigate to the next page
            window.location.href = 'get-started-connect.html';
        });
    }
}

// Audience Connect functionality
function initializeAudienceConnect() {
    const form = document.getElementById('audience-connect-form');
    const connectButtons = document.querySelectorAll('.connect-btn');
    const csvDropZone = document.getElementById('csv-drop-zone');
    const csvFileInput = document.getElementById('csv-file-input');
    const fileInfo = document.getElementById('file-info');
    const modal = document.getElementById('connection-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');
    const modalConfirm = document.querySelector('.modal-confirm');
    const skipBtn = document.getElementById('skip-btn');
    const continueBtn = document.getElementById('continue-btn');
    const actionError = document.getElementById('action-error');
    
    // Exit early if we're not on the audience connect page
    if (!form) {
        return;
    }
    
    let currentPlatform = null;
    let hasConnectedChannel = false;
    let hasUploadedFile = false;
    
    // Initialize connect buttons
    connectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            currentPlatform = platform;
            
            modalTitle.textContent = `Connect to ${platform}`;
            modalMessage.textContent = `Are you sure you want to connect to ${platform}? This will allow us to pull your audience data.`;
            modal.style.display = 'flex';
        });
    });
    
    // Modal functionality
    modalConfirm.addEventListener('click', function() {
        if (currentPlatform) {
            const button = document.querySelector(`[data-platform="${currentPlatform}"]`);
            button.classList.add('completed');
            button.textContent = `Connected to ${currentPlatform} ✓`;
            hasConnectedChannel = true;
            clearError();
        }
        modal.style.display = 'none';
    });
    
    modalClose.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    modalCancel.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // CSV Drag and Drop functionality
    if (csvDropZone && csvFileInput) {
        // Click to browse
        csvDropZone.addEventListener('click', function() {
            csvFileInput.click();
        });
        
        // File input change
        csvFileInput.addEventListener('change', function(e) {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
            }
        });
        
        // Drag and drop
        csvDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            csvDropZone.classList.add('drag-over');
        });
        
        csvDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            csvDropZone.classList.remove('drag-over');
        });
        
        csvDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            csvDropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'text/csv') {
                handleFileUpload(files[0]);
            } else {
                showNotification('Please upload a CSV file.', 'error');
            }
        });
    }
    
    function handleFileUpload(file) {
        hasUploadedFile = true;
        csvDropZone.classList.add('has-file');
        
        fileInfo.innerHTML = `
            <p><strong>📄 ${file.name}</strong></p>
            <p>Size: ${(file.size / 1024).toFixed(1)} KB</p>
            <p>Type: CSV file</p>
        `;
        fileInfo.style.display = 'block';
        
        clearError();
        showNotification('CSV file uploaded successfully!', 'success');
    }
    
    // Skip button functionality
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            // Navigate to next page or dashboard
            window.location.href = 'dashboard-customer-table.html';
        });
    }
    
    // Form submission validation
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!hasConnectedChannel && !hasUploadedFile) {
                actionError.style.display = 'block';
                actionError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            // Form is valid, proceed to revenue connect page
            console.log('Audience connect form submitted successfully');
            // Navigate to revenue connect page
            window.location.href = 'get-started-connect-revenue.html';
        });
    }
    
    function clearError() {
        actionError.style.display = 'none';
    }
}

// Revenue Connect functionality (similar to audience connect but for revenue sources)
function initializeRevenueConnect() {
    const form = document.getElementById('revenue-connect-form');
    const connectButtons = document.querySelectorAll('.connect-btn');
    const csvDropZone = document.getElementById('csv-drop-zone');
    const csvFileInput = document.getElementById('csv-file-input');
    const fileInfo = document.getElementById('file-info');
    const modal = document.getElementById('connection-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalClose = document.querySelector('.modal-close');
    const modalCancel = document.querySelector('.modal-cancel');
    const modalConfirm = document.querySelector('.modal-confirm');
    const skipBtn = document.getElementById('skip-btn');
    const continueBtn = document.getElementById('continue-btn');
    const actionError = document.getElementById('action-error');
    
    // Exit early if we're not on the revenue connect page
    if (!form) {
        return;
    }
    
    let currentPlatform = null;
    let hasConnectedChannel = false;
    let hasUploadedFile = false;
    
    // Initialize connect buttons
    connectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const platform = this.getAttribute('data-platform');
            currentPlatform = platform;
            
            modalTitle.textContent = `Connect to ${platform}`;
            modalMessage.textContent = `Are you sure you want to connect to ${platform}? This will allow us to pull your customer data.`;
            modal.style.display = 'flex';
        });
    });
    
    // Modal functionality
    if (modalConfirm) {
        modalConfirm.addEventListener('click', function() {
            if (currentPlatform) {
                const button = document.querySelector(`[data-platform="${currentPlatform}"]`);
                button.classList.add('completed');
                button.textContent = `Connected to ${currentPlatform} ✓`;
                hasConnectedChannel = true;
                clearError();
            }
            modal.style.display = 'none';
        });
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    if (modalCancel) {
        modalCancel.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // CSV file upload functionality
    if (csvDropZone && csvFileInput) {
        csvDropZone.addEventListener('click', function() {
            csvFileInput.click();
        });
        
        csvFileInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                hasUploadedFile = true;
                clearError();
                showFileInfo(file);
            }
        });
        
        // Drag and drop functionality
        csvDropZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            csvDropZone.classList.add('drag-over');
        });
        
        csvDropZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            csvDropZone.classList.remove('drag-over');
        });
        
        csvDropZone.addEventListener('drop', function(e) {
            e.preventDefault();
            csvDropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                hasUploadedFile = true;
                clearError();
                showFileInfo(file);
            }
        });
    }
    
    function showFileInfo(file) {
        if (fileInfo) {
            fileInfo.style.display = 'block';
            fileInfo.innerHTML = `
                <p><strong>File selected:</strong> ${file.name}</p>
                <p><strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
                <p><strong>Type:</strong> ${file.type || 'Unknown'}</p>
            `;
            csvDropZone.classList.add('has-file');
        }
    }
    
    // Skip button functionality
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            // Navigate to loading page
            window.location.href = 'loading.html';
        });
    }
    
    // Form submission validation
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!hasConnectedChannel && !hasUploadedFile) {
                actionError.style.display = 'block';
                actionError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
            
            // Form is valid, proceed to loading page
            console.log('Revenue connect form submitted successfully');
            // Navigate to loading screen
            window.location.href = 'loading.html';
        });
    }
    
    function clearError() {
        if (actionError) {
            actionError.style.display = 'none';
        }
    }
}

// Loading screen functionality
function initializeLoadingScreen() {
    // Check if we're on the loading page
    if (document.querySelector('.loading-container')) {
        startLoadingAnimation();
    }
}

function startLoadingAnimation() {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    const spinner = document.querySelector('.loading-spinner');
    const continueBtn = document.getElementById('continue-btn');
    
    // Initially disable the button
    if (continueBtn) {
        continueBtn.style.opacity = '0.5';
        continueBtn.style.pointerEvents = 'none';
        continueBtn.style.cursor = 'not-allowed';
    }
    
    let progress = 0;
    const duration = 3000; // 3 seconds
    const interval = 50; // Update every 50ms for smooth animation
    const increment = 100 / (duration / interval);
    
    const progressInterval = setInterval(() => {
        progress += increment;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Complete the loading sequence
            progressFill.style.width = '100%';
            progressText.textContent = '100%';
            
            // Hide spinner and activate button
            if (spinner) {
                spinner.style.visibility = 'hidden';
            }
            
            if (continueBtn) {
                continueBtn.style.opacity = '1';
                continueBtn.style.pointerEvents = 'auto';
                continueBtn.style.cursor = 'pointer';
            }
        } else {
            // Update progress
            progressFill.style.width = progress + '%';
            progressText.textContent = Math.round(progress) + '%';
        }
    }, interval);
}

// DataTables initialization
function initializeDataTables() {
    // Ensure DataTables is available
    if (typeof $ === 'undefined' || typeof $.fn.DataTable === 'undefined') {
        return;
    }

    const tableConfigs = [
        { selector: '#overview-table', dataUrl: 'data/customers.json' },
        { selector: '#customers-table', dataUrl: 'data/customers.json' }
    ];

    tableConfigs.forEach(config => {
        const tableElement = document.querySelector(config.selector);
        if (!tableElement) {
            return;
        }

        const dataTable = $(config.selector).DataTable({
            ajax: {
                url: config.dataUrl,
                dataSrc: 'data'
            },
            columns: [
                {
                    data: 'initials',
                    render: function(data) {
                        return '<span class="initials-avatar">' + data + '</span>';
                    }
                },
                { data: 'name' },
                { data: 'about' },
                {
                    data: 'tag',
                    render: function(data, type, row) {
                        return '<span class="tag-pill ' + row.tag_type + '">' + data + '</span>';
                    }
                },
                { data: 'following' },
                { data: 'start_date' },
                {
                    data: 'active_score',
                    render: function(data) {
                        let stars = '';
                        for (let i = 1; i <= 5; i++) {
                            const filled = i <= data ? 'filled' : '';
                            stars += '<span class="star ' + filled + '">★</span>';
                        }
                        return '<div class="star-rating">' + stars + '</div>';
                    }
                },
                { data: 'influence' }
            ],
            dom: 'rt',
            paging: false,
            searching: false,
            info: false,
            lengthChange: false,
            ordering: false,
            responsive: true,
            columnDefs: [
                {
                    targets: [0, 4, 7],
                    className: 'dt-body-center'
                }
            ]
        });

        $(config.selector + ' tbody').on('click', 'tr', function() {
            const data = dataTable.row(this).data();
            if (data) {
                showCustomerModal(data);
            }
        });
    });
}

// Customer modal functionality
function showCustomerModal(customerData) {
    const modal = document.getElementById('customer-modal');
    
    // Update header fields (moved to header)
    document.getElementById('detail-name').textContent = customerData.name;
    document.getElementById('detail-job-title').textContent = customerData.job_title || 'Unknown';
    document.getElementById('detail-company').textContent = customerData.company || 'Unknown';
    document.getElementById('detail-tag').innerHTML = '<span class="tag-pill ' + customerData.tag_type + '">' + customerData.tag + '</span>';
    
    // Update top score in influence section
    const topScoreElement = document.querySelector('.top-score');
    if (topScoreElement) {
        topScoreElement.textContent = customerData.influence;
    }
    
    // Update top stars in engagement section
    const topStarsElement = document.querySelector('.top-stars');
    if (topStarsElement) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= customerData.active_score ? 'filled' : '';
            stars += '<span class="star ' + filled + '">★</span>';
        }
        topStarsElement.innerHTML = '<div class="star-rating">' + stars + '</div>';
    }
    
    // Update detail fields that still exist (only update elements that exist)
    const detailFollowing = document.getElementById('detail-following');
    if (detailFollowing) {
        detailFollowing.textContent = customerData.following;
    }
    
    const detailInfluence = document.getElementById('detail-influence');
    if (detailInfluence) {
        detailInfluence.textContent = customerData.influence;
    }
    
    const detailStartDate = document.getElementById('detail-start-date');
    if (detailStartDate) {
        detailStartDate.textContent = customerData.start_date;
    }
    
    const detailLastActivity = document.getElementById('detail-last-activity');
    if (detailLastActivity) {
        detailLastActivity.textContent = customerData.last_activity || 'Unknown';
    }
    
    const detailEngagementRate = document.getElementById('detail-engagement-rate');
    if (detailEngagementRate) {
        detailEngagementRate.textContent = customerData.engagement_rate || 'Unknown';
    }
    
    const detailReferralSource = document.getElementById('detail-referral-source');
    if (detailReferralSource) {
        detailReferralSource.textContent = customerData.referral_source || 'Unknown';
    }
    
    // Show the modal
    modal.style.display = 'flex';
}

// Initialize customer modal functionality
function initializeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    const modalClose = modal.querySelector('.modal-close');
    const modalConfirm = modal.querySelector('.modal-confirm');
    
    // Close modal when clicking the X
    if (modalClose) {
        modalClose.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking the Close button (if it exists)
    if (modalConfirm) {
        modalConfirm.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside of it
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            modal.style.display = 'none';
        }
    });
}

// Export functions for use in other scripts if needed
window.BrandApp = {
    showNotification,
    handleFormSubmission,
    initializeCategorySelection,
    initializeTableTabs,
    initializeHeaderTabs,
    initializeGettingStartedForm,
    initializeAudienceConnect,
    initializeRevenueConnect,
    initializeLoadingScreen,
    initializeDataTables,
    initializeCustomerModal,
    showCustomerModal
};
