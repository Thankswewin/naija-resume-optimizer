// State Management
let currentResume = null;
let currentOptimization = null;
let isOptimizing = false;
let selectedTemplate = 'professional';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadTheme();
    initializeFormValidation();
});

// Event Listeners
function initializeEventListeners() {
    // Form inputs
    const formInputs = document.querySelectorAll('input, textarea, select');
    formInputs.forEach(input => {
        input.addEventListener('input', handleFormInput);
    });

    // Character counter for professional summary
    const professionalSummary = document.getElementById('professionalSummary');
    if (professionalSummary) {
        professionalSummary.addEventListener('input', updateCharCount);
    }

    // Job description analysis
    const jobDescription = document.getElementById('jobDescription');
    if (jobDescription) {
        jobDescription.addEventListener('input', analyzeJobDescription);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            optimizeResume();
        }
        if (e.key === 'Escape') {
            hideLoading();
        }
    });
}

// Theme Management
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle i');

    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.classList.remove('fa-sun');
        themeToggle.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeToggle = document.querySelector('.theme-toggle i');

    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.classList.remove('fa-moon');
        themeToggle.classList.add('fa-sun');
    }
}

// Form Management
function initializeFormValidation() {
    // Add real-time validation
    const requiredFields = document.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
    });

    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', formatPhoneNumber);
    }
}

function handleFormInput(event) {
    const input = event.target;
    if (input.hasAttribute('required')) {
        validateField(input);
    }
}

function validateField(field) {
    const isValid = field.checkValidity();
    const formGroup = field.closest('.form-group');

    if (isValid) {
        formGroup?.classList.remove('invalid');
        field.style.borderColor = '';
    } else {
        formGroup?.classList.add('invalid');
        field.style.borderColor = 'var(--error-color)';
    }

    return isValid;
}

function formatPhoneNumber(event) {
    let value = event.target.value.replace(/\D/g, '');

    if (value.length > 0 && !value.startsWith('234')) {
        value = '234' + value;
    }

    if (value.length <= 3) {
        event.target.value = value;
    } else if (value.length <= 6) {
        event.target.value = `${value.slice(0, 3)} ${value.slice(3)}`;
    } else if (value.length <= 10) {
        event.target.value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6)}`;
    } else {
        event.target.value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)} ${value.slice(10, 13)}`;
    }
}

function updateCharCount(event) {
    const textarea = event.target;
    const charCount = textarea.value.length;
    const charCountElement = textarea.parentElement.querySelector('.char-count');

    if (charCountElement) {
        charCountElement.textContent = `${charCount} characters`;

        if (charCount > 500) {
            charCountElement.style.color = 'var(--warning-color)';
        } else if (charCount > 800) {
            charCountElement.style.color = 'var(--error-color)';
        } else {
            charCountElement.style.color = 'var(--text-tertiary)';
        }
    }
}

// Job Description Analysis
function analyzeJobDescription(event) {
    const jobDescription = event.target.value;
    if (jobDescription.length < 50) return;

    // Extract keywords
    const keywords = extractKeywords(jobDescription);
    const requirements = extractRequirements(jobDescription);

    // Update preview
    updateJobAnalysisPreview(keywords, requirements);
}

function extractKeywords(text) {
    // Common job keywords
    const commonKeywords = [
        'experience', 'skills', 'degree', 'bachelor', 'master', 'phd',
        'management', 'leadership', 'communication', 'team', 'project',
        'development', 'software', 'programming', 'data', 'analysis',
        'marketing', 'sales', 'customer', 'service', 'support',
        'financial', 'accounting', 'budget', 'reporting', 'strategy',
        'nigerian', 'lagos', 'abuja', 'port harcourt', 'kano',
        'remote', 'hybrid', 'onsite', 'office', 'work from home'
    ];

    const words = text.toLowerCase().split(/\W+/);
    const foundKeywords = commonKeywords.filter(keyword =>
        words.some(word => word.includes(keyword))
    );

    return [...new Set(foundKeywords)].slice(0, 10);
}

