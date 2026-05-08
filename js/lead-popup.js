const YENA_LEADS_KEY = 'yenaLeads';
const YENA_LEAD_CLOSED_KEY = 'yenaLeadClosed';
const YENA_COUPON = 'YENA10';
const YENA_LEAD_SOURCE = 'homepage_popup';

const SUPABASE_URL = 'https://ujnrtjocbaggivaspcgp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_M0UKn3iDg-wy3_QuAWGu_g_1Vli7oiS';

const supabaseClient = window.supabase?.createClient
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

async function saveLeadToSupabase(email) {
  if (!supabaseClient) {
    console.error('Failed to save YENA lead: Supabase client is not initialized.');
    return false;
  }

  const { error } = await supabaseClient
    .from('leads')
    .insert({
      email,
      coupon: YENA_COUPON,
      source: YENA_LEAD_SOURCE
    });

  if (error) {
    console.error('Failed to save YENA lead to Supabase:', error);
    return false;
  }

  return true;
}

function getLeads() {
  try {
    const leads = JSON.parse(localStorage.getItem(YENA_LEADS_KEY));
    return Array.isArray(leads) ? leads : [];
  } catch {
    return [];
  }
}

function downloadCSV(leads) {
  const rows = [['Email', 'Coupon', 'Created At']];
  leads.forEach((lead) => rows.push([lead.email || '', lead.coupon || '', lead.createdAt || '']));
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'yena-leads.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function initPopup() {
  const overlay = document.querySelector('.yena-lead-overlay');
  if (!overlay) return;

  const closeBtn = overlay.querySelector('.yena-lead-close');
  const form = overlay.querySelector('.yena-lead-form');
  const success = overlay.querySelector('.yena-lead-success');

  if (!localStorage.getItem(YENA_LEAD_CLOSED_KEY)) {
    setTimeout(() => overlay.classList.add('is-open'), 700);
  }

  const closePopup = () => {
    overlay.classList.remove('is-open');
    localStorage.setItem(YENA_LEAD_CLOSED_KEY, 'true');
  };

  closeBtn?.addEventListener('click', closePopup);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closePopup();
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const emailInput = form.querySelector('input[name="email"]');
    const email = emailInput?.value.trim();
    if (!email) return;

    const saved = await saveLeadToSupabase(email);
    if (!saved) return;

    form.classList.add('is-hidden');
    success?.classList.add('is-visible');
    localStorage.setItem(YENA_LEAD_CLOSED_KEY, 'true');
  });
}

function initAdminLeads() {
  const leadsBody = document.querySelector('[data-leads-body]');
  if (!leadsBody) return;

  const leads = getLeads();
  const totalEl = document.querySelector('[data-total-leads]');
  if (totalEl) totalEl.textContent = String(leads.length);

  if (!leads.length) {
    leadsBody.innerHTML = '<tr><td colspan="3">No local leads captured yet.</td></tr>';
  } else {
    leadsBody.innerHTML = leads.map((lead) => `
      <tr>
        <td>${lead.email || ''}</td>
        <td>${lead.coupon || ''}</td>
        <td>${lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ''}</td>
      </tr>
    `).join('');
  }

  document.querySelector('[data-export-leads]')?.addEventListener('click', () => downloadCSV(leads));
}

document.addEventListener('DOMContentLoaded', () => {
  initPopup();
  initAdminLeads();
});
