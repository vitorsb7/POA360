document.addEventListener("DOMContentLoaded", () => {
  seedInitialData();
  initTabs();
  initMobileMenu();

  initCitizenRegister();
  initCitizenLogin();
  initCitizenDashboard();

  initGovRegister();
  initGovLogin();
  initGovDashboard();
});

function seedInitialData() {
  if (!localStorage.getItem("poa360_occurrences")) {
    const initialOccurrences = [
      {
        id: generateId(),
        citizenEmail: "demo@cidadao.com",
        citizenName: "Cidadão Demo",
        bairro: "Humaitá",
        tipo: "Alagamento",
        gravidade: "Alta",
        descricao: "Via comprometida e acúmulo elevado de água.",
        status: "Enviada",
        prazo: "",
        createdAt: new Date().toLocaleString("pt-BR")
      },
      {
        id: generateId(),
        citizenEmail: "demo@cidadao.com",
        citizenName: "Cidadão Demo",
        bairro: "Menino Deus",
        tipo: "Falta de água",
        gravidade: "Média",
        descricao: "Abastecimento interrompido em parte da região.",
        status: "Recebida",
        prazo: "24 horas",
        createdAt: new Date().toLocaleString("pt-BR")
      },
      {
        id: generateId(),
        citizenEmail: "demo@cidadao.com",
        citizenName: "Cidadão Demo",
        bairro: "Sarandi",
        tipo: "Falta de luz",
        gravidade: "Alta",
        descricao: "Quadras sem energia e postes apagados.",
        status: "Em andamento",
        prazo: "48 horas",
        createdAt: new Date().toLocaleString("pt-BR")
      }
    ];
    localStorage.setItem("poa360_occurrences", JSON.stringify(initialOccurrences));
  }
}

function generateId() {
  return "ID-" + Date.now() + "-" + Math.floor(Math.random() * 10000);
}

function getOccurrences() {
  return JSON.parse(localStorage.getItem("poa360_occurrences") || "[]");
}

function saveOccurrences(data) {
  localStorage.setItem("poa360_occurrences", JSON.stringify(data));
}

function getCitizenUsers() {
  return JSON.parse(localStorage.getItem("poa360_citizen_users") || "[]");
}

function saveCitizenUsers(users) {
  localStorage.setItem("poa360_citizen_users", JSON.stringify(users));
}

function getGovUsers() {
  return JSON.parse(localStorage.getItem("poa360_gov_users") || "[]");
}

function saveGovUsers(users) {
  localStorage.setItem("poa360_gov_users", JSON.stringify(users));
}

function setCitizenSession(user) {
  localStorage.setItem("poa360_citizen_logged", JSON.stringify(user));
}

function getCitizenSession() {
  return JSON.parse(localStorage.getItem("poa360_citizen_logged") || "null");
}

function clearCitizenSession() {
  localStorage.removeItem("poa360_citizen_logged");
}

function setGovSession(user) {
  localStorage.setItem("poa360_gov_logged", JSON.stringify(user));
}

function getGovSession() {
  return JSON.parse(localStorage.getItem("poa360_gov_logged") || "null");
}

function clearGovSession() {
  localStorage.removeItem("poa360_gov_logged");
}

function initTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const contents = document.querySelectorAll(".tab-content");

  if (!buttons.length) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const target = document.getElementById(btn.dataset.tab);
      if (target) target.classList.add("active");
    });
  });
}

function initMobileMenu() {
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

function initCitizenRegister() {
  const form = document.getElementById("citizenRegisterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("citizenRegisterName").value.trim();
    const email = document.getElementById("citizenRegisterEmail").value.trim().toLowerCase();
    const bairro = document.getElementById("citizenRegisterBairro").value.trim();
    const password = document.getElementById("citizenRegisterPassword").value.trim();

    if (!name || !email || !bairro || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    const users = getCitizenUsers();
    const exists = users.some(user => user.email === email);

    if (exists) {
      alert("Esse e-mail já está cadastrado.");
      return;
    }

    users.push({ name, email, bairro, password });
    saveCitizenUsers(users);

    alert("Cadastro de cidadão realizado com sucesso.");
    form.reset();

    const loginTabBtn = document.querySelector('[data-tab="cidLoginTab"]');
    if (loginTabBtn) loginTabBtn.click();
  });
}

function initCitizenLogin() {
  const form = document.getElementById("citizenLoginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("citizenLoginEmail").value.trim().toLowerCase();
    const password = document.getElementById("citizenLoginPassword").value.trim();

    const users = getCitizenUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("E-mail ou senha inválidos.");
      return;
    }

    setCitizenSession(user);
    window.location.href = "cidadao-dashboard.html";
  });
}