function extractRequirements(text) {
    const requirements = [];

    // Look for patterns
    if (text.includes('year') && text.includes('experience')) {
        requirements.push('Experience requirement');
    }
    if (text.includes('degree') || text.includes('bachelor')) {
        requirements.push('Educational qualification');
    }
    if (text.includes('skill') || text.includes('expertise')) {
        requirements.push('Technical skills');
    }
    if (text.includes('team') || text.includes('collaborat')) {
        requirements.push('Teamwork ability');
    }
    if (text.includes('communication')) {
        requirements.push('Communication skills');
    }
    if (text.includes('nigerian') || /lagos|abuja|port harcourt/i.test(text)) {
        requirements.push('Local market knowledge');
    }

    return requirements;
}

function updateJobAnalysisPreview(keywords, requirements) {
    const keywordsElement = document.getElementById('jobKeywords');
    const requirementsElement = document.getElementById('jobRequirements');

    if (keywordsElement) {
        keywordsElement.innerHTML = `
            <strong>Key Terms:</strong> ${keywords.map(k => `<span class="keyword-tag matched">${k}</span>`).join(' ')}
        `;
    }

    if (requirementsElement) {
        requirementsElement.innerHTML = `
            <strong>Requirements:</strong> ${requirements.map(r => `<span class="keyword-tag">${r}</span>`).join(' ')}
        `;
    }
}

// Resume Optimization
function optimizeResume() {
    if (isOptimizing) return;

    // Validate form
    const requiredFields = document.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });

    if (!isValid) {
        alert('Please fill in all required fields before optimizing your resume.');
        return;
    }

    // Collect resume data
    const resumeData = collectResumeData();
    const jobData = collectJobData();
    const settings = collectOptimizationSettings();

    if (!resumeData || !jobData) {
        alert('Please provide both resume information and job description.');
        return;
    }

    isOptimizing = true;
    showLoading();

    // Simulate optimization process
    setTimeout(() => {
        const optimization = performResumeOptimization(resumeData, jobData, settings);
        displayResults(optimization);
        isOptimizing = false;
        hideLoading();
    }, 3000 + Math.random() * 2000);
}

function collectResumeData() {
    const fullName = document.getElementById('fullName')?.value?.trim();
    const email = document.getElementById('email')?.value?.trim();
    const phone = document.getElementById('phone')?.value?.trim();
    const location = document.getElementById('location')?.value?.trim();
    const linkedIn = document.getElementById('linkedIn')?.value?.trim();
    const professionalTitle = document.getElementById('professionalTitle')?.value?.trim();
    const experience = document.getElementById('experience')?.value;
    const industry = document.getElementById('industry')?.value;
    const professionalSummary = document.getElementById('professionalSummary')?.value?.trim();
    const skills = document.getElementById('skills')?.value?.trim();
    const experienceDetails = document.getElementById('experienceDetails')?.value?.trim();
    const education = document.getElementById('education')?.value?.trim();
    const certifications = document.getElementById('certifications')?.value?.trim();

    if (!fullName || !email || !phone || !location || !professionalTitle ||
        !experience || !industry || !professionalSummary || !skills ||
        !experienceDetails || !education) {
        return null;
    }

    return {
        fullName,
        email,
        phone,
        location,
        linkedIn,
        professionalTitle,
        experience,
        industry,
        professionalSummary,
        skills,
        experienceDetails,
        education,
        certifications
    };
}

function collectJobData() {
    const jobTitle = document.getElementById('jobTitle')?.value?.trim();
    const companyType = document.getElementById('companyType')?.value;
    const jobDescription = document.getElementById('jobDescription')?.value?.trim();

    if (!jobTitle || !companyType || !jobDescription) {
        return null;
    }

    return {
        jobTitle,
        companyType,
        jobDescription
    };
}

