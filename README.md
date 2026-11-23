# LATTICE — Atomic Structure Observatory

A standalone interactive crystallography study, using the DEVIANCE / ATELIER design system and Three.js. The project does **not** navigate to, depend upon, or link to the author's other interactive scenes.

## Run / publish

Upload the contents of this repository to GitHub and enable **Settings → Pages → Deploy from a branch → main / (root)**. Your site will load directly from `index.html`.

For local development, serve the folder over HTTP, not with the `file://` protocol (ES modules are subject to local-file security restrictions):

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`. A modern browser with WebGL support and an internet connection is required for Three.js, which is loaded from the version-pinned CDN in `index.html`.

## Scene controls

- **Structure tab:** switch between simple cubic (SC), body-centered cubic (BCC), face-centered cubic (FCC), and diamond cubic (DIA). Adjust conventional-cell count (2–5 per edge), lattice parameter, nearest-neighbor bonds, the central unit cell, Miller-plane orientation, and atom halos.
- **Select any visible atom:** click a sphere to read its conventional fractional coordinates and finite-neighbor count. You can remove that site (vacancy), substitute a differently colored atom, or clear all defects.
- **Vibrations tab:** choose a prescribed sinusoidal longitudinal or transverse plane wave, wave-vector direction [100], [110], or [111], amplitude, relative wavenumber and playback speed. This is a harmonic *visualization*, not a material-specific phonon eigenvalue calculation.
- **Analysis tab:** lattice-specific bulk coordination and nearest-neighbor spacing, ideal packing factor, specimen size, finite bonds and rendered-site counts.
- **Viewpoints:** Crystal Array (overall 3D), Unit Cell (close-up), Atomic Planes (crystallographic perspective), Defect Focus (selected site).
- **Keyboard:** `1`–`4` change viewpoint; `Space` pause; `G` toggle guides; `V` vacancy; `D` substitution; `R` reset; `H` inspector; `P` capture; `F` fullscreen.

## Physical interpretation

The conventional cubic bases are correct for the four structures. The generated nearest-neighbor bonds are drawn at these ideal distances in terms of the conventional lattice parameter **a**:

| Structure | Sites / conventional cell | Ideal coordination | Nearest-neighbor distance | Hard-sphere packing fraction |
|---|---:|---:|---|---:|
| Simple cubic | 1 | 6 | a | π/6 ≈ 52.36% |
| BCC | 2 | 8 | √3 a/2 | √3 π/8 ≈ 68.02% |
| FCC | 4 | 12 | a/√2 | π/(3√2) ≈ 74.05% |
| Diamond cubic | 8 | 4 | √3 a/4 | π√3/16 ≈ 34.01% |

Only sites that lie within the rendered **finite supercell** are shown. Atoms at its boundary have fewer neighbors than the infinite-lattice coordination listed above. The displayed radius and surface shading are deliberately stylized and are **not** literal electron-cloud sizes. The substitution effect changes the display species at a host site, rather than simulating chemistry. The optional sinusoidal displacement field is a harmonic demonstration and does not determine true phonon frequencies, thermal properties, or material-specific force constants.

## Files

- `index.html` — one-page UI, import map and project bootstrap
- `assets/lattice-scene.js` — WebGL scene, interaction, render loop and prescribed vibration
- `assets/lattice-model.js` — conventional bases, crystallographic geometry and neighbor connectivity
- `assets/atelier-ui.css`, `assets/atelier-ui.js` — standalone ATELIER visual design system (local copies)

## Rendering notes

The lattice uses instanced meshes for atom spheres and bonds. Geometry is regenerated on structure or supercell changes; animation updates transformations with a reduced cadence to keep larger specimens responsive. For slower devices, choose 2–3 cells per edge or disable vibrations and halos.
