let currentStep = 1;
let currentTemplate = Math.random() < 0.5 ? 1 : 2;
const MAX_TEMPLATES = 9;
const TOTAL_STEPS = 3;
let originalText = '';

// Get tenant name from URL parameter or use default
const urlParams = new URLSearchParams(window.location.search);
const tenantName = urlParams.get('tenant') || 'Your Tenant';

document.addEventListener('DOMContentLoaded', function() {
    // Update tenant name in UI elements
    document.querySelectorAll('.tenant-name').forEach(element => {
        element.textContent = tenantName;
    });

    // Add input event listeners for progress bar
    document.querySelectorAll('input, select').forEach(field => {
        field.addEventListener('input', calculateProgress);
    });

    // Add event listener for phone input
    const phoneInput = document.getElementById('landlordPhone');
    phoneInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/\D/g, '');
    });

    // Format phone number as user types
    phoneInput.addEventListener('input', function(e) {
        let number = this.value.replace(/\D/g, '');
        
        if (number.length > 0) {
            // Format as (XXX) XXX-XXXX
            let formatted = number;
            if (number.length > 0) {
                formatted = `(${number.slice(0,3)}`;
                if (number.length > 3) {
                    formatted += `) ${number.slice(3,6)}`;
                    if (number.length > 6) {
                        formatted += `-${number.slice(6)}`;
                    }
                }
            }
            this.value = formatted;
        }
    });

    const skipAddressCheckbox = document.getElementById('skipAddress');
    const addressField = document.getElementById('landlordAddress');
    
    skipAddressCheckbox.addEventListener('change', function() {
        addressField.disabled = this.checked;
        if (this.checked) {
            addressField.value = '';
        }
    });

    const skipRentCheckbox = document.getElementById('skipRent');
    const rentField = document.getElementById('monthlyRent');
    const rentCurrency = document.getElementById('rentCurrency');
    
    skipRentCheckbox.addEventListener('change', function() {
        rentField.disabled = this.checked;
        rentCurrency.disabled = this.checked;
        if (this.checked) {
            rentField.value = '';
        }
    });

    // Add change event listeners for checkboxes to recalculate progress
    document.getElementById('skipAddress').addEventListener('change', calculateProgress);
    document.getElementById('skipRent').addEventListener('change', calculateProgress);
    
    // Initial progress calculation
    calculateProgress();

    // Add fade transition for landing page
    const startButton = document.getElementById('startButton');
    if (startButton) {
        startButton.addEventListener('click', function() {
            document.getElementById('landingPage').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('landingPage').style.display = 'none';
                document.getElementById('mainContent').style.display = 'block';
                setTimeout(() => {
                    document.getElementById('mainContent').style.opacity = '1';
                }, 50);
            }, 500);
        });
    }

    // Add input validation for tenancy period
    const tenancyValue = document.getElementById('tenancyValue');
    if (tenancyValue) {
        tenancyValue.addEventListener('input', function() {
            // Ensure positive integers only
            this.value = Math.max(1, Math.floor(this.value) || 1);
        });
    }
});

// Navigation functions
function nextStep(step) {
    if (!validateStep(step)) return;
    
    document.getElementById(`step${step}`).style.display = 'none';
    document.getElementById(`step${step + 1}`).style.display = 'block';
    currentStep = step + 1;
    calculateProgress();
    window.scrollTo(0, 0);
}

function previousStep(step) {
    if (step === 1) return;
    
    const currentElement = document.getElementById(`step${step}`);
    const previousElement = document.getElementById(`step${step - 1}`);
    
    if (currentElement.id === 'result') {
        document.getElementById('result').style.display = 'none';
        document.getElementById('step3').style.display = 'block';
        currentStep = 3;
    } else {
        currentElement.style.display = 'none';
        previousElement.style.display = 'block';
        currentStep = step - 1;
    }
    
    calculateProgress();
    window.scrollTo(0, 0);
}