function collectOptimizationSettings() {
    return {
        resumeFormat: document.getElementById('resumeFormat')?.value || 'professional',
        resumeLength: document.getElementById('resumeLength')?.value || '1',
        focusArea: document.getElementById('focusArea')?.value || 'ats',
        nigerianContext: document.getElementById('nigerianContext')?.value || 'formal'
    };
}

function performResumeOptimization(resumeData, jobData, settings) {
    // Extract job keywords
    const jobKeywords = extractKeywords(jobData.jobDescription);
    const resumeSkills = resumeData.skills.toLowerCase().split(/[,;]/).map(s => s.trim()).filter(s => s);

    // Match keywords
    const matchedKeywords = resumeSkills.filter(skill =>
        jobKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    );

    const missingKeywords = jobKeywords.filter(keyword =>
        !resumeSkills.some(skill => skill.toLowerCase().includes(keyword))
    );

    // Generate suggested keywords
    const suggestedKeywords = generateSuggestedKeywords(resumeData, jobData);

    // Calculate ATS scores
    const keywordScore = Math.min(100, (matchedKeywords.length / Math.max(jobKeywords.length, 1)) * 100);
    const formatScore = settings.resumeFormat === 'professional' ? 95 : 85;
    const contentScore = Math.min(100, 60 + resumeData.experienceDetails.length / 100);
    const contextScore = settings.nigerianContext === 'formal' ? 90 : 85;

    const totalScore = Math.round((keywordScore + formatScore + contentScore + contextScore) / 4);

    // Generate optimized resume content
    const optimizedContent = generateOptimizedResume(resumeData, jobData, matchedKeywords, settings);

    // Generate suggestions
    const suggestions = generateImprovementSuggestions(resumeData, jobData, missingKeywords);

    // Generate Nigerian market tips
    const nigerianTips = generateNigerianTips(resumeData, jobData, settings);

    return {
        atsScore: totalScore,
        keywordScore: Math.round(keywordScore),
        formatScore,
        contentScore: Math.round(contentScore),
        contextScore,
        matchedKeywords,
        missingKeywords,
        suggestedKeywords,
        optimizedContent,
        suggestions,
        nigerianTips
    };
}

function generateSuggestedKeywords(resumeData, jobData) {
    const industryKeywords = {
        'technology': ['JavaScript', 'Python', 'React', 'Node.js', 'Cloud Computing', 'DevOps', 'Agile', 'Scrum'],
        'finance': ['Financial Analysis', 'Excel', 'Accounting', 'Budget Management', 'Risk Assessment', 'Compliance'],
        'healthcare': ['Patient Care', 'Medical Records', 'HIPAA', 'Clinical', 'Healthcare Management'],
        'marketing': ['Digital Marketing', 'SEO', 'Content Marketing', 'Social Media', 'Analytics', 'Campaign Management'],
        'sales': ['Sales Strategy', 'Customer Relationship', 'Negotiation', 'Lead Generation', 'Revenue Growth'],
        'hr': ['Recruitment', 'Employee Relations', 'Performance Management', 'Training', 'HR Policies'],
        'engineering': ['Project Management', 'CAD', 'Quality Control', 'Technical Design', 'Problem Solving']
    };

    const nigerianKeywords = ['Local Market Knowledge', 'Stakeholder Management', 'Cross-cultural Communication', 'Regulatory Compliance'];

    const keywords = [
        ...(industryKeywords[resumeData.industry] || []),
        ...nigerianKeywords
    ];

    return keywords.slice(0, 8);
}

