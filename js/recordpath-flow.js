(function () {
  const eligibilityForm = document.getElementById('eligibilityForm');
  if (eligibilityForm) {
    eligibilityForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const state = document.getElementById('state').value.trim();
      const court = document.getElementById('court').value.trim();
      localStorage.setItem('rpEligibility', JSON.stringify({ state, court, checkedAt: new Date().toISOString() }));
      document.getElementById('eligibilityResult').innerHTML = '<p><strong>Eligibility preview ready.</strong> This result is informational and not legal advice.</p><a class="btn" href="record-details.html">Continue to Record Details</a>';
    });
  }

  const detailsForm = document.getElementById('recordDetailsForm');
  if (detailsForm) {
    detailsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const caseNumber = document.getElementById('caseNumber').value.trim();
      const petitionerName = document.getElementById('petitionerName').value.trim();
      const courtKey = document.getElementById('courtKey').value;
      localStorage.setItem('rpRecordDetails', JSON.stringify({ caseNumber, petitionerName, courtKey }));
      window.location.href = 'packet.html';
    });
  }

  const filingOptions = document.getElementById('filingOptions');
  if (filingOptions) {
    const details = JSON.parse(localStorage.getItem('rpRecordDetails') || '{}');
    const method = courtFilingMethods[details.courtKey || 'ohio-wood-municipal'];
    const options = ['Download Packet', 'Print Packet'];

    if (method.acceptsOnline && method.portalUrl) options.push(`Open Court Filing Portal: ${method.portalUrl}`);
    if (method.acceptsEmail && method.clerkEmail) options.push(`Email Clerk: ${method.clerkEmail}`);

    options.push('Mail/In-Person Filing Instructions');
    if (method.requiresNotary) options.push('Notary Requirements');
    if (method.requiresFingerprint) options.push('Fingerprint Requirements');
    if (method.filingFeeRequired) options.push('Filing Fee Requirements');
    if (method.courtAddress) options.push(`Court Address: ${method.courtAddress}`);
    if (method.notes) options.push(method.notes);

    filingOptions.innerHTML = options.map((item) => `<li>${item}</li>`).join('');

    const downloadButton = document.getElementById('downloadPacket');
    if (downloadButton) downloadButton.addEventListener('click', () => alert('Packet download is prepared in this demo flow.'));
    const printButton = document.getElementById('printPacket');
    if (printButton) printButton.addEventListener('click', () => window.print());
  }
})();