// Validation functions
function validateStep(step) {
    const requiredFields = {
        1: {
            'landlordName': 'Name',
            'landlordPhone': 'Phone Number',
            'landlordEmail': 'Email'
        },
        2: {
            'propertyAddress': 'Property Address',
            'tenancyValue': 'Tenancy Period',
            'monthlyRent': 'Monthly Rent'
        },
        3: {
            'paymentHistory': 'Payment History',
            'propertyCondition': 'Property Condition',
            'moveOutCondition': 'Move-out Condition',
            'neighborRelations': 'Neighbor Relations',
            'wouldRentAgain': 'Future Rental Consideration'
        }
    };

    const fields = requiredFields[step];
    for (let fieldId in fields) {
        const field = document.getElementById(fieldId);
        if (!field) {
            console.error(`Field ${fieldId} not found`);
            continue;
        }

        // Skip validation for disabled fields
        if (field.disabled) {
            continue;
        }

        const value = field.value.trim();
        
        // Remove any previous error styling
        field.classList.remove('is-invalid');
        
        if (!value) {
            field.classList.add('is-invalid');
            alert(`Please fill in the ${fields[fieldId]} field.`);
            field.focus();
            return false;
        }
        
        if (fieldId === 'landlordEmail' && !isValidEmail(value)) {
            field.classList.add('is-invalid');
            alert('Please enter a valid email address.');
            field.focus();
            return false;
        }
        
        if (fieldId === 'landlordPhone' && !isValidPhone(value)) {
            field.classList.add('is-invalid');
            alert('Please enter a valid phone number in format (XXX) XXX-XXXX');
            field.focus();
            return false;
        }
    }
    
    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\(\d{3}\)\s\d{3}-\d{4}$/.test(phone);
}

// Progress bar
function updateProgress(percentage) {
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
}

// Reference generation and template switching
function showLoadingAnimation() {
    const result = document.getElementById('result');
    const existingContent = result.innerHTML;
    
    result.innerHTML = `
        <div class="loading-container text-center py-5">
            <div class="loading-content">
                <div class="spinner-grow text-primary mb-4" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h3 class="loading-text mb-2">Generating Reference Letter</h3>
                <p class="loading-subtext text-muted">Creating a professional recommendation...</p>
            </div>
        </div>`;
    
    return () => {
        result.innerHTML = existingContent;
    };
}

function generateReference() {
    if (!validateStep(3)) return;
    
    // Hide step 3
    document.getElementById('step3').style.display = 'none';
    // Show result div with loading animation
    document.getElementById('result').style.display = 'block';
    
    const restoreContent = showLoadingAnimation();
    
    // Random loading time between 300ms and 1600ms
    const loadingTime = Math.random() * (1600 - 300) + 300;
    
    // Simulate processing time and generate the reference
    setTimeout(() => {
        const referenceText = generateLandlordReference();
        
        // Restore the original content structure
        restoreContent();
        
        // Remove existing warning box if it exists
        const existingWarning = document.querySelector('.alert.alert-warning');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        // Create and insert the warning box before the reference output
        const warningBox = document.createElement('div');
        warningBox.className = 'alert alert-warning py-2 mb-3';
        warningBox.setAttribute('role', 'alert');
        warningBox.style.backgroundColor = '#fff3cd';
        warningBox.style.border = '1px solid #ffeeba';
        warningBox.style.color = '#856404';
        warningBox.innerHTML = `<small><i class="bi bi-exclamation-triangle-fill me-2"></i>Your letter isn't sent yet. Click "Share as PDF" and send it to your tenant via messaging apps or E-Mail.</small>`;
        
        const referenceOutput = document.getElementById('referenceOutput');
        referenceOutput.parentNode.insertBefore(warningBox, referenceOutput);
        referenceOutput.textContent = referenceText;
        
        window.scrollTo(0, 0);
    }, loadingTime); // Random loading time
}

function switchTemplate() {
    try {
        const oldTemplate = currentTemplate;
        currentTemplate = currentTemplate % MAX_TEMPLATES + 1;
        generateReference();
    } catch (error) {
        console.error('Template Switch Error:', error);
        alert('Error switching templates. Reverting to previous template.');
        currentTemplate = oldTemplate;
        generateReference();
    }
}