function generateOptimizedResume(resumeData, jobData, matchedKeywords, settings) {
    let resume = '';

    // Header
    resume += `${resumeData.fullName.toUpperCase()}\n`;
    resume += `${resumeData.phone} | ${resumeData.email} | ${resumeData.location}\n`;
    if (resumeData.linkedIn) {
        resume += `LinkedIn: ${resumeData.linkedIn}\n`;
    }
    resume += '\n';

    // Professional Summary (optimized)
    const optimizedSummary = optimizeProfessionalSummary(resumeData.professionalSummary, jobData, matchedKeywords);
    resume += `PROFESSIONAL SUMMARY\n${'='.repeat(50)}\n`;
    resume += `${optimizedSummary}\n\n`;

    // Skills Section (optimized)
    const optimizedSkills = optimizeSkills(resumeData.skills, matchedKeywords);
    resume += `KEY SKILLS\n${'='.repeat(50)}\n`;
    resume += `${optimizedSkills}\n\n`;

    // Professional Experience (optimized)
    resume += `PROFESSIONAL EXPERIENCE\n${'='.repeat(50)}\n`;
    resume += `${optimizeExperience(resumeData.experienceDetails, matchedKeywords)}\n\n`;

    // Education
    resume += `EDUCATION\n${'='.repeat(50)}\n`;
    resume += `${resumeData.education}\n\n`;

    // Certifications (if any)
    if (resumeData.certifications) {
        resume += `CERTIFICATIONS & TRAINING\n${'='.repeat(50)}\n`;
        resume += `${resumeData.certifications}\n\n`;
    }

    // Nigerian context additions
    if (settings.nigerianContext === 'formal') {
        resume += `\nREFERENCES\n${'='.repeat(50)}\n`;
        resume += 'Available upon request\n';
    }

    return resume;
}

function optimizeProfessionalSummary(summary, jobData, matchedKeywords) {
    // Add job title reference
    let optimized = summary;

    if (!optimized.toLowerCase().includes(jobData.jobTitle.toLowerCase())) {
        optimized = `Professional ${jobData.jobTitle} with ${matchedKeywords.length} relevant skills. ${optimized}`;
    }

    // Add Nigerian market context
    if (!optimized.toLowerCase().includes('nigerian')) {
        optimized += ` Experienced in Nigerian business environment and local market dynamics.`;
    }

    // Add result-oriented language
    if (!optimized.toLowerCase().includes('achiev')) {
        optimized += ` Proven track record of delivering results and driving business growth.`;
    }

    return optimized;
}

function optimizeSkills(skills, matchedKeywords) {
    const skillList = skills.split(/[,;]/).map(s => s.trim()).filter(s => s);

    // Add matched keywords if not already present
    matchedKeywords.forEach(keyword => {
        if (!skillList.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))) {
            skillList.push(keyword);
        }
    });

    // Categorize skills
    const technicalSkills = skillList.filter(skill =>
        /[A-Z][a-z]+|[A-Z]{2,}|Java|Python|JavaScript|CSS|HTML|SQL|Excel|PowerPoint|Word/i.test(skill)
    );

    const softSkills = skillList.filter(skill =>
        !technicalSkills.includes(skill) &&
        /[a-zA-Z]+(ation|tion|ship|ment|ness|ity|or|er|ist)/.test(skill)
    );

    let optimized = '';
    if (technicalSkills.length > 0) {
        optimized += `Technical Skills: ${technicalSkills.join(', ')}\n`;
    }
    if (softSkills.length > 0) {
        optimized += `Soft Skills: ${softSkills.join(', ')}`;
    }

    return optimized || skills;
}

function optimizeExperience(experience, matchedKeywords) {
    // Add action verbs and quantifiable results
    let optimized = experience;

    // Replace passive language with active
    const replacements = {
        'responsible for': 'Managed',
        'involved in': 'Contributed to',
        'worked on': 'Developed',
        'helped with': 'Assisted in',
        'participated in': 'Collaborated on'
    };

    Object.entries(replacements).forEach(([oldPhrase, newPhrase]) => {
        optimized = optimized.replace(new RegExp(oldPhrase, 'gi'), newPhrase);
    });

    // Add quantifiable metrics if missing
    if (!optimized.includes('%') && !optimized.includes('number') && !optimized.includes('N')) {
        optimized += '\n• Achieved measurable results and improved operational efficiency';
    }

    // Incorporate matched keywords naturally
    matchedKeywords.forEach(keyword => {
        if (!optimized.toLowerCase().includes(keyword.toLowerCase())) {
            optimized += `\n• Applied ${keyword} expertise to drive successful outcomes`;
        }
    });

    return optimized;
}

