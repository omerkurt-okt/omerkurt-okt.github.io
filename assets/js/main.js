/* ============================================================
   OMER KURT PORTFOLIO - Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initScrollReveal();
  initProjectFilters();
  initProjectModals();
});

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
    version: 'v3.31 | 32,000+ Lines of Code',
    description: 'A comprehensive 3D visualization tool for mesh-based structural data. FlexView generates interactive HTML reports using Plotly, enabling engineers to visualize stress distributions, reserve factors, and structural properties directly on aircraft mesh models. It became the standard data transfer method between 130+ analysis and 60+ design engineers on the TF-X program.',
    features: [
      'Dual visualization modes: Mesh Representation (property/element coloring) and Dot & Line Representation (discrete point/vector data)',
      'Interactive 3D navigation with orbital rotation, dynamic pivot control (Ctrl+click), and distance measurement tools',
      'Reserve Factor color scheme with 5-level safety threshold visualization (critical red to excellent green)',
      'Supports both shell elements (CQUAD4, CTRIA3) and beam elements (CBAR) with offset processing',
      'Integrated rich-text documentation editor with embedded file support (Excel, PowerPoint, images)',
      'Custom legend configuration with discrete, continuous, and percentile-based scaling modes',
      'CLI mode for batch processing and automation alongside the interactive GUI',
      'Advanced CBAR orientation handling with G0 reference node and OFFT flag support'
    ],
    tech: ['Python', 'Plotly', 'JavaScript', 'Pandas', 'NumPy', 'pyNastran', 'Tkinter', 'PyQt5', 'HTML5'],
    loc: '32K+',
    files: '19',
    gui: 'Plotly 3D'
  },
  ijat: {
    name: 'i-JAT: IFEM Joint Analysis Tool',
    version: 'v2.1 | Multi-Process Architecture',
    description: 'A sophisticated automation tool that orchestrates the full bolted joint analysis workflow for aircraft structures. i-JAT coordinates HyperMesh (FEA preprocessing) with Excel-based joint sizing tools, processing both composite and metallic joints through a multi-level parallel architecture with real-time progress monitoring.',
    features: [
      'End-to-end automation: HyperMesh load extraction, Excel-based joint sizing, and result compilation',
      'Multi-level parallelization: concurrent HyperMesh instances and independent Excel worker processes',
      'Distributed coordinator pattern with per-folder config snapshots preventing cross-contamination',
      'Supports both Full Analysis (HM + Excel) and Re-Analysis (Excel-only) workflows',
      'Composite and metallic bolted joint analysis with automatic load case combination detection',
      'Folder watcher system for real-time job discovery as HyperMesh creates output subfolders',
      'Thread-safe GUI message queue bridging worker processes to PyQt5 signals',
      'Light/dark theme support with modern PyQt5 interface including collapsible cards and animated status icons'
    ],
    tech: ['Python', 'PyQt5', 'xlwings', 'TCL', 'h5py', 'multiprocessing', 'pyNastran'],
    loc: '8K+',
    files: '62',
    gui: 'PyQt5'
  },
  sade: {
    name: 'SADE: Strength Analysis Engine',
    version: 'v2.62 | Vectorized Analysis',
    description: 'A high-performance automated strength analysis tool for Nastran FEA models. SADE extracts von Mises stress results, intelligently classifies structural elements by connection type (CBUSH, T-junction, L-bend), applies appropriate safety factors, and calculates reserve factors with thickness optimization capabilities.',
    features: [
      'Priority-based element classification: CBUSH-connected (3.0x), T-connections (1.5x), L-connections (1.5x), and standard (1.0x)',
      'Fully vectorized Pandas/NumPy analysis processing millions of element-case combinations in seconds',
      'Network traversal algorithm for CBUSH connectivity through RBE2/RBE3 rigid link chains',
      'Automatic thickness optimization with target RF, rounding to nearest 0.1 for manufacturing',
      'HDF5 persistence for datasets exceeding 50,000 results with optimized data types',
      'Multi-format export: Full Results, Critical Results, Property Summary, Optimized BDF',
      'Supports CQUAD4, CTRIA3, CBAR, CBEAM, CROD, CONROD element types'
    ],
    tech: ['Python', 'Pandas', 'NumPy', 'pyNastran', 'PyTables/HDF5', 'Tkinter'],
    loc: '3K+',
    files: '3',
    gui: 'Tkinter'
  },
  bade: {
    name: 'BADE: Buckling Analysis Engine',
    version: 'v3.22 | Multi-threaded Processing',
    description: 'A comprehensive tool for extracting and analyzing buckling mode data from Nastran OP2 or PCH files with advanced structural connectivity analysis. BADE identifies maximum displacement nodes, maps them to structural properties, detects coplanar surfaces and T-connections, and calculates optimized thicknesses.',
    features: [
      'Dual file format support: binary OP2 and text PCH (punch) files with automatic detection',
      'T-connection detection preventing incorrect property grouping at junctions with 3+ elements',
      'Coplanar property grouping with configurable angle threshold (5-45 degrees)',
      'Cubic thickness relationship: required_thickness = current x (target_RF / eigenvalue)^(1/3)',
      'Multi-threaded processing with configurable workers and chunked CSV export for large datasets',
      'Real-time memory monitoring with color-coded usage indicators',
      'Supports PSHELL (single thickness) and PCOMP (laminate total thickness) properties'
    ],
    tech: ['Python', 'NumPy', 'Pandas', 'pyNastran', 'Threading', 'Tkinter'],
    loc: '2.3K',
    files: '3',
    gui: 'Tkinter'
  },
  huth: {
    name: 'Huth Stiffness Updater',
    version: 'v2.53 | O(n) Optimized',
    description: 'Calculates and updates CBUSH element stiffness values in Nastran BDF files using the empirical Huth formula for fastened joints. Features advanced composite material support with Classical Lamination Theory, multi-plate connection analysis, and Airbus-method dual-CBUSH generation.',
    features: [
      'Huth formula implementation for shear and axial fastener stiffness calculation',
      'Three connection methods: Normal, HyperMesh, and Two-Plate approaches',
      'Airbus dual-CBUSH method: separate axial and shear spring elements for 3+ plate connections',
      'Full Classical Lamination Theory (CLT) ABD matrix calculation for composite laminates',
      'O(n) optimized architecture: ModelIndex, UnionFind, and vectorized NumPy calculations',
      'Performance: 100K CBUSHes processed in <30 seconds (vs hours in previous versions)',
      'Comprehensive fastener specification database with JSON persistence',
      'Nastran SET card import/export with collision-free property ID management'
    ],
    tech: ['Python', 'PyQt5', 'NumPy', 'pyNastran', 'Multiprocessing', 'JSON'],
    loc: '6K+',
    files: '8',
    gui: 'PyQt5'
  },
  propmapper: {
    name: 'Property Mapper',
    version: 'v1.61 | Ray Casting Engine',
    description: 'An intelligent property transfer tool for finite element analysis that matches properties between different mesh configurations using advanced geometric analysis. Features a multi-stage pipeline with proximity scoring, surface normal alignment, and ray casting for tie-breaking.',
    features: [
      '4-stage mapping pipeline: candidate selection, perfect match, fast scoring, and ray casting',
      '5-level confidence assessment: PERFECT, HIGH, MEDIUM, LOW, and REVIEW classifications',
      'Ray casting from element centroids for tie-breaking between similar candidates',
      'Curved surface detection using normal variation threshold with area-weighted metrics',
      'Combined R-tree (bounding box) and KDTree (nearest neighbor) spatial indexing',
      '33 configurable parameters organized by distance, surface, confidence, and scoring categories',
      'Supports both shell elements (CQUAD4, CTRIA3) and CBAR beam elements'
    ],
    tech: ['Python', 'trimesh', 'NumPy', 'SciPy', 'rtree', 'Shapely', 'pyNastran', 'Tkinter'],
    loc: '3.6K',
    files: '4',
    gui: 'Tkinter'
  },
  rbemapper: {
    name: 'RBE Mapper',
    version: 'v1.37 | Spatial Algorithms',
    description: 'Automatically generates Rigid Body Elements (RBE2 and RBE3) from large-scale FEA models by intelligently mapping master nodes to slave nodes. Features exclusive assignment with priority-based conflict resolution and colinearity detection.',
    features: [
      'Dual element support: RBE2 (independent master) and RBE3 (dependent master) generation',
      'Exclusive assignment mode with multi-phase conflict resolution and adaptive slave stealing',
      'KD-tree spatial indexing for O(log n) nearest-neighbor queries',
      'Colinearity detection via cross-product magnitude test to prevent degenerate configurations',
      'Vectorized distance calculations using NumPy broadcasting and SciPy cdist',
      'Flexible node filtering with ranges, commas, and spaces (e.g., "100-200, 350, 500-600")',
      'Full 6-DOF selection with quick-select presets for translations and rotations'
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'Tkinter', 'ttkthemes'],
    loc: '2.9K',
    files: '4',
    gui: 'Tkinter'
  },
  safir: {
    name: 'SAFiR: File Filter',
    version: 'v2.97 | 100GB+ Streaming',
    description: 'A high-performance filtering tool for large BDF and CSV files with streaming processing for datasets exceeding 100GB. Features entry-aware BDF processing that preserves multi-line structural integrity, 8 search types, complex Boolean expressions, and batch operations.',
    features: [
      'Streaming architecture: constant memory usage regardless of file size (100GB+ capable)',
      'Entry-Aware mode preserving complete BDF entries with continuation lines as single units',
      '8 search types: contains, equals, starts_with, ends_with, greater_than, less_than, in_between, range',
      'Complex Boolean expressions with AND/OR and parentheses: (C1 AND C2) OR C3',
      'Aho-Corasick automaton for fast multi-pattern string matching',
      'Adaptive buffer sizing: different strategies for 100MB, 1GB, and 10GB+ files',
      'Batch processing: multiple input files or multiple search value files simultaneously',
      'Template system for saving and loading filter configurations'
    ],
    tech: ['Python', 'Pandas', 'ahocorasick', 'Multiprocessing', 'Tkinter'],
    loc: '3.7K',
    files: '3',
    gui: 'Tkinter'
  },
  thermalmapper: {
    name: 'Thermal Mapper',
    version: 'v1.22 | Spatial Interpolation',
    description: 'Maps thermal loads from coarse/source meshes to fine/target meshes using k-nearest neighbor interpolation with inverse distance weighting. Enables coupled thermal-structural FEA workflows by transferring temperature distributions between non-conforming meshes.',
    features: [
      'K-Nearest Neighbors with Inverse Distance Weighting (IDW) interpolation',
      'One-time spatial preprocessing: KDTree construction and weight pre-calculation for all target nodes',
      'Distance analysis identifying problematic nodes with poor interpolation quality',
      'Multi-process support with auto-scaling based on dataset size',
      'Handles Nastran special scientific notation format (e.g., "1.23-4" to "1.23e-4")',
      'Large buffer I/O (8MB) for fast NASTRAN TEMP card output generation',
      'Optional Numba JIT compilation for optimized weight calculations'
    ],
    tech: ['Python', 'NumPy', 'SciPy', 'Numba', 'Tkinter', 'ttkthemes'],
    loc: '1.1K',
    files: '2',
    gui: 'Tkinter'
  },
  spcdmapper: {
    name: 'SPCD Mapper',
    version: 'v1.25 | Load Interpolation',
    description: 'Interpolates and maps structural prescribed displacement (SPCD) loads from source to target meshes. Essential for transferring boundary condition constraints between different mesh refinements while preserving load case organization and DOF definitions.',
    features: [
      'KNN-based spatial interpolation with configurable neighbor count and distance power',
      'Preserves complete load case structure and DOF relationships from source',
      'Distance-based quality control identifying nodes with poor interpolation quality',
      'Proper zero-value semantics distinguishing "not specified" from "specified as zero"',
      'Optional Numba JIT with prange for parallelized weight calculation',
      'Multi-threaded load case processing with configurable worker count',
      'Flexible node ID filtering with range syntax support'
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
    loc: '4K+',
    files: '25+',
    gui: 'Tk (HM)'
  }
};