async function generatePDF() {
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            throw new Error('PDF library not loaded');
        }
        
        const fileName = `${tenantName.replace(/\s+/g, '_')}_${document.getElementById('landlordName').value.replace(/\s+/g, '_')}_Letter.pdf`;
        
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        // iOS-style typography
        doc.setFont('times');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);

        // Get the reference text and split it into sections
        const text = document.getElementById('referenceOutput').textContent;
        const sections = text.split('\n\n');
        
        // Set up initial position and margins
        let yPos = 25;
        const leftMargin = 25;
        const contentWidth = 160;
        
        // Process header section
        doc.setFont('times', 'bold');
        doc.setFontSize(14);
        const headerLines = sections[0].split('\n');
        headerLines.forEach(line => {
            doc.text(line, leftMargin, yPos);
            yPos += 7;
        });
        
        // Date
        yPos += 7;
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text(sections[1], leftMargin, yPos);
        
        // Salutation
        yPos += 14;
        doc.setFont('times', 'bold');
        doc.text("To Whom It May Concern,", leftMargin, yPos);
        
        // Main content
        doc.setFont('times', 'normal');
        
        // Process each paragraph
        for (let i = 3; i < sections.length - 1; i++) {
            yPos += 14;
            
            // Check if we need a new page
            if (yPos > 270) {
                doc.addPage();
                yPos = 25;
            }
            
            const paragraph = sections[i].trim();
            
            // Add italic formatting for key phrases
            if (paragraph.includes("would definitely rent") || 
                paragraph.includes("would be happy to rent") || 
                paragraph.includes("would consider renting")) {
                doc.setFont('times', 'italic');
            }
            
            const lines = doc.splitTextToSize(paragraph, contentWidth);
            doc.text(lines, leftMargin, yPos);
            yPos += (lines.length - 1) * 7;
            
            doc.setFont('times', 'normal');
        }
        
        // Add signature section
        yPos += 7;
        doc.setFont('times', 'italic');
        doc.text("Sincerely,", leftMargin, yPos);
        yPos += 7;
        doc.setFont('times', 'bold');
        doc.text(document.getElementById('landlordName').value, leftMargin, yPos);
        
        // Share or download the PDF
        const pdfBlob = doc.output('blob');
        
        try {
            if (navigator.share) {
                const file = new File([pdfBlob], fileName, {
                    type: 'application/pdf'
                });
                
                await navigator.share({
                    files: [file],
                    title: 'Rental Reference Letter',
                    text: 'Generated Rental Reference Letter'
                });
            } else {
                const pdfUrl = URL.createObjectURL(pdfBlob);
                window.open(pdfUrl, '_blank');
            }
        } catch (err) {
            console.error('Error sharing:', err);
            alert('Unable to share. The PDF will download instead.');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = fileName;
            link.click();
        }
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('There was an error generating the PDF. Please try again.');
    }
}

