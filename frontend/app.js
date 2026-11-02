document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL STATE ---
    let currentAudio = null;
    const playIcon = document.getElementById('playIcon');
    const playLabel = document.getElementById('playLabel');
    const audioProgress = document.getElementById('audioProgress');
    
    // Helper function to grab the selected language globally
    const getTargetLanguage = () => {
        const langDropdown = document.getElementById('targetLangSelect');
        return langDropdown ? langDropdown.value : "English";
    };
  
    // 1. AI Simplifier
    const simplifyBtn = document.getElementById('simplifyBtn');
    const rawPolicyInput = document.getElementById('rawPolicyInput'); 
    const simplifiedOutput = document.getElementById('simplifiedOutput');
  
    if (simplifyBtn) {
      simplifyBtn.addEventListener('click', async () => {
        if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) {
            alert("Please select a PDF file first.");
            return;
        }
  
        const originalText = simplifyBtn.innerHTML;
        simplifyBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing & Generating Audio...';
        simplifyBtn.disabled = true;
        simplifiedOutput.innerHTML = `<p style="color: #4f46e5; font-weight: 600;">Processing PDF in local Omni-Engine...</p>`;
  
        const formData = new FormData();
        formData.append("file", rawPolicyInput.files[0]);
        formData.append("target_language", getTargetLanguage());
  
        try {
            const response = await fetch("http://localhost:8000/api/analyze-policy", { method: "POST", body: formData });
            if (!response.ok) throw new Error("Backend connection failed.");
            const result = await response.json();
  
            if (result.status === "success") {
                const data = result.data;
                simplifiedOutput.innerHTML = `
                    <div style="color: #10b981; font-weight: bold; margin-bottom: 10px;">Analysis Complete</div>
                    <p><strong>Document Type:</strong> ${data.document_type}</p>
                    <p><strong>Target Audience:</strong> ${data.target_audience}</p><br>
                    <p><strong>Core Requirements:</strong></p>
                    <ul style="margin-left: 20px; list-style-type: disc;">
                        ${data.core_requirements_or_eligibility.map(req => `<li>${req}</li>`).join('')}
                    </ul><br>
                    <p><strong>Actionable Steps:</strong></p>
                    <ul style="margin-left: 20px; list-style-type: disc; color: #2563eb;">
                        ${data.actionable_steps.map(step => `<li>${step}</li>`).join('')}
                    </ul>
                `;
  
                if (result.audio_url) {
                    if (currentAudio) currentAudio.pause();
                    currentAudio = new Audio(result.audio_url);
                    if (playIcon) playIcon.className = 'fa-solid fa-play';
                    if (playLabel) playLabel.textContent = `Play Audio (${result.language})`;
                    if (audioProgress) audioProgress.style.width = '0%';
  
                    currentAudio.addEventListener('timeupdate', () => {
                        if (audioProgress && currentAudio.duration) {
                            const percentage = (currentAudio.currentTime / currentAudio.duration) * 100;
                            audioProgress.style.width = percentage + '%';
                        }
                    });
                    currentAudio.addEventListener('ended', () => {
                        if (playIcon) playIcon.className = 'fa-solid fa-play';
                        if (playLabel) playLabel.textContent = `Play Audio (${result.language})`;
                        if (audioProgress) audioProgress.style.width = '0%';
                    });
                }
            }
        } catch (error) {
            console.error(error);
            simplifiedOutput.innerHTML = `<p style="color: red; font-weight: bold;">Error connecting to backend.</p>`;
        } finally {
            simplifyBtn.innerHTML = originalText;
            simplifyBtn.disabled = false;
        }
      });
    }
  
    // 2. Multilingual Translation
    const translateBtn = document.getElementById('translateBtn');
    const translationOutput = document.getElementById('translationOutput');
  
    if (translateBtn) {
      translateBtn.addEventListener('click', async () => {
        if (!rawPolicyInput || !rawPolicyInput.files || rawPolicyInput.files.length === 0) {
            alert("Please upload a Policy PDF in the first tab to translate it."); return;
        }
        const langText = getTargetLanguage();
        const originalText = translateBtn.innerHTML;
        translateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Translating...';
        translateBtn.disabled = true;
        translationOutput.innerHTML = `<p style="color: #4f46e5; font-weight: 600;">Generating ${langText} translation...</p>`;
  
        const formData = new FormData();
        formData.append("file", rawPolicyInput.files[0]);
        formData.append("target_language", langText);
  
        try {
            const response = await fetch("http://localhost:8000/api/translate-policy", { method: "POST", body: formData });
            const result = await response.json();
            if (result.status === "success") {
                translationOutput.innerHTML = `
                    <div style="color: #4f46e5; font-weight: bold; margin-bottom: 12px; font-size: 1.1rem;">
                        <i class="fa-solid fa-language"></i> [${langText}]
                    </div>
                    <p style="font-size: 1.05rem; line-height: 1.6;">${result.data.translated_text}</p>
                `;
            } else throw new Error(result.message);
        } catch (error) {
            translationOutput.innerHTML = `<p style="color: red;">Engine failed to translate.</p>`;
        } finally {
            translateBtn.innerHTML = originalText;
            translateBtn.disabled = false;
        }
      });
    }
  
    // 3. Scheme Discovery
    const schemesContainer = document.getElementById('schemesContainer');
    if (schemesContainer) {
      schemesContainer.innerHTML = `
          <button id="findSchemesBtn" class="btn-primary" style="background: #f59e0b; margin-bottom: 20px;">
              <i class="fa-solid fa-magnifying-glass"></i> Scan PDF for Grants & Schemes
          </button>
          <div id="dynamicSchemesList"><p class="placeholder-text">Click scan to discover schemes in your regional language.</p></div>
      `;
      document.getElementById('findSchemesBtn').addEventListener('click', async (e) => {
          if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) { alert("Upload PDF first."); return; }
          const btn = e.currentTarget;
          const list = document.getElementById('dynamicSchemesList');
          const originalText = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reading policy...';
          btn.disabled = true;
          
          const formData = new FormData();
          formData.append("file", rawPolicyInput.files[0]);
          formData.append("target_language", getTargetLanguage()); // SENDING LANGUAGE!
  
          try {
              const response = await fetch("http://localhost:8000/api/extract-schemes", { method: "POST", body: formData });
              const result = await response.json();
              if (result.status === "success") {
                  if (!result.data.schemes || result.data.schemes.length === 0) {
                      list.innerHTML = `<p style="color: #ea580c; font-weight: bold;">No specific schemes found.</p>`; return;
                  }
                  list.innerHTML = result.data.schemes.map(s => `
                      <div class="card" style="margin-bottom: 15px; padding: 20px;">
                          <h4 style="margin: 0 0 8px 0; font-size: 1.1rem;">${s.title}</h4>
                          <span style="background: #e0e7ff; color: #3730a3; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: bold; margin-bottom: 10px; display: inline-block;">${s.sector}</span>
                          <p style="margin: 0; color: #4b5563;">${s.desc}</p>
                      </div>
                  `).join('');
              }
          } catch (error) { list.innerHTML = `<p style="color: red;">Failed to extract schemes.</p>`; } 
          finally { btn.innerHTML = originalText; btn.disabled = false; }
      });
    }
  
    // 4. Eligibility
    const checkEligibilityBtn = document.getElementById('checkEligibilityBtn');
    const applicantIncome = document.getElementById('applicantIncome');
    const eligibilityResultBox = document.getElementById('eligibilityResultBox');
    if (checkEligibilityBtn) {
      checkEligibilityBtn.addEventListener('click', async () => {
        const income = applicantIncome.value;
        if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) { alert("Upload PDF first."); return; }
        if (!income) { alert("Enter income amount."); return; }
  
        const originalText = checkEligibilityBtn.innerHTML;
        checkEligibilityBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking Rules...';
        checkEligibilityBtn.disabled = true;
        
        const formData = new FormData();
        formData.append("file", rawPolicyInput.files[0]);
        formData.append("income", income);
        formData.append("target_language", getTargetLanguage());
  
        try {
            const response = await fetch("http://localhost:8000/api/check-eligibility", { method: "POST", body: formData });
            const result = await response.json();
            if (result.status === "success") {
                if (result.data.is_eligible) {
                    eligibilityResultBox.innerHTML = `<div style="color: #10b981; font-weight: bold; margin-bottom: 8px;">Eligible for Scheme</div><p>${result.data.reasoning}</p>`;
                } else {
                    eligibilityResultBox.innerHTML = `<div style="color: #ef4444; font-weight: bold; margin-bottom: 8px;">Not Eligible</div><p>${result.data.reasoning}</p>`;
                }
            }
        } catch (error) { eligibilityResultBox.innerHTML = `<p style="color: red;">Failed to process.</p>`; } 
        finally { checkEligibilityBtn.innerHTML = originalText; checkEligibilityBtn.disabled = false; }
      });
    }
  
    // 5. Rights & Duties
    const rightsContainer = document.getElementById('rightsContainer');
    if (rightsContainer) {
      rightsContainer.innerHTML = `
          <button id="extractRightsBtn" class="btn-primary" style="background: #10b981; margin-bottom: 20px;">
              <i class="fa-solid fa-scale-balanced"></i> Scan PDF for Rights & Duties
          </button>
          <div id="dynamicRightsList"><p class="placeholder-text">Click scan to extract legal rights.</p></div>
      `;
      document.getElementById('extractRightsBtn').addEventListener('click', async (e) => {
          if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) { alert("Upload PDF first."); return; }
          const btn = e.currentTarget;
          const list = document.getElementById('dynamicRightsList');
          const originalText = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
          btn.disabled = true;
  
          const formData = new FormData();
          formData.append("file", rawPolicyInput.files[0]);
          formData.append("target_language", getTargetLanguage());
  
          try {
              const response = await fetch("http://localhost:8000/api/extract-rights", { method: "POST", body: formData });
              const result = await response.json();
              if (result.status === "success") {
                  const rights = result.data.rights || [];
                  const duties = result.data.duties || [];
                  
                  let rightsHtml = rights.length > 0 ? rights.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('') : '<li>No explicit rights found.</li>';
                  let dutiesHtml = duties.length > 0 ? duties.map(d => `<li style="margin-bottom: 8px;">${d}</li>`).join('') : '<li>No explicit duties found.</li>';
  
                  list.innerHTML = `
                      <div class="card-grid">
                          <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
                              <h3 style="color: #16a34a;"><i class="fa-solid fa-shield-halved"></i> Your Legal Rights</h3>
                              <ul style="padding-left: 20px;">${rightsHtml}</ul>
                          </div>
                          <div class="card" style="background: #eff6ff; border-color: #bfdbfe;">
                              <h3 style="color: #2563eb;"><i class="fa-solid fa-clipboard-list"></i> Civic Duties</h3>
                              <ul style="padding-left: 20px;">${dutiesHtml}</ul>
                          </div>
                      </div>`;
              }
          } catch (error) { list.innerHTML = `<p style="color: red;">Failed to extract.</p>`; } 
          finally { btn.innerHTML = originalText; btn.disabled = false; }
      });
    }
  
    // 6. Ask AI
    const sendChatBtn = document.getElementById('sendChatBtn');
    const chatInput = document.getElementById('chatInput');
    const chatHistory = document.getElementById('chatHistory');
    if (sendChatBtn) {
      sendChatBtn.addEventListener('click', async () => {
          const question = chatInput.value.trim();
          if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) { alert("Upload PDF first."); return; }
          if (!question) return;
  
          chatHistory.innerHTML += `<div style="margin-bottom: 15px; text-align: right;"><span style="background: var(--primary); color: white; padding: 10px 15px; border-radius: 15px; display: inline-block;">${question}</span></div>`;
          chatInput.value = '';
          const loadingId = 'loading-' + Date.now();
          chatHistory.innerHTML += `<div id="${loadingId}" style="margin-bottom: 15px; text-align: left;"><span style="background: #e5e7eb; padding: 10px 15px; border-radius: 15px; display: inline-block;"><i class="fa-solid fa-spinner fa-spin"></i> AI is thinking...</span></div>`;
          chatHistory.scrollTop = chatHistory.scrollHeight;
  
          const formData = new FormData();
          formData.append("file", rawPolicyInput.files[0]);
          formData.append("question", question);
          formData.append("target_language", getTargetLanguage());
  
          try {
              const response = await fetch("http://localhost:8000/api/ask-policy", { method: "POST", body: formData });
              const result = await response.json();
              document.getElementById(loadingId).remove();
              if (result.status === "success") {
                  chatHistory.innerHTML += `<div style="margin-bottom: 15px; text-align: left;"><span style="background: #f3f4f6; border: 1px solid #e5e7eb; padding: 10px 15px; border-radius: 15px; display: inline-block;">${result.data.answer}</span></div>`;
              }
          } catch (error) { document.getElementById(loadingId).remove(); }
          chatHistory.scrollTop = chatHistory.scrollHeight;
      });
    }
  
    // 7. Auto Drafter
    const generateDraftBtn = document.getElementById('generateDraftBtn');
    const draftOutput = document.getElementById('draftOutput');
    if (generateDraftBtn) {
      generateDraftBtn.addEventListener('click', async () => {
          if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) { alert("Upload PDF first."); return; }
          const originalText = generateDraftBtn.innerHTML;
          generateDraftBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Drafting Letter...';
          generateDraftBtn.disabled = true;
          
          const formData = new FormData();
          formData.append("file", rawPolicyInput.files[0]);
          formData.append("target_language", getTargetLanguage());
  
          try {
              const response = await fetch("http://localhost:8000/api/generate-draft", { method: "POST", body: formData });
              const result = await response.json();
              if (result.status === "success") { draftOutput.innerHTML = result.data.draft; }
          } catch (error) { draftOutput.innerHTML = `<p style="color: red;">Failed to generate draft.</p>`; } 
          finally { generateDraftBtn.innerHTML = originalText; generateDraftBtn.disabled = false; }
      });
    }
  
    // 8. Deadlines
    const scanDeadlinesBtn = document.getElementById('scanDeadlinesBtn');
    const deadlinesList = document.getElementById('deadlinesList');
    if (scanDeadlinesBtn) {
      scanDeadlinesBtn.addEventListener('click', async () => {
          if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) { alert("Upload PDF first."); return; }
          const originalText = scanDeadlinesBtn.innerHTML;
          scanDeadlinesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Scanning...';
          scanDeadlinesBtn.disabled = true;
  
          const formData = new FormData();
          formData.append("file", rawPolicyInput.files[0]);
          formData.append("target_language", getTargetLanguage());
  
          try {
              const response = await fetch("http://localhost:8000/api/extract-deadlines", { method: "POST", body: formData });
              const result = await response.json();
              if (result.status === "success") {
                  const deadlines = result.data.deadlines || [];
                  if (deadlines.length === 0) { deadlinesList.innerHTML = `<p style="color: #10b981;">No deadlines found.</p>`; return; }
                  deadlinesList.innerHTML = deadlines.map(d => {
                      let badgeColor = "#3b82f6"; 
                      if (d.severity.toLowerCase() === "high") badgeColor = "#ef4444";
                      if (d.severity.toLowerCase() === "medium") badgeColor = "#f59e0b";
                      return `
                      <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px;">
                          <div>
                              <h4 style="margin: 0 0 5px 0;">${d.task}</h4>
                              <p style="margin: 0; color: #4b5563; font-weight: bold;"><i class="fa-regular fa-calendar"></i> ${d.date}</p>
                          </div>
                          <span style="background-color: ${badgeColor}; color: white; padding: 4px 12px; border-radius: 15px; font-size: 0.8rem; font-weight: bold;">${d.severity.toUpperCase()}</span>
                      </div>`;
                  }).join('');
              }
          } catch (error) { deadlinesList.innerHTML = `<p style="color: red;">Failed to scan.</p>`; } 
          finally { scanDeadlinesBtn.innerHTML = originalText; scanDeadlinesBtn.disabled = false; }
      });
    }
  
    // 9. Export Report
    const exportReportBtn = document.getElementById('exportReportBtn');
    const exportStatus = document.getElementById('exportStatus');
    if (exportReportBtn) {
      exportReportBtn.addEventListener('click', async () => {
          if (!rawPolicyInput.files || rawPolicyInput.files.length === 0) { alert("Upload PDF first."); return; }
          const langText = getTargetLanguage();
          const originalText = exportReportBtn.innerHTML;
          exportReportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Compiling...';
          exportReportBtn.disabled = true;
          exportStatus.innerHTML = `<span style="color: #0ea5e9;">Generating ${langText} document...</span>`;
  
          const formData = new FormData();
          formData.append("file", rawPolicyInput.files[0]);
          formData.append("target_language", langText);
  
          try {
              const response = await fetch("http://localhost:8000/api/generate-report", { method: "POST", body: formData });
              const result = await response.json();
              if (result.status === "success") {
                  const blob = new Blob([result.data.report_text], { type: "text/plain;charset=utf-8" });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `NitiVani_Report_${langText}.txt`;
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  exportStatus.innerHTML = `<span style="color: #10b981; font-weight: bold;"><i class="fa-solid fa-check"></i> ${langText} Report downloaded!</span>`;
              }
          } catch (error) { exportStatus.innerHTML = `<span style="color: red;">Failed to compile.</span>`; } 
          finally { exportReportBtn.innerHTML = originalText; exportReportBtn.disabled = false; }
      });
    }
  
    // Audio Player Toggle
    const playAudioBtn = document.getElementById('playAudioBtn');
    if (playAudioBtn) {
      playAudioBtn.addEventListener('click', () => {
        if (!currentAudio) { alert("Analyze a PDF first to generate audio."); return; }
        if (currentAudio.paused) {
          currentAudio.play();
          if (playIcon) playIcon.className = 'fa-solid fa-pause';
        } else {
          currentAudio.pause();
          if (playIcon) playIcon.className = 'fa-solid fa-play';
        }
      });
    }
});