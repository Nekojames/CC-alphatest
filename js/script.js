// Updated Cleaning Calculator JS (Premium Removed)

function updateDiscounts() {
    const discountSelect = document.getElementById('discount');
    const plan = document.getElementById('plan').value;
    discountSelect.innerHTML = '';

    let prices = [];
    if (plan === '49') {
        prices = [49, 44, 39];
    } else {
        prices = [59, 54, 49];
    }

    prices.forEach(price => {
        const option = document.createElement('option');
        option.value = price;
        option.textContent = `$${price.toFixed(2)} / mo`;
        discountSelect.appendChild(option);
    });
}

function calculateNegotiatedPrice() {
    const discountSelect = document.getElementById('discount');
    const monthly = parseFloat(discountSelect.value);
    const term = parseInt(document.querySelector('input[name="term"]:checked').value);
    const total = monthly * term;

    document.getElementById('negotiationResult').textContent = `Negotiated Total: $${total.toFixed(2)}`;
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    updateDiscounts();
});

function showSection(id) {
    document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function getRecommendedHours(beds, baths) {
    // 2 HR: 1 bath, 0 bed
    if (baths === 1 && beds === 0) return 2;

    // ✅ 3 HR: 1 bath, 1 bed
    if (baths === 1 && beds === 1) return 3;

    // 4 HR: 1 bath & 2 beds OR 2 baths & (1–2 beds)
    if ((baths === 1 && beds === 2) ||
        (baths === 2 && (beds === 1 || beds === 2))) {
        return 4;
    }

    // 6 HR:
    // - 2 baths & 3 beds
    // - 3 baths & 2–3 beds
    // - 3+ baths & 4+ beds
    if (
        (baths === 2 && beds === 3) ||
        (baths === 3 && (beds === 2 || beds === 3)) ||
        (baths >= 3 && beds >= 4)
    ) {
        return 6;
    }

    return 2; // fallback
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

function getVoucherPrice(hours) {
    return "$" + getVoucherDiscount(hours);
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
    if (custom && custom > 0) calculateAndDisplay(custom, 'customResult', false);
    else document.getElementById('customResult').innerHTML += '<em>No preferred hours entered.</em>';
}
/*
function calculateAndDisplay(hours, elementId, includeExtraHour) {
    const membershipFee = getSelectedMembershipFee();
    const frequency = parseInt(document.getElementById('frequency').value) || 1;

    let totalHours = hours;
    let premiumExtra = 0;

    // Add 1 extra hour for recommended calculation
    if (includeExtraHour) totalHours += 1;

    // Add $23/hr if total hours exceed 6
    if (totalHours > 6) {
        premiumExtra += (totalHours - 6) * 23;
    }

    // Voucher calculation
    let voucherValue;
    let voucherTotal;
    if (totalHours > 6) {
        voucherValue = 79;
        voucherTotal = 79 + ((totalHours - 6) * 23);
    } else {
        voucherValue = getVoucherDiscount(totalHours);
        voucherTotal = voucherValue;
    }

    // Cost calculations
    const regular = 53 * totalHours * frequency;
    const average = 75 * totalHours * frequency;
    const discounted = 23 * totalHours;
    const membership = (discounted * frequency) + premiumExtra;
    const totalMembership = membership + membershipFee;
    const totalDiscountedPerMonth = discounted * frequency;
    const savingsVsNational = average - totalMembership;
    const savingsWithVoucher = regular - (voucherTotal + membershipFee);
    const savingsWithVoucher2 = average - (voucherTotal + membershipFee);
    const voucherTotal2 = voucherTotal + membershipFee;

    document.getElementById(elementId).innerHTML +=
        `Recommended Hours: ${totalHours} HOURS 🕰️<br>` +
        `Voucher: $${voucherValue.toFixed(2)}<br><br>` +
        `Cleaning Rate ($53/hr): $${regular.toFixed(2)}<br>` +
        `National Rate ($75/hr): $${average.toFixed(2)}<br>` +
        `FC Rate (~$23/hr, ${frequency}x/month): $${totalDiscountedPerMonth.toFixed(2)}<br>` +
        `Membership + Discounted: $${totalMembership.toFixed(2)}<br>` +
        `Voucher + Membership Fee: $${voucherTotal2.toFixed(2)}<br><br>` +
        `<span style="color:#00ff99;">Savings vs $75/hr National:</span> $${savingsVsNational.toFixed(2)}<br>` +
        `<span style="color:#00ff99;">Savings with voucher:</span> $${savingsWithVoucher.toFixed(2)}<br>` +
        `<span style="color:#00ff99;">Initial savings vs National:</span> $${savingsWithVoucher2.toFixed(2)}<br>`;
}
*/
function calculateAndDisplay(baseHours, elementId, includeExtraHour) {
    const membershipFee = getSelectedMembershipFee();
    const frequency = parseInt(document.getElementById('frequency').value) || 1;

    // 🔹 Get premium input
    const rawPremium = document.getElementById('premiumAmount').value.trim();
    const premiumHours = rawPremium === '' || isNaN(rawPremium) ? 0 : parseFloat(rawPremium);

    // 🔹 Step 1: Add premium to base
    let totalHours = baseHours + premiumHours;

    // 🔹 Step 2: Add 1 extra hour if includeExtraHour (like for recommendation)
    if (includeExtraHour) totalHours += 1;

    // 🔹 Step 3: Calculate voucher logic
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

    // 💰 Price breakdowns
    const regular = 53 * totalHours * frequency;
    const average = 75 * totalHours * frequency;
    const discounted = 23 * totalHours;
    const membership = (discounted * frequency) + extraCharge;
    const totalMembership = membership + membershipFee;
    const savingsVsNational = average - totalMembership;
    const savingsWithVoucher = regular - (voucherTotal + membershipFee);
    const savingsWithVoucher2 = average - (voucherTotal + membershipFee);
    const voucherTotal2 = voucherTotal + membershipFee;

    // 🧾 Display result
    document.getElementById(elementId).innerHTML +=
        `Recommended Hours: ${totalHours} HOURS 🕰️<br>` +
        `Voucher: $${voucherValue.toFixed(2)}<br><br>` +
        `Cleaning Rate ($53/hr): $${regular.toFixed(2)}<br>` +
        `National Rate ($75/hr): $${average.toFixed(2)}<br>` +
        `FC Rate ( roughly $23/hr, ${frequency}x/month): $${discounted.toFixed(2)}<br>` +
        `Membership $${membership} plus Discounted $${discounted}: $${totalMembership.toFixed(2)}<br>` +
        `Voucher  $${voucherValue} plus Membership Fee $${membership} and premium: $${voucherTotal2.toFixed(2)}<br><br>` +
        `<span style="color:#00ff99;">Savings vs $75/hr National:</span> $${savingsVsNational.toFixed(2)}<br>` +
        `<span style="color:#00ff99;">Savings with voucher:</span> $${savingsWithVoucher.toFixed(2)}<br>` +
        `<span style="color:#00ff99;">Initial savings vs National:</span> $${savingsWithVoucher2.toFixed(2)}<br>`

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

}
);