function formatDate(date) {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function generateLandlordReference() {
    // Get all form values
    const landlordName = document.getElementById('landlordName').value;
    const landlordAddress = document.getElementById('landlordAddress').value;
    const skipAddress = document.getElementById('skipAddress').checked;
    const landlordPhone = document.getElementById('countryCode').value + ' ' + document.getElementById('landlordPhone').value;
    const landlordEmail = document.getElementById('landlordEmail').value;
    const propertyAddress = document.getElementById('propertyAddress').value;
    const months = getTenancyPeriod();
    const periodText = formatTenancyPeriod(months);
    const paymentHistory = document.getElementById('paymentHistory').value;
    const propertyCondition = document.getElementById('propertyCondition').value;
    const moveOutCondition = document.getElementById('moveOutCondition').value;
    const neighborRelations = document.getElementById('neighborRelations').value;
    const wouldRentAgain = document.getElementById('wouldRentAgain').value;
    const monthlyRent = document.getElementById('monthlyRent').value;
    const rentCurrency = document.getElementById('rentCurrency').value;
    const skipRent = document.getElementById('skipRent').checked;
    
    const rentText = skipRent ? '' : `with a monthly rent of ${rentCurrency}${monthlyRent} `;

    const paymentDescriptions = {
        'onTime': 'on time and in full',
        'occasionallyLate': 'occasionally late with advance notice',
        'sometimesLate': 'in full but sometimes late'
    };

    const conditionDescriptions = {
        'excellent': 'excellent',
        'good': 'good',
        'acceptable': 'acceptable'
    };

    const moveOutDescriptions = {
        'veryGood': 'very good',
        'good': 'good',
        'acceptable': 'acceptable'
    };

    const moveOutRepairs = {
        'veryGood': 'only standard cleaning',
        'good': 'minor repairs',
        'acceptable': 'some noticeable repairs'
    };

    const neighborDescription = {
        'excellent': 'no complaints whatsoever',
        'veryGood': 'no formal complaints',
        'good': 'one minor complaint that was resolved immediately',
        'fair': 'a few minor complaints that were all resolved quickly',
        'mixed': 'occasional complaints that were promptly addressed'
    };

    const rentAgainPhrases = {
        'definitely': 'I would definitely rent to them again without hesitation',
        'yes': 'I would be happy to rent to them again',
        'maybe': 'I would consider renting to them again with proper screening'
    };

    const template1 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

I am writing this rental reference for ${tenantName}, who rented my property at ${propertyAddress} ${rentText}for ${periodText}.

During their tenancy, ${tenantName} maintained their responsibilities as a tenant. Their rent payments were ${paymentDescriptions[paymentHistory]}, and they maintained the property in ${conditionDescriptions[propertyCondition]} condition. Upon move-out, the property was left in ${moveOutDescriptions[moveOutCondition]} condition, requiring ${moveOutRepairs[moveOutCondition]}.

Regarding community relations, there were ${neighborDescription[neighborRelations]}. They maintained good communication throughout their tenancy.

Based on this experience, ${rentAgainPhrases[wouldRentAgain]}. Their overall performance makes them a ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} candidate for future rental opportunities.

If you need any additional information, please contact me at ${landlordPhone} or ${landlordEmail}.

Kind regards,
${landlordName}`;

    const template2 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

I am providing this rental reference for ${tenantName}, a tenant at ${propertyAddress} ${rentText}for ${periodText}.

Their tenancy was characterized by ${paymentDescriptions[paymentHistory]} rent payments and ${conditionDescriptions[propertyCondition]} property maintenance. The property was returned in ${moveOutDescriptions[moveOutCondition]} condition at move-out, requiring ${moveOutRepairs[moveOutCondition]}.

During their stay, there were ${neighborDescription[neighborRelations]}. Communication was clear and timely throughout the tenancy.

${rentAgainPhrases[wouldRentAgain]}. Their record suggests they would be a ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} tenant for future rentals.

If you need any additional information, please contact me at ${landlordPhone} or ${landlordEmail}.

Kind regards,
${landlordName}`;

    const template3 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

This letter serves to document the tenancy of ${tenantName} at ${propertyAddress} ${rentText}for a period of ${periodText}.

Throughout their residency, the tenant demonstrated ${paymentDescriptions[paymentHistory]} rent payment history. The property was consistently kept in ${conditionDescriptions[propertyCondition]} condition, and upon vacating, was left in ${moveOutDescriptions[moveOutCondition]} condition, necessitating ${moveOutRepairs[moveOutCondition]}.

With regard to community standards, ${neighborDescription[neighborRelations]}. Their conduct was professional and communication was effective.

Professional assessment: ${rentAgainPhrases[wouldRentAgain]}. Based on their performance, they would be a ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} candidate for tenancy.

If you need any additional information, please contact me at ${landlordPhone} or ${landlordEmail}.

Kind regards,
${landlordName}`;

    const template4 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

At the request of ${tenantName}, I am writing to verify their tenancy at ${propertyAddress} ${rentText}which lasted ${periodText}.

As their landlord, I can confirm their rent payments were ${paymentDescriptions[paymentHistory]}. They showed ${conditionDescriptions[propertyCondition]} care of the property during their stay. The final inspection revealed ${moveOutDescriptions[moveOutCondition]} condition, with ${moveOutRepairs[moveOutCondition]} needed.

Regarding neighbor interactions, ${neighborDescription[neighborRelations]}. Our office maintained a positive working relationship with the tenant.

Looking forward, ${rentAgainPhrases[wouldRentAgain]}. Their track record indicates they would be a ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} choice for property owners.

For verification or additional details, I can be reached at ${landlordPhone} or ${landlordEmail}.

Kind regards,
${landlordName}`;

    const template5 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

This reference letter confirms that ${tenantName} was a tenant under my management at ${propertyAddress} ${rentText}for a duration of ${periodText}.

* Financial Responsibility: Rent payments were ${paymentDescriptions[paymentHistory]}.
* Property Care: Maintained in ${conditionDescriptions[propertyCondition]} condition throughout tenancy.
* Move-out Status: ${moveOutDescriptions[moveOutCondition].charAt(0).toUpperCase() + moveOutDescriptions[moveOutCondition].slice(1)} condition, ${moveOutRepairs[moveOutCondition]}.
* Community Relations: ${neighborDescription[neighborRelations].charAt(0).toUpperCase() + neighborDescription[neighborRelations].slice(1)}.