function generateImprovementSuggestions(resumeData, jobData, missingKeywords) {
    const suggestions = [];

    // Keywords suggestions
    if (missingKeywords.length > 0) {
        suggestions.push({
            icon: 'fa-key',
            title: 'Add Missing Keywords',
            description: `Consider adding these job-specific keywords: ${missingKeywords.slice(0, 5).join(', ')}`
        });
    }

    // Nigerian market suggestions
    if (!resumeData.professionalSummary.toLowerCase().includes('nigerian')) {
        suggestions.push({
            icon: 'fa-globe-africa',
            title: 'Highlight Local Experience',
            description: 'Emphasize your understanding of the Nigerian business environment and local market conditions'
        });
    }

    // Quantification suggestions
    if (!resumeData.experienceDetails.toLowerCase().match(/\d+%|\d+n|\d+ million|\d+ thousand/i)) {
        suggestions.push({
            icon: 'fa-chart-line',
            title: 'Add Quantifiable Achievements',
            description: 'Include specific metrics and numbers to demonstrate the impact of your work'
        });
    }

    // Contact information
    if (!resumeData.linkedIn) {
        suggestions.push({
            icon: 'fa-linkedin',
            title: 'Add LinkedIn Profile',
            description: 'Nigerian employers increasingly use LinkedIn for recruitment and background checks'
        });
    }

    // Professional summary length
    const summaryLength = resumeData.professionalSummary.length;
    if (summaryLength < 150) {
        suggestions.push({
            icon: 'fa-expand',
            title: 'Expand Professional Summary',
            description: 'Your summary is quite brief. Consider adding more details about your skills and achievements'
        });
    } else if (summaryLength > 400) {
        suggestions.push({
            icon: 'fa-compress',
            title: 'Shorten Professional Summary',
            description: 'Your summary is quite long. Consider making it more concise for better readability'
        });
    }

    return suggestions;
}

function generateNigerianTips(resumeData, jobData, settings) {
    const tips = [];

    // General Nigerian market tips
    tips.push({
        title: 'Phone Number Format',
        description: 'Use Nigerian phone format: +234 XXX XXX XXXX. Remove leading zeros from local numbers.',
        icon: 'fa-phone'
    });

    tips.push({
        title: 'Local References',
        description: 'Include professional references from Nigerian companies if possible. Local references carry more weight.',
        icon: 'fa-users'
    });

    tips.push({
        title: 'Professional Email',
        description: 'Use a professional email address. Gmail addresses are preferred by Nigerian recruiters.',
        icon: 'fa-envelope'
    });

    // Company type specific tips
    if (jobData.companyType === 'multinational') {
        tips.push({
            title: 'Multinational Companies',
            description: 'Highlight international experience and certifications. Emphasize cross-cultural communication skills.',
            icon: 'fa-globe'
        });
    } else if (jobData.companyType === 'startup') {
        tips.push({
            title: 'Startup Environment',
            description: 'Show adaptability, innovation, and willingness to wear multiple hats. Mention any entrepreneurial experience.',
            icon: 'fa-rocket'
        });
    } else if (jobData.companyType === 'government') {
        tips.push({
            title: 'Government Positions',
            description: 'Include any public sector experience. Emphasize compliance, documentation, and procedural knowledge.',
            icon: 'fa-landmark'
        });
    }

    // Industry specific tips
    if (resumeData.industry === 'technology') {
        tips.push({
            title: 'Tech Industry',
            description: 'List specific technologies and frameworks. Nigerian tech companies value practical, hands-on experience.',
            icon: 'fa-laptop-code'
        });
    } else if (resumeData.industry === 'finance') {
        tips.push({
            title: 'Financial Sector',
            description: 'Include knowledge of Nigerian financial regulations. Mention any CBN certifications if applicable.',
            icon: 'fa-naira-sign'
        });
    }

    // Location tips
    if (resumeData.location.toLowerCase().includes('lagos')) {
        tips.push({
            title: 'Lagos Job Market',
            description: 'Lagos is highly competitive. Emphasize what makes you unique. Consider highlighting traffic management skills.',
            icon: 'fa-city'
        });
    }

    return tips;
}

