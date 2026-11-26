/* Convenção Regional Baixo Amazonas
   Lê os arquivos da pasta "dados" e monta as listas das páginas.
   Para atualizar o conteúdo, edite os arquivos .json — não é preciso mexer aqui. */
(function () {
  'use strict';

  var base = document.documentElement.getAttribute('data-base') || '';
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  var MESES_CURTOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

  /* ---------- utilidades ---------- */

  function el(tag, props) {
    var no = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (props[k] == null || props[k] === false) return;
        if (k === 'text') no.textContent = props[k];
        else if (k === 'class') no.className = props[k];
        else no.setAttribute(k, props[k]);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var filho = arguments[i];
      if (filho == null || filho === false) continue;
      no.appendChild(typeof filho === 'string' ? document.createTextNode(filho) : filho);
    }
    return no;
  }

  function texto(v) { return (v == null ? '' : String(v)).trim(); }

  function linkSeguro(u) {
    u = texto(u);
    return /^(https?:\/\/|mailto:|tel:)/i.test(u) ? u : '';
  }

  function linkExterno(href, rotulo) {
    return el('a', { href: href, target: '_blank', rel: 'noopener', text: rotulo });
  }

  var cache = {};
  function dados(nome) {
    if (!cache[nome]) {
      cache[nome] = fetch(base + 'dados/' + nome + '.json', { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error(nome + '.json: ' + r.status);
        return r.json();
      });
    }
    return cache[nome];
  }

  function limpar(no) { while (no.firstChild) no.removeChild(no.firstChild); }

  function vazio(no, mensagem, comContato) {
    limpar(no);
    var caixa = el('div', { class: 'vazio' }, el('p', { text: mensagem }));
    if (comContato) {
      caixa.appendChild(el('p', null, el('a', { href: base + 'contato/', text: 'Falar com a Convenção' })));
    }
    no.appendChild(caixa);
  }

  function falha(no) {
    vazio(no, 'Não foi possível carregar esta lista agora. Recarregue a página para tentar de novo.');
  }

  function porNome(a, b) { return texto(a).localeCompare(texto(b), 'pt-BR', { sensitivity: 'base' }); }

  function semAcento(s) { return texto(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

  /* ---------- menu no celular ---------- */

  var botao = document.querySelector('.menu-botao');
  var menu = document.getElementById('menu');
  if (botao && menu) {
    botao.addEventListener('click', function () {
      var aberto = menu.classList.toggle('aberto');
      botao.setAttribute('aria-expanded', aberto ? 'true' : 'false');
    });
  }

  var ano = document.querySelector('[data-ano]');
  if (ano) ano.textContent = new Date().getFullYear();

  /* ---------- contatos (rodapé e página de contato) ---------- */

  function whatsapp(numero) {
    var d = texto(numero).replace(/\D/g, '');
    if (!d) return null;
    if (d.length <= 11) d = '55' + d;
    var local = d.slice(2), ddd = local.slice(0, 2), resto = local.slice(2);
    var bonito = '(' + ddd + ') ' + resto.slice(0, resto.length - 4) + '-' + resto.slice(-4);
    return { href: 'https://wa.me/' + d, texto: bonito };
  }

  function canais(s) {
    var lista = [];
    var email = texto(s.email);
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) lista.push({ rotulo: 'E-mail', texto: email, href: 'mailto:' + email });
    var w = whatsapp(s.whatsapp);
    if (w) lista.push({ rotulo: 'WhatsApp', texto: w.texto, href: w.href, externo: true });
    /* Instagram: aceita @usuario ou o link do perfil. Se vier só o nome do perfil (com espaços), mostra o nome sem link. */
    var insta = texto(s.instagram);
    if (/\s/.test(insta)) {
      lista.push({ rotulo: 'Instagram', texto: insta, soNome: true });
    } else {
      insta = insta.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/[\/?#].*$/, '');
      if (insta) lista.push({ rotulo: 'Instagram', texto: '@' + insta, href: 'https://www.instagram.com/' + encodeURIComponent(insta) + '/', externo: true });
    }
    /* Facebook: com o link, vira link; só com o nome da página, mostra o nome sem link. */
    if (linkSeguro(s.facebook)) lista.push({ rotulo: 'Facebook', texto: 'Página no Facebook', href: linkSeguro(s.facebook), externo: true });
    else if (texto(s.facebook)) lista.push({ rotulo: 'Facebook', texto: texto(s.facebook), soNome: true });
    if (linkSeguro(s.youtube)) lista.push({ rotulo: 'YouTube', texto: 'Canal no YouTube', href: linkSeguro(s.youtube), externo: true });
    if (texto(s.endereco)) lista.push({ rotulo: 'Endereço', texto: texto(s.endereco) });
    if (texto(s.atendimento)) lista.push({ rotulo: 'Atendimento', texto: texto(s.atendimento) });
    return lista;
  }

  function linkCanal(c) {
    if (!c.href) return document.createTextNode(c.texto);
    return c.externo ? linkExterno(c.href, c.texto) : el('a', { href: c.href, text: c.texto });
  }

  var rodapeContatos = document.querySelector('[data-rodape-contatos]');
  var paginaContatos = document.querySelector('[data-lista="contatos"]');
  if (rodapeContatos || paginaContatos) {
    dados('site').then(function (s) {
      var lista = canais(s || {});
      if (rodapeContatos && lista.length) {
        var ul = rodapeContatos.querySelector('ul');
        lista.forEach(function (c) {
          if (c.rotulo === 'Atendimento' || c.soNome) return;
          ul.appendChild(el('li', null, linkCanal(c)));
        });
        rodapeContatos.hidden = false;
      }
      if (paginaContatos) {
        if (!lista.length) {
          vazio(paginaContatos, 'Os canais oficiais de atendimento da Convenção ainda não foram publicados nesta página. Procure a liderança da sua igreja local.');
          return;
        }
        var dl = el('dl', { class: 'pares' });
        lista.forEach(function (c) {
          dl.appendChild(el('div', null, el('dt', { text: c.rotulo }), el('dd', null, linkCanal(c))));
        });
        limpar(paginaContatos);
        paginaContatos.appendChild(dl);
      }
    }).catch(function () { if (paginaContatos) falha(paginaContatos); });
  }

  /* ---------- datas ---------- */

  function data(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto(s));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
  }

  function periodo(ini, fim) {
    var a = ini.getDate() + ' de ' + MESES[ini.getMonth()] + ' de ' + ini.getFullYear();
    if (!fim || +fim === +ini) return a;
    var b = fim.getDate() + ' de ' + MESES[fim.getMonth()] + ' de ' + fim.getFullYear();
    if (ini.getFullYear() !== fim.getFullYear()) return a + ' a ' + b;
    if (ini.getMonth() !== fim.getMonth()) return ini.getDate() + ' de ' + MESES[ini.getMonth()] + ' a ' + b;
    return ini.getDate() + ' a ' + b;
  }

  function prepararAgenda(lista) {
    var hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    var futuros = [], passados = [];
    (Array.isArray(lista) ? lista : []).forEach(function (e) {
      var ini = data(e.inicio);
      if (!ini || !texto(e.titulo)) return;
      var fim = data(e.fim) || ini;
      var item = { e: e, ini: ini, fim: fim };
      (fim >= hoje ? futuros : passados).push(item);
    });
    futuros.sort(function (a, b) { return a.ini - b.ini; });
    passados.sort(function (a, b) { return b.ini - a.ini; });
    return { futuros: futuros, passados: passados };
  }

  function noEvento(item) {
    var e = item.e;
    var corpo = el('div', null,
      el('h3', { text: texto(e.titulo) }),
      el('p', { class: 'quando', text: periodo(item.ini, item.fim) + (texto(e.local) ? ', ' + texto(e.local) : '') }),
      texto(e.descricao) ? el('p', { text: texto(e.descricao) }) : null
    );
    if (linkSeguro(e.link)) {
      corpo.appendChild(el('p', { class: 'links' }, linkExterno(linkSeguro(e.link), texto(e.link_texto) || 'Mais informações')));
    }
    return el('li', { class: 'evento' },
      el('div', { class: 'evento-dia' }, el('b', { text: String(item.ini.getDate()).padStart(2, '0') }), el('span', { text: MESES_CURTOS[item.ini.getMonth()] + ' ' + item.ini.getFullYear() })),
      corpo
    );
  }

  /* Página inicial: próximos eventos (a seção só aparece se houver algum) */
  var proximos = document.querySelector('[data-proximos]');
  if (proximos) {
    dados('agenda').then(function (lista) {
      var a = prepararAgenda(lista);
      if (!a.futuros.length) return;
      var ul = proximos.querySelector('ul');
      a.futuros.slice(0, 3).forEach(function (item) { ul.appendChild(noEvento(item)); });
      proximos.hidden = false;
    }).catch(function () {});
  }

  /* Página da agenda */
  var agenda = document.querySelector('[data-lista="agenda"]');
  if (agenda) {
    dados('agenda').then(function (lista) {
      var a = prepararAgenda(lista);
      limpar(agenda);
      if (!a.futuros.length) {
        vazio(agenda, 'O calendário da Convenção ainda não tem eventos publicados. Para saber das próximas programações, fale com a Convenção ou com a sua igreja local.', true);
      } else {
        var grupo = null, chaveAtual = '';
        a.futuros.forEach(function (item) {
          var chave = MESES[item.ini.getMonth()] + ' de ' + item.ini.getFullYear();
          if (chave !== chaveAtual) {
            chaveAtual = chave;
            grupo = el('ul', { class: 'eventos' });
            agenda.appendChild(el('section', { class: 'mes' }, el('h2', { text: chave.charAt(0).toUpperCase() + chave.slice(1) }), grupo));
          }
          grupo.appendChild(noEvento(item));
        });
      }
      if (a.passados.length) {
        var ul = el('ul', { class: 'eventos' });
        a.passados.forEach(function (item) { ul.appendChild(noEvento(item)); });
        agenda.appendChild(el('details', { class: 'anteriores' }, el('summary', { text: 'Eventos anteriores (' + a.passados.length + ')' }), ul));
      }
    }).catch(function () { falha(agenda); });
  }

  /* ---------- igrejas ---------- */

  var igrejas = document.querySelector('[data-lista="igrejas"]');
  if (igrejas) {
    dados('igrejas').then(function (lista) {
      lista = (Array.isArray(lista) ? lista : []).filter(function (i) { return texto(i.nome) && texto(i.municipio); });
      limpar(igrejas);
      if (!lista.length) {
        vazio(igrejas, 'A lista de igrejas da região está sendo reunida e será publicada aqui. Enquanto isso, a Convenção pode indicar a igreja mais próxima de você.', true);
        return;
      }
      var grupos = {};
      lista.forEach(function (i) {
        var chave = texto(i.municipio) + '|' + texto(i.uf).toUpperCase();
        (grupos[chave] = grupos[chave] || []).push(i);
      });
      var blocos = [];
      var destino = el('div');

      Object.keys(grupos).sort(porNome).forEach(function (chave) {
        var partes = chave.split('|');
        var itens = grupos[chave].sort(function (a, b) { return porNome(a.nome, b.nome); });
        var coluna = el('div', { class: 'igrejas' });
        itens.forEach(function (i) {
          var art = el('article', { class: 'igreja' }, el('h3', { text: texto(i.nome) }));
          if (texto(i.endereco)) art.appendChild(el('p', { text: texto(i.endereco) }));
          var dl = el('dl');
          if (texto(i.pastor)) { dl.appendChild(el('dt', { text: 'Pastor' })); dl.appendChild(el('dd', { text: texto(i.pastor) })); }
          if (texto(i.cultos)) { dl.appendChild(el('dt', { text: 'Cultos' })); dl.appendChild(el('dd', { text: texto(i.cultos) })); }
          if (dl.firstChild) art.appendChild(dl);
          var links = el('p', { class: 'links' });
          if (linkSeguro(i.mapa)) links.appendChild(linkExterno(linkSeguro(i.mapa), 'Ver no mapa'));
          var w = whatsapp(i.whatsapp);
          if (w) links.appendChild(linkExterno(w.href, 'WhatsApp ' + w.texto));
          if (links.firstChild) art.appendChild(links);
          art.setAttribute('data-busca', semAcento([i.nome, i.municipio, i.endereco, i.pastor].join(' ')));
          coluna.appendChild(art);
        });
        var qtd = itens.length === 1 ? '1 igreja' : itens.length + ' igrejas';
        var bloco = el('section', { class: 'municipio' },
          el('h2', null, partes[0] + (partes[1] ? ' (' + partes[1] + ')' : ''), el('small', { text: qtd })),
          coluna);
        blocos.push(bloco);
        destino.appendChild(bloco);
      });

      if (lista.length >= 6) {
        var campo = el('input', { type: 'search', id: 'busca-igreja', autocomplete: 'off', placeholder: 'Ex.: Santarém' });
        var nada = el('div', { class: 'vazio', hidden: 'hidden' }, el('p', { text: 'Nenhuma igreja encontrada com esse nome ou cidade.' }));
        campo.addEventListener('input', function () {
          var q = semAcento(campo.value), achou = 0;
          blocos.forEach(function (bloco) {
            var visiveis = 0;
            bloco.querySelectorAll('.igreja').forEach(function (art) {
              var ok = !q || art.getAttribute('data-busca').indexOf(q) !== -1;
              art.hidden = !ok;
              if (ok) visiveis++;
            });
            bloco.hidden = !visiveis;
            achou += visiveis;
          });
          nada.hidden = achou > 0;
        });
        igrejas.appendChild(el('div', { class: 'busca' }, el('label', { for: 'busca-igreja', text: 'Buscar por cidade ou nome da igreja' }), campo));
        igrejas.appendChild(nada);
      }
      igrejas.appendChild(destino);
    }).catch(function () { falha(igrejas); });
  }

  /* ---------- ministérios ---------- */

  var ministerios = document.querySelector('[data-lista="ministerios"]');
  if (ministerios) {
    dados('ministerios').then(function (lista) {
      lista = (Array.isArray(lista) ? lista : []).filter(function (m) { return texto(m.nome); });
      limpar(ministerios);
      if (!lista.length) { vazio(ministerios, 'Os ministérios da Convenção serão apresentados aqui.', true); return; }
      var grade = el('div', { class: 'ministerios' });
      lista.forEach(function (m) {
        var corpo = el('div', null, texto(m.descricao) ? el('p', { text: texto(m.descricao) }) : null);
        if (texto(m.lider)) corpo.appendChild(el('p', { class: 'lider', text: 'Liderança regional: ' + texto(m.lider) }));
        var w = whatsapp(m.whatsapp);
        if (w) corpo.appendChild(el('p', { class: 'links' }, linkExterno(w.href, 'WhatsApp ' + w.texto)));
        grade.appendChild(el('section', { class: 'ministerio' }, el('h2', { text: texto(m.nome) }), corpo));
      });
      ministerios.appendChild(grade);
    }).catch(function () { falha(ministerios); });
  }

  /* ---------- diretoria ---------- */

  var diretoria = document.querySelector('[data-lista="diretoria"]');
  if (diretoria) {
    dados('diretoria').then(function (lista) {
      lista = (Array.isArray(lista) ? lista : []).filter(function (d) { return texto(d.cargo) && texto(d.nome); });
      limpar(diretoria);
      if (!lista.length) { vazio(diretoria, 'A composição da Diretoria Regional ainda não foi publicada nesta página.'); return; }
      var dl = el('dl', { class: 'pares' });
      lista.forEach(function (d) { dl.appendChild(el('div', null, el('dt', { text: texto(d.cargo) }), el('dd', { text: texto(d.nome) }))); });
      diretoria.appendChild(dl);
    }).catch(function () { falha(diretoria); });
  }

  /* ---------- downloads ---------- */

  var downloads = document.querySelector('[data-lista="downloads"]');
  if (downloads) {
    dados('downloads').then(function (lista) {
      lista = (Array.isArray(lista) ? lista : []).filter(function (d) { return texto(d.titulo) && texto(d.arquivo); });
      limpar(downloads);
      if (!lista.length) {
        vazio(downloads, 'Ainda não há arquivos publicados. Formulários, documentos e materiais da Convenção ficarão disponíveis aqui.', true);
        return;
      }
      var ordem = [], grupos = {};
      lista.forEach(function (d) {
        var cat = texto(d.categoria) || 'Documentos';
        if (!grupos[cat]) { grupos[cat] = []; ordem.push(cat); }
        grupos[cat].push(d);
      });
      ordem.forEach(function (cat) {
        var ul = el('ul', { class: 'arquivos' });
        grupos[cat].forEach(function (d) {
          var arq = texto(d.arquivo);
          var externo = linkSeguro(arq);
          var href = externo || base + 'arquivos/' + arq.split('/').map(encodeURIComponent).join('/');
          var ext = (/\.([a-z0-9]{2,5})(?:[?#].*)?$/i.exec(arq) || [])[1];
          var li = el('li', null, externo ? linkExterno(href, texto(d.titulo)) : el('a', { href: href, text: texto(d.titulo) }));
          if (ext && !externo) li.appendChild(el('span', { class: 'tipo', text: ext.toUpperCase() }));
          if (texto(d.descricao)) li.appendChild(el('p', { text: texto(d.descricao) }));
          ul.appendChild(li);
        });
        downloads.appendChild(el('section', { class: 'bloco' }, el('h2', { text: cat }), ul));
      });
    }).catch(function () { falha(downloads); });
  }
})();