Rental Recommendation: ${rentAgainPhrases[wouldRentAgain]}. 
Assessment: A ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} prospect for future tenancy.

Available for further inquiries at ${landlordPhone} or ${landlordEmail}.

Kind regards,
${landlordName}`;

    const template6 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

Having served as ${tenantName}'s landlord for ${periodText} at ${propertyAddress} ${rentText}, I am pleased to provide this rental reference.

The tenancy was marked by ${paymentDescriptions[paymentHistory]} rent payments, reflecting their financial reliability. The property's upkeep was consistently ${conditionDescriptions[propertyCondition]}, and upon conclusion of the lease, it was left in ${moveOutDescriptions[moveOutCondition]} condition, requiring ${moveOutRepairs[moveOutCondition]}.

In terms of neighborly conduct, ${neighborDescription[neighborRelations]}. Their approach to property-related matters was always professional.

Future rental prospects: ${rentAgainPhrases[wouldRentAgain]}. Based on my experience, they would be a ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} addition to any rental community.

Please reach out at ${landlordPhone} or ${landlordEmail} for any clarification needed.

Kind regards,
${landlordName}`;

    const template7 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

As the property owner of ${propertyAddress}, I am writing to provide a rental history for ${tenantName}, who resided at the property ${rentText}from ${formatDate(new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000))} to ${formatDate(new Date())}.

* Payment History: ${paymentDescriptions[paymentHistory].charAt(0).toUpperCase() + paymentDescriptions[paymentHistory].slice(1)}
* Property Maintenance: ${conditionDescriptions[propertyCondition].charAt(0).toUpperCase() + conditionDescriptions[propertyCondition].slice(1)} standards maintained
* Move-out Condition: ${moveOutDescriptions[moveOutCondition].charAt(0).toUpperCase() + moveOutDescriptions[moveOutCondition].slice(1)}, requiring ${moveOutRepairs[moveOutCondition]}
* Community Impact: ${neighborDescription[neighborRelations].charAt(0).toUpperCase() + neighborDescription[neighborRelations].slice(1)}

Landlord's Recommendation:
${rentAgainPhrases[wouldRentAgain]}. Their tenancy record suggests they would be a ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} candidate for property owners seeking reliable tenants.

Contact Information:
Phone: ${landlordPhone}
Email: ${landlordEmail}

Kind regards,
${landlordName}`;

    const template8 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

This letter is in response to a rental reference request for ${tenantName}. I was their landlord at ${propertyAddress} ${rentText}for a period spanning ${periodText}, and I am happy to share my experience.

Throughout the duration of their lease, I observed:
* Financial Responsibility: ${paymentDescriptions[paymentHistory]} rent payments
* Property Care: ${conditionDescriptions[propertyCondition]} maintenance of the premises
* Final Condition: ${moveOutDescriptions[moveOutCondition]} at move-out (${moveOutRepairs[moveOutCondition]})
* Neighbor Relations: ${neighborDescription[neighborRelations]}

Professional Opinion:
${rentAgainPhrases[wouldRentAgain]}. Given their history, they would be a ${wouldRentAgain === 'definitely' ? 'highly recommended' : 'suitable'} tenant for any property owner.

For additional verification, please contact me:
${landlordPhone} | ${landlordEmail}

Kind regards,
${landlordName}`;

    const template9 = `
${landlordName}
${skipAddress ? '' : landlordAddress + '\n'}Phone: ${landlordPhone}
Email: ${landlordEmail}

${formatDate(new Date())}

To Whom It May Concern,

I am providing this rental reference in my capacity as the former landlord of ${tenantName}, who maintained tenancy at ${propertyAddress} ${rentText}for ${periodText}.

Lease Performance Overview
------------------------
* Rent Payment Record: ${paymentDescriptions[paymentHistory]}
* Property Maintenance: ${conditionDescriptions[propertyCondition]}
* Move-out Assessment: ${moveOutDescriptions[moveOutCondition]} | ${moveOutRepairs[moveOutCondition]}
* Community Standing: ${neighborDescription[neighborRelations]}

Future Rental Consideration
------------------------
${rentAgainPhrases[wouldRentAgain]}
Recommendation Level: ${wouldRentAgain === 'definitely' ? 'Highly Recommended' : 'Suitable'} for future tenancy

Reference Verification
------------------------
Direct Line: ${landlordPhone}
Email: ${landlordEmail}

Kind regards,
${landlordName}`;

    switch(currentTemplate) {
        case 1:
            return template1;
        case 2:
            return template2;
        case 3:
            return template3;
        case 4:
            return template4;
        case 5:
            return template5;
        case 6:
            return template6;
        case 7:
            return template7;
        case 8:
            return template8;
        case 9:
            return template9;
        default:
            return template1;
    }
}

