import { ConvexHttpClient } from 'convex/browser';
import { api } from './convex/_generated/api';

const url = import.meta.env.VITE_CONVEX_URL || 'https://quixotic-dogfish-922.convex.cloud';
const client = url ? new ConvexHttpClient(url) : null;
const form = document.querySelector('#email-form');
const addressForm = document.querySelector('#address-form');
const emailInput = form.elements.email;
const token = Array.from(crypto.getRandomValues(new Uint8Array(32)),
  (byte) => byte.toString(16).padStart(2, '0')).join('');

emailInput.addEventListener('input', () => emailInput.setCustomValidity(''));

function busy(form, value) {
  form.querySelectorAll('input, textarea, button').forEach((control) => {
    control.disabled = value;
  });
  form.setAttribute('aria-busy', String(value));
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (form.getAttribute('aria-busy') === 'true') return;
  const email = emailInput.value.trim();
  emailInput.setCustomValidity(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? '' : 'Please enter a valid email address.');
  if (!form.reportValidity()) return;
  const status = document.querySelector('#email-status');
  busy(form, true);
  status.textContent = 'Saving…';
  try {
    if (!client) throw new Error('Missing configuration');
    await client.mutation(api.invitations.submit, { email, token });
    document.body.classList.add('accepted');
    document.querySelector('#message').innerHTML =
      '<span>Thank you.</span><span>I hope to see you in India.</span><span>in (hopefully) ~5 years</span>';
    form.hidden = true;
    addressForm.hidden = false;
    document.querySelector('meta[name="theme-color"]').content = '#f6dce3';
  } catch {
    status.textContent = 'Couldn’t save your email. Please try again.';
  } finally {
    busy(form, false);
  }
});

addressForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (addressForm.getAttribute('aria-busy') === 'true') return;
  const address = addressForm.elements.address.value.trim();
  const status = document.querySelector('#address-status');
  if (!address) {
    status.textContent = 'You can leave this blank, or enter your mailing address to save it.';
    return;
  }
  busy(addressForm, true);
  status.textContent = 'Saving…';
  try {
    await client.mutation(api.invitations.saveAddress, { token, address });
    status.textContent = 'Address saved. I’ll send you a physical invitation card.';
  } catch {
    status.textContent = 'Couldn’t save your address. Please try again.';
  } finally {
    busy(addressForm, false);
  }
});
