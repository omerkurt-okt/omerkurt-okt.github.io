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
      { value: data.loc, label: 'Lines of Code' },
      { value: data.files, label: 'Source Files' },
      { value: data.gui, label: 'GUI Framework' }
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
    version: 'v3.31 | 32,000+ Lines of Code | 19 Source Files',
    screenshot: 'assets/images/screenshots/flexview.png',
    description: 'A comprehensive 3D visualization tool for mesh-based structural data. FlexView generates interactive HTML reports using Plotly, enabling engineers to visualize stress distributions, reserve factors, and structural properties directly on aircraft mesh models. It became the standard data transfer method between 130+ analysis and 60+ design engineers on the TF-X program.',
    features: [
      'Dual visualization modes: Mesh Representation (property/element coloring) and Dot & Line Representation (discrete point/vector data)',
      'Interactive 3D navigation with orbital rotation, dynamic pivot control, and distance measurement tools',
      'Reserve Factor color scheme with 5-level safety threshold visualization (critical red to excellent green)',
      'Supports shell elements (CQUAD4, CTRIA3) and beam elements (CBAR) with offset processing',
      'Integrated documentation editor for embedding analysis notes, images, and references into reports',
      'Custom legend configuration with discrete, continuous, and percentile-based scaling modes',
      'Batch processing mode for generating multiple reports from Nastran results automatically',
      'CBAR orientation handling with G0 reference node and OFFT flag support'
    ],
    tech: ['Python', 'Plotly', 'JavaScript', 'Pandas', 'NumPy', 'pyNastran', 'Tkinter', 'PyQt5'],
    loc: '32K+',
    files: '19',
    gui: 'Plotly 3D'
  },
  optimex: {
    name: 'OptimEX',
    version: 'v2.56 | 63,500+ Lines of Code | 132 Source Files',
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
    loc: '63.5K',
    files: '132',
    gui: 'PyQt5'
  },
  ijat: {
    name: 'i-JAT: IFEM Joint Analysis Tool',
    version: 'v2.1 | 15,500+ Lines of Code | 62 Source Files',
    screenshot: 'assets/images/screenshots/ijat.png',
    description: 'A sophisticated automation tool that orchestrates the full bolted joint analysis workflow for aircraft structures. i-JAT coordinates HyperMesh (FEA preprocessing) with Excel-based joint sizing tools, processing both composite and metallic joints with parallel processing and real-time progress monitoring.',
    features: [
      'End-to-end automation: HyperMesh load extraction, Excel-based joint sizing, and result compilation',
      'Parallel processing: runs multiple HyperMesh and Excel instances simultaneously for faster turnaround',
      'Supports both Full Analysis (HM + Excel) and Re-Analysis (Excel-only) workflows',
      'Composite and metallic bolted joint analysis with automatic load case combination detection',
      'Per-folder configuration snapshots ensuring independent analysis of each joint region',
      'Real-time progress monitoring with job status tracking across all active analyses',
      'Automatic result compilation and summary generation upon completion',
      'Modern GUI with collapsible analysis cards and light/dark theme support'
    ],
    tech: ['Python', 'PyQt5', 'xlwings', 'TCL', 'psutil', 'Multiprocessing'],
    loc: '15.5K',
    files: '62',
    gui: 'PyQt5'
  },
  sade: {
    name: 'SADE: Strength Analysis Engine',
    version: 'v2.62 | Vectorized Analysis',
    screenshot: 'assets/images/screenshots/sade.png',
    description: 'A high-performance automated strength analysis tool for Nastran FEA models. SADE extracts von Mises stress results, intelligently classifies structural elements by connection type (CBUSH, T-junction, L-bend), applies appropriate safety factors, and calculates reserve factors with thickness optimization capabilities.',
    features: [
      'Element classification by connection type: CBUSH-connected (3.0x), T-connections (1.5x), L-connections (1.5x), standard (1.0x)',
      'Processes millions of element-case combinations in seconds for rapid strength checking',
      'Traces CBUSH connectivity through RBE2/RBE3 rigid link chains for accurate load path identification',
      'Automatic thickness optimization targeting specified Reserve Factor, rounded to nearest 0.1mm',
      'HDF5 storage for large result sets exceeding 50,000 entries',
      'Multi-format export: Full Results, Critical Results, Property Summary, Optimized BDF',
      'Supports CQUAD4, CTRIA3, CBAR, CBEAM, CROD, CONROD element types'
    ],
    tech: ['Python', 'Pandas', 'NumPy', 'pyNastran', 'HDF5/PyTables', 'Tkinter'],
    loc: '3K+',
    files: '3',
    gui: 'Tkinter'
  },
  bade: {
    name: 'BADE: Buckling Analysis Engine',
    version: 'v3.22 | Multi-threaded Processing',
    screenshot: 'assets/images/screenshots/bade.png',
    description: 'A comprehensive tool for extracting and analyzing buckling mode data from Nastran OP2 or PCH files with advanced structural connectivity analysis. BADE identifies maximum displacement nodes, maps them to structural properties, detects coplanar surfaces and T-connections, and calculates optimized thicknesses.',
    features: [
      'Reads Nastran OP2 (binary) and PCH (punch) buckling results with automatic format detection',
      'T-connection detection preventing incorrect property grouping at junctions with 3+ elements',
      'Coplanar property grouping with configurable angle threshold (5-45 degrees)',
      'Cubic thickness optimization: t_req = t_current x (target_RF / eigenvalue)^(1/3)',
      'Parallel subcase processing for faster analysis of models with many load cases',
      'Memory monitoring for handling large buckling result sets',
      'Supports PSHELL (single thickness) and PCOMP (laminate total thickness) properties'
    ],
    tech: ['Python', 'NumPy', 'Pandas', 'pyNastran', 'concurrent.futures', 'Tkinter'],
    loc: '2.3K',
    files: '3',
    gui: 'Tkinter'
  },
  huth: {
    name: 'Huth Stiffness Updater',
    version: 'v2.53 | O(n) Optimized',
    screenshot: 'assets/images/screenshots/huth.png',
    description: 'Calculates and updates CBUSH element stiffness values in Nastran BDF files using the empirical Huth formula for fastened joints. Features advanced composite material support with Classical Lamination Theory, multi-plate connection analysis, and Airbus-method dual-CBUSH generation.',
    features: [
      'Huth formula for shear and axial fastener stiffness calculation per industry standards',
      'Three connection methods: Normal, HyperMesh, and Two-Plate approaches',
      'Airbus dual-CBUSH method: separate axial and shear spring elements for 3+ plate connections',
      'Full Classical Lamination Theory (CLT) with ABD matrix calculation for composite laminates',
      'Processes 100K+ CBUSH elements in under 30 seconds for full-aircraft models',
      'Fastener specification database with standard bolt types and material properties',
      'Nastran SET card import/export for selective CBUSH group processing',
      'Supports metallic, composite, and mixed-material joint configurations'
    ],
    tech: ['Python', 'PyQt5', 'NumPy', 'pyNastran'],
    loc: '8K+',
    files: '7',
    gui: 'PyQt5'
  },
  propmapper: {
    name: 'Property Mapper',
    version: 'v1.61 | Ray Casting Engine',
    screenshot: 'assets/images/screenshots/property_mapper.png',
    description: 'An intelligent property transfer tool for finite element analysis that matches properties between different mesh configurations using advanced geometric analysis. Features a multi-stage pipeline with proximity scoring, surface normal alignment, and ray casting for tie-breaking.',
    features: [
      '4-stage mapping pipeline: candidate selection, perfect match, scoring, and ray casting tie-breaking',
      '5-level confidence assessment: PERFECT, HIGH, MEDIUM, LOW, and REVIEW classifications',
      'Surface normal alignment ensures properties map correctly across curved fuselage sections',
      'Ray casting resolves ambiguous matches between overlapping property regions',
      'Handles both shell elements (CQUAD4, CTRIA3) and beam elements (CBAR)',
      'Configurable distance thresholds and scoring weights for different mesh density transitions',
      'Summary report identifying all low-confidence mappings requiring engineer review'
    ],
    tech: ['Python', 'trimesh', 'NumPy', 'SciPy', 'rtree', 'Shapely', 'pyNastran', 'Tkinter'],
    loc: '3.6K',
    files: '3',
    gui: 'Tkinter'
  },
  rbemapper: {
    name: 'RBE Mapper',
    version: 'v1.37 | Spatial Algorithms',
    screenshot: 'assets/images/screenshots/rbe_mapper.png',
    description: 'Automatically generates Rigid Body Elements (RBE2 and RBE3) from large-scale FEA models by intelligently mapping master nodes to slave nodes. Features exclusive assignment with priority-based conflict resolution and colinearity detection.',
    features: [
      'Generates both RBE2 (rigid) and RBE3 (interpolation) elements from master/slave node sets',
      'Exclusive assignment ensures each slave node belongs to exactly one rigid element',
      'Colinearity detection prevents degenerate RBE configurations that cause solver errors',
      'Spatial algorithms for fast node matching even on large full-aircraft models',
      'Flexible node filtering with ranges and groups (e.g., "100-200, 350, 500-600")',
      'Full 6-DOF selection with quick-select presets for translations and rotations',
      'Priority-based conflict resolution when multiple master nodes compete for the same slaves'
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'Tkinter', 'ttkthemes'],
    loc: '2.9K',
    files: '3',
    gui: 'Tkinter'
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
    tech: ['Python', 'Pandas', 'ahocorasick', 'chardet', 'Tkinter'],
    loc: '3.7K',
    files: '2',
    gui: 'Tkinter'
  },
  thermalmapper: {
    name: 'Thermal Mapper',
    version: 'v1.22 | Spatial Interpolation',
    screenshot: 'assets/images/screenshots/thermal_mapper.png',
    description: 'Maps thermal loads from coarse/source meshes to fine/target meshes using k-nearest neighbor interpolation with inverse distance weighting. Enables coupled thermal-structural FEA workflows by transferring temperature distributions between non-conforming meshes.',
    features: [
      'K-Nearest Neighbors with Inverse Distance Weighting (IDW) for accurate temperature interpolation',
      'One-time spatial preprocessing for fast repeated mapping across multiple load cases',
      'Distance analysis identifying nodes with poor interpolation quality for engineer review',
      'Parallel load case processing for models with hundreds of thermal conditions',
      'Handles Nastran special scientific notation format (e.g., "1.23-4" → "1.23e-4")',
      'Generates Nastran TEMP cards ready for direct inclusion in structural analysis decks',
      'Numba-accelerated calculations for large thermal models'
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'Numba', 'Tkinter', 'ttkthemes'],
    loc: '1.1K',
    files: '2',
    gui: 'Tkinter'
  },
  spcdmapper: {
    name: 'SPCD Mapper',
    version: 'v1.25 | Load Interpolation',
    screenshot: 'assets/images/screenshots/spcd_mapper.png',
    description: 'Interpolates and maps structural prescribed displacement (SPCD) loads from source to target meshes. Essential for transferring boundary condition constraints between different mesh refinements while preserving load case organization and DOF definitions.',
    features: [
      'KNN interpolation with configurable neighbor count and distance weighting',
      'Preserves complete load case structure and DOF relationships from source model',
      'Quality report identifying nodes with poor interpolation for engineer review',
      'Correctly handles zero-value displacements vs. unspecified DOFs',
      'Parallel load case processing for models with many boundary conditions',
      'Flexible node ID filtering with range syntax for selective mapping',
      'Generates Nastran SPCD cards ready for inclusion in analysis decks'
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'Numba', 'Tkinter', 'ttkthemes'],
    loc: '1.3K',
    files: '2',
    gui: 'Tkinter'
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
    loc: '20K+',
    files: '28',
    gui: 'Tk (HM)'
  }
};
