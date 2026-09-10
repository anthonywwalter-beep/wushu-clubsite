(function () {
  function safeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function parseMarkdownSimple(markdownText) {
    const lines = markdownText.replace(/\r/g, '').split('\n');
    let html = '';
    let inList = false;

    function flushList() {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
    }

    lines.forEach((line) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      if (/^###?\s+/.test(trimmed)) {
        flushList();
        const level = trimmed.startsWith('###') ? 3 : 2;
        const text = trimmed.replace(/^###?\s+/, '');
        html += `<h${level}>${safeHtml(text)}</h${level}>`;
        return;
      }

      if (/^-\s+/.test(trimmed)) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${safeHtml(trimmed.replace(/^-\s+/, ''))}</li>`;
        return;
      }

      flushList();
      html += `<p>${safeHtml(trimmed)}</p>`;
    });

    flushList();
    return html;
  }

  function fetchJson(filePath) {
    return fetch(filePath + '?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load JSON: ' + filePath);
        return res.json();
      });
  }

  function fetchText(filePath) {
    return fetch(filePath + '?t=' + Date.now(), { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load content: ' + filePath);
        return res.text();
      });
  }

  function setTextIfPresent(element, value) {
    if (!element) return;
    element.textContent = value;
  }

  function setHtmlIfPresent(element, value) {
    if (!element) return;
    element.innerHTML = value;
  }

  function populateHomepage() {
    const heroTitle = document.getElementById('hero-title');
    const heroSubtitle = document.getElementById('hero-subtitle');
    const whoWeAre = document.getElementById('who-we-are-copy');
    const whatWeDo = document.getElementById('what-we-do-copy');

    if (!heroTitle && !heroSubtitle && !whoWeAre && !whatWeDo) {
      return;
    }

    fetchJson('content/homepage.json')
      .then((data) => {
        if (heroTitle) setTextIfPresent(heroTitle, data.hero.title);
        if (heroSubtitle) setTextIfPresent(heroSubtitle, data.hero.subtitle);

        if (whoWeAre) {
          const content = data.sections.whoWeAre.content;
          setHtmlIfPresent(whoWeAre, '<p>' + safeHtml(content) + '</p>');
        }

        if (whatWeDo) {
          const content = data.sections.whatWeDo.content;
          setHtmlIfPresent(whatWeDo, '<p>' + safeHtml(content) + '</p>');
        }
      })
      .catch((err) => {
        console.warn('Homepage content not loaded:', err);
      });
  }

  function populateAboutPage() {
    const aboutTarget = document.getElementById('about-copy');
    if (!aboutTarget) return;

    fetchText('content/about.md')
      .then((markdown) => {
        setHtmlIfPresent(aboutTarget, parseMarkdownSimple(markdown));
      })
      .catch((err) => {
        console.warn('About content not loaded:', err);
      });
  }

  function populateOfficers() {
    const list = document.getElementById('officers-list');
    if (!list) return;

    fetchJson('content/officers.json')
      .then((data) => {
        const officers = Array.isArray(data)
          ? data
          : (Array.isArray(data?.officers) ? data.officers : []);

        list.innerHTML = officers.map((person) => {
          return `
            <li class="officer-item">
              <img src="${safeHtml(person.image)}" alt="${safeHtml(person.name)}" />
              <div>
                <h3>${safeHtml(person.name)}</h3>
                <p>${safeHtml(person.role)}</p>
              </div>
            </li>
          `;
        }).join('');
      })
      .catch((err) => {
        console.warn('Officer content not loaded:', err);
      });
  }

  function populatePracticeInfo() {
    const list = document.getElementById('practice-list');
    if (!list) return;

    fetchJson('content/practices.json')
      .then((data) => {
        list.innerHTML = `
          <li><strong>${safeHtml(data.title)}</strong></li>
          <li>${safeHtml(data.location)}</li>
          <li>${safeHtml(data.time)}</li>
          ${data.notes.map((note) => '<li>' + safeHtml(note) + '</li>').join('')}
        `;
      })
      .catch((err) => {
        console.warn('Practice content not loaded:', err);
      });
  }

  function init() {
    populateHomepage();
    populateAboutPage();
    populateOfficers();
    populatePracticeInfo();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