function initCitizenDashboard() {
  const isCitizenDash = window.location.pathname.includes("cidadao-dashboard.html");
  if (!isCitizenDash) return;

  const user = getCitizenSession();
  if (!user) {
    alert("Faça login como cidadão primeiro.");
    window.location.href = "cidadao-auth.html";
    return;
  }

  const welcomeTitle = document.getElementById("citizenWelcomeTitle");
  const welcomeText = document.getElementById("citizenWelcomeText");
  const neighborhoodBox = document.getElementById("citizenNeighborhoodBox");
  const occurrenceForm = document.getElementById("citizenOccurrenceForm");
  const occurrenceList = document.getElementById("citizenOccurrenceList");
  const logoutBtn = document.getElementById("citizenLogoutBtn");

  welcomeTitle.textContent = `Olá, ${user.name}`;
  welcomeText.textContent = `Seu bairro cadastrado é ${user.bairro}. Aqui você acompanha e envia ocorrências.`;

  renderCitizenNeighborhood(user.bairro);
  renderCitizenOccurrences(user, occurrenceList);
  renderCitizenKpis(user);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearCitizenSession();
      window.location.href = "cidadao-auth.html";
    });
  }

  if (occurrenceForm) {
    occurrenceForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const tipo = document.getElementById("citizenOccurrenceType").value;
      const gravidade = document.getElementById("citizenOccurrenceSeverity").value;
      const descricao = document.getElementById("citizenOccurrenceDescription").value.trim();

      if (!tipo || !gravidade || !descricao) {
        alert("Preencha todos os campos.");
        return;
      }

      const occurrences = getOccurrences();

      occurrences.unshift({
        id: generateId(),
        citizenEmail: user.email,
        citizenName: user.name,
        bairro: user.bairro,
        tipo,
        gravidade,
        descricao,
        status: "Enviada",
        prazo: "",
        createdAt: new Date().toLocaleString("pt-BR")
      });

      saveOccurrences(occurrences);
      occurrenceForm.reset();

      renderCitizenOccurrences(user, occurrenceList);
      renderCitizenKpis(user);

      alert("Ocorrência enviada com sucesso.");
    });
  }

  function renderCitizenNeighborhood(bairro) {
    const maps = {
      "Humaitá": ["Risco elevado", "Ocorrências críticas em monitoramento", "Equipe pública em atenção reforçada"],
      "Menino Deus": ["Atenção", "Incidentes moderados registrados", "Situação acompanhada pelo sistema"],
      "Sarandi": ["Risco elevado", "Região com alta prioridade operacional", "Resposta recomendada"],
      "Partenon": ["Atenção", "Notificações em crescimento", "Leitura contínua"],
      "Tristeza": ["Estável", "Sem criticidade alta no momento", "Monitoramento ativo"],
      "Moinhos de Vento": ["Estável", "Baixa incidência de ocorrências", "Situação controlada"]
    };

    const data = maps[bairro] || ["Monitoramento ativo", "Leitura territorial em andamento", "Sistema observando a região"];

    neighborhoodBox.innerHTML = `
      <strong style="display:block; color:white; margin-bottom:8px;">${bairro}</strong>
      <div><b>Status:</b> ${data[0]}</div>
      <div><b>Leitura atual:</b> ${data[1]}</div>
      <div><b>Operação:</b> ${data[2]}</div>
    `;
  }
}

