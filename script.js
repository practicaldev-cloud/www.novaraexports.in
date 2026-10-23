(function(){
  var TEAM_EMAIL = 'info@novaraexports.in';
  // Set this to a form-handling URL (Formspree, Google Apps Script, your own API) once hosted.
  // When empty, the page prepares an email draft to the team instead.
  var ENDPOINT = 'https://script.google.com/macros/s/AKfycbxzSKr7yHdG03FLpNJnAFlK8S8zHYt647XKNjZ8fu94BTOsT_6IpyaoLLpZxqD-SrD4sQ/exec';

  var yr = document.getElementById('yr');
  if(yr) yr.textContent = new Date().getFullYear();

  /* Mobile menu */
  var menuBtn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  if(menuBtn && nav){
    menuBtn.addEventListener('click', function(){
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  /* Back to top button */
  var toTop = document.getElementById('toTop');
  if(toTop){
    var onScroll = function(){ toTop.classList.toggle('show', window.scrollY > 500); };
    window.addEventListener('scroll', onScroll, {passive:true});
    onScroll();
  }

  /* Scroll reveal: rises up as it enters the screen */
  var rvEls = document.querySelectorAll('.section-head, .about > *, .product, .pcard, .cta-band, .cat, .note, .why-list li, .why-grid > div:first-child, .market, .contact-grid > *, .enq-head, .pillar, .fcta');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if('IntersectionObserver' in window && !reduce){
    document.documentElement.classList.add('js');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          var t = en.target;
          t.classList.add('in'); io.unobserve(t);
          setTimeout(function(){ t.classList.remove('rv','in'); t.style.removeProperty('--d'); }, 1600);
        }
      });
    }, {threshold:0.12, rootMargin:'0px 0px -40px 0px'});
    rvEls.forEach(function(el){
      el.classList.add('rv');
      var sib = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--d', Math.min(sib, 5) * 0.09 + 's');
      io.observe(el);
    });
  }

  /* Hero strip (home page) */
  var panels = Array.prototype.slice.call(document.querySelectorAll('#strip .panel'));
  function setOn(p){ panels.forEach(function(x){ x.classList.toggle('on', x === p); }); }
  panels.forEach(function(p){
    p.addEventListener('mouseenter', function(){ setOn(p); });
    p.addEventListener('focus', function(){ setOn(p); });
  });
  // on phones: rotate through the products automatically until the visitor touches the panels
  if(panels.length && window.matchMedia('(max-width: 860px)').matches && !reduce){
    var pi = 0;
    var pTimer = setInterval(function(){ pi = (pi + 1) % panels.length; setOn(panels[pi]); }, 3200);
    panels.forEach(function(p){ p.addEventListener('touchstart', function(){ clearInterval(pTimer); }, {passive:true}); });
  }

  /* Headline animation: words rise one by one, underline draws in */
  var titles = document.querySelectorAll('.anim-title');
  Array.prototype.forEach.call(titles, function(t){
    var text = t.textContent.trim();
    t.setAttribute('aria-label', text);
    t.innerHTML = text.split(/\s+/).map(function(w, i){
      return '<span class="w" aria-hidden="true"><span style="--i:' + i + '">' + w + '</span></span>';
    }).join(' ');
  });
  if(titles.length){
    if('IntersectionObserver' in window){
      var tio = new IntersectionObserver(function(entries){
        entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('go'); tio.unobserve(en.target); } });
      }, {threshold:0.4});
      Array.prototype.forEach.call(titles, function(t){ tio.observe(t); });
    } else {
      Array.prototype.forEach.call(titles, function(t){ t.classList.add('go'); });
    }
  }

  /* Products: side-scroll carousel (home page) */
  var pc = document.getElementById('pcards');
  if(pc){
    var prev = document.getElementById('pcPrev'), next = document.getElementById('pcNext'), thumb = document.getElementById('pcThumb');
    var step = function(){ var c = pc.querySelector('.pcard'); return c ? c.offsetWidth + 18 : 300; };
    var sync = function(){
      var max = pc.scrollWidth - pc.clientWidth;
      prev.disabled = pc.scrollLeft <= 4;
      next.disabled = pc.scrollLeft >= max - 4;
      if(thumb){
        var track = thumb.parentNode.clientWidth;
        var ratio = pc.clientWidth / pc.scrollWidth;
        thumb.style.width = Math.max(ratio * 100, 12) + '%';
        var tw = thumb.clientWidth;
        var pos = max > 0 ? (pc.scrollLeft / max) * (track - tw) : 0;
        thumb.style.translate = pos + 'px 0';
      }
    };
    prev.addEventListener('click', function(){ pc.scrollBy({left: -step(), behavior: 'smooth'}); });
    next.addEventListener('click', function(){ pc.scrollBy({left: step(), behavior: 'smooth'}); });
    pc.addEventListener('scroll', sync, {passive:true});
    window.addEventListener('resize', sync);
    sync();
    setTimeout(sync, 400);

    // mouse drag to scroll
    var down = false, startX = 0, startLeft = 0, moved = false;
    pc.addEventListener('mousedown', function(e){ down = true; moved = false; startX = e.pageX; startLeft = pc.scrollLeft; });
    window.addEventListener('mousemove', function(e){
      if(!down) return;
      var dx = e.pageX - startX;
      if(Math.abs(dx) > 6){ moved = true; pc.classList.add('dragging'); }
      if(moved) pc.scrollLeft = startLeft - dx;
    });
    window.addEventListener('mouseup', function(){
      if(!down) return;
      down = false;
      if(moved){
        var snapTo = Math.round(pc.scrollLeft / step()) * step();
        pc.classList.remove('dragging');
        pc.scrollTo({left: snapTo, behavior: 'smooth'});
      }
    });
    pc.addEventListener('dragstart', function(e){ e.preventDefault(); });
  }

  /* Why Choose Us: click a card to open its detail popup */
  var wModal = document.getElementById('wModal');
  if(wModal){
    var wIcon = document.getElementById('wmIcon'), wTitle = document.getElementById('wmTitle'),
        wLead = document.getElementById('wmLead'), wPts = document.getElementById('wmPts'),
        wClose = document.getElementById('wmClose'), wCard = wModal.querySelector('.wm-card'), lastFocus = null;

    var openModal = function(li){
      var d = li.querySelector('.wdetail');
      wIcon.innerHTML = li.querySelector('.wicon').innerHTML;
      wTitle.innerHTML = li.querySelector('strong').innerHTML;
      wLead.textContent = d.querySelector('p').textContent;
      wPts.innerHTML = d.querySelector('.wd-pts').innerHTML;
      wCard.style.setProperty('--tone', li.style.getPropertyValue('--tone'));
      lastFocus = document.activeElement;
      wModal.hidden = false;
      document.body.classList.add('lock');
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ wModal.classList.add('open'); wClose.focus(); }); });
    };
    var closeModal = function(){
      wModal.classList.remove('open');
      document.body.classList.remove('lock');
      setTimeout(function(){ wModal.hidden = true; if(lastFocus) lastFocus.focus(); }, 320);
    };

    Array.prototype.forEach.call(document.querySelectorAll('.why-list .wbtn'), function(b){
      b.addEventListener('click', function(){ openModal(b.closest('li')); });
    });
    wClose.addEventListener('click', closeModal);
    wModal.addEventListener('click', function(e){ if(e.target === wModal) closeModal(); });
    document.addEventListener('keydown', function(e){
      if(wModal.hidden) return;
      if(e.key === 'Escape') closeModal();
      if(e.key === 'Tab'){
        var f = wCard.querySelectorAll('button, a[href]');
        var first = f[0], last = f[f.length - 1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---- Enquiry form (enquiry.html only) ---- */
  var form = document.getElementById('enquiryForm');
  if(!form) return;

  var prodBoxes = Array.prototype.slice.call(form.querySelectorAll('input[name="Product"]'));

  /* Preselect products from the link, e.g. enquiry.html?product=Black%20Pepper */
  try{
    var params = new URLSearchParams(window.location.search);
    params.getAll('product').forEach(function(val){
      prodBoxes.forEach(function(c){ if(c.value === val) c.checked = true; });
    });
  }catch(err){}

  /* Other product text */
  var otherChk = document.getElementById('otherChk'), otherWrap = document.getElementById('otherWrap'), otherText = document.getElementById('otherText');
  otherChk.addEventListener('change', function(){ otherWrap.hidden = !otherChk.checked; if(otherChk.checked) otherText.focus(); });

  /* Validation */
  function setErr(id, msg, inputId){
    var el = document.getElementById('e-' + id);
    if(el) el.textContent = msg || '';
    var inp = document.getElementById(inputId || id);
    if(inp){ if(msg) inp.setAttribute('aria-invalid','true'); else inp.removeAttribute('aria-invalid'); }
  }
  function validate(){
    var firstBad = null, ok = true;
    function bad(id, msg, inputId){ setErr(id, msg, inputId); if(msg){ ok = false; if(!firstBad) firstBad = document.getElementById(inputId || id); } }
    var v = function(id){ return document.getElementById(id).value.trim(); };

    bad('company', v('company') ? '' : 'Enter your company name.');
    bad('contact', v('contact') ? '' : 'Enter the contact person\u2019s name.');
    bad('country', v('country') ? '' : 'Enter your country.');
    bad('city', v('city') ? '' : 'Enter your city.');
    if(!v('email')) bad('email','Enter your email address.');
    else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v('email'))) bad('email','Enter a valid email address, like name@company.com.');
    else bad('email','');
    if(!v('mobile')) bad('mobile','Enter your mobile or WhatsApp number.');
    else if(!/^\+?[\d\s\-()]{7,}$/.test(v('mobile'))) bad('mobile','Enter a valid number, including country code.');
    else bad('mobile','');
    if(v('website') && !/^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/.*)?$/i.test(v('website'))) bad('website','Enter a valid website address, like https://example.com.');
    else bad('website','');

    var anyProd = prodBoxes.some(function(c){ return c.checked; });
    var pEl = document.getElementById('e-products');
    pEl.textContent = anyProd ? '' : 'Select at least one product.';
    if(!anyProd){ ok = false; if(!firstBad) firstBad = prodBoxes[0]; }
    if(otherChk.checked && !v('otherText')) bad('otherText','Tell us which product you need.');
    else bad('otherText','');

    var cons = document.getElementById('consent');
    var cEl = document.getElementById('e-consent');
    cEl.textContent = cons.checked ? '' : 'Please tick this box so we can contact you about your enquiry.';
    if(!cons.checked){ ok = false; if(!firstBad) firstBad = cons; }

    return {ok: ok, first: firstBad};
  }
  // clear errors as people fix them
  form.addEventListener('input', function(e){
    var t = e.target;
    if(t.id && document.getElementById('e-' + t.id) && t.value.trim()){ setErr(t.id, ''); }
  });
  form.addEventListener('change', function(e){
    if(e.target.name === 'Product' && prodBoxes.some(function(c){return c.checked;})) document.getElementById('e-products').textContent = '';
    if(e.target.id === 'consent' && e.target.checked) document.getElementById('e-consent').textContent = '';
  });

  /* Collect values */
  function collect(){
    var g = function(id){ return document.getElementById(id).value.trim(); };
    var checked = function(name){ return Array.prototype.slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function(c){ return c.value; }); };
    var prods = checked('Product').map(function(p){ return p === 'Other' ? 'Other: ' + g('otherText') : p; });
    return [
      ['Company Name', g('company')], ['Contact Person', g('contact')], ['Country', g('country')], ['City', g('city')],
      ['Email', g('email')], ['Mobile/WhatsApp', g('mobile')], ['Website', g('website') || '-'],
      ['Products', prods.join(', ')],
      ['Required Quantity', g('qty') || '-'], ['Preferred Packing Size', g('pack') || '-'], ['Destination Port', g('port') || '-'],
      ['Incoterm', checked('Incoterm').join(', ') || '-'], ['Payment Terms', checked('Payment Terms').join(', ') || '-'],
      ['Expected Shipment Date', g('ship') || '-'], ['Special Quality Requirements', g('quality') || '-'],
      ['Message', g('message') || '-'], ['Consent to be contacted', 'Yes']
    ];
  }

  var success = document.getElementById('success'), banner = document.getElementById('banner'), submitBtn = document.getElementById('submitBtn');

  function showSuccess(rows, sentToServer){
    var name = rows[1][1];
    document.getElementById('successMsg').textContent = 'Thank you, ' + name + '. ' + (sentToServer
      ? 'Your enquiry has reached the Novara Exports export team, and we will respond within one business day.'
      : 'Your enquiry is ready. Our export team responds within one business day of receiving it.');
    var mailBtn = document.getElementById('mailBtn'), fb = document.getElementById('fallback');
    if(!sentToServer){
      var body = 'New buyer enquiry\n\n' + rows.map(function(r){ return r[0] + ': ' + r[1]; }).join('\n');
      mailBtn.href = 'mailto:' + TEAM_EMAIL + '?subject=' + encodeURIComponent('Sourcing enquiry from ' + rows[0][1]) + '&body=' + encodeURIComponent(body);
      mailBtn.hidden = false;
      fb.hidden = false;
      fb.textContent = 'To deliver this enquiry to our team, press \u201cSend enquiry by email\u201d. It opens an email to ' + TEAM_EMAIL + ' with all your details filled in.';
    } else { mailBtn.hidden = true; fb.hidden = true; }
    form.style.display = 'none';
    success.classList.add('show');
    success.focus();
    success.scrollIntoView({behavior:'smooth', block:'start'});
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    banner.classList.remove('show');
    var r = validate();
    if(!r.ok){
      banner.textContent = 'Please complete the highlighted fields before submitting.';
      banner.classList.add('show');
      if(r.first) r.first.focus();
      return;
    }
    var rows = collect();
    if(ENDPOINT){
      submitBtn.disabled = true; submitBtn.textContent = 'Sending...';
      var payload = {}; rows.forEach(function(x){ payload[x[0]] = x[1]; });
      fetch(ENDPOINT, {method:'POST', body: JSON.stringify(payload)})
        .then(function(res){ return res.json(); })
        .then(function(r){ if(!r.ok) throw new Error(r.error || 'failed'); showSuccess(rows, true); })
        .catch(function(){
          banner.textContent = 'We could not send your enquiry. Please try again, or email ' + TEAM_EMAIL + ' directly.';
          banner.classList.add('show');
        })
        .finally(function(){ submitBtn.disabled = false; submitBtn.textContent = 'Submit Enquiry'; });
    } else {
      showSuccess(rows, false);
    }
  });

  document.getElementById('againBtn').addEventListener('click', function(){
    form.reset(); otherWrap.hidden = true;
    success.classList.remove('show'); form.style.display = '';
    window.scrollTo({top:0, behavior:'smooth'});
  });
})();