// Results Display
function displayResults(optimization) {
    currentOptimization = optimization;

    // Hide input, show results
    document.querySelector('.input-section').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    // Update ATS Score
    updateATSScore(optimization);

    // Display optimized resume
    displayOptimizedResume(optimization.optimizedContent);

    // Display keyword analysis
    displayKeywordAnalysis(optimization);

    // Display suggestions
    displaySuggestions(optimization.suggestions);

    // Display Nigerian tips
    displayNigerianTips(optimization.nigerianTips);

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function updateATSScore(optimization) {
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.setProperty('--score', optimization.atsScore);

    document.getElementById('atsScore').textContent = optimization.atsScore;

    // Update score label
    const scoreLabel = scoreCircle.querySelector('.score-label');
    if (optimization.atsScore >= 90) {
        scoreLabel.textContent = 'Excellent';
    } else if (optimization.atsScore >= 75) {
        scoreLabel.textContent = 'Good';
    } else if (optimization.atsScore >= 60) {
        scoreLabel.textContent = 'Fair';
    } else {
        scoreLabel.textContent = 'Needs Improvement';
    }

    // Update progress bars
    updateProgressBar('keywordsProgress', 'keywordsScore', optimization.keywordScore);
    updateProgressBar('formatProgress', 'formatScore', optimization.formatScore);
    updateProgressBar('contentProgress', 'contentScore', optimization.contentScore);
    updateProgressBar('contextProgress', 'contextScore', optimization.contextScore);
}

function updateProgressBar(progressId, scoreId, score) {
    const progressBar = document.getElementById(progressId);
    const scoreElement = document.getElementById(scoreId);

    if (progressBar) {
        progressBar.style.width = `${score}%`;
    }
    if (scoreElement) {
        scoreElement.textContent = `${score}%`;
    }
}

function displayOptimizedResume(content) {
    const resumePreview = document.getElementById('resumePreview');
    if (resumePreview) {
        resumePreview.textContent = content;
    }
}

function displayKeywordAnalysis(optimization) {
    // Update counts
    document.getElementById('matchedCount').textContent = optimization.matchedKeywords.length;
    document.getElementById('missingCount').textContent = optimization.missingKeywords.length;

    // Display matched keywords
    const matchedContainer = document.getElementById('matchedKeywords');
    if (matchedContainer) {
        matchedContainer.innerHTML = optimization.matchedKeywords.map(keyword =>
            `<span class="keyword-tag matched">${keyword}</span>`
        ).join(' ');
    }

    // Display missing keywords
    const missingContainer = document.getElementById('missingKeywords');
    if (missingContainer) {
        missingContainer.innerHTML = optimization.missingKeywords.map(keyword =>
            `<span class="keyword-tag missing">${keyword}</span>`
        ).join(' ');
    }

    // Display suggested keywords
    const suggestedContainer = document.getElementById('suggestedKeywords');
    if (suggestedContainer) {
        suggestedContainer.innerHTML = optimization.suggestedKeywords.map(keyword =>
            `<span class="keyword-tag suggested">${keyword}</span>`
        ).join(' ');
    }
}

function displaySuggestions(suggestions) {
    const suggestionsList = document.getElementById('suggestionsList');
    if (!suggestionsList) return;

    suggestionsList.innerHTML = suggestions.map((suggestion, index) => `
        <div class="suggestion-item">
            <div class="suggestion-icon">${index + 1}</div>
            <div class="suggestion-content">
                <div class="suggestion-title">${suggestion.title}</div>
                <div class="suggestion-description">${suggestion.description}</div>
            </div>
        </div>
    `).join('');
}

function displayNigerianTips(tips) {
    const tipsList = document.getElementById('nigerianTipsList');
    if (!tipsList) return;

    tipsList.innerHTML = tips.map(tip => `
        <div class="tip-item">
            <div class="tip-title">
                <i class="fas ${tip.icon}"></i>
                ${tip.title}
            </div>
            <div class="tip-description">${tip.description}</div>
        </div>
    `).join('');
}

// Utility Functions
function addSkill(skill) {
    const skillsTextarea = document.getElementById('skills');
    const currentSkills = skillsTextarea.value.trim();

    if (currentSkills) {
        if (!currentSkills.toLowerCase().includes(skill.toLowerCase())) {
            skillsTextarea.value = `${currentSkills}, ${skill}`;
        }
    } else {
        skillsTextarea.value = skill;
    }

    // Trigger input event to update form
    skillsTextarea.dispatchEvent(new Event('input'));
}

function copyResume() {
    if (!currentOptimization) return;

    navigator.clipboard.writeText(currentOptimization.optimizedContent).then(() => {
        showNotification('Resume copied to clipboard!');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = currentOptimization.optimizedContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showNotification('Resume copied to clipboard!');
    });
}

function downloadResume() {
    if (!currentOptimization) return;

    const resumeData = collectResumeData();
    const filename = `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.txt`;

    const content = `OPTIMIZED RESUME FOR NIGERIAN JOB MARKET\n${'='.repeat(50)}\n\n` +
        `ATS Score: ${currentOptimization.atsScore}%\n` +
        `Optimization Date: ${new Date().toLocaleString()}\n\n` +
        `${'='.repeat(50)}\n\n` +
        `${currentOptimization.optimizedContent}`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showNotification('Resume downloaded successfully!');
}

function downloadPDF() {
    // For PDF functionality, would typically use a library like jsPDF
    // For now, we'll show a message
    showNotification('PDF export feature coming soon! Use the download option for now.');
}

function newResume() {
    if (confirm('Create a new resume? All current data will be cleared.')) {
        // Reset form
        const form = document.querySelector('.input-section');
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.value = '';
            field.style.borderColor = '';
        });

        // Clear results
        currentOptimization = null;

        // Show input, hide results
        document.querySelector('.input-section').style.display = 'block';
        document.getElementById('resultsSection').style.display = 'none';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function changeResumeFormat(format) {
    if (!currentOptimization) return;

    // Update active button
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Re-generate resume with new format
    const resumeData = collectResumeData();
    const jobData = collectJobData();
    const settings = { ...collectOptimizationSettings(), resumeFormat: format };

    const optimizedContent = generateOptimizedResume(resumeData, jobData, currentOptimization.matchedKeywords, settings);
    document.getElementById('resumePreview').textContent = optimizedContent;
}

// Template Management
function showTemplates() {
    const modal = document.getElementById('templatesModal');
    modal.classList.add('active');
}

function useTemplate(templateName) {
    selectedTemplate = templateName;

    // Update settings to reflect template choice
    const formatSelect = document.getElementById('resumeFormat');
    if (formatSelect) {
        formatSelect.value = templateName === 'modern' ? 'modern' : 'professional';
    }

    closeModal('templatesModal');
    showNotification(`Template "${templateName.charAt(0).toUpperCase() + templateName.slice(1)}" selected!`);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// UI Utilities
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .form-group.invalid label {
        color: var(--error-color);
    }

    .notification {
        font-size: 0.875rem;
        font-weight: 500;
    }

    .keyword-tag {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        margin: 0.125rem;
        border-radius: calc(var(--radius) - 6px);
        font-size: 0.75rem;
        font-weight: 500;
    }
`;
document.head.appendChild(style);