function renderCitizenOccurrences(user, container) {
  const occurrences = getOccurrences().filter(item => item.citizenEmail === user.email);

  if (!occurrences.length) {
    container.innerHTML = `<div class="empty-box">Você ainda não enviou ocorrências.</div>`;
    return;
  }

  container.innerHTML = occurrences.map(item => `
    <div class="occ-card">
      <div>
        <strong>${item.tipo} • ${item.bairro}</strong>
        <p>${item.descricao}</p>

        <div class="occ-meta">
          <span class="${getSeverityClass(item.gravidade)}">${item.gravidade}</span>
          <span class="${getStatusClass(item.status)}">${item.status}</span>
          ${item.prazo ? `<span class="mini-badge green">Prazo: ${item.prazo}</span>` : `<span class="mini-badge blue">Aguardando análise</span>`}
          <span class="mini-badge blue">${item.createdAt}</span>
        </div>
      </div>
    </div>
  `).join("");
}

function renderCitizenKpis(user) {
  const occurrences = getOccurrences().filter(item => item.citizenEmail === user.email);

  document.getElementById("citizenKpiTotal").textContent = occurrences.length;
  document.getElementById("citizenKpiRecebidas").textContent = occurrences.filter(i => i.status === "Recebida").length;
  document.getElementById("citizenKpiAndamento").textContent = occurrences.filter(i => i.status === "Em andamento").length;
  document.getElementById("citizenKpiResolvidas").textContent = occurrences.filter(i => i.status === "Resolvida").length;
}

function initGovRegister() {
  const form = document.getElementById("govRegisterForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("govRegisterName").value.trim();
    const email = document.getElementById("govRegisterEmail").value.trim().toLowerCase();
    const org = document.getElementById("govRegisterOrg").value.trim();
    const password = document.getElementById("govRegisterPassword").value.trim();

    if (!name || !email || !org || !password) {
      alert("Preencha todos os campos.");
      return;
    }

    const users = getGovUsers();
    const exists = users.some(user => user.email === email);

    if (exists) {
      alert("Esse e-mail institucional já está cadastrado.");
      return;
    }

    users.push({ name, email, org, password });
    saveGovUsers(users);

    alert("Cadastro governamental realizado com sucesso.");
    form.reset();

    const loginTabBtn = document.querySelector('[data-tab="govLoginTab"]');
    if (loginTabBtn) loginTabBtn.click();
  });
}

function initGovLogin() {
  const form = document.getElementById("govLoginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("govLoginEmail").value.trim().toLowerCase();
    const password = document.getElementById("govLoginPassword").value.trim();

    const users = getGovUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("E-mail institucional ou senha inválidos.");
      return;
    }

    setGovSession(user);
    window.location.href = "gov-dashboard.html";
  });
}

function initGovDashboard() {
  const isGovDash = window.location.pathname.includes("gov-dashboard.html");
  if (!isGovDash) return;

  const user = getGovSession();
  if (!user) {
    alert("Faça login governamental primeiro.");
    window.location.href = "gov-auth.html";
    return;
  }

  const welcome = document.getElementById("govWelcomeText");
  const logoutBtn = document.getElementById("govLogoutBtn");
  const simulateBtn = document.getElementById("simulateBtn");
  const generalAlertBtn = document.getElementById("sendGeneralAlertBtn");
  const occurrenceList = document.getElementById("govOccurrenceList");

  welcome.textContent = `Responsável: ${user.name} • ${user.org}`;

  renderGovKpis();
  renderGovTypeChart();
  renderGovOccurrences(occurrenceList);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      clearGovSession();
      window.location.href = "gov-auth.html";
    });
  }

  if (simulateBtn) {
    simulateBtn.addEventListener("click", () => {
      alert("Atualização executiva simulada com sucesso.");
      renderGovKpis();
      renderGovTypeChart();
    });
  }

  if (generalAlertBtn) {
    generalAlertBtn.addEventListener("click", () => {
      alert("Alerta geral enviado com sucesso no modo demonstração.");
    });
  }

  occurrenceList.addEventListener("click", (e) => {
    const btn = e.target.closest(".status-btn");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;

    const occurrences = getOccurrences();
    const index = occurrences.findIndex(item => item.id === id);

    if (index === -1) return;

    if (action === "recebida") {
      const select = document.getElementById(`deadline-${id}`);
      const prazo = select ? select.value : "";

      if (!prazo) {
        alert("Selecione um prazo antes de marcar como recebida.");
        return;
      }

      occurrences[index].status = "Recebida";
      occurrences[index].prazo = prazo;
    }

    if (action === "andamento") {
      occurrences[index].status = "Em andamento";
    }

    if (action === "resolvida") {
      occurrences[index].status = "Resolvida";
    }

    saveOccurrences(occurrences);
    renderGovKpis();
    renderGovTypeChart();
    renderGovOccurrences(occurrenceList);
  });
}

