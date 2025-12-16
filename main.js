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
    const emailInput = document.getElementById('work-email');
    const emailError = document.getElementById('email-error');
    const typeButtons = document.querySelectorAll('.business-type');
    const typeError = document.getElementById('type-error');
    let selectedType = null;

    if (!form || !continueButton) {
        return;
    }

    typeButtons.forEach(button => {
        button.addEventListener('click', function() {
            typeButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedType = this.dataset.type;
            typeError.style.display = 'none';
        });
    });

    continueButton.addEventListener('click', function(e) {
        e.preventDefault();

        emailError.style.display = 'none';
        typeError.style.display = 'none';
        emailInput.style.borderColor = '#d9d9d9';

        const emailValue = emailInput.value.trim();
        const emailValid = emailValue && /.+@.+\..+/.test(emailValue);

        if (!emailValid) {
            emailError.style.display = 'block';
            emailInput.style.borderColor = '#ff4444';
            emailInput.focus();
            return;
        }

        if (!selectedType) {
            typeError.style.display = 'block';
            return;
        }

        const formData = {
            email: emailValue,
            businessType: selectedType
        };

        console.log('Account form submitted:', formData);
        window.location.href = 'get-started-connect.html';
    });
}

// Audience Connect functionality
function initializeAudienceConnect() {
    const form = document.getElementById('audience-connect-form');
    const uploadBtn = document.getElementById('audience-upload-btn');
    const dropZone = document.getElementById('audience-drop-zone');
    const fileInput = document.getElementById('audience-file-input');
    const fileInfo = document.getElementById('audience-file-info');
    const skipLink = document.getElementById('audience-skip');
    const errorBox = document.getElementById('audience-error');
    const mappingModal = document.getElementById('mapping-modal');
    const mappingClose = mappingModal ? mappingModal.querySelector('.mapping-close') : null;
    const mappingCancel = mappingModal ? mappingModal.querySelector('.mapping-cancel') : null;
    const mappingSave = mappingModal ? mappingModal.querySelector('.mapping-save') : null;
    let hasFile = false;
    let mappingConfirmed = false;

    if (!form) {
        return;
    }

    const openFilePicker = () => fileInput && fileInput.click();

    if (uploadBtn) {
        uploadBtn.addEventListener('click', openFilePicker);
    }

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', openFilePicker);
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
        });
    }

    function handleFileUpload(file) {
        hasFile = true;
        mappingConfirmed = false;
        dropZone.classList.add('has-file');
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `<p><strong>${file.name}</strong></p><p>${(file.size / 1024).toFixed(1)} KB</p>`;
        errorBox.style.display = 'none';
        openMappingModal();
    }

    function openMappingModal() {
        if (!mappingModal) return;
        mappingModal.style.display = 'flex';
    }

    function closeMappingModal() {
        if (!mappingModal) return;
        mappingModal.style.display = 'none';
    }

    if (mappingClose) {
        mappingClose.addEventListener('click', closeMappingModal);
    }
    if (mappingCancel) {
        mappingCancel.addEventListener('click', () => {
            mappingConfirmed = false;
            closeMappingModal();
        });
    }
    if (mappingSave) {
        mappingSave.addEventListener('click', () => {
            mappingConfirmed = true;
            closeMappingModal();
        });
    }

    if (skipLink) {
        skipLink.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = 'get-started-connect-revenue.html';
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!hasFile) {
            errorBox.textContent = 'Please add an audience CSV or skip for now.';
            errorBox.style.display = 'block';
            return;
        }

        if (!mappingConfirmed) {
            errorBox.textContent = 'Please save your field mapping to continue.';
            errorBox.style.display = 'block';
            openMappingModal();
            return;
        }

        window.location.href = 'get-started-connect-revenue.html';
    });
}

// Revenue Connect functionality (similar to audience connect but for revenue sources)
function initializeRevenueConnect() {
    const form = document.getElementById('revenue-connect-form');
    const uploadBtn = document.getElementById('revenue-upload-btn');
    const dropZone = document.getElementById('revenue-drop-zone');
    const fileInput = document.getElementById('revenue-file-input');
    const fileInfo = document.getElementById('revenue-file-info');
    const skipLink = document.getElementById('revenue-skip');
    const errorBox = document.getElementById('revenue-error');
    const mappingModal = document.getElementById('mapping-modal');
    const mappingClose = mappingModal ? mappingModal.querySelector('.mapping-close') : null;
    const mappingCancel = mappingModal ? mappingModal.querySelector('.mapping-cancel') : null;
    const mappingSave = mappingModal ? mappingModal.querySelector('.mapping-save') : null;
    let hasFile = false;
    let mappingConfirmed = false;

    if (!form) {
        return;
    }

    const openFilePicker = () => fileInput && fileInput.click();

    if (uploadBtn) {
        uploadBtn.addEventListener('click', openFilePicker);
    }

    if (dropZone && fileInput) {
        dropZone.addEventListener('click', openFilePicker);
        dropZone.addEventListener('dragover', e => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        dropZone.addEventListener('dragleave', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
        });
        dropZone.addEventListener('drop', e => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) handleFileUpload(file);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) handleFileUpload(file);
        });
    }

    function handleFileUpload(file) {
        hasFile = true;
        mappingConfirmed = false;
        dropZone.classList.add('has-file');
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `<p><strong>${file.name}</strong></p><p>${(file.size / 1024).toFixed(1)} KB</p>`;
        errorBox.style.display = 'none';
        openMappingModal();
    }

    function openMappingModal() {
        if (!mappingModal) return;
        mappingModal.style.display = 'flex';
    }

    function closeMappingModal() {
        if (!mappingModal) return;
        mappingModal.style.display = 'none';
    }

    if (mappingClose) {
        mappingClose.addEventListener('click', closeMappingModal);
    }
    if (mappingCancel) {
        mappingCancel.addEventListener('click', () => {
            mappingConfirmed = false;
            closeMappingModal();
        });
    }
    if (mappingSave) {
        mappingSave.addEventListener('click', () => {
            mappingConfirmed = true;
            closeMappingModal();
        });
    }

    if (skipLink) {
        skipLink.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = 'loading.html';
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!hasFile) {
            errorBox.textContent = 'Please add a customer CSV or skip for now.';
            errorBox.style.display = 'block';
            return;
        }

        if (!mappingConfirmed) {
            errorBox.textContent = 'Please save your field mapping to continue.';
            errorBox.style.display = 'block';
            openMappingModal();
            return;
        }

        window.location.href = 'loading.html';
    });
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
