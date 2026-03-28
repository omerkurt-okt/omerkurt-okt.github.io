/* ============================================================
   OMER KURT PORTFOLIO - Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  // Signal that JS is working so CSS can enable reveal animations.
  // Without this class, .reveal elements stay visible (graceful fallback).
  document.documentElement.classList.add('js-ready');

  // Each init is wrapped so one failure doesn't break the rest
  var inits = [initThemeToggle, initNav, initScrollReveal, initProjectFilters, initProjectModals];
  for (var i = 0; i < inits.length; i++) {
    try { inits[i](); } catch (e) { console.error(inits[i].name, e); }
  }
});

/* --- Theme Toggle --- */
function initThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  const html = document.documentElement;
  const meta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    if (theme === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else {
      html.removeAttribute('data-theme');
    }
    if (meta) {
      meta.content = theme === 'dark' ? '#121118' : '#faf9f6';
    }
    if (toggle) {
      toggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
    }
  }

  // Determine initial theme: saved > system preference > light default
  const saved = localStorage.getItem('theme');
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  // Toggle on click
  toggle.addEventListener('click', () => {
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';

    html.classList.add('theme-transitioning');
    applyTheme(next);
    localStorage.setItem('theme', next);

    setTimeout(() => html.classList.remove('theme-transitioning'), 450);
  });

  // Respond to OS theme change (only if user hasn't explicitly chosen)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/* --- Navigation --- */
function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('.section[id]');

  // Single scroll handler for nav effects and active section
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);

    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const link = document.querySelector(`.nav-links a[href="#${id}"]`);
      if (link) {
        link.classList.toggle('active', scrollY >= top && scrollY < top + height);
      }
    });
  }, { passive: true });

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* --- Scroll Reveal --- */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* --- Project Filters --- */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;
        card.style.display = show ? '' : 'none';
        if (show) {
          card.style.animation = '';
          void card.offsetWidth;
          card.style.animation = 'fadeInUp 0.4s ease-out forwards';
        }
      });
    });
  });
}

/* --- Project Modals --- */
function initProjectModals() {
  const overlay = document.getElementById('project-modal');
  const closeBtn = overlay.querySelector('.modal-close');

  function openModal(id) {
    const data = projectData[id];
    if (!data) return;
    renderModal(data);
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Card click + keyboard
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.project));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card.dataset.project);
      }
    });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  function renderModal(data) {
    const body = overlay.querySelector('.modal-body');
    const header = overlay.querySelector('.modal-header');

    header.querySelector('.modal-title').textContent = data.name;
    header.querySelector('.modal-version').textContent = data.version;

    // Build modal body using DOM for safety
    body.innerHTML = '';

    if (data.screenshot) {
      const ssContainer = document.createElement('div');
      ssContainer.className = 'modal-screenshot';
      const ssImg = document.createElement('img');
      ssImg.src = data.screenshot;
      ssImg.alt = data.name + ' GUI Screenshot';
      ssImg.loading = 'lazy';
      ssImg.title = 'Click to view full size';
      ssImg.addEventListener('click', () => window.open(data.screenshot, '_blank'));
      ssContainer.appendChild(ssImg);
      body.appendChild(ssContainer);
    }

    const desc = document.createElement('p');
    desc.className = 'modal-desc';
    desc.textContent = data.description;
    body.appendChild(desc);

    const featTitle = document.createElement('div');
    featTitle.className = 'modal-section-title';
    featTitle.textContent = 'Key Capabilities';
    body.appendChild(featTitle);

    const featList = document.createElement('ul');
    featList.className = 'modal-features';
    data.features.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      featList.appendChild(li);
    });
    body.appendChild(featList);

    const techTitle = document.createElement('div');
    techTitle.className = 'modal-section-title';
    techTitle.textContent = 'Technology Stack';
    body.appendChild(techTitle);

    const techGrid = document.createElement('div');
    techGrid.className = 'modal-tech-grid';
    data.tech.forEach(t => {
      const span = document.createElement('span');
      span.className = 'modal-tech-tag';
      span.textContent = t;
      techGrid.appendChild(span);
    });
    body.appendChild(techGrid);

    const statsDiv = document.createElement('div');
    statsDiv.className = 'modal-stats';
    const statsData = [
      { value: data.loc, label: 'Lines of Code' }
    ];
    statsData.forEach(s => {
      const stat = document.createElement('div');
      stat.className = 'modal-stat';
      const val = document.createElement('div');
      val.className = 'modal-stat-value';
      val.textContent = s.value;
      const lbl = document.createElement('div');
      lbl.className = 'modal-stat-label';
      lbl.textContent = s.label;
      stat.appendChild(val);
      stat.appendChild(lbl);
      statsDiv.appendChild(stat);
    });
    body.appendChild(statsDiv);
  }
}

