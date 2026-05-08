const YENA_LEAD_KEY = 'yena_leads';
const YENA_POPUP_DISMISSED = 'yena_popup_closed';
const YENA_POPUP_CAPTURED = 'yena_popup_submitted';

function getStoredLeads() {
  try {
    return JSON.parse(localStorage.getItem(YENA_LEAD_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveLead(lead) {
  const leads = getStoredLeads();
  leads.unshift(lead);
  localStorage.setItem(YENA_LEAD_KEY, JSON.stringify(leads));
}

function closePopup() {
  const overlay = document.querySelector('.yena-lead-overlay');
  if (overlay) {
    overlay.classList.remove('is-open');
  }
}

function openPopup() {
  const overlay = document.querySelector('.yena-lead-overlay');
  if (overlay) {
    overlay.classList.add('is-open');
  }
}

function exportLeadsCSV() {
  const leads = getStoredLeads();

  if (!leads.length) {
    alert('No leads found.');
    return;
  }

  const rows = [
    ['Name', 'Email', 'Phone', 'Coupon', 'Date']
  ];

  leads.forEach((lead) => {
    rows.push([
      lead.name || '',
      lead.email || '',
      lead.phone || '',
      lead.coupon || '',
      lead.date || ''
    ]);
  });

  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'yena-leads.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function renderLeadTable() {
  const tableBody = document.querySelector('[data-leads-body]');

  if (!tableBody) return;

  const leads = getStoredLeads();

  if (!leads.length) {
    tableBody.innerHTML = '<tr><td colspan="5">No leads captured yet.</td></tr>';
    return;
  }

  tableBody.innerHTML = leads.map((lead) => `
    <tr>
      <td>${lead.name || ''}</td>
      <td>${lead.email || ''}</td>
      <td>${lead.phone || ''}</td>
      <td>${lead.coupon || ''}</td>
      <td>${lead.date || ''}</td>
    </tr>
  `).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.querySelector('.yena-lead-overlay');
  const form = document.querySelector('.yena-lead-form');
  const success = document.querySelector('.yena-lead-success');
  const closeBtn = document.querySelector('.yena-lead-close');
  const exportBtn = document.querySelector('[data-export-leads]');

  if (
    overlay &&
    !localStorage.getItem(YENA_POPUP_CAPTURED) &&
    !localStorage.getItem(YENA_POPUP_DISMISSED)
  ) {
    setTimeout(openPopup, 1600);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      localStorage.setItem(YENA_POPUP_DISMISSED', 'true');
      closePopup();
    });
  }

  if (overlay) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closePopup();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const name = form.querySelector('[name="name"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const phone = form.querySelector('[name="phone"]').value.trim();

      const coupon = 'YENA25';

      saveLead({
        name,
        email,
        phone,
        coupon,
        date: new Date().toLocaleString()
      });

      localStorage.setItem(YENA_POPUP_CAPTURED, 'true');

      if (success) {
        success.classList.add('is-visible');
      }

      form.reset();

      renderLeadTable();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', exportLeadsCSV);
  }

  renderLeadTable();
});