function lockField(fieldId) {
    const container = document.getElementById(fieldId).closest('.input-group-edit');
    if (container && document.getElementById(fieldId).value.trim() !== '') {
        container.classList.add('locked');
    }
}

function enableEdit(fieldId) {
    const container = document.getElementById(fieldId).closest('.input-group-edit');
    const input = document.getElementById(fieldId);
    container.classList.remove('locked');
    input.focus();
}

function copyToClipboard() {
    const text = document.getElementById('referenceOutput').textContent;
    navigator.clipboard.writeText(text).then(() => {
        // Create a temporary button to show feedback
        const originalButton = document.querySelector('button[onclick="copyToClipboard()"]');
        const originalText = originalButton.innerHTML;
        originalButton.innerHTML = 'Copied! <i class="bi bi-check2 ms-2"></i>';
        originalButton.classList.add('btn-success');
        originalButton.classList.remove('btn-outline-primary');
        
        // Reset button after 2 seconds
        setTimeout(() => {
            originalButton.innerHTML = originalText;
            originalButton.classList.remove('btn-success');
            originalButton.classList.add('btn-outline-primary');
        }, 2000);
    }).catch(err => {
        alert('Failed to copy text: ' + err);
    });
}

// Add this new function after the generateReference function
function enableReferenceEditing() {
    const referenceOutput = document.getElementById('referenceOutput');
    originalText = referenceOutput.textContent;
    
    // Create and configure textarea
    const textarea = document.createElement('textarea');
    textarea.value = originalText;
    textarea.className = 'form-control';
    textarea.style.minHeight = '400px';
    textarea.style.fontFamily = "'Times New Roman', Times, serif";
    textarea.style.fontSize = '1.1rem';
    textarea.style.lineHeight = '1.8';
    textarea.style.padding = '1.5rem';
    textarea.style.width = '100%';
    textarea.style.resize = 'vertical';
    
    // Replace the output div with textarea
    referenceOutput.replaceWith(textarea);
    
    // Update header buttons layout
    const headerActions = document.querySelector('#result .header-actions');
    headerActions.innerHTML = `
        <div class="btn-toolbar gap-2 mb-3" role="toolbar">
            <button class="btn btn-outline-secondary btn-sm" onclick="cancelEditing()">
                <i class="bi bi-arrow-left"></i> Cancel
            </button>
            <button class="btn btn-success btn-sm" onclick="saveEdits()">
                <i class="bi bi-check2"></i> Save
            </button>
        </div>
        <h1 class="step-title mb-3">Edit Reference</h1>
    `;
    
    // Update the navigation buttons
    const navigationButtons = document.querySelector('#result .navigation-buttons .d-flex');
    navigationButtons.innerHTML = `
        <button class="btn btn-outline-secondary" onclick="cancelEditing()">
            Cancel <i class="bi bi-x ms-2"></i>
        </button>
        <button class="btn btn-success" onclick="saveEdits()">
            Save Changes <i class="bi bi-check2 ms-2"></i>
        </button>
    `;
}

function cancelEditing() {
    const textarea = document.querySelector('#result textarea');
    if (!textarea) return;
    
    // Create new output div with the original text
    const newOutput = document.createElement('div');
    newOutput.id = 'referenceOutput';
    newOutput.className = 'p-4 bg-light rounded';
    newOutput.textContent = originalText;
    
    // Replace textarea with the new output div
    textarea.replaceWith(newOutput);
    
    // Restore all buttons
    restoreButtons();
}