/* --- Project Data --- */
const projectData = {
  flexview: {
    name: 'FlexView: TF-Xplorer',
    version: 'v3.31 | 32,000+ Lines of Code',
    screenshot: 'assets/images/screenshots/flexview.png',
    description: 'A comprehensive 3D visualization tool for mesh-based structural data. FlexView generates interactive HTML reports using Plotly, enabling engineers to visualize stress distributions, reserve factors, and structural properties directly on aircraft mesh models. It became the standard data transfer method between 150+ analysis and 70+ design engineers on the TF-X program.',
    features: [
      'Dual visualization modes: Mesh Representation (property/element coloring) and Dot & Line (discrete point/vector data)',
      'Interactive 3D navigation with orbital rotation, pivot control, and distance measurement',
      'Reserve Factor color scheme with 5-level safety threshold visualization',
      'Supports shell and beam elements with offset processing',
      'Integrated documentation editor for embedding analysis notes, images, and references into reports',
      'Custom legend configuration with discrete, continuous, and percentile-based scaling modes',
      'Batch processing mode for generating multiple reports from Nastran results automatically'
    ],
    tech: ['Python', 'Plotly', 'JavaScript', 'Pandas', 'NumPy', 'pyNastran'],
    loc: '32K+'
  },
  optimex: {
    name: 'OptimEX',
    version: 'v2.56 | 63,500+ Lines of Code',
    screenshot: 'assets/images/screenshots/optimex.png',
    description: 'A generalized metaheuristic optimization framework that uses Excel workbooks, external executables, Python scripts, or ONNX ML models as objective function evaluators. Engineers define variables, constraints, and objectives through a GUI, then run single or multi-objective optimization across input data. Built for structural sizing, weight optimization, and any engineering problem expressible through a spreadsheet or simulation tool.',
    features: [
      '10 optimization algorithms: GA, DE, PSO, CMA-ES, Nelder-Mead, NRBO (single-obj), NSGA-II, NSGA-III, MOEA/D, SMS-EMOA (multi-obj)',
      'Excel evaluator: drives existing sizing spreadsheets as black-box objective functions',
      'EXE evaluator: wraps external solvers and analysis tools via file-based I/O',
      'Multi-analysis mode: optimize shared variables across multiple coupled analyses simultaneously',
      'Cross-analysis constraints linking results between different sizing disciplines',
      'ML training pipeline: generate datasets, train MLP surrogate models, export to ONNX for fast re-evaluation',
      'Pareto front extraction and visualization for multi-objective trade-off studies',
      'CLI mode for batch optimization and integration into automated workflows'
    ],
    tech: ['Python', 'PyQt5', 'pymoo', 'xlwings', 'openpyxl', 'DuckDB', 'PyTorch', 'ONNX'],
    loc: '63.5K'
  },
  ijat: {
    name: 'i-JAT: IFEM Joint Analysis Tool',
    version: 'v2.1 | 15,500+ Lines of Code',
    screenshot: 'assets/images/screenshots/ijat.png',
    description: 'A sophisticated automation tool that orchestrates the full bolted joint analysis workflow for aircraft structures. i-JAT coordinates HyperMesh (FEA preprocessing) with Excel-based joint sizing tools, processing both composite and metallic joints with parallel processing and real-time progress monitoring.',
    features: [
      'End-to-end automation: HyperMesh load extraction, Excel-based joint sizing, and result compilation',
      'Parallel processing: runs multiple HyperMesh and Excel instances simultaneously',
      'Supports both Full Analysis (HM + Excel) and Re-Analysis (Excel-only) workflows',
      'Composite and metallic bolted joint analysis with automatic load case detection',
      'Real-time progress monitoring with job status tracking across all active analyses',
      'Automatic result compilation and summary generation upon completion'
    ],
    tech: ['Python', 'PyQt5', 'openpyxl', 'pyNastran', 'TCL'],
    loc: '15.5K'
  },
  sade: {
    name: 'SADE: Strength Analysis Engine',
    version: 'v2.62',
    screenshot: 'assets/images/screenshots/sade.png',
    description: 'A high-performance automated strength analysis tool for Nastran FEA models. SADE extracts von Mises stress results, intelligently classifies structural elements by connection type (CBUSH, T-junction, L-bend), applies appropriate safety factors, and calculates reserve factors with thickness optimization capabilities.',
    features: [
      'Intelligent element classification by connection type with appropriate safety factors',
      'Processes millions of element-case combinations in seconds',
      'Automatic thickness optimization targeting specified Reserve Factor',
      'Multi-format export: Full Results, Critical Results, Property Summary, Optimized BDF',
      'Supports all common Nastran shell, bar, and rod element types'
    ],
    tech: ['Python', 'Pandas', 'NumPy', 'pyNastran'],
    loc: '3K+'
  },
  bade: {
    name: 'BADE: Buckling Analysis Engine',
    version: 'v3.22',
    screenshot: 'assets/images/screenshots/bade.png',
    description: 'A comprehensive tool for extracting and analyzing buckling mode data from Nastran OP2 or PCH files with advanced structural connectivity analysis. BADE identifies maximum displacement nodes, maps them to structural properties, detects coplanar surfaces and T-connections, and calculates optimized thicknesses.',
    features: [
      'Reads Nastran OP2 and PCH buckling results with automatic format detection',
      'T-connection detection preventing incorrect property grouping at structural junctions',
      'Coplanar surface grouping for accurate panel-level buckling assessment',
      'Thickness optimization based on target Reserve Factor and buckling eigenvalue',
      'Parallel subcase processing for models with many load cases',
      'Supports both metallic (PSHELL) and composite (PCOMP) properties'
    ],
    tech: ['Python', 'NumPy', 'Pandas', 'pyNastran'],
    loc: '2.3K'
  },
  huth: {
    name: 'Huth Stiffness Updater',
    version: 'v2.53',
    screenshot: 'assets/images/screenshots/huth.png',
    description: 'Calculates and updates CBUSH element stiffness values in Nastran BDF files using the empirical Huth formula for fastened joints. Features advanced composite material support with Classical Lamination Theory, multi-plate connection analysis, and Airbus-method dual-CBUSH generation.',
    features: [
      'Huth formula for shear and axial fastener stiffness calculation per industry standards',
      'Three connection methods: Normal, HyperMesh, and Two-Plate approaches',
      'Airbus dual-CBUSH method for multi-plate connections',
      'Classical Lamination Theory (CLT) support for composite laminates',
      'Processes 100K+ CBUSH elements in under 30 seconds for full-aircraft models',
      'Built-in fastener specification database with standard bolt types and materials',
      'Supports metallic, composite, and mixed-material joint configurations'
    ],
    tech: ['Python', 'PyQt5', 'NumPy', 'SciPy', 'pyNastran'],
    loc: '8K+'
  },
  propmapper: {
    name: 'Property Mapper',
    version: 'v1.61',
    screenshot: 'assets/images/screenshots/property_mapper.png',
    description: 'An intelligent property transfer tool for finite element analysis that matches properties between different mesh configurations using advanced geometric analysis. Features a multi-stage pipeline with proximity scoring, surface normal alignment, and ray casting for tie-breaking.',
    features: [
      'Multi-stage mapping pipeline with proximity scoring, normal alignment, and ray casting',
      '5-level confidence assessment for mapping quality',
      'Surface normal alignment for correct mapping across curved fuselage sections',
      'Handles both shell and beam elements',
      'Configurable thresholds for different mesh density transitions',
      'Summary report identifying low-confidence mappings requiring engineer review'
    ],
    tech: ['Python', 'trimesh', 'NumPy', 'SciPy', 'rtree', 'Shapely'],
    loc: '3.6K'
  },
  rbemapper: {
    name: 'RBE Mapper',
    version: 'v1.37',
    screenshot: 'assets/images/screenshots/rbe_mapper.png',
    description: 'Automatically generates Rigid Body Elements (RBE2 and RBE3) from large-scale FEA models by intelligently mapping master nodes to slave nodes. Features exclusive assignment with priority-based conflict resolution and colinearity detection.',
    features: [
      'Generates both RBE2 (rigid) and RBE3 (interpolation) elements',
      'Exclusive assignment ensures each slave node belongs to exactly one rigid element',
      'Colinearity detection prevents degenerate configurations',
      'Fast spatial matching for large full-aircraft models',
      'Flexible node filtering with range and group syntax',
      'Full 6-DOF selection with quick-select presets',
      'Priority-based conflict resolution for overlapping regions'
    ],
    tech: ['Python', 'NumPy', 'SciPy'],
    loc: '2.9K'
  },
  safir: {
    name: 'SAFiR: File Filter',
    version: 'v2.97 | 100GB+ Streaming',
    screenshot: 'assets/images/screenshots/safir.png',
    description: 'A high-performance filtering tool for large BDF and CSV files with streaming processing for datasets exceeding 100GB. Features entry-aware BDF processing that preserves multi-line structural integrity, 8 search types, complex Boolean expressions, and batch operations.',
    features: [
      'Handles 100GB+ Nastran BDF and CSV result files with constant memory usage',
      'Entry-Aware BDF mode preserving complete entries with continuation lines as single units',
      '8 search types: contains, equals, starts_with, ends_with, greater_than, less_than, in_between, range',
      'Complex Boolean expressions: combine multiple criteria with AND/OR logic',
      'Fast multi-pattern matching for extracting specific element IDs, properties, or load cases',
      'Batch processing: filter multiple input files or apply multiple search value sets at once',
      'Template system for saving and reusing frequently used filter configurations',
      'Automatic encoding detection for files from different FEA software outputs'
    ],
    tech: ['Python', 'Pandas', 'ahocorasick', 'chardet'],
    loc: '3.7K'
  },
  thermalmapper: {
    name: 'Thermal Mapper',
    version: 'v1.22',
    screenshot: 'assets/images/screenshots/thermal_mapper.png',
    description: 'Maps thermal loads from coarse/source meshes to fine/target meshes using k-nearest neighbor interpolation with inverse distance weighting. Enables coupled thermal-structural FEA workflows by transferring temperature distributions between non-conforming meshes.',
    features: [
      'KNN interpolation with inverse distance weighting for accurate temperature mapping',
      'One-time spatial preprocessing for fast repeated mapping across load cases',
      'Distance-based quality analysis identifying nodes requiring engineer review',
      'Parallel load case processing for models with hundreds of thermal conditions',
      'Generates Nastran TEMP cards ready for direct inclusion in analysis decks'
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'Numba'],
    loc: '1.1K'
  },
  spcdmapper: {
    name: 'SPCD Mapper',
    version: 'v1.25',
    screenshot: 'assets/images/screenshots/spcd_mapper.png',
    description: 'Interpolates and maps structural prescribed displacement (SPCD) loads from source to target meshes. Essential for transferring boundary condition constraints between different mesh refinements while preserving load case organization and DOF definitions.',
    features: [
      'KNN interpolation with configurable neighbor count and distance weighting',
      'Preserves complete load case structure and DOF relationships from source model',
      'Quality report identifying nodes with poor interpolation for engineer review',
      'Parallel load case processing for models with many boundary conditions',
      'Flexible node filtering with range syntax for selective mapping',
      'Generates Nastran SPCD cards ready for inclusion in analysis decks'
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'Numba'],
    loc: '1.3K'
  },
  cfhm: {
    name: 'CF HyperMesh Toolbox',
    version: 'v2.0 | 75+ Procedures',
    description: 'A comprehensive HyperMesh plugin for the TF-X Center Fuselage team, automating complex FEM model preparation, fastener modeling, quality checks, and analysis workflows. Features 6 tabbed tool categories with 75+ specialized procedures built collaboratively by the analysis team.',
    features: [
      'EasyFast: Semi-automatic fastener creation with Huth formula-based stiffness calculation',
      'RBE3 Mapper with colinearity checking for robust rigid element generation',
      'Thermal mapping between coarse and fine meshes directly within HyperMesh',
      'Local IFEM model extraction from global FEM results for detailed analysis',
      'Element orientation control for composite laminate fiber direction validation',
      'Quad element splitting with 8 different split pattern types',
      'Bidirectional Components-to-Sets conversion with CSV export capabilities',
      'Modal analysis card generation and load step creation automation'
    ],
    tech: ['TCL/Tk', 'HyperMesh API', 'VBScript', 'Nastran BDF'],
    loc: '20K+'
  }
};
