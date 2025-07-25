// Cleaning Calculator JS - Full Refactored Version

// Populate membership plan dropdown
function updateDiscounts() {
    const discountSelect = document.getElementById('discount');
    const plan = document.getElementById('plan').value;
    discountSelect.innerHTML = '';

    const prices = (plan === '49') ? [49, 44, 39] : [59, 54, 49];

    prices.forEach(price => {
        const option = document.createElement('option');
        option.value = price;
        option.textContent = `$${price.toFixed(2)} / mo`;
        discountSelect.appendChild(option);
    });
}

function calculateNegotiatedPrice() {
    const monthly = parseFloat(document.getElementById('discount').value);
    const term = parseInt(document.querySelector('input[name="term"]:checked').value);
    const total = monthly * term;
    document.getElementById('negotiationResult').textContent = `Negotiated Total: $${total.toFixed(2)}`;
}

window.addEventListener('DOMContentLoaded', () => {
    updateDiscounts();
});

function showSection(id) {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// ✅ Updated based on the Time Recommendation Table from Homeaglow
function getRecommendedHours(beds, baths) {
  beds = parseInt(beds);
  baths = parseInt(baths);

  // 6 HR if 3+ bedrooms or 3+ bathrooms
  if (beds >= 3 || baths >= 3) return 6;

  // 4 HR if 2 beds + 2 baths
  if (beds === 2 && baths === 2) return 4;

  // 4 HR if 1 bed + 2 baths, 2 beds + 1 bath, or 3 beds + 1 bath
  if (
    (beds === 1 && baths === 2) ||
    (beds === 2 && baths === 1) ||
    (beds === 3 && baths === 1)
  ) return 4;

  // 3 HR if 1 bed + 1 bath
  if (beds === 1 && baths === 1) return 3;

  // 2 HR if 0 bed + 1 bath
  if (beds === 0 && baths === 1) return 2;

  // Default fallback
  return 2;
}

function calculate() {
  const beds = document.getElementById('bedrooms').value;
  const baths = document.getElementById('bathrooms').value;
  const hours = getRecommendedHours(beds, baths);
  document.getElementById('result').textContent = `Recommended Cleaning Time: ${hours} HR`;
}


function getSelectedMembershipFee() {
    return parseInt(document.querySelector('input[name="membershipFee"]:checked').value);
}

function getVoucherDiscount(hours) {
    if (hours >= 6) return 79;
    if (hours === 4) return 39;
    if (hours === 3) return 19;
    if (hours === 2) return 9;
    return 0;
}

function showBothCalculations() {
    const beds = parseInt(document.getElementById('bedrooms').value);
    const baths = parseInt(document.getElementById('bathrooms').value);
    const custom = parseFloat(document.getElementById('customHours').value);
    const recommendedHours = getRecommendedHours(beds, baths);

    document.getElementById('recommendationResult').innerHTML = '<div class="result-title">Recommended Estimate</div>';
    document.getElementById('customResult').innerHTML = '<div class="result-title">Customer\'s Preference</div>';
    document.getElementById('spielResult').innerHTML = generateSalesSpiel(recommendedHours);

    calculateAndDisplay(recommendedHours, 'recommendationResult', false);
    if (custom && custom > 0) {
        calculateAndDisplay(custom, 'customResult', false);
    } else {
        document.getElementById('customResult').innerHTML += '<em>No preferred hours entered.</em>';
    }
}

function calculateAndDisplay(baseHours, elementId, includeExtraHour) {
    const membershipFee = getSelectedMembershipFee();
    const frequency = parseInt(document.getElementById('frequency').value) || 1;

    const rawPremium = document.getElementById('premiumAmount').value.trim();
    const premiumHours = rawPremium === '' || isNaN(rawPremium) ? 0 : parseFloat(rawPremium);

    let totalHours = baseHours + premiumHours;
    if (includeExtraHour) totalHours += 1;

    let voucherValue;
    let voucherTotal;
    let extraCharge = 0;

    if (totalHours > 6) {
        voucherValue = 79;
        extraCharge = (totalHours - 6) * 23;
        voucherTotal = voucherValue + extraCharge;
    } else {
        voucherValue = getVoucherDiscount(Math.ceil(totalHours));
        voucherTotal = voucherValue;
    }

    const regular = 53 * totalHours * frequency;
    const average = 75 * totalHours * frequency;
    const discounted = 23 * totalHours;
    const membership = (discounted * frequency) + extraCharge;
    const totalMembership = membership + membershipFee;
    const savingsVsNational = average - totalMembership;
    const savingsWithVoucher = regular - (voucherTotal + membershipFee);
    const savingsWithVoucher2 = average - (voucherTotal + membershipFee);
    const voucherTotal2 = voucherTotal + membershipFee;

    document.getElementById(elementId).innerHTML +=
        `Recommended Hours: ${totalHours} HOURS 🕰️<br>` +
        `Voucher: $${voucherValue.toFixed(2)}<br><br>` +
        `Cleaning Rate ($53/hr): $${regular.toFixed(2)}<br>` +
        `National Rate ($75/hr): $${average.toFixed(2)}<br>` +
        `FC Rate (roughly $23/hr, ${frequency}x/month): $${discounted.toFixed(2)}<br>` +
        `Membership $${membership} + Discounted $${discounted}: $${totalMembership.toFixed(2)}<br>` +
        `Voucher $${voucherValue} + Membership Fee $${membership} + Premium: $${voucherTotal2.toFixed(2)}<br><br>` +
        `<span style="color:#00ff99;">Savings vs $75/hr National:</span> $${savingsVsNational.toFixed(2)}<br>` +
        `<span style="color:#00ff99;">Savings with voucher:</span> $${savingsWithVoucher.toFixed(2)}<br>` +
        `<span style="color:#00ff99;">Initial savings vs National:</span> $${savingsWithVoucher2.toFixed(2)}<br>`;
}

function generateSalesSpiel(hours) {
    const nationalRate = 75;
    const fcRate = 23;
    const savingsPerHour = nationalRate - fcRate;
    const totalSavings = savingsPerHour * hours;

    return `
        <div class="result-title">🗣️ Sales Pitch</div>
        <p>Thank you for sharing all those with me. For a home that size, we typically recommend an initial cleaning for <strong>${hours} hour(s)</strong>.</p>
        <p>Now normally, cleaners charge around <strong>$${nationalRate}/hour</strong>, which would come out to <strong>$${nationalRate * hours}</strong>.</p>
        <p>But with your <strong>Forever Clean membership</strong>, you only pay around <strong>$${fcRate}/hour</strong> — that’s just <strong>$${fcRate * hours}</strong> total!</p>
        <p>That’s a savings of <strong>$${totalSavings}</strong> right off the bat. Sounds pretty fair, right?</p>`;
}

function toggleNotepad() {
    const notepad = document.getElementById('notepad');
    if (notepad) {
        notepad.classList.toggle('hidden');
    } else {
        console.error("Notepad element not found");
    }
}

function calculateFee() {
    const cohort = document.getElementById("cohort").value;
    const hours = parseInt(document.getElementById("hours").value);
    let fee = 0;

    if (isNaN(hours) || hours <= 0) {
        document.getElementById("result").textContent = "Please enter valid hours.";
        return;
    }

    if (cohort === "cohort1") fee = (53 * hours) - getVoucherDiscount(hours);
    else if (cohort === "cohort2") fee = 25 * hours;
    else if (cohort === "cohort3" || cohort === "cohort4") fee = 35 * hours;

    document.getElementById("result").textContent = `Result: $${fee.toFixed(2)}`;
}

document.getElementById('hoursOtc').addEventListener('input', () => {
    const hours = parseFloat(document.getElementById('hoursOtc').value);
    const results = document.getElementById('resultsOtc');
    results.innerHTML = '';

    if (!isNaN(hours) && hours > 0) {
        if (hours >= 3) {
            results.innerHTML += `<div class="result"><strong>Regular 25|25:</strong> $${(hours * 57.75).toFixed(2)}</div>`;
        }
        results.innerHTML += `<div class="result"><strong>Regular 30|30:</strong> $${(hours * 63).toFixed(2)}</div>`;
        results.innerHTML += `<div class="result"><strong>Trial Cleaning 20|20:</strong> $${(hours * 52.5).toFixed(2)}<div class="note">* Cancel within 30-day trial to avoid $99 cancellation.</div></div>`;
    } else {
        results.innerHTML = '<em style="color: orange;">Please enter valid hours.</em>';
    }
});
