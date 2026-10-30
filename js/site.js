(function () {
  // ---- navigation: mobile menu and dropdowns
  var burger = document.querySelector('[data-burger]');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  var drops = Array.prototype.slice.call(document.querySelectorAll('[data-drop]'));
  function closeAll(except) {
    drops.forEach(function (b) {
      if (b === except) return;
      b.setAttribute('aria-expanded', 'false');
      b.parentNode.classList.remove('open');
    });
  }
  drops.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') === 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      b.parentNode.classList.toggle('open', !open);
    });
  });
  document.addEventListener('click', function () { closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  // ---- contact form. If a FORM_ENDPOINT was baked in at build time the form
  // posts there; otherwise it confirms locally.
  document.querySelectorAll('form[data-form="contact"]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var endpoint = f.getAttribute('data-endpoint');
      var done = function () {
        f.querySelector('.notice').hidden = false;
        f.querySelector('button').disabled = true;
      };
      if (endpoint) {
        fetch(endpoint, { method: 'POST', body: new FormData(f), headers: { 'Accept': 'application/json' } }).then(done, done);
      } else {
        done();
      }
    });
  });

  // ---- client workspace: a real form that rejects unknown accounts. Accounts
  // are created during onboarding; the site never creates one.
  document.querySelectorAll('form[data-form="login"]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = f.querySelector('.error');
      err.hidden = false;
      f.querySelector('input[name="password"]').value = '';
      var otp = f.querySelector('input[name="otp"]');
      if (otp) otp.value = '';
    });
    var forgot = f.querySelector('[data-forgot]');
    if (forgot) forgot.addEventListener('click', function (e) {
      e.preventDefault();
      var err = f.querySelector('.error');
      err.textContent = 'If that address has an account, a reset link is on its way. Resets are also confirmed with your analyst by phone.';
      err.hidden = false;
    });
  });

  // ---- plan estimator: plan fee, extra entities, extra feeds, chase list, annual discount
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var calc = document.querySelector('[data-calc]');
  if (calc) {
    var plan = calc.querySelector('[data-plan]');
    var entitiesEl = calc.querySelector('[data-entities]');
    var billing = calc.querySelector('[data-billing]');
    var feedsChk = calc.querySelector('[data-extra-feeds]');
    var feedCount = calc.querySelector('[data-feed-count]');
    var chase = calc.querySelector('[data-chase]');
    var nameEl = calc.querySelector('[data-plan-name]');
    var priceEl = calc.querySelector('[data-price]');
    var noteEl = calc.querySelector('[data-note]');
    var update = function () {
      var p = plan.value.split('|');
      var fee = +p[0];
      var feeds = p[1];
      var name = plan.options[plan.selectedIndex].text.split(' · ')[0];
      var entities = Math.min(10, Math.max(0, parseInt(entitiesEl.value, 10) || 0));
      var extras = 0, parts = [];
      if (entities) { extras += entities * 195; parts.push(entities + ' extra entit' + (entities === 1 ? 'y' : 'ies') + ' ' + money(entities * 195)); }
      if (feedsChk.checked) {
        var fc = Math.min(10, Math.max(0, parseInt(feedCount.value, 10) || 0));
        if (fc) { extras += fc * 75; parts.push(fc + ' extra feed' + (fc === 1 ? '' : 's') + ' ' + money(fc * 75)); }
      }
      if (chase.checked) { extras += 150; parts.push('chase list $150'); }
      var discount = parseFloat(billing.value || '0');
      var monthly = (fee + extras) * (1 - discount);
      nameEl.textContent = name + ' plan · ' + feeds + (entities ? ' · ' + (entities + 1) + ' entities' : '');
      priceEl.textContent = money(monthly);
      var note = name + ' plan ' + money(fee);
      if (parts.length) note += ' + ' + parts.join(' + ');
      if (discount) note += ', less 8% for annual prepayment (' + money(monthly * 12) + ' a year)';
      else note += '. Billed monthly in advance; the one-time setup is $750.';
      noteEl.textContent = note;
    };
    [plan, entitiesEl, billing, feedsChk, feedCount, chase].forEach(function (el) { el.addEventListener('input', update); el.addEventListener('change', update); });
    update();
  }
})();