function saveEdits() {
    const textarea = document.querySelector('#result textarea');
    if (!textarea) return;
    
    // Create new output div
    const newOutput = document.createElement('div');
    newOutput.id = 'referenceOutput';
    newOutput.className = 'p-4 bg-light rounded';
    newOutput.textContent = textarea.value;
    
    // Replace textarea with the new output div
    textarea.replaceWith(newOutput);
    
    // Update original text to the new version
    originalText = textarea.value;
    
    // Restore all buttons
    restoreButtons();
}

function restoreButtons() {
    // Restore header buttons
    const headerActions = document.querySelector('#result .header-actions');
    if (!headerActions) return;
    
    headerActions.innerHTML = `
        <div class="btn-toolbar gap-2 mb-3" role="toolbar">
            <button class="btn btn-outline-secondary btn-sm" onclick="previousStep(3)">
                <i class="bi bi-arrow-left"></i> Back to Edit
            </button>
            <button class="btn btn-outline-primary btn-sm" onclick="enableReferenceEditing()">
                <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-outline-primary btn-sm" onclick="copyToClipboard()">
                <i class="bi bi-clipboard"></i> Copy
            </button>
        </div>
        <h1 class="step-title mb-3">Generated Reference</h1>
    `;
    
    // Restore navigation buttons
    const navigationButtons = document.querySelector('#result .navigation-buttons .d-flex');
    if (!navigationButtons) return;
    
    navigationButtons.innerHTML = `
        <button class="btn btn-outline-primary" onclick="switchTemplate()">
            Try Different Template <i class="bi bi-shuffle ms-2"></i>
        </button>
        <button class="btn btn-primary" onclick="generatePDF()">
            Share as PDF <i class="bi bi-share ms-2"></i>
        </button>
    `;
}

// New function to calculate overall progress
function calculateProgress() {
    const requiredFields = {
        1: ['landlordName', 'landlordPhone', 'landlordEmail', 'landlordAddress'],
        2: ['propertyAddress', 'tenancyValue', 'monthlyRent'],
        3: ['paymentHistory', 'propertyCondition', 'moveOutCondition', 'neighborRelations', 'wouldRentAgain']
    };

    let totalFields = 0;
    let filledFields = 0;

    // Count filled fields for current step only
    const currentStepFields = requiredFields[currentStep];
    if (currentStepFields) {
        currentStepFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Skip if field is disabled
                if (!field.disabled) {
                    totalFields++;
                    if (field.value.trim()) {
                        filledFields++;
                    }
                }
            }
        });
    }

    // Calculate progress for current step
    const stepProgress = (filledFields / totalFields) * 100;
    const overallProgress = ((currentStep - 1) * 33.33) + (stepProgress / 3);
    
    // Update progress bar
    updateProgress(Math.min(overallProgress, 100));
}

// Update the tenancy period options generation
function generateTenancyOptions() {
    const select = document.getElementById('tenancyPeriod');
    select.innerHTML = '<option value="" disabled selected>Select Tenancy Period</option>';
    
    // Add month options (1-11 months)
    for(let i = 1; i <= 11; i++) {
        select.innerHTML += `<option value="m${i}">${i} month${i === 1 ? '' : 's'}</option>`;
    }
    
    // Add year options (1-10 years)
    for(let i = 1; i <= 10; i++) {
        select.innerHTML += `<option value="y${i}">${i} year${i === 1 ? '' : 's'}</option>`;
    }
}

// Update the period text generation in the reference letter
function getPeriodText(tenancyPeriod) {
    const [unit, value] = [tenancyPeriod.charAt(0), parseInt(tenancyPeriod.slice(1))];
    
    if (unit === 'm') {
        return `${value} month${value === 1 ? '' : 's'}`;
    } else {
        return `${value} year${value === 1 ? '' : 's'}`;
    }
}

function getTenancyPeriod() {
    const value = document.getElementById('tenancyValue').value;
    const unit = document.getElementById('tenancyUnit').value;
    
    if (!value) return null;
    
    // Convert to months for internal storage
    const months = unit === 'years' ? value * 12 : parseInt(value);
    return months;
}

function formatTenancyPeriod(months) {
    if (!months) return '';
    
    if (months >= 12 && months % 12 === 0) {
        const years = months / 12;
        return `${years} year${years === 1 ? '' : 's'}`;
    } else {
        return `${months} month${months === 1 ? '' : 's'}`;
    }
} 