function renderGovKpis() {
  const occurrences = getOccurrences();

  document.getElementById("kpiTotal").textContent = occurrences.length;
  document.getElementById("kpiCriticas").textContent = occurrences.filter(i => i.gravidade === "Alta").length;
  document.getElementById("kpiAndamento").textContent = occurrences.filter(i => i.status === "Em andamento").length;
  document.getElementById("kpiResolvidas").textContent = occurrences.filter(i => i.status === "Resolvida").length;
}

function renderGovTypeChart() {
  const occurrences = getOccurrences();

  const alagamento = occurrences.filter(i => i.tipo === "Alagamento").length;
  const agua = occurrences.filter(i => i.tipo === "Falta de água").length;
  const luz = occurrences.filter(i => i.tipo === "Falta de luz").length;
  const via = occurrences.filter(i => i.tipo === "Bloqueio de via").length;

  const max = Math.max(alagamento, agua, luz, via, 1);

  setBar("barAlagamento", "countAlagamento", alagamento, max);
  setBar("barAgua", "countAgua", agua, max);
  setBar("barLuz", "countLuz", luz, max);
  setBar("barVia", "countVia", via, max);
}

function setBar(barId, countId, value, max) {
  const percent = Math.max(10, Math.round((value / max) * 100));
  const bar = document.getElementById(barId);
  const count = document.getElementById(countId);

  if (bar) bar.style.width = percent + "%";
  if (count) count.textContent = value;
}

function renderGovOccurrences(container) {
  const occurrences = getOccurrences();

  if (!occurrences.length) {
    container.innerHTML = `<div class="empty-box">Nenhuma ocorrência registrada.</div>`;
    return;
  }

  container.innerHTML = occurrences.map(item => `
    <div class="occ-card">
      <div style="width:100%;">
        <strong>${item.tipo} • ${item.bairro}</strong>
        <p>${item.descricao}</p>

        <div class="occ-meta">
          <span class="mini-badge blue">${item.citizenName}</span>
          <span class="${getSeverityClass(item.gravidade)}">${item.gravidade}</span>
          <span class="${getStatusClass(item.status)}">${item.status}</span>
          ${item.prazo ? `<span class="mini-badge green">Prazo: ${item.prazo}</span>` : ""}
          <span class="mini-badge blue">${item.createdAt}</span>
        </div>

        <div class="deadline-box">
          <label for="deadline-${item.id}">Prazo:</label>
          <select id="deadline-${item.id}" class="deadline-select">
            <option value="">Selecionar prazo</option>
            <option value="24 horas" ${item.prazo === "24 horas" ? "selected" : ""}>24 horas</option>
            <option value="48 horas" ${item.prazo === "48 horas" ? "selected" : ""}>48 horas</option>
            <option value="72 horas" ${item.prazo === "72 horas" ? "selected" : ""}>72 horas</option>
          </select>
        </div>

        <div class="occ-actions">
          <button class="status-btn" data-id="${item.id}" data-action="recebida">Marcar recebida</button>
          <button class="status-btn" data-id="${item.id}" data-action="andamento">Em andamento</button>
          <button class="status-btn" data-id="${item.id}" data-action="resolvida">Resolver</button>
        </div>
      </div>
    </div>
  `).join("");
}

function getSeverityClass(value) {
  if (value === "Alta") return "mini-badge red";
  if (value === "Média") return "mini-badge yellow";
  return "mini-badge green";
}

function getStatusClass(value) {
  if (value === "Enviada") return "mini-badge blue";
  if (value === "Recebida") return "mini-badge green";
  if (value === "Em andamento") return "mini-badge yellow";
  if (value === "Resolvida") return "mini-badge green";
  return "mini-badge blue";
}

function sendPartnerAlert(partner) {
  alert(`Alerta estratégico enviado para ${partner} no modo demonstração.`);
}